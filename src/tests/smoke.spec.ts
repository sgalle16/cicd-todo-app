import { test, expect, request, APIRequestContext } from '@playwright/test';
import { Task } from '../types/task.types';

interface HealthStatus {
  status: string;
}

// Base URL for the environment under test (prod in this case)
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';

test.describe('Production Smoke Tests', () => {
  let apiRequestContext: APIRequestContext; // Reusable context for API requests

  // Runs once before all tests in this describe block
  test.beforeAll(async () => {
    // Create a persistent context for API calls to potentially reuse connections
    apiRequestContext = await request.newContext({});
    console.log(`Running smoke tests against: ${APP_BASE_URL}`);
    // Short delay to allow service  to potentially settle after deployment/update signal
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  // Runs once after all tests in this describe block
  test.afterAll(async () => {
    await apiRequestContext.dispose();
  });

  /* 
  Test Case: Verify the Health Check Endpoint
  */
  test('should return 200 OK from /health endpoint', async () => {
    const response = await apiRequestContext.get(`${APP_BASE_URL}/health`);
    // Check if the response status is 2xx.
    expect(response.ok(), `Health check failed with status ${response.status()}`).toBeTruthy();
    const body = (await response.json()) as HealthStatus;
    expect(body, 'Health check response body did not match expected').toEqual({ status: 'TEST' });
  });

  /* 
  Test Case: Verify Core API Endpoint Accessibility
  */
  test('should access API root and get a valid response', async () => {
    const response = await apiRequestContext.get(`${APP_BASE_URL}/api/tasks`);
    // Check if the response status is 2xx.
    expect(response.ok(), `GET /api/tasks failed with status ${response.status()}`).toBeTruthy();
    const body = (await response.json()) as Task[];
    // Assert that the response body is an array (it's okay if it's empty)
    expect(Array.isArray(body), 'Response body from GET /api/tasks was not an array').toBe(true);
  });

  /*
  Test Case: Verify Frontend Basic Load
  Uses the 'page' fixture provided by Playwright Test runner for UI interaction
  */
  test('should load frontend page and see main title', async ({ page }) => {
    await page.goto(APP_BASE_URL + '/');
    await expect(page, 'Page title is incorrect').toHaveTitle(/ToDo|Kanban/);
    const heading = page.locator('h1.board-title');
    await expect(heading, 'Main heading (h1.board-title) not visible').toBeVisible();
    await expect(heading, 'Main heading text is incorrect').toContainText(/Kanban|ToDo/);
  });
});
