const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const defaultPageId = 'grades';
const activePageStorageKey = 'studentPlannerActivePage_v1';
const rememberLastPage = true;
const years = ['1ο Έτος', '2ο Έτος', '3ο Έτος', '4ο Έτος'];
const gradeTables = ['Πίνακας Α', 'Πίνακας Β'];
const exams = ['Χειμερινή', 'Εαρινή', 'Σεπτεμβρίου'];
const courseTypes = ['Υποχρεωτικό', 'Project', 'Υποχρεωτικό Κατεύθυνσης', 'Βασικό Κατεύθυνσης', 'Γενικής Παιδείας', 'Πρακτική Άσκηση', 'Επιλογής' , 'ΠΔΕ', 'Αυτοτελή Προαιρετικά Εργαστήρια ', ];
const targetEcts = 240;
const storageKey = 'studentPlannerData_v2';

let modalMode = null;
let modalContext = null;
let data = loadData();

async function loadDataFromFile() {
  const response = await fetch('data.json?ts=' + Date.now());
  return await response.json();
}

function showPage(pageId, shouldRemember = true) {
  const targetPage = document.getElementById(pageId) || document.getElementById(defaultPageId);
  if (!targetPage) return;

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === targetPage.id);
  });

  pages.forEach(page => {
    page.classList.toggle('active-page', page.id === targetPage.id);
  });

  if (rememberLastPage && shouldRemember) {
    localStorage.setItem(activePageStorageKey, targetPage.id);
  }
}

function getInitialPageId() {
  if (!rememberLastPage) return defaultPageId;
  const savedPage = localStorage.getItem(activePageStorageKey);
  return savedPage && document.getElementById(savedPage) ? savedPage : defaultPageId;
}

navLinks.forEach(link => {
  link.addEventListener('click', () => showPage(link.dataset.page));
});

function createId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function defaultData() {
  return {
    courses: [],
    grades: [],
    examGrades: []
  };
}

function loadData() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return defaultData();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.courses) || !Array.isArray(parsed.grades) || !Array.isArray(parsed.examGrades)) return defaultData();
    return parsed;
  } catch (error) {
    return defaultData();
  }
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatGrade(value) {
  const grade = numberValue(value);
  return grade === null ? '-' : grade.toFixed(grade % 1 === 0 ? 0 : 1);
}

function getCourse(courseId) {
  return data.courses.find(course => course.id === courseId);
}

function getGradeRowClass(value) {
  const grade = numberValue(value);
  if (grade === null) return '';
  return grade >= 5 ? 'grade-pass-row' : 'grade-fail-row';
}

