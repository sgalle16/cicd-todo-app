import { Request, Response } from 'express';
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import * as TaskController from '../controllers/task.controller';
import * as TaskService from '../services/task.service';
import { Task, TaskStatus } from '../types/task.types';

// --- Mocking the TaskService ---
jest.mock('../services/task.service');
const mockedTaskService = TaskService as jest.Mocked<typeof TaskService>;

describe('Task Controller - Unit Tests', () => {
  let req: MockRequest<Request>;
  let res: MockResponse<Response>;

  beforeEach(() => {
    // Reset mocks and create fresh req/res objects for each test
    jest.clearAllMocks();
    res = createResponse(); // Create a new response object before each test
    // You can create req here too if it's generic, or within each test if specific properties are needed
  });

  // --- getTasks ---
  describe('getTasks', () => {
    beforeEach(() => {
       req = createRequest();
    });

    it('should call TaskService.getAllTasks and return 200 with tasks', () => {
        const now = new Date(); // Define now once if comparing dates
        const mockTasks: Task[] = [
          { id: 't1', text: 'Test 1', status: 'todo', createdAt: now, updatedAt: now },
          { id: 't2', text: 'Test 2', status: 'done', createdAt: now, updatedAt: now },
        ];
        mockedTaskService.getAllTasks.mockReturnValue(mockTasks);
  
        // Act
        TaskController.getTasks(req, res);
  
        // Assert
        expect(mockedTaskService.getAllTasks).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(200);
  
        const responseData = res._getJSONData();
        expect(responseData).toBeInstanceOf(Array);
        expect(responseData.length).toBe(2);
        // Check the structure and non-date fields using objectContaining
        expect(responseData[0]).toEqual(expect.objectContaining({
          id: 't1',
          text: 'Test 1',
          status: 'todo',
        }));
        // Check that date properties exist and are strings
        expect(responseData[0]).toHaveProperty('createdAt');
        expect(typeof responseData[0].createdAt).toBe('string');
        expect(responseData[0]).toHaveProperty('updatedAt');
        expect(typeof responseData[0].updatedAt).toBe('string');
      });

    it('should return 500 if TaskService.getAllTasks throws an error', () => {
      const errorMessage = 'Database error';
      mockedTaskService.getAllTasks.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Act
      TaskController.getTasks(req, res);

      // Assert
      expect(mockedTaskService.getAllTasks).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: 'Failed to retrieve tasks' });
    });
  });

  // --- postTask ---
  describe('postTask', () => {
    it('should call TaskService.createTask and return 201 with the new task on valid input', () => {
        const taskText = 'Brand new task';
        const now = new Date();
        const createdTask: Task = { id: 'newT', text: taskText, status: 'todo', createdAt: now, updatedAt: now };
        req = createRequest({
          method: 'POST',
          body: { text: taskText },
        });
        mockedTaskService.createTask.mockReturnValue(createdTask);
  
        // Act
        TaskController.postTask(req, res);
  
        // Assert
        expect(mockedTaskService.createTask).toHaveBeenCalledWith(taskText);
        expect(mockedTaskService.createTask).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(201);
  
        // --- Correction ---
        const responseData = res._getJSONData();
         // Check the structure and non-date fields using objectContaining
        expect(responseData).toEqual(expect.objectContaining({
          id: createdTask.id,
          text: createdTask.text,
          status: createdTask.status,
        }));
         // Check that date properties exist and are strings
        expect(responseData).toHaveProperty('createdAt');
        expect(typeof responseData.createdAt).toBe('string');
        expect(responseData).toHaveProperty('updatedAt');
        expect(typeof responseData.updatedAt).toBe('string');

      });

    it('should return 400 if text is missing in the body', () => {
      req = createRequest({ method: 'POST', body: {} });

      // Act
      TaskController.postTask(req, res);

      // Assert
      expect(mockedTaskService.createTask).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ error: 'Task text is required and cannot be empty.' });
    });

     it('should return 400 if text is an empty string', () => {
        req = createRequest({ method: 'POST', body: { text: '  ' } }); // Whitespace only

        TaskController.postTask(req, res);

        expect(mockedTaskService.createTask).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ error: 'Task text is required and cannot be empty.' });
    });

    it('should return 400 if text is not a string', () => {
        req = createRequest({ method: 'POST', body: { text: 123 } }); // Number instead of string

        TaskController.postTask(req, res);

        expect(mockedTaskService.createTask).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ error: 'Task text is required and cannot be empty.' });
    });

    it('should return 500 if TaskService.createTask throws an error', () => {
       const taskText = 'Valid text';
       req = createRequest({ method: 'POST', body: { text: taskText } });
       const errorMessage = 'Creation failed';
       mockedTaskService.createTask.mockImplementation(() => {
         throw new Error(errorMessage);
       });

       TaskController.postTask(req, res);

       expect(mockedTaskService.createTask).toHaveBeenCalledWith(taskText);
       expect(res.statusCode).toBe(500); // Assumes generic catch block message
       expect(res._getJSONData()).toEqual({ error: 'Failed to create task' }); // Check controller's error message
    });

     it('should return 400 if TaskService.createTask throws a specific validation error', () => {
       // This tests the specific error handling in your controller's catch block
       const taskText = 'Valid text';
       req = createRequest({ method: 'POST', body: { text: taskText } });
       const errorMessage = 'Invalid task text provided by service';
       mockedTaskService.createTask.mockImplementation(() => {
         const error = new Error(errorMessage);
         // Simulate how your controller checks the message
         // In a real scenario, the service might throw a custom error type
         throw error;
       });

       TaskController.postTask(req, res);

       expect(mockedTaskService.createTask).toHaveBeenCalledWith(taskText);
       expect(res.statusCode).toBe(400); // Controller should map this specific error message to 400
       expect(res._getJSONData()).toEqual({ error: errorMessage });
    });
  });

  // --- putTask ---
  describe('putTask', () => {
    const taskId = 'task123';

    it('should call TaskService.updateTask and return 200 with the updated task on valid input', () => {
        const updates = { text: 'Updated Task', status: 'doing' as TaskStatus };
        const createdAtDate = new Date();
        const updatedAtDate = new Date(createdAtDate.getTime() + 1000); // Ensure different date
        const updatedTask: Task = { id: taskId, text: updates.text, status: updates.status, createdAt: createdAtDate, updatedAt: updatedAtDate };
        req = createRequest({ method: 'PUT', params: { id: taskId }, body: updates });
        mockedTaskService.updateTask.mockReturnValue(updatedTask);
  
        // Act
        TaskController.putTask(req, res);
  
        // Assert
        expect(mockedTaskService.updateTask).toHaveBeenCalledWith(taskId, updates);
        expect(mockedTaskService.updateTask).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(200);
  
        const responseData = res._getJSONData();
        // Check the structure and non-date fields using objectContaining
        expect(responseData).toEqual(expect.objectContaining({
            id: taskId,
            text: updates.text,
            status: updates.status,
        }));
        // Check that date properties exist and are strings
        expect(responseData).toHaveProperty('createdAt');
        expect(typeof responseData.createdAt).toBe('string');
        expect(responseData).toHaveProperty('updatedAt');
        expect(typeof responseData.updatedAt).toBe('string');

      });

    it('should return 400 if status is invalid', () => {
      req = createRequest({ method: 'PUT', params: { id: taskId }, body: { status: 'invalid-status' } });

      TaskController.putTask(req, res);

      expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ error: 'Invalid status value provided.' });
    });

     it('should return 400 if text is not a string', () => {
      req = createRequest({ method: 'PUT', params: { id: taskId }, body: { text: true } }); // Boolean

      TaskController.putTask(req, res);

      expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ error: 'Task text must be a string.' });
    });

     it('should return 400 if no valid fields (status or text) are provided', () => {
      req = createRequest({ method: 'PUT', params: { id: taskId }, body: { other: 'value' } }); // No valid fields

      TaskController.putTask(req, res);

      expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ error: 'No valid fields provided for update (status or text).' });
    });

    it('should return 404 if TaskService.updateTask returns null (task not found)', () => {
        const updates = { status: 'done' as TaskStatus };
        req = createRequest({ method: 'PUT', params: { id: taskId }, body: updates });
        mockedTaskService.updateTask.mockReturnValue(null); // Simulate task not found

        TaskController.putTask(req, res);

        expect(mockedTaskService.updateTask).toHaveBeenCalledWith(taskId, updates);
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ error: 'Task not found.' });
    });

    it('should return 500 if TaskService.updateTask throws an error', () => {
      const updates = { text: 'Update attempt' };
      req = createRequest({ method: 'PUT', params: { id: taskId }, body: updates });
      const errorMessage = 'Concurrency issue';
      mockedTaskService.updateTask.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      TaskController.putTask(req, res);

      expect(mockedTaskService.updateTask).toHaveBeenCalledWith(taskId, updates);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: errorMessage }); // Controller passes service error message directly
    });
  });

  // --- deleteTaskById ---
  describe('deleteTaskById', () => {
     const taskId = 'taskToDelete';

     beforeEach(() => {
         req = createRequest({ method: 'DELETE', params: { id: taskId } });
     });

    it('should call TaskService.deleteTask and return 204 on success', () => {
      mockedTaskService.deleteTask.mockReturnValue(true); // Simulate successful deletion

      // Act
      TaskController.deleteTaskById(req, res);

      // Assert
      expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockedTaskService.deleteTask).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(204);
      expect(res._isEndCalled()).toBe(true); // Check that response was ended (send() was called)
    });

    it('should return 404 if TaskService.deleteTask returns false (task not found)', () => {
        mockedTaskService.deleteTask.mockReturnValue(false); // Simulate task not found

        TaskController.deleteTaskById(req, res);

        expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(taskId);
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ error: 'Task not found.' });
    });

     it('should return 500 if TaskService.deleteTask throws an error', () => {
        const errorMessage = 'Deletion failed';
        mockedTaskService.deleteTask.mockImplementation(() => {
          throw new Error(errorMessage);
        });

        TaskController.deleteTaskById(req, res);

        expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(taskId);
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ error: 'Failed to delete task' });
    });
  });
});