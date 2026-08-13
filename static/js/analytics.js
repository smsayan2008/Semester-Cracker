function initAnalyticsPage() {
  const workspace = getWorkspace();
  const tasks = workspace.tasks || [];
  const notes = workspace.notes || [];
  const attendance = workspace.attendance || [];
  const cgpa = workspace.cgpa || [];
  const planner = workspace.planner || [];
  const pomodoro = workspace.pomodoro || {};

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const taskCompletion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const averageAttendance = attendance.length ? Math.round(attendance.reduce((sum, record) => sum + calculateAttendancePercentage(record), 0) / attendance.length) : 0;
  const overallCgpa = calculateOverallCGPA(cgpa);
  const plannerProgress = planner.length ? Math.round(planner.reduce((sum, plan) => sum + Number(plan.progress || 0), 0) / planner.length) : 0;
  const productivityScore = Math.round((taskCompletion * 0.3) + (averageAttendance * 0.3) + (plannerProgress * 0.2) + (Number(pomodoro.completedFocusSessions || 0) * 2));

  document.getElementById('analytics-task-completion').textContent = `${taskCompletion}%`;
  document.getElementById('analytics-attendance').textContent = `${averageAttendance}%`;
  document.getElementById('analytics-cgpa').textContent = overallCgpa.toFixed(2);
  document.getElementById('analytics-planner').textContent = `${plannerProgress}%`;
  document.getElementById('analytics-focus').textContent = pomodoro.completedFocusSessions || 0;
  document.getElementById('analytics-productivity').textContent = `${Math.min(productivityScore, 100)}%`;

  const summary = [
    { label: 'Total tasks', value: totalTasks },
    { label: 'Completed tasks', value: completedTasks },
    { label: 'Pending tasks', value: totalTasks - completedTasks },
    { label: 'Notes saved', value: notes.length },
    { label: 'Attendance avg', value: `${averageAttendance}%` },
    { label: 'Planner progress', value: `${plannerProgress}%` },
    { label: 'Focus sessions', value: pomodoro.completedFocusSessions || 0 },
  ];

  document.getElementById('analytics-summary').innerHTML = summary.map((item) => `
    <div class="summary-item">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join('');
}
