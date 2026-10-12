const API_BASE = '/api';
const TOKEN_KEY = 'rootToken';

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const courseForm = document.getElementById('courseForm');
const courseFormMessage = document.getElementById('courseFormMessage');
const coursesTableBody = document.getElementById('coursesTableBody');
const userForm = document.getElementById('userForm');
const userFormMessage = document.getElementById('userFormMessage');
const usersTableBody = document.getElementById('usersTableBody');
const userRole = document.getElementById('userRole');
const createUserDepartmentsField = document.getElementById('createUserDepartmentsField');
const createUserDepartments = document.getElementById('createUserDepartments');
const userSearch = document.getElementById('userSearch');
const updateUserSelect = document.getElementById('updateUserSelect');
const updateUserForm = document.getElementById('userUpdateForm');
const userUpdateMessage = document.getElementById('userUpdateMessage');
const updateUserRole = document.getElementById('updateUserRole');
const updateUserAcademicRoleField = document.getElementById('updateUserAcademicRoleField');
const updateUserAcademicRole = document.getElementById('updateUserAcademicRole');
const updateUserDepartmentsField = document.getElementById('updateUserDepartmentsField');
const updateUserDepartments = document.getElementById('updateUserDepartments');
const updateUserPassword = document.getElementById('updateUserPassword');
const updateUserBysStudentId = document.getElementById('updateUserBysStudentId');
const toggleUpdatePassword = document.getElementById('toggleUpdatePassword');
const userPassword = document.getElementById('userPassword');
const userBysStudentId = document.getElementById('userBysStudentId');
const togglePassword = document.getElementById('togglePassword');
const departmentCheckboxList = document.getElementById('departmentCheckboxList');
const departmentCourseMap = document.getElementById('departmentCourseMap');
const courseCount = document.getElementById('courseCount');
const departmentCount = document.getElementById('departmentCount');
const logoutBtn = document.getElementById('logoutBtn');
const pageTitle = document.getElementById('pageTitle');
const sidebarUserBadge = document.getElementById('sidebarUserBadge');
const sidebarUserName = document.getElementById('sidebarUserName');
const sidebarUserRole = document.getElementById('sidebarUserRole');
const homeWelcomeTitle = document.getElementById('homeWelcomeTitle');
const homeActionButton = document.getElementById('homeActionButton');
const homeStats = document.getElementById('homeStats');
const homeView = document.getElementById('homeView');
const coursesView = document.getElementById('coursesView');
const studentCoursesView = document.getElementById('studentCoursesView');
const studentScheduleView = document.getElementById('studentScheduleView');
const studentCoursesList = document.getElementById('studentCoursesList');
const studentCoursesMessage = document.getElementById('studentCoursesMessage');
const studentScheduleList = document.getElementById('studentScheduleList');
const studentScheduleMessage = document.getElementById('studentScheduleMessage');
const usersView = document.getElementById('usersView');
const rolesView = document.getElementById('rolesView');
const courseManagementPanel = document.getElementById('courseManagementPanel');
const courseInstructorPanel = document.getElementById('courseInstructorPanel');
const courseInstructorForm = document.getElementById('courseInstructorForm');
const instructorCourseSelect = document.getElementById('instructorCourseSelect');
const instructorUserSelect = document.getElementById('instructorUserSelect');
const courseInstructorsTableBody = document.getElementById('courseInstructorsTableBody');
const courseInstructorMessage = document.getElementById('courseInstructorMessage');
const roleForm = document.getElementById('roleForm');
const roleFormMessage = document.getElementById('roleFormMessage');
const rolesTableBody = document.getElementById('rolesTableBody');
const permissionRoleSelect = document.getElementById('permissionRoleSelect');
const rolePermissionList = document.getElementById('rolePermissionList');
const permissionMessage = document.getElementById('permissionMessage');
const saveRoleButton = document.getElementById('saveRoleButton');
const cancelRoleEdit = document.getElementById('cancelRoleEdit');
const savePermissionsButton = document.getElementById('savePermissionsButton');
const requestsView = document.getElementById('requestsView');
const studentRequestPanel = document.getElementById('studentRequestPanel');
const studentHomeRequestsPanel = document.getElementById('studentHomeRequestsPanel');
const studentAnnouncementsList = document.getElementById('studentAnnouncementsList');
const staffRequestsPanel = document.getElementById('staffRequestsPanel');
const staffRequestsTableBody = document.getElementById('staffRequestsTableBody');
const staffRequestsTitle = document.getElementById('staffRequestsTitle');
const staffRequestsMessage = document.getElementById('staffRequestsMessage');
const studentRequestForm = document.getElementById('studentRequestForm');
const studentRequestCourse = document.getElementById('studentRequestCourse');
const studentRequestSubmit = document.getElementById('studentRequestSubmit');
const studentRequestCancelEdit = document.getElementById('studentRequestCancelEdit');
const studentRequestsManagementList = document.getElementById('studentRequestsManagementList');
const requestTitle = document.getElementById('requestTitle');
const requestDescription = document.getElementById('requestDescription');
const requestAttachment = document.getElementById('requestAttachment');
const studentRequestMessage = document.getElementById('studentRequestMessage');
const studentRequestsList = document.getElementById('studentRequestsList');
const navButtons = document.querySelectorAll('.nav-item');

