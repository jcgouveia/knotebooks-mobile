import { User, Project, Notebook, NotebookExecution, AuthResponse, ApiError } from '@/types/api';
import { mockUser, mockProjects, mockNotebooks, mockExecutions, createMockExecution } from './mockData';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8081/notebooks';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || false; // Default to mock for demo

class ApiService {
  private token: string | null = null;
  private user: User | null = null;
  private baseUrl: string = API_BASE_URL;

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async login(username: string, password: string): Promise<AuthResponse> {

    console.log('Login request to:', API_BASE_URL);

    const response = await fetch(`${this.baseUrl}/session/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('Login Response status:', response.status);
    console.log('Login Response headers:', response.headers);

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const authResponse: AuthResponse = await response.json();
    console.log('Login Success:', authResponse);

    this.token = authResponse.token;
    return authResponse;
  }

  async logout(): Promise<void> {

    if (this.token) {
      await fetch(`${this.baseUrl}/auth/logout`, {
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

    const response = await fetch(`${this.baseUrl}/project`, {
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
      ? `${this.baseUrl}/projects/${projectId}/notebooks`
      : `${this.baseUrl}/notebook/list`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async getNotebook(id: string): Promise<Notebook> {

    const response = await fetch(`${this.baseUrl}/notebook/${id}/info`, {
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

    const response = await fetch(`${this.baseUrl}/notebooks/${notebookId}/execute`, {
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

    const response = await fetch(`${this.baseUrl}/executions/${executionId}`, {
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
    
    return `${this.baseUrl.replace('/api', '')}/runner?notebook=${notebookId}&project=${projectId}&token=${this.token}`;
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