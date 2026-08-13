async function initPdfVaultPage() {
  const input = document.getElementById('pdf-upload');
  const list = document.getElementById('pdf-list');

  const render = async () => {
    const files = await listPdfFiles().catch(() => []);
    if (!files.length) {
      list.innerHTML = '<div class="empty-state"><p>No PDFs stored locally yet.</p></div>';
      return;
    }

    list.innerHTML = files.map((file) => `
      <div class="pdf-item">
        <div class="task-item-header">
          <strong>${file.name}</strong>
          <span class="pill neutral">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <div class="task-meta">
          <span>${formatDateTime(file.createdAt)}</span>
        </div>
        <div class="pdf-actions">
          <button class="secondary-btn" type="button" data-action="open" data-id="${file.id}">Open</button>
          <button class="danger-btn" type="button" data-action="delete" data-id="${file.id}">Delete</button>
        </div>
      </div>
    `).join('');
  };

  input.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are allowed in the vault.', 'error');
      return;
    }

    try {
      const sizeMb = file.size / 1024 / 1024;
      if (sizeMb > 20) {
        showToast('This PDF exceeds the local browser storage suggestion.', 'error');
        return;
      }
      await storePdfFile(file);
      await render();
      showToast('PDF saved to this browser only.', 'success');
    } catch (error) {
      console.error(error);
      showToast('PDF could not be saved locally. Check browser storage.', 'error');
    }
    input.value = '';
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const id = button.dataset.id;

    if (button.dataset.action === 'delete') {
      try {
        await deletePdfFile(id);
        await render();
        showToast('PDF deleted.', 'success');
      } catch (error) {
        showToast('Failed to delete PDF.', 'error');
      }
      return;
    }

    if (button.dataset.action === 'open') {
      try {
        const fileRecord = await getPdfFile(id);
        if (!fileRecord) {
          showToast('PDF not found.', 'error');
          return;
        }
        const pdfUrl = URL.createObjectURL(fileRecord.data);
        const newWindow = window.open(pdfUrl, '_blank');
        if (!newWindow) {
          showToast('Popup blocked. Allow popups to open the PDF.', 'error');
        }
      } catch (error) {
        showToast('Could not open the PDF in this browser.', 'error');
      }
    }
  });

  await render();
}
