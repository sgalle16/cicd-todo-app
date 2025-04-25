import { Task } from '../types/task.types';
import crypto from 'crypto';

// --- In-Memory Data Store ---
// NOTE: This will reset every time the server restarts.
// Consider a database for persistence.
let tasks: Task[] = [
  {
    id: crypto.randomUUID(),
    text: 'Setup Backend',
    status: 'done',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    text: 'Create Frontend',
    status: 'doing',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    text: 'Add Styling',
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getAllTasks = (): Task[] => {
  // Return a copy to prevent direct modification of the internal array
  return [...tasks];
};

export const findTaskById = (id: string): Task | undefined => {
  return tasks.find((task) => task.id === id);
};

export const createTask = (text: string): Task => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('Invalid task text provided.'); // Throw error for controller to catch
  }
  const newTask: Task = {
    id: crypto.randomUUID(),
    text: text.trim(),
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tasks.push(newTask);
  console.log('Task created in service:', newTask.id);
  return { ...newTask }; // Return a copy
};

export const updateTask = (
  id: string,
  updates: Partial<Pick<Task, 'text' | 'status'>>
): Task | null => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return null; // Task not found
  }

  let updated = false;
  const taskToUpdate = { ...tasks[taskIndex] }; // Work on a copy

  // Update status if provided and valid
  if (updates.status && ['todo', 'doing', 'done'].includes(updates.status)) {
    if (taskToUpdate.status !== updates.status) {
      taskToUpdate.status = updates.status;
      updated = true;
    }
  } else if (updates.status) {
    console.warn(`Update task service: Invalid status ignored - ${updates.status}`);
    // Or throw new Error('Invalid status');
  }

  // Update text if provided and valid
  if (updates.text && typeof updates.text === 'string' && updates.text.trim() !== '') {
    if (taskToUpdate.text !== updates.text.trim()) {
      taskToUpdate.text = updates.text.trim();
      updated = true;
    }
  } else if (updates.text !== undefined && updates.text.trim() === '') {
    console.warn('Update task service: Empty text ignored');
    // Or throw new Error('Task text cannot be empty');
  }

  if (updated) {
    taskToUpdate.updatedAt = new Date();
    tasks[taskIndex] = taskToUpdate; // Update the original array
    console.log(
      `Task updated in service: ${id}, Status: ${taskToUpdate.status}, Text: ${taskToUpdate.text}`
    );
    return { ...taskToUpdate }; // Return a copy of the updated task
  } else {
    console.log(`Task update service: No valid changes detected for task ${id}`);
    return { ...taskToUpdate }; // Return original if no changes made
  }
};

export const deleteTask = (id: string): boolean => {
  const initialLength = tasks.length;
  tasks = tasks.filter((task) => task.id !== id);
  const deleted = tasks.length < initialLength;
  if (deleted) {
    console.log(`Task deleted in service: ${id}`);
  } else {
    console.warn(`Task delete service: Task not found ${id}`);
  }
  return deleted; // Return true if deleted, false otherwise
};
