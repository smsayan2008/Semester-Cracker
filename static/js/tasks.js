function initTaskPage() {
  const form = document.getElementById('task-form');
  const taskList = document.getElementById('tasks-list');
  const searchInput = document.getElementById('task-search');
  const filterSelect = document.getElementById('task-filter');
  const sortSelect = document.getElementById('task-sort');

  const render = () => {
    const workspace = getWorkspace();
    const tasks = workspace.tasks || [];
    const query = (searchInput.value || '').trim().toLowerCase();
    const filter = filterSelect.value;
    const sort = sortSelect.value;

    let filtered = [...tasks].filter((task) => {
      const matchesQuery = [task.title, task.description, task.category].join(' ').toLowerCase().includes(query);
      const overdue = task.date && task.date < getCurrentDateValue() && !task.completed;
      if (!matchesQuery) return false;
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      if (filter === 'overdue') return overdue;
      return true;
    });

    if (sort === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 };
      filtered.sort((a, b) => (order[a.priority] ?? 99) - (order[b.priority] ?? 99));
    } else if (sort === 'created') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }

    taskList.innerHTML = filtered.length ? filtered.map((task) => {
      const overdue = task.date && task.date < getCurrentDateValue() && !task.completed;
      return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
          <div class="task-item-header">
            <strong>${task.title}</strong>
            <span class="pill ${task.completed ? 'success' : overdue ? 'danger' : 'neutral'}">${task.completed ? 'Completed' : overdue ? 'Overdue' : 'Open'}</span>
          </div>
          <p>${task.description || 'No description provided.'}</p>
          <div class="task-meta">
            <span>${task.category || 'General'}</span>
            <span>${task.priority || 'Medium'}</span>
            <span>${task.date || 'No due date'}</span>
          </div>
          <div class="task-actions">
            <button class="secondary-btn" type="button" data-action="toggle" data-id="${task.id}">${task.completed ? 'Mark incomplete' : 'Mark complete'}</button>
            <button class="secondary-btn" type="button" data-action="edit" data-id="${task.id}">Edit</button>
            <button class="danger-btn" type="button" data-action="delete" data-id="${task.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('') : '<div class="empty-state"><p>No tasks match your filter.</p></div>';

    const pending = tasks.filter((task) => !task.completed).length;
    const completed = tasks.filter((task) => task.completed).length;
    document.getElementById('pending-count').textContent = `${pending} Pending`;
    document.getElementById('completed-count').textContent = `${completed} Completed`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value.trim();
    if (!title) {
      showToast('Task title is required.', 'error');
      return;
    }

    const payload = {
      id: id || `task-${Date.now()}`,
      title,
      description: document.getElementById('task-description').value.trim(),
      date: document.getElementById('task-date').value,
      priority: document.getElementById('task-priority').value,
      category: document.getElementById('task-category').value.trim(),
      completed: Boolean(id ? (workspace.tasks.find((task) => task.id === id)?.completed || false) : false),
      createdAt: id ? (workspace.tasks.find((task) => task.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentIndex = workspace.tasks.findIndex((task) => task.id === payload.id);
    if (currentIndex >= 0) {
      workspace.tasks[currentIndex] = { ...workspace.tasks[currentIndex], ...payload };
    } else {
      workspace.tasks.unshift(payload);
    }

    saveWorkspace(workspace);
    form.reset();
    render();
    showToast('Task saved locally.', 'success');
  });

  taskList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const { action, id } = button.dataset;
    const workspace = getWorkspace();
    const task = workspace.tasks.find((item) => item.id === id);
    if (!task) return;

    if (action === 'toggle') {
      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();
      saveWorkspace(workspace);
      render();
      showToast(task.completed ? 'Task marked complete.' : 'Task restored to pending.', 'success');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm('Delete this task?')) return;
      workspace.tasks = workspace.tasks.filter((item) => item.id !== id);
      saveWorkspace(workspace);
      render();
      showToast('Task deleted.', 'success');
      return;
    }

    if (action === 'edit') {
      document.getElementById('task-id').value = task.id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value = task.description || '';
      document.getElementById('task-date').value = task.date || '';
      document.getElementById('task-priority').value = task.priority || 'Medium';
      document.getElementById('task-category').value = task.category || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  searchInput.addEventListener('input', render);
  filterSelect.addEventListener('change', render);
  sortSelect.addEventListener('change', render);

  document.getElementById('task-reset').addEventListener('click', () => {
    form.reset();
    document.getElementById('task-id').value = '';
    showToast('Task form cleared.', 'success');
  });

  render();
}
