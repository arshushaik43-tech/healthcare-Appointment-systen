const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const appointmentForm = document.getElementById('appointmentForm');
const appointmentList = document.getElementById('appointmentList');
const message = document.getElementById('message');
const userName = document.getElementById('userName');
const logoutButton = document.getElementById('logoutButton');
const dateInput = document.getElementById('date');
const doctorInput = document.getElementById('doctor');

const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];
if (dateInput) dateInput.min = localDate;
if (doctorInput) {
  const selectedDoctor = new URLSearchParams(window.location.search).get('doctor');
  if (selectedDoctor) doctorInput.value = selectedDoctor;
}

function getAppointments() {
  return JSON.parse(localStorage.getItem('hospitalCareAppointments') || '[]');
}

function saveAppointments(appointments) {
  localStorage.setItem('hospitalCareAppointments', JSON.stringify(appointments));
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `form-message ${type}`;
}

function showApp() {
  const email = localStorage.getItem('hospitalCareUser');
  if (!email) {
    if (!window.location.pathname.endsWith('index.html')) window.location.href = 'index.html';
    return;
  }

  if (!app) {
    if (window.location.pathname.endsWith('index.html')) window.location.href = 'home.html';
    return;
  }

  if (loginPage) loginPage.classList.add('hidden');
  app.classList.remove('hidden');
  if (userName) userName.textContent = email;
  renderAppointments();
}

function logout() {
  localStorage.removeItem('hospitalCareUser');
  if (!app) {
    window.location.href = 'index.html';
    return;
  }

  app.classList.add('hidden');
  if (loginPage) loginPage.classList.remove('hidden');
  if (loginForm) loginForm.reset();
  if (loginMessage) loginMessage.textContent = '';
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(time) {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function renderAppointments() {
  if (!appointmentList) return;

  const appointments = getAppointments();

  if (appointments.length === 0) {
    appointmentList.innerHTML = '<p class="empty-state">You do not have any appointments yet.</p>';
    return;
  }

  appointmentList.innerHTML = appointments.map((appointment) => `
    <article class="appointment-item">
      <div><strong>${appointment.patient}</strong><small>${appointment.reason || 'General consultation'}</small></div>
      <div><strong>${appointment.doctor}</strong><small>Doctor</small></div>
      <div><strong>${formatDate(appointment.date)}</strong><small>${formatTime(appointment.time)}</small></div>
      <button class="cancel-button" type="button" data-id="${appointment.id}">Cancel</button>
    </article>
  `).join('');
}

if (loginForm) loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || password.length < 1) {
    showMessage(loginMessage, 'Please enter your email and password.', 'error');
    return;
  }

  localStorage.setItem('hospitalCareUser', email);
  if (app) showApp();
  else window.location.href = 'home.html';
});

if (logoutButton) logoutButton.addEventListener('click', logout);

document.querySelectorAll('.doctor-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (doctorInput) doctorInput.value = button.dataset.doctor;
    if (document.getElementById('booking')) {
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `booking.html?doctor=${encodeURIComponent(button.dataset.doctor)}`;
    }
  });
});

if (appointmentForm) appointmentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const appointment = {
    id: Date.now(),
    patient: document.getElementById('patient').value.trim(),
    doctor: doctorInput.value,
    date: dateInput.value,
    time: document.getElementById('time').value,
    reason: document.getElementById('reason').value.trim()
  };

  const appointments = getAppointments();
  appointments.push(appointment);
  saveAppointments(appointments);
  appointmentForm.reset();
  dateInput.min = localDate;
  showMessage(message, 'Your appointment has been booked successfully.', 'success');
  renderAppointments();
});

if (appointmentList) appointmentList.addEventListener('click', (event) => {
  if (!event.target.matches('.cancel-button')) return;

  const id = Number(event.target.dataset.id);
  saveAppointments(getAppointments().filter((appointment) => appointment.id !== id));
  renderAppointments();
});

showApp();
