function renderDashboard() {
  const workspace = getWorkspace();
  const tasks = workspace.tasks || [];
  const notes = workspace.notes || [];
  const attendanceRecords = workspace.attendance || [];
  const cgpaData = workspace.cgpa || [];
  const plans = workspace.planner || [];
  const pomodoro = workspace.pomodoro || {};

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const notesCount = notes.length;
  const averageAttendance = attendanceRecords.length ?
    Math.round(attendanceRecords.reduce((sum, record) => sum + calculateAttendancePercentage(record), 0) / attendanceRecords.length) : 0;
  const overallCgpa = calculateOverallCGPA(cgpaData);

  const today = getCurrentDateValue();
  const todayTasks = tasks.filter((task) => task.date && task.date === today);
  const upcomingTasks = tasks.filter((task) => task.date && task.date > today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
  const recentNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);

  document.getElementById('stat-total-tasks').textContent = totalTasks;
  document.getElementById('stat-completed-tasks').textContent = completedTasks;
  document.getElementById('stat-note-count').textContent = notesCount;
  document.getElementById('stat-attendance').textContent = `${averageAttendance}%`;
  document.getElementById('stat-cgpa').textContent = overallCgpa.toFixed(2);
  document.getElementById('stat-study-plans').textContent = plans.length;
  document.getElementById('stat-pomodoro').textContent = pomodoro.completedFocusSessions || 0;

  const todayTasksContainer = document.getElementById('today-tasks');
  todayTasksContainer.innerHTML = todayTasks.length ? todayTasks.map((task) => `
    <div class="task-item">
      <div class="task-item-header">
        <strong>${task.title}</strong>
        <span class="pill ${task.completed ? 'success' : 'neutral'}">${task.completed ? 'Done' : 'Open'}</span>
      </div>
      <div class="task-meta">
        <span>${task.category || 'General'}</span>
        <span>${task.priority || 'Medium'}</span>
        <span>${task.date || 'No date'}</span>
      </div>
    </div>
  `).join('') : '<div class="empty-state"><p>No tasks scheduled for today.</p></div>';

  const upcomingBlock = document.getElementById('upcoming-tasks');
  upcomingBlock.innerHTML = upcomingTasks.length ? upcomingTasks.map((task) => `
    <div class="task-item">
      <div class="task-item-header">
        <strong>${task.title}</strong>
        <span class="pill ${task.priority === 'High' ? 'warning' : 'neutral'}">${task.priority}</span>
      </div>
      <div class="task-meta">
        <span>${task.category || 'General'}</span>
        <span>${task.date}</span>
      </div>
    </div>
  `).join('') : '<div class="empty-state"><p>No upcoming tasks.</p></div>';

  const recentNotesContainer = document.getElementById('recent-notes');
  recentNotesContainer.innerHTML = recentNotes.length ? recentNotes.map((note) => `
    <div class="note-item">
      <div class="note-item-header">
        <strong>${note.title}</strong>
        <small>${note.subject || 'General'}</small>
      </div>
      <p>${(note.content || '').slice(0, 90) || 'No content yet.'}</p>
    </div>
  `).join('') : '<div class="empty-state"><p>No notes yet.</p></div>';

  const taskCompletion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const plannerProgress = plans.length ? Math.round(plans.reduce((sum, plan) => sum + Number(plan.progress || 0), 0) / plans.length) : 0;
  document.getElementById('task-completion-bar').style.width = `${taskCompletion}%`;
  document.getElementById('planner-progress-bar').style.width = `${plannerProgress}%`;
  document.getElementById('attendance-health-bar').style.width = `${averageAttendance}%`;

  document.getElementById('guest-workspace-text').textContent = `Workspace ID: ${slugify(workspace.workspaceName || 'guest-workspace')} • ${formatDateTime(workspace.createdAt)}.`;
}
