import { Request, Response } from 'express';
import TaskModel, { ITask , TaskPriority } from '../models/task.model';
import mongoose from 'mongoose';


const isValidPriority = (value: any): value is TaskPriority => {
    return ['low', 'medium', 'high'].includes(value);
};

class TaskController {
    
    async createTask(req: Request, res: Response): Promise<Response> {
        try {
            const { title, description , dueDate, priority } = req.body;

            if (!title) {
                return res.status(400).json({ message: 'Title is required' });
            }

            if (priority && !isValidPriority(priority)) {
                return res.status(400).json({ message: 'Invalid priority value. Must be low, medium, or high.' });
           }

           if (dueDate && isNaN(Date.parse(dueDate))) {
                return res.status(400).json({ message: 'Invalid due date format.' });
           }

            if (!req.user?.userId) {
                 return res.status(401).json({ message: 'User not authenticated' });
            }

            const task = new TaskModel({
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority: priority || 'medium', 
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

    async updateTask(req: Request, res: Response): Promise<Response> {
        try {
            const { taskId } = req.params;
            const { title, description, status, dueDate, priority } = req.body;
    
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                return res.status(400).json({ message: 'Invalid Task ID format' });
            }
    
            if (!req.user?.userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
    
            const task = await TaskModel.findOne({ _id: taskId, user: req.user.userId });
    
            if (!task) {
                return res.status(404).json({ message: 'Task not found or not authorized' });
            }
    
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (status) {
                if (!['pending', 'inProgress', 'completed'].includes(status)) {
                    return res.status(400).json({ message: 'Invalid status provided' });
                }
                task.status = status;
            }
            if (dueDate !== undefined) {
                if (dueDate === null || dueDate === '') {
                    task.dueDate = undefined;
                } else if (isNaN(Date.parse(dueDate))) {
                    return res.status(400).json({ message: 'Invalid due date format.' });
                } else {
                    task.dueDate = new Date(dueDate);
                }
            }
            if (priority) {
                if (!isValidPriority(priority)) {
                    return res.status(400).json({ message: 'Invalid priority value.' });
                }
                task.priority = priority;
            }
    
            const updatedTask = await task.save();
            return res.status(200).json(updatedTask);
        } catch (error) {
            console.error('Error updating task:', error);
            return res.status(500).json({ message: 'Server error updating task' });
        }
    }

    async deleteTask(req: Request, res: Response): Promise<Response> {
        try {
            const { taskId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                return res.status(400).json({ message: 'Invalid Task ID format' });
            }
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