function courseTypeOptions(selectedType = '') {
  return courseTypes.map(type => `<option value="${escapeHtml(type)}" ${type === selectedType ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('');
}

function normalizeText(value) {
  return String(value || '').trim().toLocaleLowerCase('el-GR');
}

function findCourseByName(name) {
  const normalized = normalizeText(name);
  return data.courses.find(course => normalizeText(course.name) === normalized) || null;
}

function upsertManualCourse({ courseId, name, professor, ects, type, year, semester }) {
  const cleanName = name.trim();
  const cleanProfessor = professor.trim() || '-';
  const cleanType = type || 'Επιλογής';
  const cleanEcts = numberValue(ects) ?? 0;
  const cleanSemester = normalizeSemester(semester, year);
  const cleanYear = semesterToYear(cleanSemester);

  let course = courseId ? getCourse(courseId) : findCourseByName(cleanName);
  if (course) {
    Object.assign(course, {
      name: cleanName,
      professor: cleanProfessor,
      ects: cleanEcts,
      type: cleanType,
      year: cleanYear,
      semester: cleanSemester
    });
    return course.id;
  }

  const newCourse = {
    id: createId(),
    name: cleanName,
    professor: cleanProfessor,
    ects: cleanEcts,
    semester: cleanSemester,
    year: cleanYear,
    type: cleanType
  };
  data.courses.push(newCourse);
  return newCourse.id;
}

function yearToDefaultSemester(year) {
  const index = years.indexOf(year);
  return index >= 0 ? index * 2 + 1 : 1;
}

function normalizeSemester(semester, fallbackYear = '1ο Έτος') {
  const value = Number(semester);
  if (Number.isInteger(value) && value >= 1 && value <= 8) return value;
  return yearToDefaultSemester(fallbackYear);
}

function semesterToYear(semester) {
  const value = normalizeSemester(semester);
  if (value <= 2) return '1ο Έτος';
  if (value <= 4) return '2ο Έτος';
  if (value <= 6) return '3ο Έτος';
  return '4ο Έτος';
}

function semesterOptions(selectedSemester = 1) {
  const selected = normalizeSemester(selectedSemester);
  return Array.from({ length: 8 }, (_, index) => {
    const semester = index + 1;
    return `<option value="${semester}" ${semester === selected ? 'selected' : ''}>${semester}ο Εξάμηνο</option>`;
  }).join('');
}

function getLatestGradeForCourse(courseId) {
  return [...data.grades]
    .filter(grade => grade.courseId === courseId)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
}

function getPassedCourses() {
  return data.courses.filter(course => {
    const grade = getLatestGradeForCourse(course.id);
    return grade && Number(grade.finalGrade) >= 5;
  });
}

function calculateStats() {
  const totalCourses = data.courses.length;
  const graded = data.courses.map(course => ({ course, grade: getLatestGradeForCourse(course.id) })).filter(x => x.grade);
  const passed = graded.filter(x => Number(x.grade.finalGrade) >= 5);
  const failed = graded.filter(x => Number(x.grade.finalGrade) < 5);
  const passedEcts = passed.reduce((sum, x) => sum + Number(x.course.ects || 0), 0);
  const weightedSum = passed.reduce((sum, x) => sum + Number(x.grade.finalGrade) * Number(x.course.ects || 0), 0);
  const passedEctsForAverage = passed.reduce((sum, x) => sum + Number(x.course.ects || 0), 0);
  const average = passedEctsForAverage ? weightedSum / passedEctsForAverage : 0;
  const completion = Math.min(100, Math.round((passedEcts / targetEcts) * 100));

  return {
    totalCourses,
    gradedCount: graded.length,
    passedCount: passed.length,
    failedCount: failed.length,
    passedEcts,
    average,
    completion
  };
}

function refreshAll() {
  buildDashboard();
  buildGrades();
  buildExams();
  buildRequirements();
  buildCourses();
  activateAccordions();
}

function buildDashboard() {
  const stats = calculateStats();
  document.getElementById('dashboardStats').innerHTML = `
    <div class="stat-card"><span>Σύνολο μαθημάτων</span><strong>${stats.totalCourses}</strong><small>Μαθήματα στο πρόγραμμα σπουδών</small></div>
    <div class="stat-card"><span>Περασμένα</span><strong>${stats.passedCount}</strong><small>Μαθήματα με βαθμό ≥ 5</small></div>
    <div class="stat-card"><span>Κομμένα</span><strong>${stats.failedCount}</strong><small>Μαθήματα με βαθμό κάτω από 5</small></div>
    <div class="stat-card"><span>ECTS</span><strong>${stats.passedEcts} / ${targetEcts}</strong><small>Πρόοδος πτυχίου</small></div>
    <div class="stat-card"><span>Μέσος όρος</span><strong>${stats.average ? stats.average.toFixed(2) : '-'}</strong><small>Σταθμισμένος με βάση τα ECTS</small></div>
    <div class="stat-card"><span>Ολοκλήρωση</span><strong>${stats.completion}%</strong><small>Ποσοστό απαιτήσεων</small></div>
  `;

  const recent = [...data.grades].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 5);
  document.getElementById('recentGrades').innerHTML = recent.length
    ? recent.map(grade => {
        const course = getCourse(grade.courseId);
        return `<li><span>${escapeHtml(course?.name || 'Άγνωστο μάθημα')}</span><b>${formatGrade(grade.finalGrade)}</b></li>`;
      }).join('')
    : '<li class="empty-state">Δεν υπάρχουν ακόμα βαθμολογίες.</li>';

  const progress = document.getElementById('dashboardEctsProgress');
  progress.style.width = `${stats.completion}%`;
  progress.textContent = `${stats.completion}%`;
  document.getElementById('dashboardEctsText').textContent = `Απομένουν ${Math.max(targetEcts - stats.passedEcts, 0)} ECTS για την ολοκλήρωση των ${targetEcts}.`;
}

function buildGrades() {
  const container = document.getElementById('gradesContainer');
  container.innerHTML = years.map((year, yearIndex) => `
    <div class="accordion ${yearIndex === 3 ? 'open' : ''}">
      <button class="accordion-header" type="button">${year}<span>⌄</span></button>
      <div class="accordion-body">
        ${gradeTables.map(tableName => buildGradeTable(year, tableName)).join('')}
      </div>
    </div>`).join('');
}

function buildGradeTable(year, tableName) {
  const rows = data.grades.filter(grade => grade.year === year && grade.table === tableName);
  return `
    <div class="table-box">
      <h3>${tableName}</h3>
      <button class="action-btn add-btn" type="button" onclick="openGradeForm('add', '${year}', '${tableName}')">+ Προσθήκη μαθήματος</button>
      <table>
        <thead><tr><th>Α/Α</th><th>Όνομα μαθήματος</th><th>ECTS</th><th>Κατηγορία</th><th>Εξάμηνο</th><th>Τελικός βαθμός</th><th>Ενέργειες</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map((grade, index) => {
            const course = getCourse(grade.courseId);
            return `
              <tr class="${getGradeRowClass(grade.finalGrade)}">
                <td>${index + 1}</td>
                <td>${escapeHtml(course?.name || 'Άγνωστο μάθημα')}</td>
                
                <td>${escapeHtml(course?.ects || '-')}</td>
                <td>${escapeHtml(course?.type || '-')}</td>
                <td>${course?.semester ? `${escapeHtml(course.semester)}ο` : '-'}</td>
                <td>${formatGrade(grade.finalGrade)}</td>
                <td>
                  <button class="action-btn edit-btn" type="button" onclick="openGradeForm('edit', '${year}', '${tableName}', '${grade.id}')">Επεξεργασία</button>
                  <button class="action-btn delete-btn" type="button" onclick="deleteGrade('${grade.id}')">Διαγραφή</button>
                </td>
              </tr>`;
          }).join('') : `<tr><td colspan="6" class="empty-state">Δεν υπάρχουν εγγραφές.</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function buildExams() {
  const container = document.getElementById('examsContainer');
  container.innerHTML = years.map((year, yearIndex) => `
    <div class="accordion ${yearIndex === 1 ? 'open' : ''}">
      <button class="accordion-header" type="button">${year}<span>⌄</span></button>
      <div class="accordion-body">
        ${exams.map(exam => buildExamTable(year, exam)).join('')}
      </div>
    </div>`).join('');
}

function buildExamTable(year, exam) {
  const rows = data.examGrades.filter(row => row.year === year && row.exam === exam);
  return `
    <div class="table-box">
      <h3>${exam} Εξεταστική</h3>
      <button class="action-btn add-btn" type="button" onclick="openExamForm('add', '${year}', '${exam}')">+ Προσθήκη μαθήματος</button>
      <table>
        <thead><tr><th>Α/Α</th><th>Όνομα μαθήματος</th><th>Περίοδος</th><th>Τελικός βαθμός</th><th>Βαθμολογικά πεδία</th><th>Ενέργειες</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map((row, index) => {
            const course = getCourse(row.courseId);
            const fields = (row.extraFields || []).map(field => `<span class="badge">${escapeHtml(field.title)}: ${formatGrade(field.grade)} (${field.weight || 0}%)</span>`).join('') || '-';
            return `
              <tr class="${getGradeRowClass(row.finalGrade)}">
                <td>${index + 1}</td>
                <td>${escapeHtml(course?.name || 'Άγνωστο μάθημα')}</td>
                <td>${escapeHtml(course?.professor || '-')}</td>
                <td>${escapeHtml(row.period || '-')}</td>
                <td>${formatGrade(row.finalGrade)}</td>
                <td>${fields}</td>
                
                <td>
                  <button class="action-btn edit-btn" type="button" onclick="openExamForm('edit', '${year}', '${exam}', '${row.id}')">Επεξεργασία</button>
                  <button class="action-btn delete-btn" type="button" onclick="deleteExamGrade('${row.id}')">Διαγραφή</button>
                </td>
              </tr>`;
          }).join('') : `<tr><td colspan="6" class="empty-state">Δεν υπάρχουν εγγραφές.</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function buildRequirements() {
  const stats = calculateStats();
  const passed = getPassedCourses();
  const countByType = type => passed.filter(course => course.type === type).length;
  const targetByType = {
    'Υποχρεωτικό': 18,
    'Project': 1,
    'Υποχρεωτικό Κατεύθυνσης': 4,
    'Βασικό Κατεύθυνσης': 4,
    'Γενικής Παιδείας': 3,
    'Πρακτική Άσκηση': 2,
    'ΠΔΕ':5,
    'Αυτοτελή Προαιρετικά Εργαστήρια ':1

  
  };

  document.getElementById('requirementsContainer').innerHTML = `
    <div class="panel personal-info">
      <h3>Προσωπικά Στοιχεία</h3>
      <p><b>Ονοματεπώνυμο:</b> Αντώνιος Γεώργιος Λαμπιδάκης</p>
      <p><b>Αριθμός Μητρώου:</b> 1115202200008</p>
      <p><b>Εξάμηνο Φοίτησης:</b> 8ο</p>
      <p><b>Κατεύθυνση:</b> Πληροφορική</p>
      <p><b>Μέσος Όρος:</b> ${stats.average ? stats.average.toFixed(2) : '-'}</p>
    </div>

    <div class="panel">
      <h3>Απαιτήσεις για την Λήψη Πτυχίου</h3>
      <p><b>ECTS:</b> ${stats.passedEcts} / ${targetEcts}</p>
      <div class="progress"><div style="width:${stats.completion}%">${stats.completion}%</div></div>
      <div class="requirements-list">
        ${Object.entries(targetByType).map(([type, target]) => `<span>${type}: ${countByType(type)} / ${target}</span>`).join('')}
      </div>
      <h3>Tasks απαιτήσεων</h3>
      <ul class="clean-list requirement-tasks">
        ${Object.entries(targetByType).map(([type, target]) => {
          const current = countByType(type);
          const done = current >= target;
          return `<li class="${done ? 'task-done' : 'task-open'}"><span>${done ? 'Ολοκληρώθηκε' : 'Εκκρεμεί'}: ${escapeHtml(type)}</span><b>${current} / ${target}</b></li>`;
        }).join('')}
      </ul>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>Μαθήματα</h3>
        <div class="pie" style="background:${coursePie(stats)}"></div>
        <p>Περασμένα ${stats.passedCount} / Κομμένα ${stats.failedCount}</p>
      </div>
      <div class="chart-card">
        <h3>Βαθμοί</h3>
        <div class="pie" style="background:${gradePie()}"></div>
        <p>Κατανομή βαθμών από τις βαθμολογίες.</p>
      </div>
      <div class="chart-card wide">
        <h3>Μέσος Όρος / Εξάμηνο</h3>
        <div class="bar-chart">${semesterBars()}</div>
      </div>
    </div>`;
}

function coursePie(stats) {
  const total = Math.max(stats.passedCount + stats.failedCount, 1);
  const passedPercent = (stats.passedCount / total) * 100;
  return `conic-gradient(#2563eb 0 ${passedPercent}%, #ef4444 ${passedPercent}% 100%)`;
}

function gradePie() {
  const buckets = { '5-6': 0, '7-8': 0, '9-10': 0, '<5': 0 };
  data.grades.forEach(row => {
    const grade = Number(row.finalGrade);
    if (!Number.isFinite(grade)) return;
    if (grade < 5) buckets['<5'] += 1;
    else if (grade < 7) buckets['5-6'] += 1;
    else if (grade < 9) buckets['7-8'] += 1;
    else buckets['9-10'] += 1;
  });
  const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
  let cursor = 0;
  const colors = ['#ef4444', '#06b6d4', '#84cc16', '#7c3aed'];
  return 'conic-gradient(' + Object.values(buckets).map((count, index) => {
    const next = cursor + (count / total) * 100;
    const part = `${colors[index]} ${cursor}% ${next}%`;
    cursor = next;
    return part;
  }).join(', ') + ')';
}

function semesterBars() {
  return Array.from({ length: 8 }, (_, index) => {
    const semester = index + 1;
    const passedInSemester = data.courses.map(course => ({ course, grade: getLatestGradeForCourse(course.id) }))
      .filter(x => x.course.semester === semester && x.grade && Number(x.grade.finalGrade) >= 5);
    const average = passedInSemester.length
      ? passedInSemester.reduce((sum, x) => sum + Number(x.grade.finalGrade), 0) / passedInSemester.length
      : 0;
    const height = Math.round((average / 10) * 100);
    return `<span style="height:${height}%" title="${semester}ο εξάμηνο: ${average ? average.toFixed(2) : '-'}">${semester}</span>`;
  }).join('');
}

function buildCourses() {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = Array.from({ length: 8 }, (_, i) => {
    const semester = i + 1;
    const semesterCourses = data.courses.filter(course => Number(course.semester) === semester);
    return `
      <div class="semester-card">
        <h2>${semester}ο Εξάμηνο</h2>
        <div class="course-grid">
          ${semesterCourses.length ? semesterCourses.map(course => {
            const grade = getLatestGradeForCourse(course.id);
            const statusClass = grade ? (Number(grade.finalGrade) >= 5 ? 'status-pass' : 'status-fail') : 'status-pending';
            const statusText = grade ? (Number(grade.finalGrade) >= 5 ? 'Περασμένο' : 'Κομμένο') : 'Δεν έχει βαθμό';
            return `
              <div class="course-card" onclick="openCourse('${course.id}')">
                <h3>${escapeHtml(course.name)}</h3>
                <p>ECTS: ${escapeHtml(course.ects)}</p>
                <p>${escapeHtml(course.type)}</p>
                <p>Βαθμός: ${grade ? formatGrade(grade.finalGrade) : '-'}</p>
                <p class="${statusClass}">${statusText}</p>
              </div>`;
          }).join('') : '<p class="empty-state">Δεν υπάρχουν μαθήματα σε αυτό το εξάμηνο.</p>'}
        </div>
      </div>`;
  }).join('');
}

function activateAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.onclick = () => header.parentElement.classList.toggle('open');
  });
}