const state = {
  departments: [],
  courses: [],
  roles: [],
  users: [],
  endpoints: [],
  endpointRoles: [],
  editingRoleId: null,
  roleNames: [],
  sessionUserName: '',
  bysStudentId: null,
  academics: [],
  courseInstructorAssignments: [],
  editingRequestId: null,
  activePage: 'home',
  requests: [],
  calendarMonth: new Date(2026, 10, 1),
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

function getSessionRoleNames() {
  try {
    const payload = getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    const roles = decoded.roles || [];

    if (!Array.isArray(roles)) return [];

    return roles
      .map((role) => typeof role === 'string' ? role : role?.roleName)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getSessionUserId() {
  try {
    const payload = getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    return Number(decoded.userId || 0);
  } catch {
    return 0;
  }
}

function getSessionUserName() {
  try {
    const payload = getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    return decoded.name || state.sessionUserName || decoded.email || 'Kullanıcı';
  } catch {
    return 'Kullanıcı';
  }
}

const ACADEMIC_ROLE_NAMES = ['Akademisyen', 'Öğretim Görevlisi'];

function hasAcademicRole() {
  return state.roleNames.some((roleName) => ACADEMIC_ROLE_NAMES.includes(roleName));
}

function hasSessionRole(...roleNames) {
  return roleNames.some((roleName) => state.roleNames.includes(roleName));
}

function updateSidebarUser() {
  const userName = getSessionUserName();
  const primaryRole = state.roleNames[0] || 'Kullanıcı';

  if (sidebarUserName) {
    sidebarUserName.textContent = userName;
  }

  if (sidebarUserRole) {
    sidebarUserRole.textContent = primaryRole;
  }

  if (sidebarUserBadge) {
    sidebarUserBadge.textContent = userName?.trim()?.charAt(0)?.toUpperCase() || 'K';
  }
}

function applyRoleVisibility() {
  const canViewCourses = hasSessionRole('Root', 'Admin') || hasAcademicRole();
  const canManageUsers = hasSessionRole('Root', 'Admin', 'Öğrenci İşleri');
  const canManageRoles = hasSessionRole('Root');
  const canCreateRequest = hasSessionRole('Öğrenci', 'Mezun');
  const isStudent = hasSessionRole('Öğrenci', 'Mezun');
  const isStudentAffairs = hasSessionRole('Öğrenci İşleri');
  const canManageRequests = hasSessionRole('Root', 'Admin', 'Öğrenci İşleri');
  const canReviewAssignedRequests = hasAcademicRole();

  document.title = isStudent
    ? 'Öğrenci Dilekçe Takibi'
    : isStudentAffairs
      ? 'Öğrenci İşleri Paneli'
      : hasAcademicRole() && !hasSessionRole('Root', 'Admin')
        ? 'Akademik Panel'
        : 'Yönetim Paneli';

  studentRequestPanel?.classList.toggle('hidden', !canCreateRequest);
  studentHomeRequestsPanel?.classList.toggle('hidden', !isStudent);
  staffRequestsPanel?.classList.toggle('hidden', !(canManageRequests || canReviewAssignedRequests));
  homeStats?.classList.toggle('hidden', isStudent);

  if (homeWelcomeTitle) {
    homeWelcomeTitle.textContent = isStudent
      ? 'Öğrenci işlemlerinizi buradan takip edin.'
      : isStudentAffairs
        ? 'Öğrenci kayıtları ve dilekçe süreçleri.'
        : hasAcademicRole() && !hasSessionRole('Root', 'Admin')
          ? 'Ders ve akademik işlemler.'
          : 'Yönetim ekranına eriştiniz.';
  }

  if (homeActionButton) {
    const actionPage = isStudent || isStudentAffairs ? 'requests' : 'courses';
    homeActionButton.dataset.pageTarget = actionPage;
    homeActionButton.textContent = isStudent
      ? 'Dilekçelerim'
      : isStudentAffairs
        ? 'Dilekçe kuyruğu'
        : 'Ders işlemleri';
  }

  navButtons.forEach((button) => {
    if (button.dataset.page === 'requests') {
      button.textContent = isStudent
        ? 'Dilekçelerim'
        : isStudentAffairs
          ? 'Dilekçe İnceleme'
          : canReviewAssignedRequests && !hasSessionRole('Root', 'Admin')
            ? 'Hoca İnceleme'
          : 'Dilekçe Yönetimi';
    } else if (button.dataset.page === 'users' && isStudentAffairs) {
      button.textContent = 'Öğrenci Yönetimi';
    }

    const visible = button.dataset.page === 'home'
      || (button.dataset.page === 'requests' && (canCreateRequest || canManageRequests || canReviewAssignedRequests))
      || (button.dataset.page === 'courses' && canViewCourses)
      || (button.dataset.page === 'student-courses' && isStudent)
      || (button.dataset.page === 'student-schedule' && isStudent)
      || (button.dataset.page === 'users' && canManageUsers)
      || (button.dataset.page === 'roles' && canManageRoles);
    button.classList.toggle('hidden', !visible);
  });

  updateSidebarUser();

  courseManagementPanel.classList.toggle('hidden', !hasSessionRole('Root', 'Admin'));
  courseInstructorPanel?.classList.toggle('hidden', !hasSessionRole('Root', 'Admin'));
  document.querySelector('[data-page-target="courses"]')?.classList.toggle('hidden', !canViewCourses);
  courseCount.closest('.stat-card').classList.toggle('hidden', !canViewCourses);
  departmentCount.closest('.stat-card').classList.toggle('hidden', !canViewCourses);
}

function showLogin() {
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
}

function showDashboard() {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
}

function setPage(page) {
  const pageButton = [...navButtons].find((button) => button.dataset.page === page);
  if (page !== 'home' && (!pageButton || pageButton.classList.contains('hidden'))) {
    page = 'home';
  }

  state.activePage = page;

  const pageMap = {
    home: 'Ana Sayfa',
    requests: hasAcademicRole() && !hasSessionRole('Root', 'Admin', 'Öğrenci İşleri')
      ? 'Hoca İnceleme Kuyruğu'
      : hasSessionRole('Öğrenci İşleri', 'Root', 'Admin') ? 'Dilekçe Takibi' : 'Dilekçelerim',
    courses: 'Ders Yönetimi',
    'student-courses': 'Derslerim',
    'student-schedule': 'Ders Programım',
    users: hasSessionRole('Öğrenci İşleri') ? 'Öğrenci Yönetimi' : 'Kullanıcı Yönetimi',
    roles: 'Roller',
  };

  pageTitle.textContent = pageMap[page] || 'Ana Sayfa';
  homeView.classList.toggle('hidden', page !== 'home');
  requestsView.classList.toggle('hidden', page !== 'requests');
  coursesView.classList.toggle('hidden', page !== 'courses');
  studentCoursesView.classList.toggle('hidden', page !== 'student-courses');
  studentScheduleView.classList.toggle('hidden', page !== 'student-schedule');
  usersView.classList.toggle('hidden', page !== 'users');
  rolesView.classList.toggle('hidden', page !== 'roles');

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.page === page);
  });
}

async function apiFetch(url, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data?.error || 'İstek başarısız oldu.');
  }

  return data;
}

function renderDepartmentCheckboxes() {
  departmentCheckboxList.innerHTML = state.departments
    .map(
      (department) => `
        <label class="department-checkbox-item">
          <input type="checkbox" name="departmentIds" value="${department.id}" />
          <span>${department.departmentName}</span>
        </label>
      `
    )
    .join('');
}

async function loadDepartments() {
  const departments = await apiFetch('/departments/GetAllDepartments');
  state.departments = departments;
  renderDepartmentCheckboxes();
  renderUserDepartmentCheckboxes(createUserDepartments, 'createDepartmentIds');
  renderUserDepartmentCheckboxes(updateUserDepartments, 'updateDepartmentIds');
  departmentCount.textContent = String(departments.length);
}

function renderUserDepartmentCheckboxes(container, inputName, selectedIds = []) {
  const selected = new Set(selectedIds.map(Number));
  container.innerHTML = state.departments
    .map((department) => `
      <label class="department-checkbox-item">
        <input type="checkbox" name="${inputName}" value="${department.id}" ${selected.has(department.id) ? 'checked' : ''} />
        <span>${department.departmentName}</span>
      </label>
    `)
    .join('');
}

function isStudentOrGraduate(roleId) {
  const role = state.roles.find((item) => item.id === Number(roleId));
  return ['Öğrenci', 'Mezun'].includes(role?.roleName);
}

function selectedDepartmentIds(container) {
  return [...container.querySelectorAll('input[type="checkbox"]:checked')]
    .map((checkbox) => Number(checkbox.value));
}

function updateDepartmentFieldVisibility() {
  createUserDepartmentsField.classList.toggle('hidden', !isStudentOrGraduate(userRole.value));
  updateUserDepartmentsField.classList.toggle('hidden', !updateUserSelect.value || !isStudentOrGraduate(updateUserRole.value));
}

function updateAcademicRoleFieldVisibility() {
  const role = state.roles.find((item) => item.id === Number(updateUserRole.value));
  updateUserAcademicRoleField.classList.toggle('hidden', !updateUserSelect.value || role?.roleName !== 'Admin');
}

function getVisibleRoleOptions() {
  const isStudentAffairs = hasSessionRole('Öğrenci İşleri');
  return state.roles.filter((role) => {
    if (role.roleName === 'Root') return false;
    if (isStudentAffairs) return ['Öğrenci', 'Mezun'].includes(role.roleName);
    return true;
  });
}

async function loadRoles() {
  const roles = await apiFetch('/roles/GetAllRoles');
  state.roles = roles;
  const visibleRoles = getVisibleRoleOptions();
  userRole.innerHTML = visibleRoles
    .map((role) => `<option value="${role.id}">${role.roleName}</option>`)
    .join('');
  setUpdateRoleOptions();
  updateDepartmentFieldVisibility();
  if (hasSessionRole('Root')) {
    renderRoles();
    renderPermissionRoleOptions();
  }
}

