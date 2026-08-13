function initAttendancePage() {
  const form = document.getElementById('attendance-form');
  const list = document.getElementById('attendance-list');

  const render = () => {
    const workspace = getWorkspace();
    const records = workspace.attendance || [];
    const totalPercentage = records.length ? Math.round(records.reduce((sum, record) => sum + calculateAttendancePercentage(record), 0) / records.length) : 0;
    document.getElementById('overall-attendance-pill').textContent = `Overall: ${totalPercentage}%`;

    list.innerHTML = records.length ? records.map((record) => {
      const percentage = Math.round(calculateAttendancePercentage(record));
      let status = 'safe';
      if (percentage < 75) status = 'critical';
      else if (percentage < 85) status = 'warning';
      return `
        <div class="attendance-item">
          <div class="attendance-header">
            <strong>${record.subject}</strong>
            <span class="pill ${status === 'safe' ? 'success' : status === 'warning' ? 'warning' : 'danger'}">${status}</span>
          </div>
          <div class="task-meta">
            <span>Attended: ${record.attended}</span>
            <span>Total: ${record.total}</span>
            <span>Absent: ${record.absent}</span>
          </div>
          <p>${percentage}% attendance</p>
          <div class="progress-bar"><span style="width:${percentage}%"></span></div>
          <div class="task-actions">
            <button class="secondary-btn" type="button" data-action="edit" data-id="${record.id}">Edit</button>
            <button class="danger-btn" type="button" data-action="delete" data-id="${record.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('') : '<div class="empty-state"><p>No attendance records yet.</p></div>';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const id = document.getElementById('attendance-id').value;
    const subject = document.getElementById('attendance-subject').value.trim();
    const total = Number(document.getElementById('attendance-total').value || 0);
    const attended = Number(document.getElementById('attendance-attended').value || 0);
    const absent = Number(document.getElementById('attendance-absent').value || 0);

    if (!subject || total < 0 || attended < 0 || absent < 0) {
      showToast('Please fill in valid attendance values.', 'error');
      return;
    }

    const payload = {
      id: id || `attendance-${Date.now()}`,
      subject,
      total,
      attended,
      absent,
      percentage: Math.round((attended / (total || 1)) * 100),
      updatedAt: new Date().toISOString(),
    };

    const index = workspace.attendance.findIndex((item) => item.id === payload.id);
    if (index >= 0) {
      workspace.attendance[index] = { ...workspace.attendance[index], ...payload };
    } else {
      workspace.attendance.unshift(payload);
    }

    saveWorkspace(workspace);
    form.reset();
    render();
    showToast('Attendance saved.', 'success');
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const workspace = getWorkspace();
    const record = workspace.attendance.find((item) => item.id === button.dataset.id);
    if (!record) return;

    if (button.dataset.action === 'delete') {
      if (!window.confirm('Delete this subject?')) return;
      workspace.attendance = workspace.attendance.filter((item) => item.id !== record.id);
      saveWorkspace(workspace);
      render();
      showToast('Attendance subject deleted.', 'success');
      return;
    }

    if (button.dataset.action === 'edit') {
      document.getElementById('attendance-id').value = record.id;
      document.getElementById('attendance-subject').value = record.subject;
      document.getElementById('attendance-total').value = record.total;
      document.getElementById('attendance-attended').value = record.attended;
      document.getElementById('attendance-absent').value = record.absent;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('attendance-reset').addEventListener('click', () => {
    form.reset();
    document.getElementById('attendance-id').value = '';
    showToast('Attendance form cleared.', 'success');
  });

  render();
}
