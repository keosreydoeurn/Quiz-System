// js/login.js - Complete Login System with Database
import dbManager from './database.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// ================= TABS TOGGLE =================
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
    
    popup.style.display = 'flex';
    
    setTimeout(() => {
        popup.style.display = 'none';
    }, 1500);
}

// ================= LOGIN VALIDATION =================
function validateLoginForm() {
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

// Live validation for login
if (document.getElementById('emailLogin') && document.getElementById('passwordLogin')) {
    document.getElementById('emailLogin').addEventListener('input', validateLoginForm);
    document.getElementById('passwordLogin').addEventListener('input', validateLoginForm);
}

// ================= SIGNUP VALIDATION =================
function validateSignupForm() {
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
if (document.getElementById('nameSignup')) {
    ['nameSignup', 'emailSignup', 'passwordSignup', 'confirmPasswordSignup'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', validateSignupForm);
        }
    });
}

// ================= LOGIN SUBMIT =================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;
    const rememberMe = document.getElementById('rememberMeLogin')?.checked || false;
    
    try {
        // Wait for database initialization
        if (!dbManager.db) {
            await dbManager.init();
        }
        
        // Attempt login
        const user = await dbManager.loginUser(email, password);
        
        if (!user) {
            throw new Error('Login failed');
        }
        
        // Store user session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({ email }));
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Show success message
        showSuccess(`Welcome back, ${user.fullName || user.username}!`);
        
        // Redirect to home page after delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message || 'Invalid email or password';
        loginError.style.display = 'block';
    }
});

// ================= SIGNUP SUBMIT =================
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) return;
    
    const fullName = document.getElementById('nameSignup').value;
    const email = document.getElementById('emailSignup').value;
    const password = document.getElementById('passwordSignup').value;
    const confirmPassword = document.getElementById('confirmPasswordSignup').value;
    
    try {
        // Wait for database initialization
        if (!dbManager.db) {
            await dbManager.init();
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        // Register new user
        const userData = {
            email: email,
            password: password,
            fullName: fullName
        };
        
        const user = await dbManager.registerUser(userData);
        
        // Store user session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show success message
        showSuccess('Account created successfully! Welcome to TechQuiz!');
        
        // Redirect to home page after delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        signupError.textContent = error.message || 'Registration failed';
        signupError.style.display = 'block';
    }
});

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

// ================= CLOSE POPUP ON CLICK =================
const successPopup = document.getElementById('successPopup');
if (successPopup) {
    successPopup.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
}

// ================= REMEMBER ME FUNCTIONALITY =================
window.addEventListener('DOMContentLoaded', () => {
    // Load remembered email if exists
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
    
    // Initialize database
    dbManager.init().catch(error => {
        console.error('Database initialization failed:', error);
    });
});