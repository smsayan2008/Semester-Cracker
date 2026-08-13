function initNotesPage() {
  const form = document.getElementById('note-form');
  const notesList = document.getElementById('notes-list');
  const searchInput = document.getElementById('note-search');
  const filterSelect = document.getElementById('note-filter');

  const render = () => {
    const workspace = getWorkspace();
    const notes = workspace.notes || [];
    const query = (searchInput.value || '').trim().toLowerCase();
    const filter = filterSelect.value;

    const subjects = [...new Set(notes.map((note) => note.subject).filter(Boolean))];
    filterSelect.innerHTML = '<option value="all">All subjects</option>' + subjects.map((subject) => `<option value="${subject}">${subject}</option>`).join('');
    filterSelect.value = filter && subjects.includes(filter) ? filter : 'all';

    const filtered = notes.filter((note) => {
      const text = [note.title, note.content, note.subject].join(' ').toLowerCase();
      const matchesQuery = text.includes(query);
      const matchesFilter = filter === 'all' || note.subject === filter;
      return matchesQuery && matchesFilter;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    notesList.innerHTML = filtered.length ? filtered.map((note) => `
      <div class="note-item">
        <div class="note-item-header">
          <strong>${note.title}</strong>
          <span>${note.subject || 'General'}</span>
        </div>
        <p>${(note.content || '').slice(0, 220) || 'No content yet.'}</p>
        <div class="note-meta">
          <span>Created: ${formatDateTime(note.createdAt)}</span>
          <span>Updated: ${formatDateTime(note.updatedAt)}</span>
        </div>
        <div class="note-actions">
          <button class="secondary-btn" type="button" data-action="edit" data-id="${note.id}">Edit</button>
          <button class="danger-btn" type="button" data-action="delete" data-id="${note.id}">Delete</button>
        </div>
      </div>
    `).join('') : '<div class="empty-state"><p>No notes found.</p></div>';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const id = document.getElementById('note-id').value;
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    if (!title || !content) {
      showToast('A note title and content are required.', 'error');
      return;
    }

    const payload = {
      id: id || `note-${Date.now()}`,
      title,
      content,
      subject: document.getElementById('note-subject').value.trim() || 'General',
      createdAt: id ? (workspace.notes.find((note) => note.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentIndex = workspace.notes.findIndex((note) => note.id === payload.id);
    if (currentIndex >= 0) {
      workspace.notes[currentIndex] = { ...workspace.notes[currentIndex], ...payload };
    } else {
      workspace.notes.unshift(payload);
    }

    saveWorkspace(workspace);
    form.reset();
    render();
    showToast('Note saved locally.', 'success');
  });

  notesList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const workspace = getWorkspace();
    const note = workspace.notes.find((item) => item.id === button.dataset.id);
    if (!note) return;

    if (button.dataset.action === 'delete') {
      if (!window.confirm('Delete this note?')) return;
      workspace.notes = workspace.notes.filter((item) => item.id !== note.id);
      saveWorkspace(workspace);
      render();
      showToast('Note deleted.', 'success');
      return;
    }

    if (button.dataset.action === 'edit') {
      document.getElementById('note-id').value = note.id;
      document.getElementById('note-title').value = note.title;
      document.getElementById('note-subject').value = note.subject || '';
      document.getElementById('note-content').value = note.content || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  searchInput.addEventListener('input', render);
  filterSelect.addEventListener('change', render);
  document.getElementById('note-reset').addEventListener('click', () => {
    form.reset();
    document.getElementById('note-id').value = '';
    showToast('Note form cleared.', 'success');
  });

  render();
}
