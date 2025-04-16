import axios from 'axios';

import { AxiosError } from 'axios';
import { Task, TaskStatus } from '../../src/types/task.types'; // Adjust path

// --- Configuration ---
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/tasks'; // API Endpoint

// Helper function to fetch all tasks and optionally find one by ID
async function getAllTasks(findId?: string): Promise<Task[] | Task | null> {
    const response = await axios.get<Task[]>(BASE_URL);
    expect(response.status).toBe(200); // Basic check within helper
    if (findId) {
        return response.data.find(task => task.id === findId) || null;
    }
    return response.data;
}

describe('Task API - E2E Tests (Simulating Frontend Flow)', () => {
    let testTask: Task | null = null; // Store the full task object created
    let idOfTaskToDelete: string | null = null;

    beforeAll(async () => {
        // Optional: Clear data via a dedicated test endpoint if available
        // try { await axios.delete(`${BASE_URL}/test/clear-all`); } catch (e) {}
        console.log(`Running E2E tests against: ${BASE_URL}`);
        // Ensure server is ready
        await new Promise(resolve => setTimeout(resolve, 500));
    });


    it('Step 1 (Load Page): should initially GET tasks', async () => {
        try {
            const tasks = await getAllTasks() as Task[];
            expect(tasks).toBeInstanceOf(Array);
            // If data was cleared, you could assert length is 0:
            // expect(tasks.length).toBe(0);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Initial GET Error:', axiosError.response?.data);
            throw error;
        }
    });

    it('Step 2 (Add Task): should POST a new task via form simulation', async () => {
        const newTaskData = { text: 'My E2E Task (Simulated Add)' };
        try {
            const response = await axios.post<Task>(BASE_URL, newTaskData, {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('id');
            expect(response.data.text).toEqual(newTaskData.text);
            expect(response.data.status).toEqual('todo'); // Default status
            expect(response.data.createdAt).toBeDefined();
            expect(response.data.updatedAt).toBeDefined();
            expect(response.data.createdAt).toEqual(response.data.updatedAt); // Initially equal

            testTask = response.data; // Store the created task details

        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('POST Error:', axiosError.response?.data);
            throw error;
        }
    });

    it('Step 3 (Verify Add): should GET all tasks and find the newly added task', async () => {
        expect(testTask).not.toBeNull(); // Ensure previous step created it

        try {
            const foundTask = await getAllTasks(testTask!.id) as Task | null;
            expect(foundTask).toBeDefined();
            expect(foundTask).not.toBeNull();
            // Compare relevant fields (dates might have slight format diffs if parsed)
            expect(foundTask?.id).toEqual(testTask!.id);
            expect(foundTask?.text).toEqual(testTask!.text);
            expect(foundTask?.status).toEqual('todo');
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('GET after POST Error:', axiosError.response?.data);
            throw error;
        }
    });

     it('Step 4 (Move Task - Drag/Drop): should PUT to update only the status', async () => {
        expect(testTask).not.toBeNull();
        const taskId = testTask!.id;
        const originalUpdatedAt = testTask!.updatedAt; // Store for comparison
        const statusUpdate = { status: 'doing' as TaskStatus }; // Payload matches JS

        try {
            const response = await axios.put<Task>(`${BASE_URL}/${taskId}`, statusUpdate, {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(response.status).toBe(200);
            expect(response.data.id).toEqual(taskId);
            expect(response.data.text).toEqual(testTask!.text); // Text should NOT change
            expect(response.data.status).toEqual(statusUpdate.status); // Status should change
            expect(response.data.updatedAt).toBeDefined();
            // Verify updatedAt timestamp has changed
            expect(response.data.updatedAt).not.toEqual(originalUpdatedAt);

            // Update local copy for subsequent tests
            testTask = response.data;

        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('PUT Error:', axiosError.response?.data);
            throw error;
        }
    });

     it('Step 5 (Verify Move): should GET all tasks and find the updated task', async () => {
        expect(testTask).not.toBeNull(); // Ensure previous step updated it
        expect(testTask!.status).toEqual('doing'); // Check local copy first

        try {
            const foundTask = await getAllTasks(testTask!.id) as Task | null;
            expect(foundTask).toBeDefined();
            expect(foundTask).not.toBeNull();
            expect(foundTask?.id).toEqual(testTask!.id);
            expect(foundTask?.text).toEqual(testTask!.text);
            expect(foundTask?.status).toEqual('doing'); // Verify updated status
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('GET after PUT Error:', axiosError.response?.data);
            throw error;
        }
    });

    it('Step 6 (Delete Task): should DELETE the task', async () => {
         expect(testTask).not.toBeNull();
         idOfTaskToDelete = testTask!.id;
         try {
            const response = await axios.delete(`${BASE_URL}/${idOfTaskToDelete}`);
            expect(response.status).toBe(204); // No Content
            testTask = null; // Clear local *object* copy
            // Keep taskIdToDelete available for the next step
         } catch (error) {
            const axiosError = error as AxiosError;
            console.error('DELETE Error:', axiosError.response?.data);
            idOfTaskToDelete = null; // Clear ID if delete failed? Or leave it to fail next step?
            throw error;
         }
    });

     it('Step 7 (Verify Delete): should GET all tasks and NOT find the deleted task', async () => {
         expect(testTask).toBeNull(); // Ensure previous step cleared it
         expect(idOfTaskToDelete).not.toBeNull();
         try {
            const foundTask = await getAllTasks(idOfTaskToDelete!) as Task | null;
             expect(foundTask).toBeNull(); // Expect NOT to find it
         } catch (error) {
             // Handle case where GET itself fails if API is down, etc.
             const axiosError = error as AxiosError;
             console.error('GET after DELETE Error:', axiosError.response?.data);
             throw error;
         }
    });

    // --- Error Condition Tests  ---

    it('should return 400 on POST with invalid data', async () => {
        const invalidData = { text: '' };
         try {
            await axios.post<Task>(BASE_URL, invalidData, {
                 headers: { 'Content-Type': 'application/json' }
            });
            throw new Error('POST with invalid data succeeded but should have failed.');
         } catch (error) {
             const axiosError = error as AxiosError;
             expect(axiosError.response).toBeDefined();
             expect(axiosError.response?.status).toBe(400);
             expect(axiosError.response?.data).toEqual({ error: 'Task text is required and cannot be empty.' });
         }
    });

     it('should return 404 on PUT for a non-existent task ID', async () => {
        const updates = { status: 'done' as TaskStatus };
         try {
            await axios.put<Task>(`${BASE_URL}/non-existent-id-12345`, updates, {
                 headers: { 'Content-Type': 'application/json' }
            });
            throw new Error('PUT for non-existent ID succeeded but should have failed.');
         } catch (error) {
             const axiosError = error as AxiosError;
             expect(axiosError.response).toBeDefined();
             expect(axiosError.response?.status).toBe(404);
             expect(axiosError.response?.data).toEqual({ error: 'Task not found.' });
         }
    });

     it('should return 404 on DELETE for a non-existent task ID', async () => {
         try {
            await axios.delete(`${BASE_URL}/non-existent-id-12345`);
             throw new Error('DELETE for non-existent ID succeeded but should have failed.');
         } catch (error) {
             const axiosError = error as AxiosError;
             expect(axiosError.response).toBeDefined();
             expect(axiosError.response?.status).toBe(404);
             expect(axiosError.response?.data).toEqual({ error: 'Task not found.' });
         }
    });

});