import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000'; 


async function addTask(page: Page, taskText: string) {
    await page.locator('#newTaskInput').fill(taskText);
    await page.locator('#addTaskForm button[type="submit"]').click();
    // Wait for the task card to appear in the todo column
    const taskLocator = page.locator(`#todo-tasks .task-card:has-text("${taskText}")`);
    await expect(taskLocator).toBeVisible({ timeout: 10000 }); // Wait longer after add
    return taskLocator;
}

test.describe('Kanban Board UI E2E Tests', () => {
    let page: Page;

    // Runs before each test in the describe block
    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(FRONTEND_URL);
    });

    // Runs after each test
    test.afterEach(async () => {
        await page.close();
    });

    test('should load the page correctly', async () => {
        await expect(page).toHaveTitle(/Kanban Board/);
        await expect(page.locator('h1.board-title')).toHaveText('Mi Tablero Kanban');
        await expect(page.locator('#todo-tasks')).toBeVisible();
        await expect(page.locator('#doing-tasks')).toBeVisible();
        await expect(page.locator('#done-tasks')).toBeVisible();
    });

    test('should add a new task to the "Por Hacer" column', async () => {
        const taskText = `New Playwright Task ${Date.now()}`;
        const taskLocator = await addTask(page, taskText); // Use helper

        // Verify it's in the correct column
        await expect(page.locator('#todo-tasks')).toContainText(taskText);
        await expect(taskLocator.locator('.task-text')).toHaveText(taskText);
    });

    test('should delete a task', async () => {
        const taskText = `Task to Delete ${Date.now()}`;
        const taskLocator = await addTask(page, taskText);

        // --- Handle Alert Dialog ---
        // Playwright needs you to register the dialog handler BEFORE the action that triggers it
        let alertMessage = '';
        page.once('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            alertMessage = dialog.message();
            await dialog.accept(); // Automatically accept the confirm() dialog
        });
        // ---------------------------

        // Click the delete button within the specific task card
        await taskLocator.locator('button.delete-btn').click();

        // Verify the dialog was handled and the message was correct
        expect(alertMessage).toContain(`"${taskText}"`); // Check alert text

        // Verify the task card is removed from the DOM
        await expect(taskLocator).not.toBeVisible({ timeout: 5000 }); // Or use .toBeHidden() / .count() === 0
        await expect(page.locator(`#todo-tasks :text("${taskText}")`)).not.toBeVisible();
    });

    test('should drag a task from "Por Hacer" to "Haciendo"', async () => {
        const taskText = `Task to Drag ${Date.now()}`;
        const taskLocator = await addTask(page, taskText);
        const doingColumnLocator = page.locator('#doing-tasks');

        // Perform drag and drop
        await taskLocator.dragTo(doingColumnLocator);

        // Verify the task is now visually within the 'Doing' column's container
        // Use a locator that checks for the task text within the target column
        const taskInDoingLocator = page.locator(`#doing-tasks .task-card:has-text("${taskText}")`);
        await expect(taskInDoingLocator).toBeVisible({ timeout: 5000 });

        // Verify it's gone from the 'Todo' column
        const taskInTodoLocator = page.locator(`#todo-tasks .task-card:has-text("${taskText}")`);
        await expect(taskInTodoLocator).not.toBeVisible(); // Or .toBeHidden()
    });

     test('should drag a task from "Haciendo" to "Hecho"', async () => {
        const taskText = `Task to Finish ${Date.now()}`;
        const todoTaskLocator = await addTask(page, taskText);
        const doingColumnLocator = page.locator('#doing-tasks');
        const doneColumnLocator = page.locator('#done-tasks');

        // Move to Doing first
        await todoTaskLocator.dragTo(doingColumnLocator);
        const doingTaskLocator = page.locator(`#doing-tasks .task-card:has-text("${taskText}")`);
        await expect(doingTaskLocator).toBeVisible({ timeout: 5000 }); // Confirm intermediate move

        // Move from Doing to Done
        await doingTaskLocator.dragTo(doneColumnLocator);

        // Verify in Done column
        const doneTaskLocator = page.locator(`#done-tasks .task-card:has-text("${taskText}")`);
        await expect(doneTaskLocator).toBeVisible({ timeout: 5000 });

        // Verify gone from Doing column
        await expect(doingTaskLocator).not.toBeVisible();
    });

});