function courseOptions(selectedId = '') {
  return data.courses.map(course => `<option value="${course.id}" ${course.id === selectedId ? 'selected' : ''}>${escapeHtml(course.name)}</option>`).join('');
}

function openGradeForm(mode, year, table, gradeId = null) {
  modalMode = 'grade-' + mode;
  const existing = gradeId ? data.grades.find(row => row.id === gradeId) : null;
  modalContext = { year, table, gradeId };
  document.getElementById('formModalTitle').textContent = mode === 'add' ? 'Προσθήκη βαθμολογίας' : 'Επεξεργασία βαθμολογίας';
  document.getElementById('entryForm').innerHTML = `
    <div class="form-grid">
      <div class="form-field full-field">
        <label for="courseName">Μάθημα</label>
        <input id="courseName" type="text" placeholder="Γράψε το όνομα του μαθήματος" value="${escapeHtml(getCourse(existing?.courseId)?.name || '')}" required />
        <input id="courseId" type="hidden" value="${existing?.courseId || ''}" />
      </div>
      
      <div class="form-field">
        <label for="ects">ECTS</label>
        <input id="ects" type="number" min="0" step="0.5" value="${getCourse(existing?.courseId)?.ects ?? 6}" required />
      </div>
      <div class="form-field">
        <label for="courseType">Κατηγορία</label>
        <select id="courseType" required>${courseTypeOptions(getCourse(existing?.courseId)?.type || 'Υποχρεωτικό')}</select>
      </div>
      <div class="form-field">
        <label for="semester">Εξάμηνο</label>
        <select id="semester" required>${semesterOptions(getCourse(existing?.courseId)?.semester || yearToDefaultSemester(year))}</select>
      </div>
      <div class="form-field">
        <label for="finalGrade">Τελικός βαθμός</label>
        <input id="finalGrade" type="number" min="0" max="10" step="0.1" value="${existing?.finalGrade ?? ''}" required />
      </div>
      <div class="form-field">
        <label>Έτος</label>
        <input value="${year}" disabled />
      </div>
      <div class="form-field">
        <label>Πίνακας</label>
        <input value="${table}" disabled />
      </div>
    </div>
    <div class="form-actions">
      <button class="action-btn secondary-btn" type="button" onclick="closeFormModal()">Άκυρο</button>
      <button class="action-btn add-btn" type="submit">ΟΚ</button>
    </div>`;
  document.getElementById('entryForm').onsubmit = submitEntryForm;
  document.getElementById('formModal').classList.remove('hidden');
}

