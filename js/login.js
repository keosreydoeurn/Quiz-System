// js/login.js - Complete Login System with Database
import dbManager from './database.js';

// ================= DOM ELEMENTS =================
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// ================= TABS TOGGLE =================
if (loginTab && signupTab && loginForm && signupForm) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active-toggle');
        signupTab.classList.remove('active-toggle');
        loginForm.classList.add('active-form');
        loginForm.classList.remove('hidden-form');
        signupForm.classList.add('hidden-form');
        signupForm.classList.remove('active-form');
        clearErrors();
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active-toggle');
        loginTab.classList.remove('active-toggle');
        signupForm.classList.add('active-form');
        signupForm.classList.remove('hidden-form');
        loginForm.classList.add('hidden-form');
        loginForm.classList.remove('active-form');
        clearErrors();
    });
}

// ================= PASSWORD TOGGLE =================
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;

    toggle.addEventListener('click', () => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        toggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
}

// Initialize password toggles
setupPasswordToggle('passwordLogin', 'togglePasswordLogin');
setupPasswordToggle('passwordSignup', 'togglePasswordSignup');
setupPasswordToggle('confirmPasswordSignup', 'toggleConfirmPasswordSignup');

// ================= CLEAR ERRORS =================
function clearErrors() {
    if (loginError) loginError.textContent = '';
    if (signupError) signupError.textContent = '';
}

// ================= SUCCESS POPUP =================
function showSuccess(message, title = 'Success') {
    const popup = document.getElementById('successPopup');
    const titleEl = document.getElementById('successTitle');
    const messageEl = document.getElementById('successMessage');

    if (!popup || !titleEl || !messageEl) return;

    titleEl.textContent = title;
    messageEl.textContent = message;
    popup.classList.add('show');

    // Auto-close
    setTimeout(() => popup.classList.remove('show'), 1500);

    // Reset progress bar
    const progressBar = document.querySelector('.popup-progress-bar');
    if (progressBar) {
        progressBar.style.animation = 'none';
        setTimeout(() => {
            progressBar.style.animation = 'progressBar 1.5s linear forwards';
        }, 10);
    }
}

// ================= LOGIN VALIDATION =================
function validateLoginForm() {
    if (!loginForm) return false;
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        loginError.style.display = 'block';
        return false;
    }
    loginError.style.display = 'none';
    return true;
}

// Live validation
if (document.getElementById('emailLogin')) {
    document.getElementById('emailLogin').addEventListener('input', validateLoginForm);
    document.getElementById('passwordLogin').addEventListener('input', validateLoginForm);
}

// ================= SIGNUP VALIDATION =================
function validateSignupForm() {
    if (!signupForm) return false;
    const fullName = document.getElementById('nameSignup').value;
    const email = document.getElementById('emailSignup').value;
    const password = document.getElementById('passwordSignup').value;
    const confirmPassword = document.getElementById('confirmPasswordSignup').value;

    if (!fullName || !email || !password || !confirmPassword) {
        signupError.textContent = 'All fields are required';
        signupError.style.display = 'block';
        return false;
    }

    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters';
        signupError.style.display = 'block';
        return false;
    }

    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        signupError.style.display = 'block';
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        signupError.textContent = 'Please enter a valid email address';
        signupError.style.display = 'block';
        return false;
    }

    signupError.style.display = 'none';
    return true;
}

// Live validation for signup
['nameSignup', 'emailSignup', 'passwordSignup', 'confirmPasswordSignup'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('input', validateSignupForm);
});

// ================= LOGIN SUBMIT =================
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateLoginForm()) return;

        const email = document.getElementById('emailLogin').value;
        const password = document.getElementById('passwordLogin').value;
        const rememberMe = document.getElementById('rememberMeLogin')?.checked || false;

        try {
            if (!dbManager.db) await dbManager.init();
            const user = await dbManager.loginUser(email, password);

            if (!user) throw new Error('Login failed');

            sessionStorage.setItem('currentUser', JSON.stringify(user));
            if (rememberMe) localStorage.setItem('rememberedUser', JSON.stringify({ email }));
            else localStorage.removeItem('rememberedUser');

            showSuccess(`Welcome back, ${user.fullName || user.username}!`);
            setTimeout(() => window.location.href = '../index.html', 1500);
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = error.message || 'Invalid email or password';
            loginError.style.display = 'block';
        }
    });
}

// ================= SIGNUP SUBMIT =================
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateSignupForm()) return;

        const fullName = document.getElementById('nameSignup').value;
        const email = document.getElementById('emailSignup').value;
        const password = document.getElementById('passwordSignup').value;
        const confirmPassword = document.getElementById('confirmPasswordSignup').value;

        try {
            if (!dbManager.db) await dbManager.init();
            if (password !== confirmPassword) throw new Error('Passwords do not match');

            const userData = { fullName, email, password };
            const user = await dbManager.registerUser(userData);

            sessionStorage.setItem('currentUser', JSON.stringify(user));
            showSuccess('Account created successfully! Welcome to TechQuiz!');
            setTimeout(() => window.location.href = '../index.html', 1500);
        } catch (error) {
            console.error('Signup error:', error);
            signupError.textContent = error.message || 'Registration failed';
            signupError.style.display = 'block';
        }
    });
}

// ================= SOCIAL LOGIN PLACEHOLDERS =================
document.querySelectorAll('.social-btn.google').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Google login would be implemented here with OAuth');
    });
});

document.querySelectorAll('.social-btn.facebook').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Facebook login would be implemented here with OAuth');
    });
});

// ================= CLOSE POPUP =================
const successPopup = document.getElementById('successPopup');
if (successPopup) {
    successPopup.addEventListener('click', e => {
        if (e.target === successPopup) successPopup.style.display = 'none';
    });
}

// ================= REMEMBER ME =================
window.addEventListener('DOMContentLoaded', () => {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        try {
            const { email } = JSON.parse(remembered);
            if (email && document.getElementById('emailLogin')) {
                document.getElementById('emailLogin').value = email;
                document.getElementById('rememberMeLogin').checked = true;
            }
        } catch (error) {
            console.error('Error loading remembered user:', error);
        }
    }

    if (dbManager) dbManager.init().catch(err => console.error('DB init failed:', err));
});