async function loadRolePermissions() {
  const [endpoints, endpointRoles] = await Promise.all([
    apiFetch('/endpoints/GetAllEndpoints'),
    apiFetch('/endpoint-roles/GetAllEndpointRoles'),
  ]);
  state.endpoints = endpoints;
  state.endpointRoles = endpointRoles;
  renderRolePermissions();
}

function renderRoles() {
  rolesTableBody.innerHTML = state.roles
    .map((role) => {
      const userCount = state.users.filter((user) => user.role?.id === role.id).length;
      const action = role.roleName === 'Root'
        ? '<span class="protected-user">Koruma</span>'
        : `<div class="role-actions"><button class="secondary-button" type="button" data-edit-role="${role.id}">Düzenle</button><button class="delete-btn" type="button" data-delete-role="${role.id}">Sil</button></div>`;

      return `
        <tr>
          <td>${role.id}</td>
          <td>${role.roleName}</td>
          <td>${userCount}</td>
          <td>${action}</td>
        </tr>
      `;
    })
    .join('');
}

function renderPermissionRoleOptions() {
  const previousRoleId = permissionRoleSelect.value;
  permissionRoleSelect.innerHTML = state.roles
    .map((role) => `<option value="${role.id}">${role.roleName}</option>`)
    .join('');

  const defaultRole = state.roles.find((role) => role.roleName !== 'Root') || state.roles[0];
  permissionRoleSelect.value = state.roles.some((role) => String(role.id) === previousRoleId)
    ? previousRoleId
    : String(defaultRole?.id || '');
  renderRolePermissions();
}

function renderRolePermissions() {
  const roleId = Number(permissionRoleSelect.value);
  const role = state.roles.find((item) => item.id === roleId);
  const isRoot = role?.roleName === 'Root';
  const assignedEndpointIds = new Set(
    state.endpointRoles
      .filter((assignment) => assignment.roleId === roleId)
      .map((assignment) => assignment.endpointId)
  );
  const groups = state.endpoints.reduce((result, endpoint) => {
    const groupName = endpoint.routerPath || 'Diğer';
    (result[groupName] ||= []).push(endpoint);
    return result;
  }, {});

  rolePermissionList.innerHTML = Object.entries(groups)
    .map(([groupName, endpoints]) => `
      <section class="permission-group">
        <h4>${groupName}</h4>
        <div class="permission-endpoints">
          ${endpoints.map((endpoint) => `
            <label class="permission-item">
              <input type="checkbox" data-endpoint-id="${endpoint.id}" ${assignedEndpointIds.has(endpoint.id) ? 'checked' : ''} ${isRoot ? 'disabled' : ''} />
              <span><strong>${endpoint.method}</strong> ${endpoint.endpointPath}<small>${endpoint.description || ''}</small></span>
            </label>
          `).join('')}
        </div>
      </section>
    `)
    .join('');

  savePermissionsButton.disabled = isRoot || !role;
  permissionMessage.textContent = isRoot ? 'Root rolünün tüm sistem yetkileri korunur ve değiştirilemez.' : '';
  permissionMessage.className = 'form-message';
}

function resetRoleForm() {
  state.editingRoleId = null;
  roleForm.reset();
  saveRoleButton.textContent = 'Rol Ekle';
  cancelRoleEdit.classList.add('hidden');
}

function setUpdateRoleOptions(selectedRoleId = '') {
  const selectedRole = state.roles.find((role) => role.id === Number(selectedRoleId));
  const roles = state.roles.filter((role) => {
    if (role.roleName === 'Root') return selectedRole?.roleName === 'Root';
    const isStudentAffairs = hasSessionRole('Öğrenci İşleri');
    if (isStudentAffairs) return ['Öğrenci', 'Mezun'].includes(role.roleName);
    return true;
  });

  updateUserRole.innerHTML = roles
    .map((role) => `<option value="${role.id}" ${role.id === Number(selectedRoleId) ? 'selected' : ''}>${role.roleName}</option>`)
    .join('');
}

function renderUserSearchResults() {
  const query = userSearch.value.trim().toLocaleLowerCase('tr-TR');
  const matches = state.users.filter((user) =>
    `${user.name} ${user.email}`.toLocaleLowerCase('tr-TR').includes(query)
  );

  updateUserSelect.innerHTML = matches.length
    ? `<option value="">Kullanıcı seçin</option>${matches
        .map((user) => `<option value="${user.id}">${user.name} - ${user.email}</option>`)
        .join('')}`
    : '<option value="">Eşleşen kullanıcı bulunamadı</option>';
}

function populateUserUpdateForm() {
  const selectedUser = state.users.find((user) => user.id === Number(updateUserSelect.value));
  if (!selectedUser) return;

  document.getElementById('updateUserName').value = selectedUser.name;
  document.getElementById('updateUserEmail').value = selectedUser.email;
  document.getElementById('updateUserNumber').value = selectedUser.number || '';
  updateUserBysStudentId.value = selectedUser.bysStudentId || '';
  updateUserPassword.value = '';
  setUpdateRoleOptions(selectedUser.role?.id);
  updateUserAcademicRole.checked = (selectedUser.roles || []).some(({ roleName }) => ACADEMIC_ROLE_NAMES.includes(roleName));
  renderUserDepartmentCheckboxes(
    updateUserDepartments,
    'updateDepartmentIds',
    (selectedUser.departments || []).map((department) => department.id)
  );
  updateDepartmentFieldVisibility();
  updateAcademicRoleFieldVisibility();
}

