function initCgpaPage() {
  const form = document.getElementById('cgpa-form');
  const list = document.getElementById('cgpa-list');

  const render = () => {
    const workspace = getWorkspace();
    const semesters = workspace.cgpa || [];
    const overall = calculateOverallCGPA(semesters);
    document.getElementById('cgpa-overview').textContent = `CGPA: ${overall.toFixed(2)}`;

    if (!semesters.length) {
      list.innerHTML = '<div class="empty-state"><p>No semester data yet.</p></div>';
      return;
    }

    list.innerHTML = semesters.map((semester) => {
      const semGpa = calculateCGPAFromSemester(semester.subjects || []);
      return `
        <div class="cgpa-item">
          <div class="attendance-header">
            <strong>${semester.name || 'Semester'}</strong>
            <span class="pill neutral">GPA ${semGpa.toFixed(2)}</span>
          </div>
          <div class="task-list">
            ${(semester.subjects || []).map((subject) => `
              <div class="task-item">
                <div class="task-item-header">
                  <strong>${subject.subject}</strong>
                  <span class="pill success">${subject.grade}</span>
                </div>
                <div class="task-meta">
                  <span>Credits: ${subject.credits}</span>
                  <span>Points: ${getGradePoints(subject.grade)}</span>
                </div>
                <div class="task-actions">
                  <button class="secondary-btn" type="button" data-action="edit" data-semester="${semester.id}" data-subject-id="${subject.id}">Edit</button>
                  <button class="danger-btn" type="button" data-action="delete" data-semester="${semester.id}" data-subject-id="${subject.id}">Delete</button>
                </div>
              </div>
            `).join('') || '<p>No subjects added yet.</p>'}
          </div>
        </div>
      `;
    }).join('');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const semesterName = document.getElementById('cgpa-semester').value.trim();
    const subjectName = document.getElementById('cgpa-subject').value.trim();
    const credits = Number(document.getElementById('cgpa-credits').value || 0);
    const grade = document.getElementById('cgpa-grade').value;
    const subjectId = document.getElementById('cgpa-subject-id').value;

    if (!semesterName || !subjectName || credits <= 0) {
      showToast('Enter a valid semester, subject, and credit value.', 'error');
      return;
    }

    let semester = workspace.cgpa.find((item) => item.name === semesterName);
    if (!semester) {
      semester = { id: `semester-${Date.now()}`, name: semesterName, subjects: [] };
      workspace.cgpa.push(semester);
    }

    const subject = {
      id: subjectId || `subject-${Date.now()}`,
      subject: subjectName,
      credits,
      grade,
      points: getGradePoints(grade),
    };

    const index = semester.subjects.findIndex((item) => item.id === subject.id);
    if (index >= 0) {
      semester.subjects[index] = subject;
    } else {
      semester.subjects.push(subject);
    }

    saveWorkspace(workspace);
    form.reset();
    document.getElementById('cgpa-subject-id').value = '';
    render();
    showToast('CGPA record saved.', 'success');
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const workspace = getWorkspace();
    const semester = workspace.cgpa.find((item) => item.id === button.dataset.semester);
    if (!semester) return;
    const subject = semester.subjects.find((item) => item.id === button.dataset.subjectId);
    if (!subject) return;

    if (button.dataset.action === 'delete') {
      semester.subjects = semester.subjects.filter((item) => item.id !== subject.id);
      if (!semester.subjects.length) {
        workspace.cgpa = workspace.cgpa.filter((item) => item.id !== semester.id);
      }
      saveWorkspace(workspace);
      render();
      showToast('Subject removed.', 'success');
      return;
    }

    if (button.dataset.action === 'edit') {
      document.getElementById('cgpa-semester').value = semester.name;
      document.getElementById('cgpa-subject-id').value = subject.id;
      document.getElementById('cgpa-subject').value = subject.subject;
      document.getElementById('cgpa-credits').value = subject.credits;
      document.getElementById('cgpa-grade').value = subject.grade;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('cgpa-reset').addEventListener('click', () => {
    form.reset();
    document.getElementById('cgpa-subject-id').value = '';
    showToast('CGPA form cleared.', 'success');
  });

  render();
}
