import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskService, { ITask , TaskPriority, UpdateTaskData} from '../services/task.service';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import EditTaskModal from '../components/tasks/EditTaskModal';
import socket from '../services/socket.server';


const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
      return new Date(dateString).toISOString().split('T')[0];
  } catch (e) {
      return ''; 
  }
};

const PriorityDisplay: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const colorClasses = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
  };
  return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[priority] || colorClasses.medium}`}>
          {priority}
      </span>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // create Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(''); // Store as YYYY-MM-DD string
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium'); // Default priority
  // const [error, setError] = useState<string | null>(null);
  // const [submitError, setSubmitError] = useState<string | null>(null);

  // --- ADD STATE FOR EDITING ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTasks = await TaskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  // --- WebSocket Event Handling ---
  useEffect(() => {
    // Function to handle new tasks received via WebSocket
    const handleTaskCreated = (newTask: ITask) => {
        console.log('Socket event: task:created received', newTask);
        setTasks(currentTasks => {
            // Double-check if it somehow already exists (e.g., rapid events)
            const taskExists = currentTasks.some(task => task._id === newTask._id);
            console.log(`Received task ${newTask._id}. Already in state [${currentTasks.map(t=>t._id).join(', ')}]? ${taskExists}`);
            if (!taskExists) {
                toast.success(`New task added: "${newTask.title}"`);
                return [newTask, ...currentTasks]; // Prepend the new task
            }
            return currentTasks; // Task already exists, return state unchanged
        });
    };

    // Function to handle updated tasks received via WebSocket
    const handleTaskUpdated = (updatedTask: ITask) => {
        console.log('Socket event: task:updated received', updatedTask);
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            )
        );
        toast.success(`Task updated: "${updatedTask.title}"`);
    };

    // Function to handle deleted tasks received via WebSocket
    const handleTaskDeleted = (data: { taskId: string }) => {
        console.log('Socket event: task:deleted received', data);
        setTasks(prevTasks =>
            prevTasks.filter(task => task._id !== data.taskId)
        );
        toast.error(`Task deleted.`); 
    };

    // --- Set up listeners when component mounts ---
    console.log('Setting up socket listeners...');
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    // Re-connect socket if it's disconnected (e.g., navigating back to page)
    // The service attempts reconnection, but explicit connect might be needed
    if (!socket.connected) {
        socket.connect();
    }

    // --- Clean up listeners when component unmounts ---
    return () => {
        console.log('Cleaning up socket listeners...');
        socket.off('task:created', handleTaskCreated);
        socket.off('task:updated', handleTaskUpdated);
        socket.off('task:deleted', handleTaskDeleted);
        // Optional: Disconnect if appropriate
        // socket.disconnect();
    };
}, []); // Empty dependency array means this runs once on mount and cleanup on unmount


  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty."); 
      return;
    }
    setIsSubmitting(true);
    try{

      const payload: any = {
            title: newTaskTitle,
            description: newTaskDescription || undefined,
            dueDate: newTaskDueDate || undefined,
            priority: newTaskPriority,
      };

      const createdTask = await TaskService.createTask(payload);
      //setTasks((prevTasks) => [createdTask, ...prevTasks]);
      toast.success(`Task "${createdTask.title}" created!`);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: ITask['status']
  ) => {
    // have backup here
    const originalTasks = [...tasks];
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        ));
    try {
      await TaskService.updateTaskStatus(taskId, newStatus);
    } catch (err: any) {
      toast.error("Failed to update task status. Reverting. Coul you please check server is up and running");
      setTasks(originalTasks);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedData: UpdateTaskData) => {
    try {
        const updatedTask = await TaskService.updateTask(taskId, updatedData);

        // Update the task list state
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? updatedTask : task
        ));

        toast.success(`Task "${updatedTask.title}" updated successfully!`);
        handleCloseEditModal(); // Close the modal on success

    } catch (error: any) {
        toast.error(error.message || "Failed to update task.");
    }
    // No finally block needed here to set loading state, as that's handled within the modal
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const originalTasks = [...tasks];
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    try {
      await TaskService.deleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete task. Reverting.");
      setTasks(originalTasks);
    }
  };

    const handleOpenEditModal = (task: ITask) => {
        setEditingTask(task); // Set the task to be edited
        setIsEditModalOpen(true); // Open the modal
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false); 
        setEditingTask(null); 
    };

  return (
    <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            {user && <p className="text-lg mb-6">Welcome back, <span className="font-semibold">{user.name}</span>!</p>}

            {/* --- Create Task Form --- */}
            <div className="mb-8 p-6 border rounded-lg shadow-lg bg-white">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Task</h2>
                <form onSubmit={handleCreateTask} className="space-y-4">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input type="text" id="taskTitle" required disabled={isSubmitting}
                            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="What needs to be done?"
                        />
                    </div>
                    {/* Description Textarea */}
                    <div>
                        <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="taskDescription" rows={2} disabled={isSubmitting}
                            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)}
                            placeholder="Add more details..."
                        ></textarea>
                    </div>
                    {/* Due Date Input */}
                    <div>
                        <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" id="taskDueDate" disabled={isSubmitting}
                            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)}
                        />
                    </div>
                    {/* Priority Select */}
                    <div>
                        <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select id="taskPriority" disabled={isSubmitting} value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                            className="shadow-sm block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    {/* Submit Button */}
                    <div>
                        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
                            Add Task
                        </Button>
                    </div>
                </form>
            </div>

            {/* --- Task List --- */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Tasks</h2>
                {loading && <p className="text-gray-600">Loading tasks...</p>}
                {!loading && tasks.length === 0 && <p className="text-gray-600">You have no tasks yet. Add one above!</p>}
                {!loading && tasks.length > 0 && (
                    <ul className="space-y-4">
                        {tasks.map((task) => (
                            <li key={task._id} className="bg-white shadow-md overflow-hidden rounded-lg p-5 border border-gray-200 flex justify-between items-start hover:shadow-lg transition-shadow duration-200">
                                <div className="flex-grow pr-4"> {/* Allow text to grow */}
                                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                    {task.description && <p className="mt-1 text-sm text-gray-600">{task.description}</p>}
                                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 items-center"> {/* Use flex for inline items */}
                                        <span> {/* Status */}
                                            Status: <span className={`font-semibold ${task.status === 'completed' ? 'text-green-600' : task.status === 'inProgress' ? 'text-yellow-600' : 'text-gray-600'}`}>{task.status}</span>
                                        </span>
                                        {task.dueDate && ( // Display Due Date if it exists
                                            <span>| Due: <span className="font-medium text-gray-700">{new Date(task.dueDate).toLocaleDateString()}</span></span>
                                        )}
                                        <span> {/* Priority */}
                                            | Priority: <PriorityDisplay priority={task.priority} />
                                        </span>
                                        <span> {/* Created Date */}
                                            | Created: {new Date(task.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {/* Action Buttons Area */}
                                <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center ml-4 flex-shrink-0">
                                    <select value={task.status} title="Change Status"
                                        onChange={(e) => handleStatusChange(task._id, e.target.value as ITask['status'])}
                                        className="text-xs border-gray-300 rounded-md shadow-sm p-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="inProgress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {/* --- ADD EDIT BUTTON --- */}
                                 <Button
                                     onClick={() => handleOpenEditModal(task)} 
                                     variant="secondary" 
                                     size="sm"
                                     className="p-1"
                                     title="Edit Task"
                                 >
                                     Edit
                                 </Button>
                                 {/*ADD DELETE BUTTON*/}
                                    <Button onClick={() => handleDeleteTask(task._id)} title="Delete Task"
                                        variant="danger" size="sm" className="p-1">
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                </div>
            {isEditModalOpen && editingTask && (
         <EditTaskModal
            isOpen={isEditModalOpen} // Control visibility
            task={editingTask}       // Pass the task data
            onClose={handleCloseEditModal} // Pass the close handler
            onUpdate={handleUpdateTask} // Pass the update handler
         />
    )}
    </div>
  )
};


export default DashboardPage;