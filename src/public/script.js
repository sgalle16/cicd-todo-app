// --- DOM Elements ---
const taskContainers = {
  todo: document.getElementById('todo-tasks'),
  doing: document.getElementById('doing-tasks'),
  done: document.getElementById('done-tasks'),
};
const addTaskForm = document.getElementById('addTaskForm');
const newTaskInput = document.getElementById('newTaskInput');
const messageArea = document.getElementById('messageArea');

// --- API Configuration ---
const API_BASE_URL = '/api';

// --- State ---
let draggedTaskElement = null;
let tasksState = []; // Local cache of tasks

// --- Utility Functions ---
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    // Format like: 14 Abr, 19:55
    return (
      date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) +
      ', ' +
      date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return 'Fecha inválida';
  }
}

function showMessage(message, isError) {
  if (isError === void 0) {
    isError = false;
  }
  if (messageArea) {
    messageArea.textContent = message;
    messageArea.className = `text-center mb-4 font-medium ${
      isError ? 'text-red-600' : 'text-green-600'
    }`;
    // Clear message after some time
    setTimeout(function () {
      if (messageArea.textContent === message) {
        // Avoid clearing newer messages
        messageArea.textContent = '';
        messageArea.className = 'text-center mb-4 min-h-[24px]'; // Reset class
      }
    }, 4000);
  }
}

// --- API Interaction Functions ---
async function fetchTasks() {
  console.log('Fetching tasks from backend...');
  try {
    // fetch automatically uses the current domain when the path starts with '/'
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      // Try to parse error from backend, otherwise use statusText
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        /* Ignore parsing error */
      }
      throw new Error(`Error fetching tasks: ${errorMsg}`);
    }
    tasksState = await response.json(); // Assume backend sends correct Task[] type
    console.log('Tasks fetched successfully:', tasksState.length);
    renderBoard();
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    showMessage('Error al cargar las tareas desde el servidor.', true);
    tasksState = [];
    renderBoard();
  }
}

async function addTaskAPI(text) {
  if (!text || !text.trim()) {
    showMessage('El texto de la tarea no puede estar vacío.', true);
    return;
  }
  console.log('Adding task via API:', text.trim());
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    });
    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        /* Ignore parsing error */
      }
      throw new Error(errorMsg);
    }
    const newTask = await response.json();
    console.log('Task added successfully:', newTask.id);
    tasksState.push(newTask);
    renderTask(newTask);
    showMessage('Tarea añadida con éxito.', false);
    if (newTaskInput) newTaskInput.value = ''; // Clear input on success
  } catch (error) {
    console.error('Failed to add task:', error);
    showMessage(`Error al añadir tarea: ${error.message}`, true);
  }
}

async function updateTaskAPI(taskId, updates) {
  // 'updates' is an object like { status: 'done' } or { text: 'new text' }
  console.log(`Updating task ${taskId} with`, updates, `via API...`);
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates), // Send the updates object
    });
    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        /* Ignore parsing error */
      }
      throw new Error(errorMsg);
    }
    const updatedTask = await response.json();
    console.log('Task updated successfully:', updatedTask.id);

    // Update local state
    const taskIndex = tasksState.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      tasksState[taskIndex] = updatedTask;
    }
    // Update timestamp on the moved element
    const taskElement = document.getElementById(taskId);
    const timestampElement = taskElement?.querySelector('.task-timestamp');
    if (timestampElement) {
      timestampElement.textContent = `Actualizado: ${formatDate(updatedTask.updatedAt)}`;
    }
    return true; // Indicate success
  } catch (error) {
    console.error('Failed to update task:', error);
    showMessage(`Error al actualizar tarea: ${error.message}`, true);
    return false; // Indicate failure
  }
}

async function deleteTaskAPI(taskId) {
  console.log(`Deleting task ${taskId} via API...`);
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      // 204 is success for DELETE
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        /* Ignore parsing error */
      }
      throw new Error(errorMsg);
    }
    console.log('Task deleted successfully:', taskId);
    tasksState = tasksState.filter((t) => t.id !== taskId);
    return true;
  } catch (error) {
    console.error('Failed to delete task:', error);
    showMessage(`Error al eliminar tarea: ${error.message}`, true);
    return false;
  }
}