function openExamForm(mode, year, exam, examGradeId = null) {
  modalMode = 'exam-' + mode;
  const existing = examGradeId ? data.examGrades.find(row => row.id === examGradeId) : null;
  modalContext = { year, exam, examGradeId };
  document.getElementById('formModalTitle').textContent = mode === 'add' ? 'Προσθήκη εξεταστικής' : 'Επεξεργασία εξεταστικής';
  document.getElementById('entryForm').innerHTML = `
    <div class="form-grid">
      <div class="form-field full-field">
        <label for="courseId">Μάθημα</label>
        <select id="courseId" required>${courseOptions(existing?.courseId)}</select>
      </div>
      <div class="form-field">
        <label for="period">Περίοδος</label>
        <input id="period" type="text" placeholder="π.χ. 2025-2026" value="${escapeHtml(existing?.period || '')}" />
      </div>
      <div class="form-field">
        <label for="finalGrade">Τελικός βαθμός</label>
        <input id="finalGrade" type="number" min="0" max="10" step="0.1" value="${existing?.finalGrade ?? ''}" required />
      </div>
      <div class="form-field full-field">
        <label for="notes">Σχόλια</label>
        <textarea id="notes" placeholder="Προαιρετικά σχόλια">${escapeHtml(existing?.notes || '')}</textarea>
      </div>
      <div class="extra-fields-box">
        <h3>Βαθμολογικά στοιχεία</h3>
        <div id="extraFieldsContainer"></div>
        <button class="action-btn add-btn" type="button" onclick="addExtraFieldRow()">+ Νέο πεδίο</button>
      </div>
    </div>
    <div class="form-actions">
      <button class="action-btn secondary-btn" type="button" onclick="closeFormModal()">Άκυρο</button>
      <button class="action-btn add-btn" type="submit">ΟΚ</button>
    </div>`;
  document.getElementById('entryForm').onsubmit = submitEntryForm;
  const fields = existing?.extraFields?.length ? existing.extraFields : [{ title: 'Τελική εξέταση', grade: '', weight: 100 }];
  fields.forEach(field => addExtraFieldRow(field));
  document.getElementById('formModal').classList.remove('hidden');
}

