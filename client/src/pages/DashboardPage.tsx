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
      setSubmitError('Task title cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const createdTask = await TaskService.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
      });
      setTasks((prevTasks) => [createdTask, ...prevTasks]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create task.');
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
      console.error('Failed to update status:', err.message);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await TaskService.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err: any) {
      console.error('Failed to delete task:', err.message);
      setError('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          {user && (
            <p className="mt-2 text-lg text-gray-600">
              Welcome back, <span className="font-semibold text-indigo-600">{user.name}</span>!
            </p>
          )}
        </header>

        {/* Task Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Task Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-5">
              Create New Task
            </h2>
            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label
                  htmlFor="taskTitle"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="taskDescription"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="taskDescription"
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Add more details..."
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <button
                type="submit"
                className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Task...' : 'Add Task'}
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-5">
              Your Tasks
            </h2>
            {loading && <p className="text-gray-600">Loading tasks...</p>}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {!loading && !error && tasks.length === 0 && (
              <p className="text-gray-600">
                You have no tasks yet. Add one above!
              </p>
            )}
            {!loading && !error && tasks.length > 0 && (
              <ul className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <li
                    key={task._id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {task.description}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Status:{' '}
                        <span
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'text-green-500'
                              : task.status === 'inProgress'
                              ? 'text-yellow-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {task.status}
                        </span>{' '}
                        | Created:{' '}
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task._id,
                            e.target.value as ITask['status']
                          )
                        }
                        className="rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                        title="Change Status"
                      >
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none focus:text-red-700"
                        title="Delete Task"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3.382l-.618-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 01-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 01-2 0V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;