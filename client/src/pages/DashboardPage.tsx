import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskService, { ITask , TaskPriority} from '../services/task.service';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty."); 
      return;
    }
    setIsSubmitting(true);
    try{
      const createdTask = await TaskService.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        dueDate: newTaskDueDate || undefined, // Send undefined if empty
        priority: newTaskPriority,
      });
      setTasks((prevTasks) => [createdTask, ...prevTasks]);
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
                                    {/* <Button size="sm" variant="secondary" className="p-1">Edit</Button> */}
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
        </div>
    );
};

export default DashboardPage;