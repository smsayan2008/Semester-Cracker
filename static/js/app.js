document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  applyTheme();
  updateClock();
  setInterval(updateClock, 1000 * 30);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      applyTheme(nextTheme);
      showToast(`Theme changed to ${nextTheme} mode.`, 'success');
    });
  }

  const workspaceChip = document.getElementById('workspace-chip');
  if (workspaceChip) {
    const workspace = getWorkspace();
    workspaceChip.textContent = workspace.workspaceName || 'Guest Workspace';
  }

  const searchButton = document.getElementById('global-search-button');
  const searchInput = document.getElementById('global-search-input');
  const searchModal = document.getElementById('search-modal');
  const closeSearch = searchModal?.querySelector('.close-modal');

  const runSearch = () => {
    const query = (searchInput?.value || '').trim();
    const results = searchLocalData(query);
    renderSearchResults(results, query);
    if (searchModal) {
      searchModal.classList.remove('hidden');
    }
  };

  searchButton?.addEventListener('click', runSearch);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') runSearch();
  });
  closeSearch?.addEventListener('click', () => searchModal?.classList.add('hidden'));
  searchModal?.addEventListener('click', (event) => {
    if (event.target === searchModal) {
      searchModal.classList.add('hidden');
    }
  });

  if (page === 'dashboard') {
    renderDashboard();
  }

  if (page === 'tasks') {
    initTaskPage();
  }

  if (page === 'notes') {
    initNotesPage();
  }

  if (page === 'attendance') {
    initAttendancePage();
  }

  if (page === 'cgpa') {
    initCgpaPage();
  }

  if (page === 'planner') {
    initPlannerPage();
  }

  if (page === 'pomodoro') {
    initPomodoroPage();
  }

  if (page === 'analytics') {
    initAnalyticsPage();
  }

  if (page === 'pdf-vault') {
    initPdfVaultPage();
  }

  if (page === 'settings') {
    initSettingsPage();
  }
});

function updateClock() {
  const clock = document.getElementById('live-clock');
  if (!clock) return;
  const now = new Date();
  clock.textContent = now.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function searchLocalData(query) {
  const workspace = getWorkspace();
  const term = query.toLowerCase();
  if (!term) return [];

  const results = [];

  workspace.tasks.forEach((task) => {
    if ([task.title, task.description, task.category].join(' ').toLowerCase().includes(term)) {
      results.push({ type: 'Task', title: task.title, detail: `${task.category || 'General'} • ${task.priority || 'Medium'}` });
    }
  });

  workspace.notes.forEach((note) => {
    if ([note.title, note.content, note.subject].join(' ').toLowerCase().includes(term)) {
      results.push({ type: 'Note', title: note.title, detail: `${note.subject || 'General'} • ${formatDateTime(note.updatedAt)}` });
    }
  });

  workspace.attendance.forEach((record) => {
    if ((record.subject || '').toLowerCase().includes(term)) {
      results.push({ type: 'Attendance', title: record.subject, detail: `${record.attended}/${record.total} classes attended` });
    }
  });

  workspace.planner.forEach((plan) => {
    if ([plan.subject, plan.topic].join(' ').toLowerCase().includes(term)) {
      results.push({ type: 'Study Plan', title: `${plan.subject}: ${plan.topic}`, detail: `${plan.date} • ${plan.priority}` });
    }
  });

  return results;
}

function renderSearchResults(results, query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (!query || !results.length) {
    resultsContainer.innerHTML = '<p class="empty-state-text">No matching local records found.</p>';
    return;
  }

  resultsContainer.innerHTML = results.map((item) => `
    <div class="summary-item">
      <div>
        <strong>${item.type}</strong>
        <p>${item.title}</p>
      </div>
      <small>${item.detail}</small>
    </div>
  `).join('');
}

function safeSetInputValue(element, value) {
  if (element) element.value = value ?? '';
}
