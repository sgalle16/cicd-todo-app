import request from 'supertest';
import app from '../server'; // Adjust the path to your exported Express app
import * as TaskService from '../services/task.service'; // Import the service to mock it
import { Task, TaskStatus } from '../types/task.types'; // Import Task type

type TaskResponse = Omit<Task, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

// --- Mocking the TaskService ---
jest.mock('../services/task.service');
const mockedTaskService = TaskService as jest.Mocked<typeof TaskService>;

// --- Test Suite ---
describe('Task API Endpoints', () => {
  const API_BASE_PATH = '/api/tasks'; // path to the API

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /tasks ---
  describe('GET ' + API_BASE_PATH, () => {
    it('should return 200 OK and an array of tasks matching the Task interface', async () => {
      const now = new Date();
      const mockTasks: Task[] = [
        { id: '1', text: 'Task 1', status: 'todo', createdAt: now, updatedAt: now },
        { id: '2', text: 'Task 2', status: 'doing', createdAt: now, updatedAt: now },
      ];
      mockedTaskService.getAllTasks.mockReturnValue(mockTasks);

      const response = await request(app)
        .get(API_BASE_PATH)
        .expect('Content-Type', /json/)
        .expect(200);

      const tasks = response.body as TaskResponse[];

      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBe(2);
      expect(tasks[0]).toEqual(
        expect.objectContaining({
          id: '1',
          text: 'Task 1',
          status: 'todo',
        })
      );
      expect(tasks[0]).toHaveProperty('createdAt');
      expect(typeof tasks[0].createdAt).toBe('string');
      expect(tasks[0]).toHaveProperty('updatedAt');
      expect(typeof tasks[0].updatedAt).toBe('string');
      expect(mockedTaskService.getAllTasks).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if the service throws an error', async () => {
      mockedTaskService.getAllTasks.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get(API_BASE_PATH)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to retrieve tasks' });
      expect(mockedTaskService.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  // --- POST /tasks ---
  describe('POST ' + API_BASE_PATH, () => {
    it('should return 201 Created and the new task matching the Task interface', async () => {
      const newTaskData = { text: 'A new task' };
      const now = new Date();
      const createdTask: Task = {
        id: 'new-id-123',
        text: newTaskData.text,
        status: 'todo', // Assuming default status
        createdAt: now,
        updatedAt: now, // For a new task, createdAt and updatedAt are often the same
      };
      mockedTaskService.createTask.mockReturnValue(createdTask);

      const response = await request(app)
        .post(API_BASE_PATH)
        .send(newTaskData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdTask.id,
          text: createdTask.text,
          status: createdTask.status,
        })
      );
      // Check date properties exist (serialized as strings)
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(typeof (response.body as TaskResponse).createdAt).toBe('string');
      expect(typeof (response.body as TaskResponse).updatedAt).toBe('string');

      expect(mockedTaskService.createTask).toHaveBeenCalledWith(newTaskData.text);
      expect(mockedTaskService.createTask).toHaveBeenCalledTimes(1);
    });

    // ... (Keep the 400 Bad Request tests for POST as they are, they test input validation before the Task type is relevant) ...
    it('should return 400 Bad Request if text is missing', async () => {
      const response = await request(app)
        .post(API_BASE_PATH)
        .send({}) // Empty body
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Task text is required and cannot be empty.' });
      expect(mockedTaskService.createTask).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if text is empty string', async () => {
      const response = await request(app)
        .post(API_BASE_PATH)
        .send({ text: ' ' }) // Empty text
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Task text is required and cannot be empty.' });
      expect(mockedTaskService.createTask).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if text is not a string', async () => {
      const response = await request(app)
        .post(API_BASE_PATH)
        .send({ text: 123 }) // Invalid type
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Task text is required and cannot be empty.' });
      expect(mockedTaskService.createTask).not.toHaveBeenCalled();
    });

    it('should return 500 if the service throws an error during creation', async () => {
      mockedTaskService.createTask.mockImplementation(() => {
        throw new Error('Failed to save');
      });

      const response = await request(app)
        .post(API_BASE_PATH)
        .send({ text: 'Valid text but service fails' })
        .expect('Content-Type', /json/)
        .expect(500); // Or 400 if the controller catches specific service errors

      expect(response.body).toEqual({ error: 'Failed to create task' }); // Adjust expected error based on controller logic
      expect(mockedTaskService.createTask).toHaveBeenCalledTimes(1);
    });
  });

  // --- PUT /tasks/:id ---
  describe('PUT ' + API_BASE_PATH + '/:id', () => {
    const taskId = 'task-to-update';
    const validUpdateData = { status: 'done' as TaskStatus, text: 'Updated Task Text' };
    const now = new Date();
    const later = new Date(now.getTime() + 1000); // Simulate time passing for update
    const updatedTask: Task = {
      id: taskId,
      text: validUpdateData.text,
      status: validUpdateData.status,
      createdAt: now, // Assume createdAt remains the original time
      updatedAt: later, // updatedAt reflects the update time
    };

    it('should return 200 OK and the updated task matching the Task interface', async () => {
      mockedTaskService.updateTask.mockReturnValue(updatedTask);

      const response = await request(app)
        .put(`${API_BASE_PATH}/${taskId}`)
        .send(validUpdateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: taskId,
          text: validUpdateData.text,
          status: validUpdateData.status,
        })
      );
      // Check date properties exist and are strings
      expect(response.body).toHaveProperty('createdAt'); // Keep this simple check
      expect(response.body).toHaveProperty('updatedAt'); // Keep this simple check
      expect(typeof (response.body as TaskResponse).createdAt).toBe('string'); // Assert type before accessing property
      expect(typeof (response.body as TaskResponse).updatedAt).toBe('string'); // Assert type before accessing property

      expect(mockedTaskService.updateTask).toHaveBeenCalledWith(taskId, validUpdateData);
      expect(mockedTaskService.updateTask).toHaveBeenCalledTimes(1);
    });

    it('should return 404 Not Found if task ID does not exist', async () => {
      mockedTaskService.updateTask.mockReturnValue(null); // Service indicates task not found

      await request(app)
        .put(`${API_BASE_PATH}/non-existent-id`)
        .send({ status: 'done' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(mockedTaskService.updateTask).toHaveBeenCalledWith('non-existent-id', {
        status: 'done',
      });
    });

    it('should return 400 Bad Request for invalid status value', async () => {
      await request(app)
        .put(`${API_BASE_PATH}/${taskId}`)
        .send({ status: 'pending' }) // Invalid status
        .expect('Content-Type', /json/)
        .expect(400);

      expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if text is not a string', async () => {
      await request(app)
        .put(`${API_BASE_PATH}/${taskId}`)
        .send({ text: false }) // Invalid type
        .expect('Content-Type', /json/)
        .expect(400);

      expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if no valid fields are provided', async () => {
      await request(app)
        .put(`${API_BASE_PATH}/${taskId}`)
        .send({ unrelatedField: 123 }) // No 'status' or 'text'
        .expect('Content-Type', /json/)
        .expect(400);

      expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
    });

    it('should return 500 if the service throws an error during update', async () => {
      mockedTaskService.updateTask.mockImplementation(() => {
        throw new Error('Update conflict');
      });

      const response = await request(app)
        .put(`${API_BASE_PATH}/${taskId}`)
        .send({ text: 'Valid update but service fails' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Update conflict' }); // Error message from the thrown error
      expect(mockedTaskService.updateTask).toHaveBeenCalledTimes(1);
    });
  });

  // --- DELETE /tasks/:id ---
  describe('DELETE ' + API_BASE_PATH + '/:id', () => {
    const taskIdToDelete = 'task-to-delete';

    it('should return 204 No Content on successful deletion', async () => {
      mockedTaskService.deleteTask.mockReturnValue(true); // Service indicates success

      await request(app)
        .delete(`${API_BASE_PATH}/${taskIdToDelete}`) // Now uses the variable from the describe scope
        .expect(204); // No Content-Type check needed for 204

      expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(taskIdToDelete);
      expect(mockedTaskService.deleteTask).toHaveBeenCalledTimes(1);
    });

    it('should return 404 Not Found if task ID does not exist', async () => {
      mockedTaskService.deleteTask.mockReturnValue(false); // Service indicates task not found
      const nonExistentId = 'non-existent-id'; // Use a different ID for clarity

      const response = await request(app)
        .delete(`${API_BASE_PATH}/${nonExistentId}`)
        .expect('Content-Type', /json/) // 404 has a JSON body
        .expect(404);

      expect(response.body).toEqual({ error: 'Task not found.' }); // Check error message for 404
      expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(nonExistentId);
    });

    it('should return 500 if the service throws an error during deletion', async () => {
      mockedTaskService.deleteTask.mockImplementation(() => {
        throw new Error('Deletion restricted');
      });

      const response = await request(app)
        // Now correctly uses the taskIdToDelete defined in the describe block
        .delete(`${API_BASE_PATH}/${taskIdToDelete}`)
        .expect('Content-Type', /json/) // 500 has a JSON body
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to delete task' });
      // We expect the service to be called, even if it throws
      expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(taskIdToDelete);
      expect(mockedTaskService.deleteTask).toHaveBeenCalledTimes(1);
    });
  });
});
