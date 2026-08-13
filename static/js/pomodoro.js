function initPomodoroPage() {
  const display = document.getElementById('timer-display');
  const modeButtons = [...document.querySelectorAll('.mode-btn')];
  const startBtn = document.getElementById('start-timer');
  const pauseBtn = document.getElementById('pause-timer');
  const resumeBtn = document.getElementById('resume-timer');
  const resetBtn = document.getElementById('reset-timer');
  const saveSettingsBtn = document.getElementById('save-timer-settings');

  let currentMode = 'focus';
  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;

  const workspace = getWorkspace();
  const settings = workspace.pomodoro?.settings || { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 };

  document.getElementById('focus-minutes').value = settings.focusMinutes;
  document.getElementById('short-break').value = settings.shortBreakMinutes;
  document.getElementById('long-break').value = settings.longBreakMinutes;

  const updateDisplay = () => {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const seconds = String(remainingSeconds % 60).padStart(2, '0');
    display.textContent = `${minutes}:${seconds}`;
  };

  const setMode = (mode) => {
    currentMode = mode;
    modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    if (mode === 'focus') totalSeconds = Number(document.getElementById('focus-minutes').value || 25) * 60;
    if (mode === 'shortBreak') totalSeconds = Number(document.getElementById('short-break').value || 5) * 60;
    if (mode === 'longBreak') totalSeconds = Number(document.getElementById('long-break').value || 15) * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
  };

  const tick = () => {
    if (remainingSeconds > 0) {
      remainingSeconds -= 1;
      updateDisplay();
      return;
    }
    clearInterval(timerInterval);
    const workspaceNow = getWorkspace();
    workspaceNow.pomodoro = workspaceNow.pomodoro || { sessions: 0, completedFocusSessions: 0, dailyMinutes: 0, settings: {} };
    if (currentMode === 'focus') {
      workspaceNow.pomodoro.completedFocusSessions = (workspaceNow.pomodoro.completedFocusSessions || 0) + 1;
      workspaceNow.pomodoro.sessions = (workspaceNow.pomodoro.sessions || 0) + 1;
      workspaceNow.pomodoro.dailyMinutes = (workspaceNow.pomodoro.dailyMinutes || 0) + Number(document.getElementById('focus-minutes').value || 25);
      showToast('Focus session completed.', 'success');
      setMode('shortBreak');
    }
    saveWorkspace(workspaceNow);
    renderPomodoroStats();
  };

  const renderPomodoroStats = () => {
    const workspaceNow = getWorkspace();
    const pomodoro = workspaceNow.pomodoro || { completedFocusSessions: 0, sessions: 0, dailyMinutes: 0 };
    document.getElementById('completed-focus-sessions').textContent = pomodoro.completedFocusSessions || 0;
    document.getElementById('daily-focus-minutes').textContent = pomodoro.dailyMinutes || 0;
    document.getElementById('total-focus-sessions').textContent = pomodoro.sessions || 0;
  };

  startBtn.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
  });

  resumeBtn.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    setMode(currentMode);
  });

  saveSettingsBtn.addEventListener('click', () => {
    const workspaceNow = getWorkspace();
    workspaceNow.pomodoro = workspaceNow.pomodoro || { sessions: 0, completedFocusSessions: 0, dailyMinutes: 0, settings: {} };
    workspaceNow.pomodoro.settings = {
      focusMinutes: Number(document.getElementById('focus-minutes').value || 25),
      shortBreakMinutes: Number(document.getElementById('short-break').value || 5),
      longBreakMinutes: Number(document.getElementById('long-break').value || 15),
    };
    saveWorkspace(workspaceNow);
    showToast('Timer settings saved.', 'success');
    setMode(currentMode);
  });

  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
  renderPomodoroStats();
  setMode('focus');
}
