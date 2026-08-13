function initPlannerPage() {
  const form = document.getElementById('planner-form');
  const list = document.getElementById('planner-list');
  const filter = document.getElementById('planner-filter');

  const render = () => {
    const workspace = getWorkspace();
    const plans = workspace.planner || [];
    const currentDate = getCurrentDateValue();
    const view = filter.value;
    const filtered = plans.filter((plan) => {
      if (view === 'today') return plan.date === currentDate;
      if (view === 'upcoming') return plan.date >= currentDate;
      return true;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    list.innerHTML = filtered.length ? filtered.map((plan) => `
      <div class="planner-item">
        <div class="planner-header">
          <strong>${plan.subject}: ${plan.topic}</strong>
          <span class="pill ${plan.status === 'Completed' ? 'success' : 'neutral'}">${plan.status || 'Pending'}</span>
        </div>
        <div class="planner-meta">
          <span>${plan.date}</span>
          <span>${plan.startTime} - ${plan.endTime}</span>
          <span>${plan.priority}</span>
        </div>
        <div class="progress-bar"><span style="width:${Number(plan.progress || 0)}%"></span></div>
        <div class="planner-actions">
          <button class="secondary-btn" type="button" data-action="toggle" data-id="${plan.id}">${plan.status === 'Completed' ? 'Mark pending' : 'Mark completed'}</button>
          <button class="secondary-btn" type="button" data-action="edit" data-id="${plan.id}">Edit</button>
          <button class="danger-btn" type="button" data-action="delete" data-id="${plan.id}">Delete</button>
        </div>
      </div>
    `).join('') : '<div class="empty-state"><p>No study plans found.</p></div>';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const id = document.getElementById('plan-id').value;
    const subject = document.getElementById('plan-subject').value.trim();
    const topic = document.getElementById('plan-topic').value.trim();
    const date = document.getElementById('plan-date').value;
    const startTime = document.getElementById('plan-start').value;
    const endTime = document.getElementById('plan-end').value;
    const priority = document.getElementById('plan-priority').value;
    const progress = Number(document.getElementById('plan-progress').value || 0);

    if (!subject || !topic || !date || !startTime || !endTime) {
      showToast('Please fill all study plan fields.', 'error');
      return;
    }

    const payload = {
      id: id || `plan-${Date.now()}`,
      subject,
      topic,
      date,
      startTime,
      endTime,
      priority,
      progress: Math.min(Math.max(progress, 0), 100),
      status: progress >= 100 ? 'Completed' : 'Pending',
      updatedAt: new Date().toISOString(),
    };

    const index = workspace.planner.findIndex((item) => item.id === payload.id);
    if (index >= 0) {
      workspace.planner[index] = { ...workspace.planner[index], ...payload };
    } else {
      workspace.planner.unshift(payload);
    }

    saveWorkspace(workspace);
    form.reset();
    document.getElementById('plan-id').value = '';
    render();
    showToast('Study plan saved.', 'success');
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const workspace = getWorkspace();
    const plan = workspace.planner.find((item) => item.id === button.dataset.id);
    if (!plan) return;

    if (button.dataset.action === 'delete') {
      if (!window.confirm('Delete this study plan?')) return;
      workspace.planner = workspace.planner.filter((item) => item.id !== plan.id);
      saveWorkspace(workspace);
      render();
      showToast('Plan deleted.', 'success');
      return;
    }

    if (button.dataset.action === 'toggle') {
      plan.status = plan.status === 'Completed' ? 'Pending' : 'Completed';
      plan.progress = plan.status === 'Completed' ? 100 : Math.max(plan.progress || 0, 20);
      saveWorkspace(workspace);
      render();
      showToast('Plan status updated.', 'success');
      return;
    }

    if (button.dataset.action === 'edit') {
      document.getElementById('plan-id').value = plan.id;
      document.getElementById('plan-subject').value = plan.subject;
      document.getElementById('plan-topic').value = plan.topic;
      document.getElementById('plan-date').value = plan.date;
      document.getElementById('plan-start').value = plan.startTime;
      document.getElementById('plan-end').value = plan.endTime;
      document.getElementById('plan-priority').value = plan.priority;
      document.getElementById('plan-progress').value = plan.progress || 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  filter.addEventListener('change', render);
  document.getElementById('planner-reset').addEventListener('click', () => {
    form.reset();
    document.getElementById('plan-id').value = '';
    showToast('Planner form cleared.', 'success');
  });

  render();
}
