const STORAGE_KEY = 'semester-cracker-workspace-v1';
const THEME_KEY = 'semester-cracker-theme';

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('Failed to parse stored data:', error);
    return fallback;
  }
}

function ensureGuestWorkspace() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return safeParse(existing, defaultWorkspace());
  }

  const workspace = defaultWorkspace();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  return workspace;
}

function defaultWorkspace() {
  const now = new Date().toISOString();
  return {
    workspaceName: 'Guest Workspace',
    createdAt: now,
    settings: {
      theme: 'light',
      lastUpdated: now,
    },
    tasks: [],
    notes: [],
    attendance: [],
    cgpa: [],
    planner: [],
    pomodoro: {
      sessions: 0,
      completedFocusSessions: 0,
      dailyMinutes: 0,
      settings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      },
      lastUpdated: now,
    },
    pdfs: [],
    analytics: {
      generatedAt: now,
    },
  };
}

function getWorkspace() {
  const workspace = ensureGuestWorkspace();
  if (!workspace.settings) {
    workspace.settings = { theme: 'light', lastUpdated: new Date().toISOString() };
  }
  return workspace;
}

function saveWorkspace(workspace) {
  workspace.settings = workspace.settings || {};
  workspace.settings.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function resetWorkspace() {
  const workspace = defaultWorkspace();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  return workspace;
}

async function clearPdfVault() {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pdfs', 'readwrite');
      const store = tx.objectStore('pdfs');
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error || new Error('Failed to clear PDF vault.'));
    });
  } catch (error) {
    console.warn('Could not clear PDF vault on reset:', error);
  }
}

function getTheme() {
  const workspace = getWorkspace();
  const stored = localStorage.getItem(THEME_KEY);
  return stored || workspace.settings.theme || 'light';
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  const workspace = getWorkspace();
  workspace.settings.theme = theme;
  saveWorkspace(workspace);
}

function applyTheme(theme = getTheme()) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2400);
}

function formatDate(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getCurrentDateValue() {
  return new Date().toISOString().split('T')[0];
}

function formatCurrency(value) {
  return Number(value || 0).toFixed(2);
}

function getGradePoints(grade) {
  const mapping = {
    'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, D: 1.0, F: 0,
  };
  return mapping[grade] || 0;
}

function calculateAttendancePercentage(record) {
  if (!record || Number(record.total) <= 0) return 0;
  return (Number(record.attended) / Number(record.total)) * 100;
}

function calculateCGPAFromSemester(subjects) {
  if (!subjects || subjects.length === 0) return 0;
  const totalCredits = subjects.reduce((sum, subject) => sum + Number(subject.credits || 0), 0);
  if (totalCredits === 0) return 0;
  const weighted = subjects.reduce((sum, subject) => sum + (Number(subject.credits || 0) * getGradePoints(subject.grade || 'F')), 0);
  return weighted / totalCredits;
}

function calculateOverallCGPA(cgpaRecords) {
  if (!cgpaRecords || cgpaRecords.length === 0) return 0;
  const records = [...cgpaRecords].filter((item) => item && item.subjects && item.subjects.length > 0);
  if (!records.length) return 0;
  const totalCredits = records.reduce((sum, item) => sum + item.subjects.reduce((inner, subject) => inner + Number(subject.credits || 0), 0), 0);
  if (totalCredits === 0) return 0;
  const weighted = records.reduce((sum, item) => {
    const semTotal = item.subjects.reduce((inner, subject) => inner + (Number(subject.credits || 0) * getGradePoints(subject.grade || 'F')), 0);
    return sum + semTotal;
  }, 0);
  return weighted / totalCredits;
}

function slugify(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isIndexedDBAvailable() {
  return !!window.indexedDB;
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }

    const request = indexedDB.open('semester-cracker-db', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pdfs')) {
        db.createObjectStore('pdfs', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB failed to open.'));
  });
}

async function storePdfFile(file) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readwrite');
    const store = tx.objectStore('pdfs');
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pdf-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      data: file,
      createdAt: new Date().toISOString(),
    };
    const request = store.put(record);
    request.onsuccess = () => resolve(record.id);
    request.onerror = () => reject(request.error || new Error('Could not save PDF.'));
  });
}

async function listPdfFiles() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readonly');
    const store = tx.objectStore('pdfs');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Could not load PDFs.'));
  });
}

async function deletePdfFile(id) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readwrite');
    const store = tx.objectStore('pdfs');
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error('Could not delete PDF.'));
  });
}

async function getPdfFile(id) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readonly');
    const store = tx.objectStore('pdfs');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not fetch PDF.'));
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
