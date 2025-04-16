var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
// --- DOM Elements ---
var taskContainers = {
  todo: document.getElementById("todo-tasks"),
  doing: document.getElementById("doing-tasks"),
  done: document.getElementById("done-tasks"),
};
var addTaskForm = document.getElementById("addTaskForm");
var newTaskInput = document.getElementById("newTaskInput");
var messageArea = document.getElementById("messageArea");
// --- API Configuration ---
var API_BASE_URL = "http://localhost:5000/api"; // Backend URL
// --- State ---
var draggedTaskElement = null;
var tasksState = []; // Local cache of tasks
// --- Utility Functions ---
function formatDate(dateString) {
  try {
    var date = new Date(dateString);
    // Format like: 14 Abr, 19:55
    return (
      date.toLocaleDateString("es-CO", { day: "numeric", month: "short" }) +
      ", " +
      date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return "Fecha inválida";
  }
}
function showMessage(message, isError) {
  if (isError === void 0) {
    isError = false;
  }
  if (messageArea) {
    messageArea.textContent = message;
    messageArea.className = "text-center mb-4 font-medium ".concat(
      isError ? "text-red-600" : "text-green-600",
    );
    // Clear message after some time
    setTimeout(function () {
      if (messageArea.textContent === message) {
        // Avoid clearing newer messages
        messageArea.textContent = "";
        messageArea.className = "text-center mb-4 min-h-[24px]"; // Reset class
      }
    }, 4000);
  }
}
// --- API Interaction Functions ---
function fetchTasks() {
  return __awaiter(this, void 0, void 0, function () {
    var response, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.log("Fetching tasks from backend...");
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, , 5]);
          return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/tasks"))];
        case 2:
          response = _a.sent();
          if (!response.ok) {
            throw new Error(
              "Error fetching tasks: ".concat(response.statusText),
            );
          }
          return [4 /*yield*/, response.json()];
        case 3:
          tasksState = _a.sent();
          console.log("Tasks fetched successfully:", tasksState.length);
          renderBoard();
          return [3 /*break*/, 5];
        case 4:
          error_1 = _a.sent();
          console.error("Failed to fetch tasks:", error_1);
          showMessage("Error al cargar las tareas desde el servidor.", true);
          tasksState = []; // Clear local state on error
          renderBoard(); // Render empty board
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function addTaskAPI(text) {
  return __awaiter(this, void 0, void 0, function () {
    var response_1, errorData, newTask, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!text) return [2 /*return*/];
          console.log("Adding task via API:", text);
          _a.label = 1;
        case 1:
          _a.trys.push([1, 6, , 7]);
          return [
            4 /*yield*/,
            fetch("".concat(API_BASE_URL, "/tasks"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: text }),
            }),
          ];
        case 2:
          response_1 = _a.sent();
          if (!!response_1.ok) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            response_1.json().catch(function () {
              return { error: response_1.statusText };
            }),
          ];
        case 3:
          errorData = _a.sent();
          throw new Error(
            errorData.error || "Error ".concat(response_1.status),
          );
        case 4:
          return [4 /*yield*/, response_1.json()];
        case 5:
          newTask = _a.sent();
          console.log("Task added successfully:", newTask.id);
          tasksState.push(newTask); // Add to local cache
          renderTask(newTask); // Add directly to the board (todo column)
          showMessage("Tarea añadida con éxito.", false);
          return [3 /*break*/, 7];
        case 6:
          error_2 = _a.sent();
          console.error("Failed to add task:", error_2);
          showMessage(
            "Error al a\u00F1adir tarea: ".concat(error_2.message),
            true,
          );
          return [3 /*break*/, 7];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function updateTaskStatusAPI(taskId, newStatus) {
  return __awaiter(this, void 0, void 0, function () {
    var response_2,
      errorData,
      updatedTask,
      taskIndex,
      taskElement,
      timestampElement,
      error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.log(
            "Updating task "
              .concat(taskId, " status to ")
              .concat(newStatus, " via API..."),
          );
          _a.label = 1;
        case 1:
          _a.trys.push([1, 6, , 7]);
          return [
            4 /*yield*/,
            fetch("".concat(API_BASE_URL, "/tasks/").concat(taskId), {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            }),
          ];
        case 2:
          response_2 = _a.sent();
          if (!!response_2.ok) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            response_2.json().catch(function () {
              return { error: response_2.statusText };
            }),
          ];
        case 3:
          errorData = _a.sent();
          throw new Error(
            errorData.error || "Error ".concat(response_2.status),
          );
        case 4:
          return [4 /*yield*/, response_2.json()];
        case 5:
          updatedTask = _a.sent();
          console.log("Task status updated successfully:", updatedTask.id);
          taskIndex = tasksState.findIndex(function (t) {
            return t.id === taskId;
          });
          if (taskIndex !== -1) {
            tasksState[taskIndex] = updatedTask;
          }
          taskElement = document.getElementById(taskId);
          timestampElement =
            taskElement === null || taskElement === void 0
              ? void 0
              : taskElement.querySelector(".task-timestamp");
          if (timestampElement) {
            timestampElement.textContent = "Actualizado: ".concat(
              formatDate(updatedTask.updatedAt),
            );
          }
          return [2 /*return*/, true]; // Indicate success
        case 6:
          error_3 = _a.sent();
          console.error("Failed to update task status:", error_3);
          showMessage("Error al mover tarea: ".concat(error_3.message), true);
          return [2 /*return*/, false]; // Indicate failure
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function deleteTaskAPI(taskId) {
  return __awaiter(this, void 0, void 0, function () {
    var response_3, errorData, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.log("Deleting task ".concat(taskId, " via API..."));
          _a.label = 1;
        case 1:
          _a.trys.push([1, 5, , 6]);
          return [
            4 /*yield*/,
            fetch("".concat(API_BASE_URL, "/tasks/").concat(taskId), {
              method: "DELETE",
            }),
          ];
        case 2:
          response_3 = _a.sent();
          if (!(!response_3.ok && response_3.status !== 204))
            return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            response_3.json().catch(function () {
              return { error: response_3.statusText };
            }),
          ];
        case 3:
          errorData = _a.sent();
          throw new Error(
            errorData.error || "Error ".concat(response_3.status),
          );
        case 4:
          console.log("Task deleted successfully:", taskId);
          // Remove from local state
          tasksState = tasksState.filter(function (t) {
            return t.id !== taskId;
          });
          return [2 /*return*/, true]; // Indicate success
        case 5:
          error_4 = _a.sent();
          console.error("Failed to delete task:", error_4);
          showMessage(
            "Error al eliminar tarea: ".concat(error_4.message),
            true,
          );
          return [2 /*return*/, false]; // Indicate failure
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// --- DOM Manipulation & Rendering ---
function createTaskElement(task) {
  var taskCard = document.createElement("div");
  taskCard.classList.add("task-card");
  taskCard.setAttribute("draggable", "true");
  taskCard.setAttribute("id", task.id);
  taskCard.dataset.status = task.status; // Store status for potential use
  var taskTextSpan = document.createElement("span");
  taskTextSpan.classList.add("task-text");
  taskTextSpan.textContent = task.text;
  var timestampSpan = document.createElement("span");
  timestampSpan.classList.add("task-timestamp");
  // Show updated time, fallback to created time
  timestampSpan.textContent = "Actualizado: ".concat(
    formatDate(task.updatedAt || task.createdAt),
  );
  var deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", "Eliminar tarea");
  deleteBtn.addEventListener("click", handleDeleteTask); // Use specific handler
  taskCard.appendChild(taskTextSpan);
  taskCard.appendChild(timestampSpan);
  taskCard.appendChild(deleteBtn);
  // Add drag listeners
  taskCard.addEventListener("dragstart", handleDragStart);
  taskCard.addEventListener("dragend", handleDragEnd);
  return taskCard;
}
function renderTask(task) {
  var container = taskContainers[task.status];
  if (container) {
    var taskElement = createTaskElement(task);
    container.appendChild(taskElement);
  } else {
    console.warn("Container not found for status: ".concat(task.status));
  }
}
function clearBoard() {
  Object.values(taskContainers).forEach(function (container) {
    if (container) {
      container.innerHTML = ""; // Clear existing tasks
    }
  });
}
function renderBoard() {
  clearBoard();
  if (tasksState.length === 0) {
    console.log("No tasks to render.");
    // Optionally show a message in each column
  } else {
    console.log("Rendering ".concat(tasksState.length, " tasks."));
    tasksState.forEach(function (task) {
      return renderTask(task);
    });
  }
}
// --- Event Handlers ---
function handleAddTaskFormSubmit(event) {
  event.preventDefault();
  if (newTaskInput && newTaskInput.value.trim()) {
    var taskText = newTaskInput.value.trim();
    addTaskAPI(taskText); // Call API function
    newTaskInput.value = ""; // Clear input field
  }
}
function handleDeleteTask(event) {
  return __awaiter(this, void 0, void 0, function () {
    var button, taskCard, taskId, confirmed, success;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          event.stopPropagation(); // Prevent drag start
          button = event.target;
          taskCard = button.closest(".task-card");
          if (!taskCard) return [3 /*break*/, 2];
          taskId = taskCard.id;
          confirmed = confirm(
            '\u00BFEst\u00E1s seguro de que quieres eliminar esta tarea?\n"'.concat(
              (_a = taskCard.querySelector(".task-text")) === null ||
                _a === void 0
                ? void 0
                : _a.textContent,
              '"',
            ),
          );
          if (!confirmed) return [3 /*break*/, 2];
          return [4 /*yield*/, deleteTaskAPI(taskId)];
        case 1:
          success = _b.sent();
          if (success) {
            taskCard.remove(); // Remove from DOM immediately
            showMessage("Tarea eliminada.", false);
          }
          _b.label = 2;
        case 2:
          return [2 /*return*/];
      }
    });
  });
}
// --- Drag and Drop Handlers ---
function handleDragStart(event) {
  var _a;
  var target = event.target;
  // Prevent dragging if delete button is the source
  if (
    target.classList.contains("delete-btn") ||
    ((_a = event.explicitOriginalTarget) === null || _a === void 0
      ? void 0
      : _a.classList.contains("delete-btn"))
  ) {
    event.preventDefault();
    return;
  }
  if (target.classList.contains("task-card")) {
    draggedTaskElement = target;
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", target.id);
      event.dataTransfer.effectAllowed = "move";
    }
    // Add styling class after a short delay
    setTimeout(function () {
      draggedTaskElement === null || draggedTaskElement === void 0
        ? void 0
        : draggedTaskElement.classList.add("dragging");
    }, 0);
  }
}
function handleDragEnd(event) {
  draggedTaskElement === null || draggedTaskElement === void 0
    ? void 0
    : draggedTaskElement.classList.remove("dragging");
  draggedTaskElement = null;
  // Remove highlight from all containers
  Object.values(taskContainers).forEach(function (container) {
    container === null || container === void 0
      ? void 0
      : container.classList.remove("drag-over");
  });
}
function handleDragOver(event) {
  event.preventDefault(); // Necessary to allow dropping
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  // Add highlight to the container being hovered over
  var targetContainer = event.target.closest(".tasks-container");
  if (targetContainer) {
    Object.values(taskContainers).forEach(function (container) {
      if (container === targetContainer) {
        container === null || container === void 0
          ? void 0
          : container.classList.add("drag-over");
      } else {
        container === null || container === void 0
          ? void 0
          : container.classList.remove("drag-over");
      }
    });
  }
}
function handleDragLeave(event) {
  var targetContainer = event.target.closest(".tasks-container");
  var relatedTarget = event.relatedTarget;
  // Remove highlight only if leaving the container itself
  if (
    targetContainer &&
    (!relatedTarget || !targetContainer.contains(relatedTarget))
  ) {
    targetContainer.classList.remove("drag-over");
  }
}
function handleDrop(event) {
  return __awaiter(this, void 0, void 0, function () {
    var targetContainer,
      taskId,
      newStatus,
      originalStatus,
      originalContainer,
      afterElement,
      success;
    var _a, _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          event.preventDefault();
          targetContainer = event.target.closest(".tasks-container");
          taskId =
            (_a = event.dataTransfer) === null || _a === void 0
              ? void 0
              : _a.getData("text/plain");
          if (!(targetContainer && taskId && draggedTaskElement))
            return [3 /*break*/, 3];
          newStatus = targetContainer.dataset.columnId;
          originalStatus = draggedTaskElement.dataset.status;
          originalContainer = taskContainers[originalStatus || "todo"];
          targetContainer.classList.remove("drag-over"); // Remove highlight immediately
          if (!(newStatus && newStatus !== originalStatus))
            return [3 /*break*/, 2];
          console.log(
            "Task "
              .concat(taskId, " dropped in ")
              .concat(newStatus, ". Original: ")
              .concat(originalStatus),
          );
          afterElement = getDragAfterElement(targetContainer, event.clientY);
          // 2. Move element in DOM
          if (afterElement == null) {
            targetContainer.appendChild(draggedTaskElement);
          } else {
            targetContainer.insertBefore(draggedTaskElement, afterElement);
          }
          // 3. Update element's dataset (optional but good practice)
          draggedTaskElement.dataset.status = newStatus;
          return [4 /*yield*/, updateTaskStatusAPI(taskId, newStatus)];
        case 1:
          success = _c.sent();
          // --- Handle API Failure (Revert UI) ---
          if (!success) {
            showMessage("Error al mover la tarea. Revirtiendo cambio.", true);
            // Move element back to original container
            if (originalContainer && originalStatus) {
              // Re-find original insertion point if needed, or just append
              originalContainer.appendChild(draggedTaskElement);
              draggedTaskElement.dataset.status = originalStatus; // Revert dataset
            } else {
              // Fallback: Fetch all tasks again to ensure consistency
              fetchTasks();
            }
          } else {
            showMessage(
              'Tarea movida a "'.concat(
                ((_b = targetContainer.previousElementSibling) === null ||
                _b === void 0
                  ? void 0
                  : _b.textContent) || newStatus,
                '".',
              ),
              false,
            );
          }
          return [3 /*break*/, 3];
        case 2:
          console.log("Task dropped in the same column or invalid drop.");
          _c.label = 3;
        case 3:
          // Clean up dragging state even if drop is invalid
          draggedTaskElement === null || draggedTaskElement === void 0
            ? void 0
            : draggedTaskElement.classList.remove("dragging");
          draggedTaskElement = null;
          return [2 /*return*/];
      }
    });
  });
}
// Helper function to find insertion point during drag
function getDragAfterElement(container, y) {
  var draggableElements = __spreadArray(
    [],
    container.querySelectorAll(".task-card:not(.dragging)"),
    true,
  );
  return draggableElements.reduce(
    function (closest, child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}
// --- Initial Setup ---
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded.");
  // Add form submit listener
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", handleAddTaskFormSubmit);
    console.log("Add task form listener attached.");
  } else {
    console.error("Add task form not found!");
  }
  // Add drag listeners to columns
  Object.values(taskContainers).forEach(function (container) {
    if (container) {
      container.addEventListener("dragover", handleDragOver);
      container.addEventListener("dragleave", handleDragLeave);
      container.addEventListener("drop", handleDrop);
    }
  });
  console.log("Drag listeners attached to containers.");
  // Fetch initial tasks
  fetchTasks();
});
