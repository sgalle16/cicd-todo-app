export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
