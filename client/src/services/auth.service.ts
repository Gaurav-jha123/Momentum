import apiClient from './api';

interface RegisterData { name: string; email: string; password: string; }
interface LoginData { email: string; password: string; }
interface LoginResponse { accessToken: string; user: any; } 

class AuthService {
  async register(data: RegisterData): Promise<any> { 
    try {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    } catch (error: any) {
        console.error("Registration failed:", error.response?.data || error.message);
        throw error.response?.data || new Error("Registration failed");
    }
  }

  async login(data: LoginData): Promise<LoginResponse> {
     try {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        return response.data;
     } catch (error: any) {
        console.error("Login failed:", error.response?.data || error.message);
        throw error.response?.data || new Error("Login failed");
     }
  }
}

export default new AuthService();