// --- DOM Manipulation & Rendering ---
function createTaskElement(task) {
  const taskCard = document.createElement('div');
  taskCard.classList.add('task-card');
  taskCard.setAttribute('draggable', 'true');
  taskCard.setAttribute('id', task.id);
  taskCard.dataset.status = task.status; // Store status for potential use

  const taskTextSpan = document.createElement('span');
  taskTextSpan.classList.add('task-text');
  taskTextSpan.textContent = task.text;

  const timestampSpan = document.createElement('span');
  timestampSpan.classList.add('task-timestamp');
  // Show updated time, fallback to created time
  timestampSpan.textContent = `Actualizado: ${formatDate(task.updatedAt || task.createdAt)}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('aria-label', 'Eliminar tarea');
  deleteBtn.addEventListener('click', handleDeleteTask); // Use specific handler

  taskCard.appendChild(taskTextSpan);
  taskCard.appendChild(timestampSpan);
  taskCard.appendChild(deleteBtn);
  // Add drag listeners
  taskCard.addEventListener('dragstart', handleDragStart);
  taskCard.addEventListener('dragend', handleDragEnd);

  return taskCard;
}

function renderTask(task) {
  const container = taskContainers[task.status];
  if (container) {
    const taskElement = createTaskElement(task);
    container.appendChild(taskElement);
  } else {
    console.warn('Container not found for status: '.concat(task.status));
  }
}

function clearBoard() {
  Object.values(taskContainers).forEach(function (container) {
    if (container) {
      container.innerHTML = ''; // Clear existing tasks
    }
  });
}

function renderBoard() {
  clearBoard();
  if (tasksState.length === 0) {
    console.log('No tasks to render.');
    // Optionally show a message in each column
  } else {
    console.log('Rendering '.concat(tasksState.length, ' tasks.'));
    tasksState.forEach(function (task) {
      return renderTask(task);
    });
  }
}

// --- Event Handlers ---
function handleAddTaskFormSubmit(event) {
  event.preventDefault();
  if (newTaskInput && newTaskInput.value.trim()) {
    const taskText = newTaskInput.value.trim();
    addTaskAPI(taskText); // Call API function
    newTaskInput.value = ''; // Clear input field
  }
}

async function handleDeleteTask(event) {
  event.stopPropagation();
  const button = event.target;
  const taskCard = button.closest('.task-card');
  if (taskCard) {
    const taskId = taskCard.id;
    const taskText = taskCard.querySelector('.task-text')?.textContent || '';
    const confirmed = confirm(`¿Estás seguro de que quieres eliminar esta tarea?\n"${taskText}"`);
    if (confirmed) {
      const success = await deleteTaskAPI(taskId);
      if (success) {
        taskCard.remove();
        showMessage('Tarea eliminada.', false);
      }
    }
  }
}

// --- Drag and Drop Handlers ---
function handleDragStart(event) {
  const target = event.target;
  // Prevent dragging if delete button is the source element (more reliable)
  if (event.target && event.target.classList.contains('delete-btn')) {
    event.preventDefault();
    return;
  }

  if (target && target.classList.contains('task-card')) {
    draggedTaskElement = target;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', target.id);
      event.dataTransfer.effectAllowed = 'move';
    }
    setTimeout(() => {
      draggedTaskElement?.classList.add('dragging');
    }, 0);
  }
}

function handleDragEnd(event) {
  draggedTaskElement?.classList.remove('dragging');
  draggedTaskElement = null;
  Object.values(taskContainers).forEach((container) => {
    container?.classList.remove('drag-over');
  });
}

function handleDragOver(event) {
  event.preventDefault(); // Necessary to allow dropping
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  const targetContainer = event.target.closest('.tasks-container');
  if (targetContainer) {
    Object.values(taskContainers).forEach((container) => {
      if (container === targetContainer) {
        container?.classList.add('drag-over');
      } else {
        container?.classList.remove('drag-over');
      }
    });
  }
}
function handleDragLeave(event) {
  const targetContainer = event.target.closest('.tasks-container');
  const relatedTarget = event.relatedTarget;
  // Remove highlight only if leaving the container itself
  if (targetContainer && (!relatedTarget || !targetContainer.contains(relatedTarget))) {
    targetContainer.classList.remove('drag-over');
  }
}

async function handleDrop(event) {
  event.preventDefault();
  const targetContainer = event.target.closest('.tasks-container');
  const taskId = event.dataTransfer?.getData('text/plain');

  if (targetContainer && taskId && draggedTaskElement) {
    const newStatus = targetContainer.dataset.columnId; // Type assertion might be needed if TS complains
    const originalStatus = draggedTaskElement.dataset.status; // Type assertion might be needed
    const originalContainer = taskContainers[originalStatus];

    targetContainer.classList.remove('drag-over');

    if (newStatus && newStatus !== originalStatus) {
      console.log(`Task ${taskId} dropped in ${newStatus}. Original: ${originalStatus}`);

      // Optimistic UI Update
      const afterElement = getDragAfterElement(targetContainer, event.clientY);
      if (afterElement == null) {
        targetContainer.appendChild(draggedTaskElement);
      } else {
        targetContainer.insertBefore(draggedTaskElement, afterElement);
      }
      draggedTaskElement.dataset.status = newStatus;

      // Call API - Pass only the status update
      const success = await updateTaskAPI(taskId, { status: newStatus });

      // Handle API Failure (Revert UI)
      if (!success) {
        showMessage('Error al mover la tarea. Revirtiendo cambio.', true);
        if (originalContainer && originalStatus) {
          originalContainer.appendChild(draggedTaskElement); // Append is simpler for revert
          draggedTaskElement.dataset.status = originalStatus;
        } else {
          fetchTasks(); // Fallback
        }
      } else {
        showMessage(
          `Tarea movida a "${targetContainer.previousElementSibling?.textContent || newStatus}".`,
          false
        );
      }
    } else {
      console.log('Task dropped in the same column or invalid drop.');
    }
  }
  // Ensure cleanup happens regardless of drop validity
  if (draggedTaskElement) {
    // Check if it exists before removing class
    draggedTaskElement.classList.remove('dragging');
  }
  draggedTaskElement = null; // Reset state
}

// Helper function to find insertion point during drag
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded.');
  // Add form submit listener
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', handleAddTaskFormSubmit);
    console.log('Add task form listener attached.');
  } else {
    console.error('Add task form not found!');
  }
  // Add drag listeners to columns
  Object.values(taskContainers).forEach(function (container) {
    if (container) {
      container.addEventListener('dragover', handleDragOver);
      container.addEventListener('dragleave', handleDragLeave);
      container.addEventListener('drop', handleDrop);
    }
  });
  console.log('Drag listeners attached to containers.');
  // Fetch initial tasks
  fetchTasks();
});