function addExtraFieldRow(field = {}) {
  const container = document.getElementById('extraFieldsContainer');
  container.insertAdjacentHTML('beforeend', `
    <div class="extra-grade-row">
      <div>
        <label>Πεδίο</label>
        <input class="extra-title" type="text" placeholder="π.χ. Εργασία, Quiz, Πρόοδος" value="${escapeHtml(field.title || '')}" />
      </div>
      <div>
        <label>Βαθμός</label>
        <input class="extra-grade" type="number" min="0" max="100" step="0.1" value="${field.grade ?? ''}" />
      </div>
      <div>
        <label>Βαρύτητα %</label>
        <input class="extra-weight" type="number" min="0" max="100" step="1" value="${field.weight ?? ''}" />
      </div>
      <button class="action-btn delete-btn" type="button" onclick="this.closest('.extra-grade-row').remove()">Διαγραφή</button>
    </div>`);
}

function submitEntryForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  let courseId = form.querySelector('#courseId')?.value;
  const finalGrade = numberValue(form.querySelector('#finalGrade')?.value);

  if (finalGrade === null || finalGrade < 0 || finalGrade > 10) {
    alert('Συμπλήρωσε σωστά τον βαθμό από 0 έως 10.');
    return;
  }

  if (modalMode === 'grade-add' || modalMode === 'grade-edit') {
    const courseName = form.querySelector('#courseName')?.value.trim();
    const professor = form.querySelector('#professor')?.value || '';
    const ects = numberValue(form.querySelector('#ects')?.value);
    const courseType = form.querySelector('#courseType')?.value || 'Επιλογής';
    const semester = normalizeSemester(form.querySelector('#semester')?.value, modalContext.year);
    const gradeYear = semesterToYear(semester);

    if (!courseName || ects === null || ects < 0) {
      alert('Συμπλήρωσε σωστά το μάθημα και τα ECTS.');
      return;
    }

    courseId = upsertManualCourse({ courseId, name: courseName, professor, ects, type: courseType, year: gradeYear, semester });
    modalContext.year = gradeYear;
  }

  if (!courseId) {
    alert('Δεν βρέθηκε μάθημα.');
    return;
  }

  if (modalMode === 'grade-add') {
    data.grades.push({ id: createId(), courseId, year: modalContext.year, table: modalContext.table, finalGrade, updatedAt: Date.now() });
  }

  if (modalMode === 'grade-edit') {
    const row = data.grades.find(item => item.id === modalContext.gradeId);
    if (row) Object.assign(row, { courseId, year: modalContext.year, finalGrade, updatedAt: Date.now() });
  }

  if (modalMode === 'exam-add' || modalMode === 'exam-edit') {
    const extraFields = [...form.querySelectorAll('.extra-grade-row')].map(row => ({
      id: createId(),
      title: row.querySelector('.extra-title').value.trim(),
      grade: numberValue(row.querySelector('.extra-grade').value),
      weight: numberValue(row.querySelector('.extra-weight').value) || 0
    })).filter(field => field.title || field.grade !== null);

    const payload = {
      courseId,
      year: modalContext.year,
      exam: modalContext.exam,
      period: form.querySelector('#period').value.trim(),
      finalGrade,
      notes: form.querySelector('#notes').value.trim(),
      extraFields,
      updatedAt: Date.now()
    };

    if (modalMode === 'exam-add') {
      data.examGrades.push({ id: createId(), ...payload });
    } else {
      const row = data.examGrades.find(item => item.id === modalContext.examGradeId);
      if (row) Object.assign(row, payload);
    }
  }

  saveData();
  closeFormModal();
  refreshAll();
