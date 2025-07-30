import { User, Project, Notebook, NotebookExecution, NotebookResult } from '@/types/api';

export const mockUser: User = {
  id: 'user-1',
  email: 'demo@knotebooks.com',
  name: 'Demo User',
  avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
};

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Data Analysis Pipeline',
    description: 'Collection of notebooks for data processing and analysis',
    creationDate: '2024-01-15T10:00:00Z',
    modifiedDate: '2024-01-20T15:30:00Z',
    notebookCount: 5
  },
  {
    id: 'proj-2',
    name: 'Machine Learning Models',
    description: 'Training and evaluation notebooks for ML models',
    creationDate: '2024-01-10T09:00:00Z',
    modifiedDate: '2024-01-22T11:45:00Z',
    notebookCount: 8
  },
  {
    id: 'proj-3',
    name: 'Reporting Dashboard',
    description: 'Automated report generation and visualization',
    creationDate: '2024-01-05T14:00:00Z',
    modifiedDate: '2024-01-25T16:20:00Z',
    notebookCount: 3
  }
];

export const mockNotebooks: Notebook[] = [
  {
    id: 'nb-1',
    name: 'Data Cleaning',
    description: 'Clean and preprocess raw data files',
    projectId: 'proj-1',
    projectName: 'Data Analysis Pipeline',
    creationDate: '2024-01-15T10:30:00Z',
    modifiedDate: '2024-01-20T15:30:00Z',
    canRunInteractive: true,
    parameters: [
      {
        name: 'input_file',
        type: 'string',
        required: true,
        description: 'Path to the input data file'
      },
      {
        name: 'remove_duplicates',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Remove duplicate records'
      }
    ]
  },
  {
    id: 'nb-2',
    name: 'Statistical Analysis',
    description: 'Generate statistical summaries and insights',
    projectId: 'proj-1',
    projectName: 'Data Analysis Pipeline',
    creationDate: '2024-01-16T11:00:00Z',
    modifiedDate: '2024-01-21T09:15:00Z',
    canRunInteractive: false,
    parameters: [
      {
        name: 'dataset',
        type: 'string',
        required: true,
        description: 'Dataset identifier'
      },
      {
        name: 'confidence_level',
        type: 'select',
        required: false,
        defaultValue: '0.95',
        options: ['0.90', '0.95', '0.99'],
        description: 'Statistical confidence level'
      }
    ]
  },
  {
    id: 'nb-3',
    name: 'Model Training',
    description: 'Train machine learning models with hyperparameter tuning',
    projectId: 'proj-2',
    projectName: 'Machine Learning Models',
    creationDate: '2024-01-12T13:00:00Z',
    modifiedDate: '2024-01-22T11:45:00Z',
    canRunInteractive: true,
    parameters: [
      {
        name: 'algorithm',
        type: 'select',
        required: true,
        options: ['random_forest', 'gradient_boosting', 'neural_network'],
        description: 'ML algorithm to use'
      },
      {
        name: 'epochs',
        type: 'number',
        required: false,
        defaultValue: 100,
        description: 'Number of training epochs'
      }
    ]
  }
];

export const mockExecutions: Record<string, NotebookExecution> = {};

export function createMockExecution(notebookId: string): NotebookExecution {
  const id = `exec-${Date.now()}`;
  const execution: NotebookExecution = {
    id,
    notebookId,
    status: 'running',
    startedAt: new Date().toISOString()
  };
  
  mockExecutions[id] = execution;
  
  // Simulate execution completion after 3-5 seconds
  setTimeout(() => {
    const notebook = mockNotebooks.find(nb => nb.id === notebookId);
    if (notebook && mockExecutions[id]) {
      mockExecutions[id] = {
        ...mockExecutions[id],
        status: 'completed',
        completedAt: new Date().toISOString(),
        result: {
          type: 'json',
          data: {
            message: `Execution completed for ${notebook.name}`,
            timestamp: new Date().toISOString(),
            results: {
              processed_records: Math.floor(Math.random() * 1000) + 100,
              accuracy: (Math.random() * 0.3 + 0.7).toFixed(3),
              execution_time: `${(Math.random() * 30 + 10).toFixed(1)}s`
            }
          },
          files: [
            {
              name: 'results.csv',
              url: 'https://example.com/results.csv',
              mimeType: 'text/csv',
              size: 15672
            },
            {
              name: 'visualization.png',
              url: 'https://example.com/viz.png',
              mimeType: 'image/png',
              size: 89432
            }
          ]
        }
      };
    }
  }, Math.random() * 2000 + 3000);
  
  return execution;
}