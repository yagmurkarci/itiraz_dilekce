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
const updateUserDepartmentsField = document.getElementById('updateUserDepartmentsField');
const updateUserDepartments = document.getElementById('updateUserDepartments');
const updateUserPassword = document.getElementById('updateUserPassword');
const toggleUpdatePassword = document.getElementById('toggleUpdatePassword');
const userPassword = document.getElementById('userPassword');
const togglePassword = document.getElementById('togglePassword');
const departmentCheckboxList = document.getElementById('departmentCheckboxList');
const departmentCourseMap = document.getElementById('departmentCourseMap');
const courseCount = document.getElementById('courseCount');
const departmentCount = document.getElementById('departmentCount');
const logoutBtn = document.getElementById('logoutBtn');
const pageTitle = document.getElementById('pageTitle');
const homeView = document.getElementById('homeView');
const coursesView = document.getElementById('coursesView');
const usersView = document.getElementById('usersView');
const rolesView = document.getElementById('rolesView');
const courseManagementPanel = document.getElementById('courseManagementPanel');
const roleForm = document.getElementById('roleForm');
const roleFormMessage = document.getElementById('roleFormMessage');
const rolesTableBody = document.getElementById('rolesTableBody');
const permissionRoleSelect = document.getElementById('permissionRoleSelect');
const rolePermissionList = document.getElementById('rolePermissionList');
const permissionMessage = document.getElementById('permissionMessage');
const saveRoleButton = document.getElementById('saveRoleButton');
const cancelRoleEdit = document.getElementById('cancelRoleEdit');
const savePermissionsButton = document.getElementById('savePermissionsButton');
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
  activePage: 'home',
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
    return (decoded.roles || []).map(({ roleName }) => roleName);
  } catch {
    return [];
  }
}

function hasSessionRole(...roleNames) {
  return roleNames.some((roleName) => state.roleNames.includes(roleName));
}

function applyRoleVisibility() {
  const canViewCourses = hasSessionRole('Root', 'Admin', 'Öğrenci', 'Mezun', 'Akademisyen');
  const canManageUsers = hasSessionRole('Root', 'Admin', 'Öğrenci İşleri');
  const canManageRoles = hasSessionRole('Root');

  navButtons.forEach((button) => {
    const visible = button.dataset.page === 'home'
      || (button.dataset.page === 'courses' && canViewCourses)
      || (button.dataset.page === 'users' && canManageUsers)
      || (button.dataset.page === 'roles' && canManageRoles);
    button.classList.toggle('hidden', !visible);
  });

  courseManagementPanel.classList.toggle('hidden', !hasSessionRole('Root', 'Admin'));
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
    courses: 'Dersler',
    users: 'Kullanıcılar',
    roles: 'Roller',
  };

  pageTitle.textContent = pageMap[page] || 'Ana Sayfa';
  homeView.classList.toggle('hidden', page !== 'home');
  coursesView.classList.toggle('hidden', page !== 'courses');
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

async function loadRoles() {
  const roles = await apiFetch('/roles/GetAllRoles');
  state.roles = roles;
  const selectableRoles = roles.filter((role) => role.roleName !== 'Root');
  const userFormRoles = hasSessionRole('Öğrenci İşleri')
    ? selectableRoles.filter((role) => ['Öğrenci', 'Mezun'].includes(role.roleName))
    : selectableRoles;
  userRole.innerHTML = roles
    .filter((role) => userFormRoles.some(({ id }) => id === role.id))
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
    if (hasSessionRole('Öğrenci İşleri')) return ['Öğrenci', 'Mezun'].includes(role.roleName);
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
  updateUserPassword.value = '';
  setUpdateRoleOptions(selectedUser.role?.id);
  renderUserDepartmentCheckboxes(
    updateUserDepartments,
    'updateDepartmentIds',
    (selectedUser.departments || []).map((department) => department.id)
  );
  updateDepartmentFieldVisibility();
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
          <td>${user.role?.roleName || '-'}</td>
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
}

async function initializeDashboard() {
  try {
    state.roleNames = getSessionRoleNames();
    applyRoleVisibility();

    const tasks = [];
    if (hasSessionRole('Root', 'Admin', 'Öğrenci', 'Mezun', 'Akademisyen')) {
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

userSearch.addEventListener('input', renderUserSearchResults);
updateUserSelect.addEventListener('change', populateUserUpdateForm);
userRole.addEventListener('change', updateDepartmentFieldVisibility);
updateUserRole.addEventListener('change', updateDepartmentFieldVisibility);

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
        roleId: Number(document.getElementById('updateUserRole').value),
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

document.querySelector('[data-page-target="courses"]')?.addEventListener('click', () => {
  setPage('courses');
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
