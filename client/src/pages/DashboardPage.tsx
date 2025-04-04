import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskService, { ITask } from '../services/task.service';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      });
      setTasks((prevTasks) => [createdTask, ...prevTasks]);
      toast.success(`Task "${createdTask.title}" created!`);
      setNewTaskTitle('');
      setNewTaskDescription('');
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
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, newStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (err: any) {
      toast.error("Failed to update task status. Reverting. Coul you please check server is up and running");
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
      {/* ... (Welcome message) ... */}

       {/* Create Task Form - slightly restyled */}
       <div className="mb-8 p-6 border rounded-lg shadow-lg bg-white"> {/* Enhanced styling */}
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Task</h2>
          {/* Remove {submitError && ...} */}
          <form onSubmit={handleCreateTask}>
             {/* ... (Inputs - maybe add focus rings like login) ... */}
             <div className="mb-3">
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                      type="text" id="taskTitle"
                      className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      required
                      disabled={isSubmitting}
                  />
              </div>
              <div className="mb-3">
                   <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                   <textarea
                        id="taskDescription" rows={2}
                         className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Add more details..."
                        disabled={isSubmitting}
                    ></textarea>
              </div>
              <button
                type="submit"
                 className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
               >
                  {isSubmitting ? 'Adding Task...' : 'Add Task'}
              </button>
          </form>
      </div>

      {/* Task List - slightly restyled */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Tasks</h2>
        {loading && <p className="text-gray-600">Loading tasks...</p>}
        {!loading && tasks.length === 0 && <p className="text-gray-600">You have no tasks yet. Add one above!</p>}
        {!loading && tasks.length > 0 && (
          <ul className="space-y-4"> 
            {tasks.map((task) => (
               <li key={task._id} className="bg-white shadow-md overflow-hidden rounded-lg p-5 border border-gray-200 flex justify-between items-start hover:shadow-lg transition-shadow duration-200"> {/* Enhanced styling */}
                 {/* ... (Task details display) ... */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    {task.description && <p className="mt-1 text-sm text-gray-600">{task.description}</p>}
                    <p className="mt-2 text-xs text-gray-500">
                         Status: {/* ... (status display) ... */} | Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                </div>
                 
                 <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center ml-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
                     <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value as ITask['status'])}
                        className="text-xs border-gray-300 rounded-md shadow-sm p-1 focus:ring-indigo-500 focus:border-indigo-500" // Added focus styles
                        title="Change Status"
                     >
                         <option value="pending">Pending</option>
                         <option value="inProgress">In Progress</option>
                         <option value="completed">Completed</option>
                     </select>
                     <button
                         onClick={() => handleDeleteTask(task._id)}
                         className="text-xs text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1" // Added focus styles
                         title="Delete Task"
                      >
                        
                         Delete
                      </button>
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