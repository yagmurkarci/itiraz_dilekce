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
const userSearch = document.getElementById('userSearch');
const updateUserSelect = document.getElementById('updateUserSelect');
const updateUserForm = document.getElementById('userUpdateForm');
const userUpdateMessage = document.getElementById('userUpdateMessage');
const updateUserRole = document.getElementById('updateUserRole');
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
const navButtons = document.querySelectorAll('.nav-item');

const state = {
  departments: [],
  courses: [],
  roles: [],
  users: [],
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

function showLogin() {
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
}

function showDashboard() {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
}

function setPage(page) {
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
  departmentCount.textContent = String(departments.length);
}

async function loadRoles() {
  const roles = await apiFetch('/roles/GetAllRoles');
  state.roles = roles;
  userRole.innerHTML = roles
    .filter((role) => role.roleName !== 'Root')
    .map((role) => `<option value="${role.id}">${role.roleName}</option>`)
    .join('');
  setUpdateRoleOptions();
}

function setUpdateRoleOptions(selectedRoleId = '') {
  const selectedRole = state.roles.find((role) => role.id === Number(selectedRoleId));
  const roles = state.roles.filter((role) => role.roleName !== 'Root' || selectedRole?.roleName === 'Root');

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
          <td>${user.role?.roleName || '-'}</td>
          <td>${user.role?.roleName === 'Root' ? '<span class="protected-user">Koruma</span>' : `<button class="delete-btn" data-user-id="${user.id}">Sil</button>`}</td>
        </tr>
      `
    )
    .join('');

  renderUserSearchResults();
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
            <td><button class="delete-btn" data-id="${course.id}">Sil</button></td>
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
    await Promise.all([loadDepartments(), loadCourses(), loadRoles(), loadUsers()]);
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

  try {
    await apiFetch('/users/CreateUser', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        password: document.getElementById('userPassword').value,
        number: document.getElementById('userNumber').value.trim(),
        roleId: Number(userRole.value),
      }),
    });

    userForm.reset();
    userFormMessage.textContent = 'Kullanıcı başarıyla eklendi.';
    userFormMessage.className = 'form-message success';
    await loadUsers();
  } catch (error) {
    userFormMessage.textContent = error.message;
    userFormMessage.className = 'form-message error';
  }
});

userSearch.addEventListener('input', renderUserSearchResults);
updateUserSelect.addEventListener('change', populateUserUpdateForm);

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

  try {
    await apiFetch(`/users/UpdateUserById/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: document.getElementById('updateUserName').value.trim(),
        email: document.getElementById('updateUserEmail').value.trim(),
        number: document.getElementById('updateUserNumber').value.trim(),
        roleId: Number(document.getElementById('updateUserRole').value),
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
