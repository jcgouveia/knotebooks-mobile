export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  notebooks?:[],
  notebookCount?: number,
  creationDate: string;
  modifiedDate: string;
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  creationDate: string;
  modifiedDate: string;

  projectId: string;
  projectName: string;
  parameters: NotebookParameter[];
  canRunInteractive?: boolean;
}

export interface NotebookParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[]; // for select type
}

export interface NotebookExecution {
  id: string;
  notebookId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: NotebookResult;
  error?: string;
}

export interface NotebookResult {
  type: 'json' | 'text' | 'files';
  data: any;
  files?: DownloadableFile[];
}

export interface DownloadableFile {
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}