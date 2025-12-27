// js/auth.js - Authentication Check for Protected Pages
import dbManager from './database.js';

// Check if user is logged in
export function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const protectedPages = ['profile.html', 'quiz.html']; // Add pages that require login
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Get current user
export function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout function
export function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Update header based on auth state
export function updateHeaderAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.fullName || currentUser.username}`;
        loginBtn.href = 'profile.html';
        
        // Add logout option if needed
        loginBtn.addEventListener('click', (e) => {
            if (e.ctrlKey) { // Ctrl+click to logout
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            }
        });
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateHeaderAuth();
});