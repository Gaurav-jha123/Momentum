import apiClient from './api';

export interface ITask {
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'inProgress' | 'completed';
    user: string; 
    createdAt: string; 
    updatedAt: string;
}

interface CreateTaskData {
    title: string;
    description?: string;
}

class TaskService {
    async getTasks(): Promise<ITask[]> {
        try {
            const response = await apiClient.get<ITask[]>('/tasks');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch tasks:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to fetch tasks");
        }
    }

    async createTask(data: CreateTaskData): Promise<ITask> {
         try {
            const response = await apiClient.post<ITask>('/tasks', data);
            return response.data;
        } catch (error: any) {
            console.error("Failed to create task:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to create task");
        }
    }

    async updateTaskStatus(taskId: string, status: ITask['status']): Promise<ITask> {
         try {
            const response = await apiClient.put<ITask>(`/tasks/${taskId}/status`, { status });
            return response.data;
        } catch (error: any) {
            console.error("Failed to update task status:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to update task status");
        }
    }

    async deleteTask(taskId: string): Promise<{ message: string }> {
         try {
            const response = await apiClient.delete<{ message: string }>(`/tasks/${taskId}`);
            return response.data;
        } catch (error: any) {
            console.error("Failed to delete task:", error.response?.data || error.message);
            throw error.response?.data || new Error("Failed to delete task");
        }
    }
}

export default new TaskService();