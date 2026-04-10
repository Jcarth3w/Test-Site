import { login } from '../core/api.js';
import { bindLogout } from '../core/admin-helpers.js';
import { getToken, setToken } from '../core/auth.js';

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

function showLogin() {
  loginSection.classList.remove('hidden');
  adminSection.classList.add('hidden');
  logoutBtn.classList.add('hidden');
}

function showAdmin() {
  loginSection.classList.add('hidden');
  adminSection.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
}

async function handleLogin(event) {
  event.preventDefault();
  loginError.classList.add('hidden');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await login(username, password);
    setToken(data.token);
    showAdmin();
  } catch (error) {
    loginError.textContent = error.message || 'Login failed';
    loginError.classList.remove('hidden');
  }
}

function init() {
  bindLogout('logout-btn');
  loginForm.addEventListener('submit', handleLogin);

  if (getToken()) {
    showAdmin();
    return;
  }

  showLogin();
}

init();
