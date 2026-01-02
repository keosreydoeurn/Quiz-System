import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ------------------- AUTH OBSERVER -------------------
export function initAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const protectedPages = ['profile.html', 'quiz.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (user) {
            updateHeaderAuth(user);
            updateProfileInfo(user); 
        } else {
            if (protectedPages.includes(currentPage)) {
                window.location.href = '../pages/login.html';
            }
            updateHeaderAuth(null);
            clearProfileInfo();
        }
    });
}

// ------------------- LOGOUT -------------------
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = window.location.pathname.includes('pages') ? 'login.html' : './pages/login.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// ------------------- UPDATE HEADER UI -------------------
export function updateHeaderAuth(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const usernameSpan = document.getElementById('username');
    const dropdownContent = document.getElementById('dropdownContent');
    const logoutBtn = document.getElementById('logoutBtn');
    const userBtn = document.getElementById('userBtn');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'inline-block';
        if (usernameSpan) usernameSpan.textContent = user.displayName || user.email.split('@')[0];

        if (userBtn && !userBtn.dataset.listener) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = dropdownContent.style.display === 'block';
                dropdownContent.style.display = isVisible ? 'none' : 'block';
            });
            userBtn.dataset.listener = "true";
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userDropdown) userDropdown.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) logout();
        };
    }
}

// ------------------- UPDATE PROFILE INFO -------------------
export function updateProfileInfo(user) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');

    if (userNameEl) userNameEl.textContent = user.displayName || user.email.split('@')[0];
    if (userEmailEl) userEmailEl.textContent = user.email;

    if (userAvatarEl) {
        if (user.photoURL) {
            userAvatarEl.src = user.photoURL;
        } else {
            userAvatarEl.src = '../img/avatar.png';
        }
    }
}

// ------------------- CLEAR PROFILE INFO -------------------
export function clearProfileInfo() {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');

    if (userNameEl) userNameEl.textContent = 'userName';
    if (userEmailEl) userEmailEl.textContent = 'username@example.com';
    if (userAvatarEl) userAvatarEl.src = '../img/avatar.png';
}

// ------------------- GLOBAL CLICK LISTENER -------------------
window.addEventListener('click', () => {
    const content = document.getElementById('dropdownContent');
    if (content) content.style.display = 'none';
});

// Initialize auth listener on page load
document.addEventListener('DOMContentLoaded', initAuthListener);
