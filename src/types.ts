export type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado';
export type TaskStatus = 'Pendente' | 'Em andamento' | 'Concluída';
export type Category = 'Limpeza' | 'Cozinha' | 'Organização' | 'Reparos' | 'Outros';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  estimatedTime: string; // e.g., "30 min"
  status: TaskStatus;
  dueDate: string; // ISO string
  createdAt: string;
  completedAt?: string;
}

export interface Tutorial {
  title: string;
  overview: string;
  materials: string[];
  steps: string[];
  explanation: string;
  precautions: string[];
  tips: string[];
  commonErrors: string[];
  videoSuggestion: string;
  difficulty: Difficulty;
  estimatedTime: string;
}

export interface UserStats {
  tasksCompleted: number;
  points: number;
  level: number;
}
