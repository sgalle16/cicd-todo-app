import { Task } from '../types/task.types';
import type crypto from 'crypto';

let idCounter = 0;
const mockUuid = jest.fn((): string => `mock-uuid-${++idCounter}`);

jest.mock(
  'crypto',
  () =>
    ({
      ...jest.requireActual('crypto'),
      randomUUID: (): string => mockUuid(),
    }) as Partial<typeof crypto>
);

let getAllTasks: typeof import('../services/task.service').getAllTasks;
let findTaskById: typeof import('../services/task.service').findTaskById;
let createTask: typeof import('../services/task.service').createTask;
let updateTask: typeof import('../services/task.service').updateTask;
let deleteTask: typeof import('../services/task.service').deleteTask;

describe('Task Service', () => {
  let initialTasks: Task[];
  let consoleSpyLog: jest.SpyInstance;
  let consoleSpyWarn: jest.SpyInstance;

  beforeEach(() => {
    idCounter = 0;
    mockUuid.mockClear();

    jest.resetModules();

    jest.mock(
      'crypto',
      () =>
        ({
          ...jest.requireActual('crypto'),
          randomUUID: (): string => mockUuid(),
        }) as Partial<typeof crypto>
    );

    type TaskServiceModule = typeof import('../services/task.service');
    const typedServiceModule = require('../services/task.service') as TaskServiceModule; // eslint-disable-line @typescript-eslint/no-require-imports

    getAllTasks = typedServiceModule.getAllTasks;
    findTaskById = typedServiceModule.findTaskById;
    createTask = typedServiceModule.createTask;
    updateTask = typedServiceModule.updateTask;
    deleteTask = typedServiceModule.deleteTask;

    initialTasks = getAllTasks(); // <<<<< Assign initialTasks HERE

    consoleSpyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleSpyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore spies
    consoleSpyLog.mockRestore();
    consoleSpyWarn.mockRestore();
  });

  describe('getAllTasks', () => {
    it('should return all initial tasks', () => {
      const tasks = getAllTasks();
      expect(tasks).toHaveLength(initialTasks.length);
      expect(tasks).toEqual(initialTasks);
    });

    it('should return a copy of the tasks array, not the original reference', () => {
      const tasks = getAllTasks();
      tasks.push({
        /* ... dummy task ... */
      } as Task);
      const tasksAfterModification = getAllTasks();
      expect(tasksAfterModification).toHaveLength(initialTasks.length);
      expect(tasksAfterModification).toEqual(initialTasks);
    });
  });

  describe('findTaskById', () => {
    it('should return the correct task when a valid ID is provided', () => {
      const existingTask = initialTasks[1];
      const foundTask = findTaskById(existingTask.id);
      expect(foundTask).toEqual(existingTask);
    });

    it('should return undefined when an invalid/non-existent ID is provided', () => {
      const foundTask = findTaskById('non-existent-id');
      expect(foundTask).toBeUndefined();
    });
  });

  describe('createTask', () => {
    it('should create a new task with status "todo" and return it', () => {
      const newTaskText = '  Learn Testing  ';
      const expectedId = 'mock-uuid-4';
      const createdTask = createTask(newTaskText);

      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBe(expectedId);
      expect(consoleSpyLog).toHaveBeenCalledWith('Task created in service:', expectedId);

      const allTasks = getAllTasks();
      expect(allTasks).toHaveLength(initialTasks.length + 1);
      const addedTask = allTasks.find((task: Task) => task.id === expectedId);
      expect(addedTask).toEqual(createdTask);
    });
    it('should throw an error if task text is empty', () => {
      expect(() => createTask('')).toThrow('Invalid task text provided.');
      expect(() => createTask('   ')).toThrow('Invalid task text provided.');
    });
    it('should throw an error if task text is not a string', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      expect(() => createTask(null as any)).toThrow('Invalid task text provided.');
    });
    it('should return a copy of the created task', () => {
      const newTaskText = 'Immutable Check';
      const createdTask = createTask(newTaskText);
      const taskId = createdTask.id;
      createdTask.text = 'Mutated Text';
      const taskFromService = findTaskById(taskId);
      expect(taskFromService?.text).toBe(newTaskText);
    });
  });

  describe('updateTask', () => {
    let taskToUpdateId: string;
    let originalTask: Task;

    beforeEach(() => {
      // Correctly uses initialTasks from the outer scope
      taskToUpdateId = initialTasks[1].id;
      originalTask = { ...initialTasks[1] };
    });

    it('should update only the text of an existing task', () => {
      const newText = '  Updated Frontend Text  ';
      const updatedTask = updateTask(taskToUpdateId, { text: newText });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.text).toBe('Updated Frontend Text');
      expect(updatedTask?.status).toBe(originalTask.status);
      expect(updatedTask?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
        originalTask.updatedAt.getTime()
      );
      expect(updatedTask?.createdAt?.getTime()).toEqual(originalTask.createdAt.getTime());
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task updated in service: ${taskToUpdateId}, Status: ${originalTask.status}, Text: Updated Frontend Text`
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(updatedTask);
    });

    it('should update only the status of an existing task', () => {
      const newStatus = 'done';
      const updatedTask = updateTask(taskToUpdateId, { status: newStatus });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.text).toBe(originalTask.text);
      expect(updatedTask?.status).toBe(newStatus);
      expect(updatedTask?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
        originalTask.updatedAt.getTime()
      );
      expect(updatedTask?.createdAt?.getTime()).toEqual(originalTask.createdAt.getTime());
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task updated in service: ${taskToUpdateId}, Status: ${newStatus}, Text: ${originalTask.text}`
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(updatedTask);
    });

    it('should update both text and status of an existing task', () => {
      const newText = 'Finished Frontend';
      const newStatus = 'done';
      const updatedTask = updateTask(taskToUpdateId, { text: newText, status: newStatus });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.text).toBe(newText);
      expect(updatedTask?.status).toBe(newStatus);
      expect(updatedTask?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
        originalTask.updatedAt.getTime()
      );
      expect(updatedTask?.createdAt?.getTime()).toEqual(originalTask.createdAt.getTime());
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task updated in service: ${taskToUpdateId}, Status: ${newStatus}, Text: ${newText}`
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(updatedTask);
    });

    it('should ignore invalid status updates and not change updatedAt', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const invalidStatus = 'pending' as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updatedTask: Task | null = updateTask(taskToUpdateId, { status: invalidStatus });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask).toEqual(originalTask);
      expect(updatedTask?.updatedAt?.getTime()).toEqual(originalTask.updatedAt.getTime());
      expect(consoleSpyWarn).toHaveBeenCalledWith(
        `Update task service: Invalid status ignored - ${invalidStatus}`
      );
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task update service: No valid changes detected for task ${taskToUpdateId}`
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(originalTask);
    });

    it('should ignore empty text updates and not change updatedAt', () => {
      const updatedTask = updateTask(taskToUpdateId, { text: '   ' });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask).toEqual(originalTask);
      expect(updatedTask?.updatedAt?.getTime()).toEqual(originalTask.updatedAt.getTime());
      expect(consoleSpyWarn).toHaveBeenCalledWith('Update task service: Empty text ignored');
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task update service: No valid changes detected for task ${taskToUpdateId}`
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(originalTask);
    });

    it('should not update updatedAt if status is valid but the same as current status', () => {
      const updatedTask = updateTask(taskToUpdateId, { status: originalTask.status });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask).toEqual(originalTask);
      expect(updatedTask?.updatedAt?.getTime()).toEqual(originalTask.updatedAt.getTime());
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task update service: No valid changes detected for task ${taskToUpdateId}`
      );
      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('Task updated in service:')
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(originalTask);
    });

    it('should not update updatedAt if text is valid but the same as current text', () => {
      const updatedTask = updateTask(taskToUpdateId, { text: `  ${originalTask.text}  ` });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask).toEqual(originalTask);
      expect(updatedTask?.updatedAt?.getTime()).toEqual(originalTask.updatedAt.getTime());
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task update service: No valid changes detected for task ${taskToUpdateId}`
      );
      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('Task updated in service:')
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(originalTask);
    });

    it('should not update updatedAt if updates object contains only undefined/null values', () => {
      const updatedTask = updateTask(taskToUpdateId, { text: undefined, status: undefined });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask).toEqual(originalTask);
      expect(updatedTask?.updatedAt?.getTime()).toEqual(originalTask.updatedAt.getTime());
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task update service: No valid changes detected for task ${taskToUpdateId}`
      );
      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('Task updated in service:')
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService).toEqual(originalTask);
    });

    it('should update text but skip status update if status is the same', () => {
      const newText = 'New Text Here';
      const updatedTask = updateTask(taskToUpdateId, {
        text: newText,
        status: originalTask.status,
      });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.text).toBe(newText);
      expect(updatedTask?.status).toBe(originalTask.status);
      expect(updatedTask?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
        originalTask.updatedAt.getTime()
      );
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task updated in service: ${taskToUpdateId}, Status: ${originalTask.status}, Text: ${newText}`
      );
      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('No valid changes detected')
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService?.text).toBe(newText);
      expect(taskFromService?.status).toBe(originalTask.status);
    });

    it('should update status but skip text update if text is the same', () => {
      const newStatus = 'done';
      const updatedTask = updateTask(taskToUpdateId, {
        text: `  ${originalTask.text}  `,
        status: newStatus,
      });
      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.text).toBe(originalTask.text);
      expect(updatedTask?.status).toBe(newStatus);
      expect(updatedTask?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
        originalTask.updatedAt.getTime()
      );
      expect(consoleSpyLog).toHaveBeenCalledWith(
        `Task updated in service: ${taskToUpdateId}, Status: ${newStatus}, Text: ${originalTask.text}`
      );
      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('No valid changes detected')
      );
      const taskFromService = findTaskById(taskToUpdateId);
      expect(taskFromService?.text).toBe(originalTask.text);
      expect(taskFromService?.status).toBe(newStatus);
    });

    it('should return null if the task to update is not found', () => {
      const nonExistentId = 'id-that-definitely-does-not-exist';
      const result = updateTask(nonExistentId, { text: 'This update should not happen' });

      expect(result).toBeNull();

      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('Task updated in service:')
      );
      expect(consoleSpyLog).not.toHaveBeenCalledWith(
        expect.stringContaining('No valid changes detected')
      );
      expect(consoleSpyWarn).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    let taskToDeleteId: string;
    let initialLength: number;

    beforeEach(() => {
      taskToDeleteId = initialTasks[0].id;
      initialLength = initialTasks.length;
    });

    it('should delete an existing task and return true', () => {
      const result = deleteTask(taskToDeleteId);
      expect(result).toBe(true);
      expect(consoleSpyLog).toHaveBeenCalledWith(`Task deleted in service: ${taskToDeleteId}`);

      const allTasks = getAllTasks();
      expect(allTasks).toHaveLength(initialLength - 1);
      const deletedTask = allTasks.find((task: Task) => task.id === taskToDeleteId);
      expect(deletedTask).toBeUndefined();
    });

    it('should return false if the task to delete is not found', () => {
      const nonExistentId = 'non-existent-id';
      const result = deleteTask(nonExistentId);
      expect(result).toBe(false);
      expect(consoleSpyWarn).toHaveBeenCalledWith(
        `Task delete service: Task not found ${nonExistentId}`
      );

      const allTasks = getAllTasks();
      expect(allTasks).toHaveLength(initialLength);
    });
  });
});
