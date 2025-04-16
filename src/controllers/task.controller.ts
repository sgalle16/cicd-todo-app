import { Request, Response } from 'express';
import * as TaskService from '../services/task.service';
import { TaskStatus } from '../types/task.types';

export const getTasks = (req: Request, res: Response): void => {
  try {
    const allTasks = TaskService.getAllTasks();
    console.log('Controller: Sending all tasks');
    res.status(200).json(allTasks);
  } catch (error) {
    console.error('Controller Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
};

export const postTask = (req: Request, res: Response): void => {
  try {
    const { text } = req.body as { text: unknown };
    // Basic validation (more robust validation can be added)
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.error('Controller: Invalid text for new task:', text);
      res.status(400).json({ error: 'Task text is required and cannot be empty.' });
      return;
    }
    // Create task using the service
    const newTask = TaskService.createTask(text);
    console.log('Controller: Task created:', newTask.id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Controller Error creating task:', error);
    // Check if it's a validation error from the service
    let errorMessage = 'Failed to create task';
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('Invalid task text')) {
        errorMessage = error.message;
        statusCode = 400;
      }
    }
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const putTask = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, text } = req.body as { status?: unknown; text?: unknown };
    const updates: Partial<{ status: TaskStatus; text: string }> = {};

    // Validate and add updates
    if (status !== undefined) {
      if (typeof status !== 'string' || !['todo', 'doing', 'done'].includes(status)) {
        console.error(`Controller: Invalid status provided for update: ${JSON.stringify(status)}`);
        res.status(400).json({ error: 'Invalid status value provided.' });
        return;
      }
      updates.status = status as TaskStatus;
    }

    if (text !== undefined) {
      if (typeof text !== 'string') {
        console.error(`Controller: Invalid text type provided for update: ${JSON.stringify(text)}`); //${String(text)}
        res.status(400).json({ error: 'Task text must be a string.' });
        return;
      }
      // Allow setting empty string if desired by client? Or validate here?
      // For now, we let the service handle empty string logic if needed.
      updates.text = text;
    }

    if (Object.keys(updates).length === 0) {
      console.log(`Controller: No valid fields provided for update task ${id}`);
      res.status(400).json({
        error: 'No valid fields provided for update (status or text).',
      });
      return;
    }

    const updatedTask = TaskService.updateTask(id, updates);

    if (!updatedTask) {
      console.error(`Controller: Task not found for update: ${id}`);
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    console.log(`Controller: Task updated: ${id}`);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(`Controller Error updating task ${req.params.id}:`, error);
    let errorMessage = 'Failed to update task';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteTaskById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = TaskService.deleteTask(id);

    if (!deleted) {
      console.error(`Controller: Task not found for deletion: ${id}`);
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    console.log(`Controller: Task deleted: ${id}`);
    res.status(204).send(); // No content
  } catch (error) {
    console.error(`Controller Error deleting task ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
