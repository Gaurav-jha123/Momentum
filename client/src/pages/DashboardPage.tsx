import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskService, { ITask } from '../services/task.service';

const DashboardPage: React.FC = () => {

  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await TaskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks.');
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
        setSubmitError("Task title cannot be empty.");
        return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const createdTask = await TaskService.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
      });

      setTasks(prevTasks => [createdTask, ...prevTasks]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create task.');
    } finally {
        setIsSubmitting(false);
    }
  };

    const handleStatusChange = async (taskId: string, newStatus: ITask['status']) => {
        try {
            const updatedTask = await TaskService.updateTaskStatus(taskId, newStatus);
            setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? updatedTask : task));
        } catch (err: any) {
            console.error("Failed to update status:", err.message);
            setError("Failed to update task status. Please try again."); 
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return; 

        try {
            await TaskService.deleteTask(taskId);
            setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        } catch (err: any) {
            console.error("Failed to delete task:", err.message);
             setError("Failed to delete task. Please try again.");
        }
    };


  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user && <p className="text-lg mb-6">Welcome back, <span className="font-semibold">{user.name}</span>!</p>}

      {/* Create Task Form */}
      <div className="mb-8 p-4 border rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3">Create New Task</h2>
          {submitError && <p className="text-red-500 text-sm mb-3">{submitError}</p>}
          <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                      type="text" id="taskTitle"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
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
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
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

      {/* Task List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
        {loading && <p>Loading tasks...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && tasks.length === 0 && <p>You have no tasks yet. Add one above!</p>}
        {!loading && !error && tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task._id} className="bg-white shadow overflow-hidden rounded-md p-4 border flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    {task.description && <p className="mt-1 text-sm text-gray-600">{task.description}</p>}
                    <p className="mt-2 text-xs text-gray-500">
                        Status: <span className={`font-semibold ${task.status === 'completed' ? 'text-green-600' : task.status === 'inProgress' ? 'text-yellow-600' : 'text-gray-600'}`}>{task.status}</span> | Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                </div>
                 {/* Optional Action Buttons */}
                 <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center ml-4">
                     <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value as ITask['status'])}
                        className="text-xs border-gray-300 rounded shadow-sm p-1"
                        title="Change Status"
                     >
                         <option value="pending">Pending</option>
                         <option value="inProgress">In Progress</option>
                         <option value="completed">Completed</option>
                     </select>
                     <button
                         onClick={() => handleDeleteTask(task._id)}
                         className="text-xs text-red-600 hover:text-red-800 p-1"
                         title="Delete Task"
                      >
                         Delete
                      </button>
                 </div>
                 {}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;