showPage(getInitialPageId(), false);
}

function deleteGrade(gradeId) {
  if (!confirm('Να διαγραφεί η βαθμολογία;')) return;
  data.grades = data.grades.filter(row => row.id !== gradeId);
  saveData();
  refreshAll();
showPage(getInitialPageId(), false);
}

function deleteExamGrade(examGradeId) {
  if (!confirm('Να διαγραφεί η εγγραφή εξεταστικής;')) return;
  data.examGrades = data.examGrades.filter(row => row.id !== examGradeId);
  saveData();
  refreshAll();
showPage(getInitialPageId(), false);
}

function openCourse(courseId) {
  const course = getCourse(courseId);
  if (!course) return;
  const grade = getLatestGradeForCourse(course.id);
  const courseExams = data.examGrades.filter(row => row.courseId === course.id);
  const status = grade ? (Number(grade.finalGrade) >= 5 ? 'Περασμένο' : 'Κομμένο') : 'Δεν έχει καταχωρηθεί βαθμός';
  document.getElementById('modalTitle').textContent = course.name;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-card"><h3>Γενικά στοιχεία</h3><p><b>Καθηγητής:</b> ${escapeHtml(course.professor)}</p><p><b>ECTS:</b> ${escapeHtml(course.ects)}</p><p><b>Εξάμηνο:</b> ${escapeHtml(course.semester)}ο</p><p><b>Κατηγορία:</b> ${escapeHtml(course.type)}</p></div>
      <div class="detail-card"><h3>Προαπαιτούμενα</h3><p>Δεν υπάρχουν καταχωρημένα προαπαιτούμενα.</p></div>
      <div class="detail-card"><h3>Σημειώσεις</h3><p>Δεν υπάρχουν ακόμα σημειώσεις.</p></div>
      <div class="detail-card"><h3>Τελική καταχώριση</h3><p><b>Κατάσταση:</b> ${status}</p><p><b>Τελικός βαθμός:</b> ${grade ? formatGrade(grade.finalGrade) : '-'}</p><p><b>Πηγή:</b> Σελίδα Βαθμολογίες</p></div>
      <div class="detail-card" style="grid-column:1/-1"><h3>Βαθμολογικά στοιχεία από Εξεταστικές</h3>${courseExams.length ? courseExams.map(row => `<p><b>${escapeHtml(row.exam)} ${escapeHtml(row.period || '')}:</b> ${formatGrade(row.finalGrade)} ${row.extraFields?.map(field => `<span class="badge">${escapeHtml(field.title)} ${formatGrade(field.grade)}</span>`).join('') || ''}</p>`).join('') : '<p>Δεν υπάρχουν εγγραφές εξεταστικής για αυτό το μάθημα.</p>'}</div>
    </div>
  `;
  document.getElementById('courseModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('courseModal').classList.add('hidden');
}

function closeFormModal() {
  document.getElementById('formModal').classList.add('hidden');
  modalMode = null;
  modalContext = null;
}

refreshAll();
showPage(getInitialPageId(), false);

function exportBackup() {

    const backup = {

        version: 1,

        created: new Date().toISOString(),

        data

    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "student-planner-backup.json";

    a.click();

    URL.revokeObjectURL(url);

}

function importBackup(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        try {

            const backup = JSON.parse(reader.result);

            if (!backup.data) {

                alert("Μη έγκυρο αρχείο.");

                return;

            }

            if (!confirm("Να αντικατασταθούν όλα τα δεδομένα;"))
                return;

            data = backup.data;

            saveData();

            refreshAll();

            alert("Η επαναφορά ολοκληρώθηκε.");

        }

        catch {

            alert("Το αρχείο δεν είναι έγκυρο.");

        }

    };

    reader.readAsText(file);

}