async function loadUsers() {
  const users = await apiFetch('/users/GetAllUsers');
  state.users = users;

  usersTableBody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.number || '-'}</td>
          <td>${(user.departments || []).map((department) => department.departmentName).join(', ') || '-'}</td>
          <td>${(user.roles || [user.role]).filter(Boolean).map(({ roleName }) => roleName).join(', ') || '-'}</td>
          <td>${user.role?.roleName === 'Root' ? '<span class="protected-user">Koruma</span>' : `<button class="delete-btn" data-user-id="${user.id}">Sil</button>`}</td>
        </tr>
      `
    )
    .join('');

  renderUserSearchResults();
  if (hasSessionRole('Root')) renderRoles();
}

async function loadCourses() {
  const courses = await apiFetch('/courses/GetAllCourses');
  state.courses = courses;

  courseCount.textContent = String(courses.length);

  coursesTableBody.innerHTML = courses
    .map(
      (course) => {
        const departments = (course.courseDepartments || []).map((item) => item.department?.departmentName).filter(Boolean);
        const departmentText = departments.length ? departments.join(', ') : course.department?.departmentName || '-';

        return `
          <tr>
            <td>${course.id}</td>
            <td>${course.courseCode}</td>
            <td>${course.courseName}</td>
            <td>${departmentText}</td>
            <td>${hasSessionRole('Root', 'Admin') ? `<button class="delete-btn" data-id="${course.id}">Sil</button>` : ''}</td>
          </tr>
        `;
      }
    )
    .join('');

  const map = await apiFetch('/courses/GetDepartmentCourseMap');
  const entries = Object.entries(map || {});

  departmentCourseMap.innerHTML = entries.length
    ? entries
        .map(
          ([departmentName, courseNames]) => `
            <div class="department-course-group">
              <h4>${departmentName}</h4>
              <ul>
                ${courseNames.map((name) => `<li>${name}</li>`).join('')}
              </ul>
            </div>
          `
        )
        .join('')
    : '<div class="department-course-group"><h4>Henüz ders atan bölüm yok</h4></div>';

  if (hasSessionRole('Root', 'Admin')) {
    await loadCourseInstructorAssignments();
  }
}

async function loadCourseInstructorAssignments() {
  const [academics, assignments] = await Promise.all([
    apiFetch('/users/GetAcademics'),
    apiFetch('/course-instructors/GetAssignments'),
  ]);
  state.academics = academics;
  state.courseInstructorAssignments = assignments;

  instructorCourseSelect.innerHTML = state.courses
    .map(({ id, courseCode, courseName }) => `<option value="${id}">${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</option>`)
    .join('');
  instructorUserSelect.innerHTML = academics
    .map(({ id, name }) => `<option value="${id}">${escapeHtml(name)}</option>`)
    .join('');
  courseInstructorsTableBody.innerHTML = assignments.length
    ? assignments.map(({ id, course, instructor }) => `<tr><td>${escapeHtml(course.courseCode)} - ${escapeHtml(course.courseName)}</td><td>${escapeHtml(instructor.name)}</td><td><button class="delete-btn" type="button" data-delete-instructor-assignment="${id}">Kaldır</button></td></tr>`).join('')
    : '<tr><td colspan="3">Henüz ders-hoca eşleştirmesi yok.</td></tr>';
}

async function loadStudentCourses() {
  if (!hasSessionRole('Öğrenci', 'Mezun')) {
    studentRequestCourse.innerHTML = '<option value="">Ders seçin</option>';
    return;
  }

  if (!state.bysStudentId) {
    studentRequestCourse.innerHTML = '<option value="">BYS öğrenci ID tanımlı değil</option>';
    return;
  }

  try {
    const [courses, bysData] = await Promise.all([
      apiFetch('/courses/GetStudentDepartmentCourses'),
      apiFetch(`/bys/student-courses?ogrenciId=${state.bysStudentId}`),
    ]);
    const bysCourseCodes = new Set(
      (bysData.dersler || [])
        .map((course) => String(course.dersKodu || '').trim())
        .filter(Boolean)
    );
    const studentCourses = bysCourseCodes.size
      ? courses.filter((course) => bysCourseCodes.has(String(course.courseCode || '').trim()))
      : [];

    studentRequestCourse.innerHTML = '<option value="">Ders seçin</option>' + courses
      .filter((course) => studentCourses.includes(course))
      .map((course) => `<option value="${course.id}">${course.courseName}</option>`)
      .join('');
  } catch (error) {
    studentRequestCourse.innerHTML = '<option value="">Ders seçin</option>';
  }
}

async function loadBysStudentCourses() {
  if (!hasSessionRole('Öğrenci', 'Mezun')) {
    return;
  }

  studentCoursesMessage.textContent = 'Dersler BYS üzerinden yükleniyor...';
  studentCoursesMessage.className = 'form-message';
  studentCoursesList.innerHTML = '';

  try {
    if (!state.bysStudentId) {
      studentCoursesMessage.textContent = 'Bu kullanıcı için BYS öğrenci ID tanımlanmamış.';
      studentCoursesMessage.className = 'form-message error';
      return;
    }

    const data = await apiFetch(`/bys/student-courses?ogrenciId=${state.bysStudentId}`);
    const courses = data.dersler || [];

    if (!courses.length) {
      studentCoursesMessage.textContent = 'BYS üzerinde ders bulunamadı.';
      return;
    }

    const groupedCourses = courses.reduce((groups, course) => {
      const year = course.yazilmaAkademikYil || 'Akademik yıl belirtilmemiş';
      const term = course.yazilmaAkademikDonemTuru || 'Dönem belirtilmemiş';

      if (!groups[year]) {
        groups[year] = {};
      }

      if (!groups[year][term]) {
        groups[year][term] = [];
      }

      groups[year][term].push(course);
      return groups;
    }, {});

    studentCoursesList.innerHTML = Object.entries(groupedCourses)
      .map(([year, terms]) => `
        <section class="department-course-group">
          <h3>${escapeHtml(year)}</h3>
          ${Object.entries(terms)
            .map(([term, termCourses]) => `
              <div class="course-term-group">
                <h4>${escapeHtml(term)}</h4>
                <ul>
                  ${termCourses
                    .map((course) => `
                      <li>
                        <strong>${escapeHtml(course.dersKodu || '-')}</strong>
                        ${escapeHtml(course.dersAd || '-')}
                        <span>Şube: ${escapeHtml(course.subeAd || '-')}</span>
                      </li>
                    `)
                    .join('')}
                </ul>
              </div>
            `)
            .join('')}
        </section>
      `)
      .join('');

    studentCoursesMessage.textContent = `${courses.length} ders BYS'den yüklendi.`;
    studentCoursesMessage.className = 'form-message success';
  } catch (error) {
    studentCoursesMessage.textContent = error.message;
    studentCoursesMessage.className = 'form-message error';
  }
}

async function loadBysStudentSchedule() {
  if (!hasSessionRole('Öğrenci', 'Mezun')) {
    return;
  }

  studentScheduleMessage.textContent = 'Ders programı BYS üzerinden yükleniyor...';
  studentScheduleMessage.className = 'form-message';
  studentScheduleList.innerHTML = '';

  try {
    if (!state.bysStudentId) {
      studentScheduleMessage.textContent = 'Bu kullanıcı için BYS öğrenci ID tanımlanmamış.';
      studentScheduleMessage.className = 'form-message error';
      return;
    }

    const data = await apiFetch(`/bys/student-schedule?ogrenciId=${state.bysStudentId}`);
    const schedule = data.program || [];

    if (!schedule.length) {
      studentScheduleMessage.textContent = 'BYS üzerinde ders programı bulunamadı.';
      return;
    }

    const weeks = schedule.reduce((result, item) => {
      const [year, month, dayOfMonth] = item.start.slice(0, 10).split('-').map(Number);
      const start = new Date(year, month - 1, dayOfMonth);
      const monday = new Date(start);
      const day = monday.getDay() || 7;
      monday.setDate(monday.getDate() - day + 1);
      monday.setHours(0, 0, 0, 0);
      const weekKey = [
        monday.getFullYear(),
        String(monday.getMonth() + 1).padStart(2, '0'),
        String(monday.getDate()).padStart(2, '0'),
      ].join('-');
      (result[weekKey] ||= []).push(item);
      return result;
    }, {});

    studentScheduleList.innerHTML = Object.entries(weeks)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([weekKey, weekItems]) => {
        const weekStart = new Date(`${weekKey}T00:00:00`);
        const days = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + index);
          return date;
        });

        return `
          <section class="weekly-schedule">
            <div class="weekly-schedule-header">
              ${escapeHtml(weekStart.toLocaleDateString('tr-TR'))} - ${escapeHtml(days[6].toLocaleDateString('tr-TR'))}
            </div>
            <div class="weekly-schedule-grid">
              ${days.map((date) => {
                const dateKey = [
                  date.getFullYear(),
                  String(date.getMonth() + 1).padStart(2, '0'),
                  String(date.getDate()).padStart(2, '0'),
                ].join('-');
                const dayItems = weekItems
                  .filter((item) => item.start?.slice(0, 10) === dateKey)
                  .sort((first, second) => new Date(first.start) - new Date(second.start));

                return `
                  <div class="schedule-day">
                    <div class="schedule-day-header">
                      <strong>${escapeHtml(date.toLocaleDateString('tr-TR', { weekday: 'short' }))}</strong>
                      <span>${escapeHtml(date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }))}</span>
                    </div>
                    <div class="schedule-day-items">
                      ${dayItems.length ? dayItems.map((item) => `
                        <article class="schedule-event">
                          <strong>${escapeHtml(item.title || 'Ders')}</strong>
                          <span>${escapeHtml(new Date(item.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }))} - ${escapeHtml(new Date(item.end).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }))}</span>
                          <small>${escapeHtml(item.description || 'Derslik bilgisi yok')}</small>
                        </article>
                      `).join('') : '<span class="schedule-empty">Ders yok</span>'}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        `;
      })
      .join('');

    studentScheduleMessage.textContent = `${schedule.length} program kaydı BYS'den yüklendi.`;
    studentScheduleMessage.className = 'form-message success';
  } catch (error) {
    studentScheduleMessage.textContent = error.message;
    studentScheduleMessage.className = 'form-message error';
  }
}

