import { Request, Response } from 'express';
import TaskModel, { ITask } from '../models/task.model';

class TaskController {
    
    async createTask(req: Request, res: Response): Promise<Response> {
        try {
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ message: 'Title is required' });
            }

            if (!req.user?.userId) {
                 return res.status(401).json({ message: 'User not authenticated' });
            }

            const task = new TaskModel({
                title,
                description,
                user: req.user.userId, 
            });

            const createdTask = await task.save();

            return res.status(201).json(createdTask);

        } catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json({ message: 'Server error creating task' });
        }
    }

    async getUserTasks(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.user?.userId) {
                 return res.status(401).json({ message: 'User not authenticated' });
            }

            const tasks = await TaskModel.find({ user: req.user.userId }).sort({ createdAt: -1 });

            return res.status(200).json(tasks);

        } catch (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ message: 'Server error fetching tasks' });
        }
    }

    async updateTaskStatus(req: Request, res: Response): Promise<Response> {
        try {
             const { taskId } = req.params;
             const { status } = req.body;

             if (!status || !['pending', 'inProgress', 'completed'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status provided' });
             }

             if (!req.user?.userId) {
                 return res.status(401).json({ message: 'User not authenticated' });
             }

             const task = await TaskModel.findOne({ _id: taskId, user: req.user.userId });

             if (!task) {
                return res.status(404).json({ message: 'Task not found or not authorized' });
             }

             task.status = status as ITask['status']; 
             await task.save();

             return res.status(200).json(task);

        } catch (error) {
            console.error('Error updating task status:', error);
            return res.status(500).json({ message: 'Server error updating task' });
        }
    }

    async deleteTask(req: Request, res: Response): Promise<Response> {
        try {
             const { taskId } = req.params;

             if (!req.user?.userId) {
                 return res.status(401).json({ message: 'User not authenticated' });
             }

             const result = await TaskModel.deleteOne({ _id: taskId, user: req.user.userId });

             if (result.deletedCount === 0) {
                 return res.status(404).json({ message: 'Task not found or not authorized' });
             }

             return res.status(200).json({ message: 'Task deleted successfully' });

        } catch (error) {
            console.error('Error deleting task:', error);
            return res.status(500).json({ message: 'Server error deleting task' });
        }
    }
}

export default new TaskController();