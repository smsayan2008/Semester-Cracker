function initSettingsPage() {
  const workspace = getWorkspace();
  const guestName = document.getElementById('guest-workspace-name');
  const browserId = document.getElementById('browser-id');

  if (guestName) guestName.textContent = workspace.workspaceName || 'Guest Workspace';
  if (browserId) browserId.textContent = `${navigator.userAgent.slice(0, 40)}...`;

  const themeButtons = [...document.querySelectorAll('.theme-choice')];
  const currentTheme = getTheme();
  themeButtons.forEach((button) => {
    const isActive = button.dataset.theme === currentTheme;
    button.classList.toggle('primary-btn', isActive);
    button.classList.toggle('secondary-btn', !isActive);
  });

  themeButtons.forEach((button) => button.addEventListener('click', () => {
    const nextTheme = button.dataset.theme;
    setTheme(nextTheme);
    applyTheme(nextTheme);
    showToast('Appearance updated.', 'success');
    themeButtons.forEach((item) => {
      const isActive = item.dataset.theme === nextTheme;
      item.classList.toggle('primary-btn', isActive);
      item.classList.toggle('secondary-btn', !isActive);
    });
  }));

  const backupButton = document.getElementById('backup-data');
  if (backupButton) {
    backupButton.addEventListener('click', () => {
      const workspaceExport = getWorkspace();
      const data = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        workspace: workspaceExport,
      }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'semester-cracker-backup.json';
      link.click();
      URL.revokeObjectURL(url);
      showToast('Backup downloaded locally.', 'success');
    });
  }

  const restoreInput = document.getElementById('restore-file');
  if (restoreInput) {
    restoreInput.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!parsed || !parsed.workspace) {
            throw new Error('Invalid backup format.');
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.workspace));
          showToast('Backup restored successfully.', 'success');
          setTimeout(() => window.location.reload(), 300);
        } catch (error) {
          showToast('Restore failed: invalid backup file.', 'error');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    });
  }

  const resetButton = document.getElementById('reset-data');
  if (resetButton) {
    resetButton.addEventListener('click', async () => {
      const confirmed = window.confirm('This will clear all local Semester Cracker data for this browser/device. Continue?');
      if (!confirmed) return;
      const fresh = resetWorkspace();
      localStorage.setItem(THEME_KEY, fresh.settings.theme || 'light');
      await clearPdfVault();
      applyTheme(fresh.settings.theme || 'light');
      showToast('App data reset. Fresh guest workspace created.', 'success');
      setTimeout(() => window.location.reload(), 300);
    });
  }
}