function getRequestStatusLabel(status) {
  const map = {
    PENDING: 'Beklemede',
    IN_REVIEW: 'İnceleniyor',
    APPROVED: 'Kabul Edildi',
    REJECTED: 'Reddedildi',
    ANSWERED: 'Hoca yanıtladı',
  };

  return map[status] || status || 'Beklemede';
}

function renderStudentAnnouncements() {
  if (!studentAnnouncementsList) return;

  if (!state.requests.length) {
    studentAnnouncementsList.innerHTML = '<div class="empty-state">Henüz duyuru bulunmuyor.</div>';
    return;
  }

  const announcements = [...state.requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  studentAnnouncementsList.innerHTML = announcements.map((request) => {
    const status = request.status || 'PENDING';
    const statusLabel = getRequestStatusLabel(status);
    const statusClass = status === 'ANSWERED' ? 'success' : status === 'REJECTED' ? 'danger' : status === 'IN_REVIEW' ? 'info' : 'pending';
    const shortMessage = status === 'ANSWERED'
      ? 'Dilekçen kabul edildi.'
      : status === 'REJECTED'
        ? 'Dilekçen reddedildi.'
        : status === 'IN_REVIEW'
          ? 'Dilekçen inceleniyor.'
          : 'Dilekçen beklemede.';

    return `
      <div class="announcement-item ${statusClass}">
        <div class="announcement-head">
          <strong>${escapeHtml(request.title || 'Dilekçe')}</strong>
          <span class="announcement-status ${statusClass}">${escapeHtml(statusLabel)}</span>
        </div>
        <div class="announcement-body">${escapeHtml(shortMessage)}</div>
      </div>
    `;
  }).join('');
}

function renderStudentRequests() {
  if (!studentRequestsList) return;

  const monthStart = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth(), 1);
  const monthLabel = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(monthStart);
  const firstDayIndex = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(monthStart.getFullYear(), monthStart.getMonth(), 0).getDate();
  const eventMap = new Map([
    ['2026-10-09', { type: 'exam', text: 'Vize sınavı', project: 'İngilizce · Frontend Geliştirme', detail: 'Vize sınavı haftası başladı.' }],
    ['2026-10-15', { type: 'exam', text: 'Vize sınavı', project: 'İngilizce · Frontend Geliştirme', detail: 'Sınav haftası devam ediyor.' }],
    ['2026-10-17', { type: 'holiday', text: 'Tatil', project: 'Üniversite', detail: 'Cumhuriyet Bayramı tatili.' }],
    ['2026-10-23', { type: 'exam', text: 'Vize sınavı', project: 'İngilizce · Frontend Geliştirme', detail: 'Sınav haftası devam ediyor.' }],
    ['2026-10-26', { type: 'holiday', text: 'Tatil', project: 'Üniversite', detail: 'Öğrenci tatili.' }],
    ['2026-11-06', { type: 'assignment', text: 'Ödev teslimi', project: 'Backend Programlama', detail: 'API geliştirme ödevi teslim tarihi.' }],
    ['2026-11-11', { type: 'quiz', text: 'Kısa sınav', project: 'Web Geliştirme', detail: '10 dakikalık kısa sınav.' }],
    ['2026-11-18', { type: 'assignment', text: 'Ödev teslimi', project: 'Veri Yapıları', detail: 'Proje ödevi teslimi.' }],
  ]);

  const cells = [];
  for (let i = 0; i < firstDayIndex; i += 1) {
    const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
    cells.push(`<span class="day muted" title="Önceki ay">${prevDay}</span>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const event = eventMap.get(key);
    const className = event ? `day ${event.type}` : 'day';
    const title = event ? `${event.text}: ${event.project} — ${event.detail}` : `${day}. ${monthLabel}`;
    cells.push(`<span class="${className}" title="${escapeHtml(title)}">${day}</span>`);
  }

  const totalCells = cells.length;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    cells.push(`<span class="day muted" title="Sonraki ay">${day}</span>`);
  }

  studentRequestsList.innerHTML = `
    <div class="mini-calendar-header">
      <button class="calendar-nav" type="button" data-calendar-action="prev" aria-label="Önceki ay">&#8249;</button>
      <span>${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</span>
      <button class="calendar-nav" type="button" data-calendar-action="next" aria-label="Sonraki ay">&#8250;</button>
    </div>
    <div class="mini-calendar-grid">
      <span class="day-name">Pt</span><span class="day-name">Sa</span><span class="day-name">Ça</span><span class="day-name">Pe</span><span class="day-name">Cu</span><span class="day-name">Ct</span><span class="day-name">Pz</span>
      ${cells.join('')}
    </div>
    <div class="calendar-legend">
      <span><i class="legend exam"></i> Sınav haftası</span>
      <span><i class="legend assignment"></i> Ödev</span>
      <span><i class="legend quiz"></i> Kısa sınav</span>
      <span><i class="legend holiday"></i> Tatil</span>
    </div>
  `;

  if (studentRequestsManagementList) {
    studentRequestsManagementList.innerHTML = state.requests.length
      ? state.requests.map((request) => {
          const canEdit = request.status === 'PENDING' && !request.assignedTo;
          const attachments = (request.attachments || []).map((attachment) =>
            `<a href="${escapeHtml(attachment.filePath)}" target="_blank" rel="noopener">${escapeHtml(attachment.fileName)}</a>`
          ).join(' ');
          return `
            <div class="request-status-item">
              <div class="request-status-header">
                <strong>${escapeHtml(request.title || 'Dilekçe')}</strong>
                <span class="request-status-badge">${escapeHtml(getRequestStatusLabel(request.status))}</span>
              </div>
              <div class="request-status-meta">${escapeHtml(request.course?.courseName || '-')} • ${escapeHtml(request.department?.departmentName || '-')}</div>
              <div class="request-status-date">${new Date(request.createdAt).toLocaleDateString('tr-TR')}</div>
              ${request.answer ? `<p class="request-response">Yanıt: ${escapeHtml(request.answer)}</p>` : ''}
              ${request.rejectionReason ? `<p class="request-response rejection">Ret gerekçesi: ${escapeHtml(request.rejectionReason)}</p>` : ''}
              ${attachments ? `<div class="request-attachments">${attachments}</div>` : ''}
              ${canEdit ? `<div class="request-actions"><button class="secondary-button" type="button" data-edit-request="${request.id}">Düzenle</button><button class="delete-btn" type="button" data-delete-request="${request.id}">Sil</button></div>` : ''}
            </div>
          `;
        }).join('')
      : '<div class="empty-state">Henüz dilekçe bulunmuyor.</div>';
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function renderManagedRequests(requests) {
  if (!staffRequestsTableBody) return;

  if (!requests.length) {
    staffRequestsTableBody.innerHTML = '<tr><td colspan="5">İncelenecek dilekçe bulunmuyor.</td></tr>';
    return;
  }

  const isInstructor = hasAcademicRole() && !hasSessionRole('Root', 'Admin', 'Öğrenci İşleri');

  staffRequestsTableBody.innerHTML = requests.map((request) => {
    const attachments = (request.attachments || []).map((attachment) =>
      `<a href="${escapeHtml(attachment.filePath)}" target="_blank" rel="noopener">${escapeHtml(attachment.fileName)}</a>`
    ).join('<br>') || 'Ek dosya yok';
    const isClosedRequest = request.status === 'REJECTED' || request.status === 'ANSWERED';
    const actions = isInstructor
      ? isClosedRequest
        ? `<div class="request-review-cell"><div class="request-attachments">Öğrenci ekleri:<br>${attachments}</div><div class="request-status-date">${escapeHtml(getRequestStatusLabel(request.status))}${request.rejectionReason ? `<small>${escapeHtml(request.rejectionReason)}</small>` : ''}</div></div>`
        : `<div class="request-review-cell"><div class="request-attachments">Öğrenci ekleri:<br>${attachments}</div><label class="file-field"><span>İncelenmiş sınav kağıdı (PDF/görsel)</span><input type="file" data-exam-paper="${request.id}" accept="application/pdf,image/*" required /></label><textarea data-instructor-answer="${request.id}" rows="3" placeholder="İnceleme yanıtı" required>${escapeHtml(request.answer || '')}</textarea><button class="primary-button small" type="button" data-reply-request="${request.id}">Dosyayı yükle ve yanıtla</button></div>`
      : request.status === 'REJECTED' || request.status === 'ANSWERED'
        ? `<div>${escapeHtml(getRequestStatusLabel(request.status))}${request.rejectionReason ? `<small>${escapeHtml(request.rejectionReason)}</small>` : ''}</div>`
        : `<div class="request-review-cell"><select data-forward-instructor="${request.id}" aria-label="Derse atanmış hoca"><option value="">Atanmış hocayı seçin</option>${(request.course?.instructors || []).map(({ instructor }) => `<option value="${instructor.id}">${escapeHtml(instructor.name)}</option>`).join('')}</select><button class="secondary-button" type="button" data-forward-request="${request.id}" ${(request.course?.instructors || []).length ? '' : 'disabled'}>Hocaya yönlendir</button><textarea data-rejection-reason="${request.id}" rows="2" placeholder="Ret gerekçesi"></textarea><button class="delete-btn" type="button" data-reject-request="${request.id}">Gerekçeli reddet</button></div>`;

    const studentAttachments = !isInstructor && request.attachments?.length
      ? `<div class="request-attachments">Ekler:<br>${attachments}</div>`
      : '';
    return `<tr data-request-row="${request.id}"><td>${escapeHtml(request.creator?.name || '-')}</td><td><strong>${escapeHtml(request.title)}</strong><small>${escapeHtml(request.description)}</small>${studentAttachments}</td><td>${escapeHtml(request.course?.courseName || '-')}<small>${escapeHtml(request.department?.departmentName || '-')}</small></td><td>${new Date(request.createdAt).toLocaleDateString('tr-TR')}</td><td>${actions}</td></tr>`;
  }).join('');
}

async function loadManagedRequests() {
  try {
    const isInstructor = hasAcademicRole() && !hasSessionRole('Root', 'Admin', 'Öğrenci İşleri');
    const requests = await apiFetch(isInstructor ? '/requests/GetAssignedRequests' : '/requests/GetAllRequests');
    if (staffRequestsTitle) {
      staffRequestsTitle.textContent = isInstructor ? 'Kendi Derslerim' : 'Dilekçe İnceleme Kuyruğu';
    }
    renderManagedRequests(requests);
  } catch (error) {
    staffRequestsMessage.textContent = error.message;
    staffRequestsMessage.className = 'form-message error';
  }
}

async function loadStudentRequests() {
  if (!hasSessionRole('Öğrenci', 'Mezun')) {
    state.requests = [];
    renderStudentRequests();
    return;
  }

  try {
    const requests = await apiFetch(`/requests/GetRequestsByUser/${getSessionUserId()}`);
    state.requests = requests;
    renderStudentAnnouncements();
    renderStudentRequests();
  } catch (error) {
    state.requests = [];
    renderStudentAnnouncements();
    renderStudentRequests();
  }
}

async function initializeDashboard() {
  try {
    state.roleNames = getSessionRoleNames();
    try {
      const profile = await apiFetch('/auth/Me');
      state.sessionUserName = profile.name || profile.email || '';
      state.bysStudentId = profile.bysStudentId || null;
    } catch {
      state.sessionUserName = '';
    }
    applyRoleVisibility();
    updateSidebarUser();

    const tasks = [];
    if (hasSessionRole('Root', 'Admin') || hasAcademicRole()) {
      tasks.push(loadDepartments(), loadCourses());
    } else if (hasSessionRole('Öğrenci İşleri')) {
      tasks.push(loadDepartments());
    }
    if (hasSessionRole('Root', 'Admin', 'Öğrenci İşleri')) {
      tasks.push(loadRoles(), loadUsers());
    }
    if (hasSessionRole('Root')) {
      tasks.push(loadRolePermissions());
    }
    if (hasSessionRole('Öğrenci', 'Mezun')) {

          tasks.push(
        loadStudentCourses(),
        loadBysStudentCourses(),
        loadBysStudentSchedule(),
        loadStudentRequests()
    );
    }

    if (hasSessionRole('Root', 'Admin', 'Öğrenci İşleri') || hasAcademicRole()) {
      tasks.push(loadManagedRequests());
    }

    await Promise.all(tasks);
    showDashboard();
    setPage('home');
  } catch (error) {
    if (courseFormMessage) {
      courseFormMessage.textContent = error.message;
      courseFormMessage.className = 'form-message error';
    }
    setToken('');
    showLogin();
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginError.textContent = '';

  try {
    const result = await fetch(`${API_BASE}/auth/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data?.error || 'Giriş başarısız oldu.');
    }

    setToken(data.token);
    await initializeDashboard();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.className = 'form-message error';
  }
});

courseForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const courseCode = document.getElementById('courseCode').value.trim();
  const courseName = document.getElementById('courseName').value.trim();
  const checkedDepartments = [...document.querySelectorAll('input[name="departmentIds"]:checked')].map((input) => Number(input.value));
  const departmentId = checkedDepartments[0] || null;

  courseFormMessage.textContent = '';

  if (!departmentId) {
    courseFormMessage.textContent = 'En az bir bölüm seçmelisiniz.';
    courseFormMessage.className = 'form-message error';
    return;
  }

  try {
    await apiFetch('/courses/CreateCourse', {
      method: 'POST',
      body: JSON.stringify({ courseCode, courseName, departmentId, departmentIds: checkedDepartments }),
    });

    courseForm.reset();
    courseFormMessage.textContent = 'Ders başarıyla eklendi.';
    courseFormMessage.className = 'form-message success';

    await initializeDashboard();
  } catch (error) {
    courseFormMessage.textContent = error.message;
    courseFormMessage.className = 'form-message error';
  }
});

userForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  userFormMessage.textContent = '';
  const departmentIds = isStudentOrGraduate(userRole.value) ? selectedDepartmentIds(createUserDepartments) : [];

  if (isStudentOrGraduate(userRole.value) && !departmentIds.length) {
    userFormMessage.textContent = 'Öğrenci veya mezun için en az bir bölüm seçmelisiniz.';
    userFormMessage.className = 'form-message error';
    return;
  }

  try {
    await apiFetch('/users/CreateUser', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        password: document.getElementById('userPassword').value,
        number: document.getElementById('userNumber').value.trim(),
        bysStudentId: userBysStudentId.value ? Number(userBysStudentId.value) : null,
        roleId: Number(userRole.value),
        departmentIds,
      }),
    });

    userForm.reset();
  updateDepartmentFieldVisibility();
    userFormMessage.textContent = 'Kullanıcı başarıyla eklendi.';
    userFormMessage.className = 'form-message success';
    await loadUsers();
  } catch (error) {
    userFormMessage.textContent = error.message;
    userFormMessage.className = 'form-message error';
  }
});

roleForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  roleFormMessage.textContent = '';

  const roleName = document.getElementById('roleName').value.trim();
  const isEditing = Boolean(state.editingRoleId);

  try {
    await apiFetch(isEditing ? `/roles/UpdateRoleById/${state.editingRoleId}` : '/roles/CreateRole', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify({ roleName }),
    });

    roleFormMessage.textContent = isEditing ? 'Rol adı güncellendi.' : 'Rol eklendi.';
    roleFormMessage.className = 'form-message success';
    resetRoleForm();
    await Promise.all([loadRoles(), loadRolePermissions()]);
  } catch (error) {
    roleFormMessage.textContent = error.message;
    roleFormMessage.className = 'form-message error';
  }
});

rolesTableBody.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete-role]');
  if (deleteButton) {
    const role = state.roles.find((item) => item.id === Number(deleteButton.dataset.deleteRole));
    if (!role || role.roleName === 'Root') return;
    if (!window.confirm(`"${role.roleName}" rolünü silmek istiyor musunuz?`)) return;

    try {
      await apiFetch(`/roles/DeleteRoleById/${role.id}`, { method: 'DELETE' });
      if (state.editingRoleId === role.id) resetRoleForm();
      roleFormMessage.textContent = `"${role.roleName}" rolü silindi.`;
      roleFormMessage.className = 'form-message success';
      await Promise.all([loadRoles(), loadRolePermissions()]);
    } catch (error) {
      roleFormMessage.textContent = error.message;
      roleFormMessage.className = 'form-message error';
    }
    return;
  }

  const button = event.target.closest('[data-edit-role]');
  if (!button) return;

  const role = state.roles.find((item) => item.id === Number(button.dataset.editRole));
  if (!role || role.roleName === 'Root') return;

  state.editingRoleId = role.id;
  document.getElementById('roleName').value = role.roleName;
  saveRoleButton.textContent = 'Rolü Güncelle';
  cancelRoleEdit.classList.remove('hidden');
  roleFormMessage.textContent = '';
  document.getElementById('roleName').focus();
});

cancelRoleEdit.addEventListener('click', resetRoleForm);
permissionRoleSelect.addEventListener('change', renderRolePermissions);

savePermissionsButton.addEventListener('click', async () => {
  const roleId = Number(permissionRoleSelect.value);
  const checkedEndpointIds = new Set(
    [...rolePermissionList.querySelectorAll('input[data-endpoint-id]:checked')]
      .map((checkbox) => Number(checkbox.dataset.endpointId))
  );
  const currentAssignments = state.endpointRoles.filter((assignment) => assignment.roleId === roleId);
  const currentEndpointIds = new Set(currentAssignments.map((assignment) => assignment.endpointId));
  const toAdd = [...checkedEndpointIds].filter((endpointId) => !currentEndpointIds.has(endpointId));
  const toRemove = currentAssignments.filter((assignment) => !checkedEndpointIds.has(assignment.endpointId));

  permissionMessage.textContent = '';

  try {
    await Promise.all([
      ...toAdd.map((endpointId) => apiFetch('/endpoint-roles/CreateEndpointRole', {
        method: 'POST',
        body: JSON.stringify({ endpointId, roleId }),
      })),
      ...toRemove.map((assignment) => apiFetch(`/endpoint-roles/DeleteEndpointRoleById/${assignment.id}`, {
        method: 'DELETE',
      })),
    ]);

    state.endpointRoles = await apiFetch('/endpoint-roles/GetAllEndpointRoles');
    renderRolePermissions();
    permissionMessage.textContent = 'Rol yetkileri kaydedildi.';
    permissionMessage.className = 'form-message success';
  } catch (error) {
    await loadRolePermissions();
    permissionMessage.textContent = error.message;
    permissionMessage.className = 'form-message error';
  }
});

studentRequestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const selectedCourseId = Number(studentRequestCourse.value);
  const studentCourses = await apiFetch('/courses/GetStudentDepartmentCourses');
  const selectedCourse = studentCourses.find((course) => course.id === selectedCourseId);

  if (!selectedCourseId || !selectedCourse) {
    studentRequestMessage.textContent = 'Lütfen ders seçin.';
    studentRequestMessage.className = 'form-message error';
    return;
  }

  if (!requestTitle.value.trim() || !requestDescription.value.trim()) {
    studentRequestMessage.textContent = 'Konu ve detay alanları zorunludur.';
    studentRequestMessage.className = 'form-message error';
    return;
  }

  try {
    const isEditing = Boolean(state.editingRequestId);
    const request = await apiFetch(isEditing ? `/requests/UpdateRequest/${state.editingRequestId}` : '/requests/CreateRequest', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify({
        title: requestTitle.value.trim(),
        description: requestDescription.value.trim(),
        requestType: 'EXAM_APPEAL',
        courseId: selectedCourse.id,
        departmentId: selectedCourse.departmentId,
        attachments: [],
      }),
    });

    const file = requestAttachment.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', request.id);

      await fetch(`${API_BASE}/request-attachments/UploadRequestAttachment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
    }

    studentRequestForm.reset();
    state.editingRequestId = null;
    studentRequestSubmit.textContent = 'Dilekçe Gönder';
    studentRequestCancelEdit.classList.add('hidden');
    studentRequestMessage.textContent = isEditing ? 'Dilekçe güncellendi.' : 'Dilekçe başarıyla gönderildi.';
    studentRequestMessage.className = 'form-message success';
    await Promise.all([loadStudentCourses(), loadStudentRequests()]);
    setPage('home');
  } catch (error) {
    studentRequestMessage.textContent = error.message;
    studentRequestMessage.className = 'form-message error';
  }
});

staffRequestsTableBody.addEventListener('click', async (event) => {
  const actionButton = event.target.closest('[data-forward-request], [data-reject-request], [data-reply-request]');
  if (!actionButton) return;

  const requestId = actionButton.dataset.forwardRequest || actionButton.dataset.rejectRequest || actionButton.dataset.replyRequest;
  const row = actionButton.closest('[data-request-row]');
  staffRequestsMessage.textContent = '';

  try {
    if (actionButton.hasAttribute('data-forward-request')) {
      const instructorId = row.querySelector(`[data-forward-instructor="${requestId}"]`).value;
      if (!instructorId) throw new Error('Derse atanmış bir hoca seçin.');
      await apiFetch(`/requests/ForwardRequest/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ instructorId: Number(instructorId) }),
      });
      staffRequestsMessage.textContent = 'Dilekçe ilgili hocaya yönlendirildi.';
    } else if (actionButton.hasAttribute('data-reject-request')) {
      const rejectionReason = row.querySelector(`[data-rejection-reason="${requestId}"]`).value.trim();
      if (!rejectionReason) throw new Error('Ret gerekçesi yazın.');
      await apiFetch(`/requests/RejectRequest/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ rejectionReason }),
      });
      staffRequestsMessage.textContent = 'Dilekçe gerekçesiyle reddedildi.';
    } else {
      const file = row.querySelector(`[data-exam-paper="${requestId}"]`).files[0];
      const answer = row.querySelector(`[data-instructor-answer="${requestId}"]`).value.trim();
      if (!file) throw new Error('Yanıtlamadan önce incelenmiş sınav kağıdını yükleyin.');
      if (!answer) throw new Error('İnceleme yanıtını yazın.');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);
      const uploadResponse = await fetch(`${API_BASE}/request-attachments/UploadRequestAttachment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadResult.error || 'Dosya yüklenemedi.');
      await apiFetch(`/requests/ReplyToRequest/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ answer }),
      });
      staffRequestsMessage.textContent = 'Sınav kağıdı yüklendi ve yanıt öğrenciye iletildi.';
    }
    staffRequestsMessage.className = 'form-message success';
    await Promise.all([loadManagedRequests(), loadStudentRequests()]);
  } catch (error) {
    staffRequestsMessage.textContent = error.message;
    staffRequestsMessage.className = 'form-message error';
  }
});

studentRequestsList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-calendar-action]');
  if (!button) return;

  const action = button.dataset.calendarAction;
  const nextMonth = new Date(state.calendarMonth);
  nextMonth.setMonth(state.calendarMonth.getMonth() + (action === 'next' ? 1 : -1));
  state.calendarMonth = nextMonth;
  renderStudentRequests();
});

studentRequestsManagementList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-request]');
  const deleteButton = event.target.closest('[data-delete-request]');

  if (editButton) {
    const request = state.requests.find(({ id }) => id === Number(editButton.dataset.editRequest));
    if (!request) return;
    state.editingRequestId = request.id;
    studentRequestCourse.value = String(request.courseId);
    requestTitle.value = request.title;
    requestDescription.value = request.description;
    studentRequestSubmit.textContent = 'Değişiklikleri Kaydet';
    studentRequestCancelEdit.classList.remove('hidden');
    studentRequestMessage.textContent = '';
    setPage('requests');
    requestTitle.focus();
    return;
  }

  if (!deleteButton || !window.confirm('Bu dilekçeyi silmek istiyor musunuz?')) return;

  try {
    await apiFetch(`/requests/DeleteRequest/${deleteButton.dataset.deleteRequest}`, { method: 'DELETE' });
    await loadStudentRequests();
  } catch (error) {
    studentRequestMessage.textContent = error.message;
    studentRequestMessage.className = 'form-message error';
  }
});

studentRequestCancelEdit.addEventListener('click', () => {
  state.editingRequestId = null;
  studentRequestForm.reset();
  studentRequestSubmit.textContent = 'Dilekçe Gönder';
  studentRequestCancelEdit.classList.add('hidden');
  studentRequestMessage.textContent = '';
});

courseInstructorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  courseInstructorMessage.textContent = '';

  try {
    await apiFetch('/course-instructors/AssignInstructor', {
      method: 'POST',
      body: JSON.stringify({
        courseId: Number(instructorCourseSelect.value),
        instructorId: Number(instructorUserSelect.value),
      }),
    });
    courseInstructorMessage.textContent = 'Hoca derse atandı.';
    courseInstructorMessage.className = 'form-message success';
    await loadCourseInstructorAssignments();
    await loadManagedRequests();
  } catch (error) {
    courseInstructorMessage.textContent = error.message;
    courseInstructorMessage.className = 'form-message error';
  }
});

courseInstructorsTableBody.addEventListener('click', async (event) => {
  const removeButton = event.target.closest('[data-delete-instructor-assignment]');
  if (!removeButton) return;

  try {
    await apiFetch(`/course-instructors/DeleteAssignment/${removeButton.dataset.deleteInstructorAssignment}`, { method: 'DELETE' });
    await loadCourseInstructorAssignments();
    await loadManagedRequests();
  } catch (error) {
    courseInstructorMessage.textContent = error.message;
    courseInstructorMessage.className = 'form-message error';
  }
});

userSearch.addEventListener('input', renderUserSearchResults);
updateUserSelect.addEventListener('change', populateUserUpdateForm);
userRole.addEventListener('change', updateDepartmentFieldVisibility);
updateUserRole.addEventListener('change', () => {
  updateDepartmentFieldVisibility();
  updateAcademicRoleFieldVisibility();
});

updateUserForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userId = updateUserSelect.value;
  userUpdateMessage.textContent = '';

  if (!userId) {
    userUpdateMessage.textContent = 'Güncellemek için bir kullanıcı seçmelisiniz.';
    userUpdateMessage.className = 'form-message error';
    return;
  }

  const password = updateUserPassword.value;
  const departmentIds = isStudentOrGraduate(updateUserRole.value) ? selectedDepartmentIds(updateUserDepartments) : [];
  const selectedRole = state.roles.find((role) => role.id === Number(updateUserRole.value));
  const academicRole = state.roles.find((role) => ACADEMIC_ROLE_NAMES.includes(role.roleName));

  if (isStudentOrGraduate(updateUserRole.value) && !departmentIds.length) {
    userUpdateMessage.textContent = 'Öğrenci veya mezun için en az bir bölüm seçmelisiniz.';
    userUpdateMessage.className = 'form-message error';
    return;
  }

  try {
    await apiFetch(`/users/UpdateUserById/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: document.getElementById('updateUserName').value.trim(),
        email: document.getElementById('updateUserEmail').value.trim(),
        number: document.getElementById('updateUserNumber').value.trim(),
        bysStudentId: updateUserBysStudentId.value ? Number(updateUserBysStudentId.value) : null,
        roleId: Number(document.getElementById('updateUserRole').value),
        academicRoleId: updateUserAcademicRole.checked && !ACADEMIC_ROLE_NAMES.includes(selectedRole?.roleName) ? academicRole?.id : null,
        departmentIds,
        ...(password ? { password } : {}),
      }),
    });

    userUpdateMessage.textContent = 'Kullanıcı başarıyla güncellendi.';
    userUpdateMessage.className = 'form-message success';
    await loadUsers();
  } catch (error) {
    userUpdateMessage.textContent = error.message;
    userUpdateMessage.className = 'form-message error';
  }
});

coursesTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-btn');
  if (!button) return;

  const courseId = button.dataset.id;

  try {
    await apiFetch(`/courses/DeleteCourseById/${courseId}`, {
      method: 'DELETE',
    });

    await initializeDashboard();
  } catch (error) {
    courseFormMessage.textContent = error.message;
    courseFormMessage.className = 'form-message error';
  }
});

usersTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-user-id]');
  if (!button) return;

  if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

  try {
    await apiFetch(`/users/DeleteUserById/${button.dataset.userId}`, {
      method: 'DELETE',
    });

    await loadUsers();
  } catch (error) {
    userFormMessage.textContent = error.message;
    userFormMessage.className = 'form-message error';
  }
});

togglePassword.addEventListener('click', () => {
  const isHidden = userPassword.type === 'password';
  userPassword.type = isHidden ? 'text' : 'password';
  togglePassword.textContent = isHidden ? 'Gizle' : 'Göster';
  togglePassword.setAttribute('aria-label', isHidden ? 'Şifreyi gizle' : 'Şifreyi göster');
});

toggleUpdatePassword.addEventListener('click', () => {
  const isHidden = updateUserPassword.type === 'password';
  updateUserPassword.type = isHidden ? 'text' : 'password';
  toggleUpdatePassword.textContent = isHidden ? 'Gizle' : 'Göster';
  toggleUpdatePassword.setAttribute('aria-label', isHidden ? 'Yeni şifreyi gizle' : 'Yeni şifreyi göster');
});

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    if (page === 'courses') {
      setPage('courses');
      return;
    }
    setPage(page);
  });
});

homeActionButton?.addEventListener('click', () => {
  setPage(homeActionButton.dataset.pageTarget);
});

logoutBtn.addEventListener('click', () => {
  setToken('');
  showLogin();
});

if (getToken()) {
  initializeDashboard();
} else {
  showLogin();
}
