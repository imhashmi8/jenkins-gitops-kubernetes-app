const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const messageBox = document.getElementById("message");
const taskStats = document.getElementById("task-stats");
const apiStatus = document.getElementById("api-status");

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function showMessage(text) {
  messageBox.hidden = false;
  messageBox.textContent = text;
}

function clearMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString();
}

function renderTasks(tasks) {
  taskStats.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

  if (!tasks.length) {
    taskList.innerHTML =
      '<div class="empty-state">No tasks yet. Create your first task from the form.</div>';
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="task-card-top">
            <div>
              <h3>${escapeHtml(task.title)}</h3>
              <p class="task-desc">${escapeHtml(task.description || "No description provided.")}</p>
            </div>
            <div class="meta-text">${formatDate(task.dueDate)}</div>
          </div>

          <div class="badge-row">
            <span class="badge status-${task.status}">${formatStatus(task.status)}</span>
            <span class="badge priority-${task.priority}">${capitalize(task.priority)} Priority</span>
          </div>

          <div class="task-card-bottom">
            <div class="action-row">
              <button class="secondary-btn" data-action="cycle-status" data-id="${task._id}">
                Next Status
              </button>
              <button class="danger-btn" data-action="delete" data-id="${task._id}">
                Delete
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(status) {
  if (status === "in-progress") {
    return "In Progress";
  }
  if (status === "done") {
    return "Done";
  }
  return "To Do";
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadHealth() {
  try {
    const health = await request("/api/health");
    apiStatus.textContent = `API ${health.database}`;
  } catch (error) {
    apiStatus.textContent = "API unavailable";
  }
}

async function loadTasks() {
  try {
    clearMessage();
    const tasks = await request("/api/tasks");
    renderTasks(tasks);
  } catch (error) {
    showMessage(error.message);
  }
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);
  const payload = {
    title: formData.get("title")?.trim(),
    description: formData.get("description")?.trim(),
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  };

  try {
    clearMessage();
    await request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    taskForm.reset();
    document.getElementById("status").value = "todo";
    document.getElementById("priority").value = "medium";
    await loadTasks();
  } catch (error) {
    showMessage(error.message);
  }
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const taskId = button.dataset.id;
  const action = button.dataset.action;

  try {
    clearMessage();

    if (action === "delete") {
      await request(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
    }

    if (action === "cycle-status") {
      const tasks = await request("/api/tasks");
      const task = tasks.find((item) => item._id === taskId);
      if (!task) {
        throw new Error("Task not found.");
      }

      const nextStatus =
        task.status === "todo"
          ? "in-progress"
          : task.status === "in-progress"
            ? "done"
            : "todo";

      await request(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: nextStatus,
          priority: task.priority,
          dueDate: task.dueDate,
        }),
      });
    }

    await loadTasks();
  } catch (error) {
    showMessage(error.message);
  }
});

loadHealth();
loadTasks();
