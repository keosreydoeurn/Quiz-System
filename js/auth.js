// js/auth.js
import dbManager from './database.js';

const LOGIN_PAGE = '../pages/login.html';
const PROTECTED_PAGES = ['profile.html', 'quiz.html'];

// ------------------- AUTH CHECK -------------------
export function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const currentPage = window.location.pathname.split('/').pop();

    if (PROTECTED_PAGES.includes(currentPage) && !currentUser) {
        window.location.href = LOGIN_PAGE;
        return false;
    }
    return true;
}

// ------------------- GET CURRENT USER -------------------
export function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    } catch {
        return null;
    }
}

// ------------------- LOGOUT -------------------
export function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.replace(LOGIN_PAGE); // prevents back navigation
}

// ------------------- UPDATE HEADER -------------------
export function updateHeaderAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');
    const dropdownContent = document.getElementById('dropdownContent');
    const userBtn = document.getElementById('userBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    const currentUser = getCurrentUser();

    if (!currentUser) {
        loginBtn?.style.setProperty('display', 'inline-flex');
        userDropdown?.style.setProperty('display', 'none');
        return;
    }

    // Logged in UI
    loginBtn?.style.setProperty('display', 'none');
    userDropdown?.style.setProperty('display', 'inline-block');
    usernameSpan.textContent = currentUser.fullName || currentUser.username;

    // Toggle dropdown
    userBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
    });

    // Logout
    logoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) logout();
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
        dropdownContent.classList.remove('show');
    });

    // Close dropdown on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdownContent.classList.remove('show');
        }
    });
}

// ------------------- INIT -------------------
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateHeaderAuth();
});
