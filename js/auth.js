// js/auth.js
import dbManager from './database.js';

// ------------------- AUTH CHECK -------------------
export function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const protectedPages = ['profile.html', 'quiz.html']; // Pages that require login
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !currentUser) {
        // Redirect to login page if not logged in
        window.location.href = '../pages/login.html';
        return false;
    }
    return true;
}

// ------------------- GET CURRENT USER -------------------
export function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// ------------------- LOGOUT -------------------
export function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../pages/login.html';
}

// ------------------- UPDATE HEADER -------------------
export function updateHeaderAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');
    const dropdownContent = document.getElementById('dropdownContent');
    const logoutBtn = document.getElementById('logoutBtn');

    const currentUser = getCurrentUser();

    if (currentUser) {
        // Hide login button
        if (loginBtn) loginBtn.style.display = 'none';

        // Show dropdown
        if (userDropdown) userDropdown.style.display = 'inline-block';
        if (usernameSpan) usernameSpan.textContent = currentUser.fullName || currentUser.username;

        // Toggle dropdown
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            userBtn.addEventListener('click', () => {
                dropdownContent.style.display =
                    dropdownContent.style.display === 'block' ? 'none' : 'block';
            });
        }

        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            });
        }

        // Close dropdown if clicked outside
        window.addEventListener('click', (e) => {
            if (userDropdown && !userDropdown.contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });
    } else {
        // Not logged in: show login button
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userDropdown) userDropdown.style.display = 'none';
    }
}

// ------------------- INIT -------------------
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateHeaderAuth();
});
