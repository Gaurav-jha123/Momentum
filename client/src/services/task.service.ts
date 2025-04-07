import apiClient from './api';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask {
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'inProgress' | 'completed';
    dueDate? : string;
    priority : TaskPriority;
    user: string; 
    createdAt: string; 
    updatedAt: string;
}

interface CreateTaskData {
    title: string;
    description?: string;
    dueDate? : string;
    priority : TaskPriority;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: 'pending' | 'inProgress' | 'completed';
    dueDate?: string | null; // Allow null to clear date
    priority?: TaskPriority;
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

    async updateTask(taskId: string, data: UpdateTaskData): Promise<ITask> {
        try {
           const response = await apiClient.put<ITask>(`/tasks/${taskId}`, data);
           return response.data;
       } catch (error: any) {
           console.error("Failed to update task:", error.response?.data || error.message);
           throw error.response?.data || new Error("Failed to update task");
       }
   }

   async updateTaskStatus(taskId: string, status: ITask['status']): Promise<ITask> {
    return this.updateTask(taskId, { status });
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