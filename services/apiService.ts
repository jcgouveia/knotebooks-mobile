import { User, Project, Notebook, NotebookExecution, AuthResponse, ApiError } from '@/types/api';
import { mockUser, mockProjects, mockNotebooks, mockExecutions, createMockExecution } from './mockData';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/notebooks';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || false; // Default to mock for demo

class ApiService {
  private token: string | null = null;
  private user: User | null = null;

  async login(username: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {

      // Mock login - accept any email/password
      await this.delay(1000);
      const response: AuthResponse = {
        token: 'mock-jwt-token-12345',
        user: mockUser,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      this.token = response.token;
      this.user = response.user;
      return response;
    }

    const response = await fetch(`${API_BASE_URL}/session/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const authResponse: AuthResponse = await response.json();
    this.token = authResponse.token;
    return authResponse;
  }

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await this.delay(500);
      this.token = null;
      return;
    }

    if (this.token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    }
    this.token = null;
  }

  async getProjects(): Promise<Project[]> {
    if (USE_MOCK) {
      await this.delay(800);
      return mockProjects;
    }

    const response = await fetch(`${API_BASE_URL}/project`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async getProject(projectId: string): Promise<Project> {

    const response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async getNotebooks(projectId?: string): Promise<Notebook[]> {
    if (USE_MOCK) {
      await this.delay(600);
      return projectId 
        ? mockNotebooks.filter(nb => nb.projectId === projectId)
        : mockNotebooks;
    }

    const url = projectId 
      ? `${API_BASE_URL}/project/${projectId}/notebooks`
      : `${API_BASE_URL}/notebook/list`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async getNotebook(id: string): Promise<Notebook> {

    const response = await fetch(`${API_BASE_URL}/notebook/${id}/info`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async executeNotebook(notebookId: string, parameters: Record<string, any>): Promise<NotebookExecution> {
    if (USE_MOCK) {
      await this.delay(500);
      return createMockExecution(notebookId);
    }

    const response = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/execute`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async getExecution(executionId: string): Promise<NotebookExecution> {
    if (USE_MOCK) {
      await this.delay(300);
      const execution = mockExecutions[executionId];
      if (!execution) {
        throw new Error('Execution not found');
      }
      return execution;
    }

    const response = await fetch(`${API_BASE_URL}/executions/${executionId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  getInteractiveNotebookUrl(notebookId: string, projectId: string): string {
    if (USE_MOCK) {
      return `https://demo.knotebooks.com/runner?notebook=${notebookId}&project=${projectId}&token=${this.token}`;
    }
    
    return `${API_BASE_URL.replace('/api', '')}/runner?notebook=${notebookId}&project=${projectId}&token=${this.token}`;
  }

  setToken(token: string): void {
    this.token = token;
  }

  setUser(user: User): void {
    this.user = user;
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
    
    if (this.user) {
      headers['X-User'] = this.user.username;
    }
    
    return headers;
  }

  private async handleError(response: Response): Promise<ApiError> {
    try {
      const error = await response.json();
      return error;
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
        code: 'HTTP_ERROR'
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new ApiService();