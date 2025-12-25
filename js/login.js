// Tabs
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Toggle forms
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active-toggle');
    signupTab.classList.remove('active-toggle');
    loginForm.classList.add('active-form');
    loginForm.classList.remove('hidden-form');
    signupForm.classList.add('hidden-form');
    signupForm.classList.remove('active-form');
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active-toggle');
    loginTab.classList.remove('active-toggle');
    signupForm.classList.add('active-form');
    signupForm.classList.remove('hidden-form');
    loginForm.classList.add('hidden-form');
    loginForm.classList.remove('active-form');
});

// Toggle password visibility
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    toggle.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

setupPasswordToggle('passwordLogin', 'togglePasswordLogin');
setupPasswordToggle('passwordSignup', 'togglePasswordSignup');

// Success popup function
function showSuccess(message, redirectUrl = null) {
    const popup = document.getElementById('successPopup');
    const popupMessage = document.getElementById('successMessage');
    popupMessage.textContent = message;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }, 1500); // Show for 1.5 seconds
}

// Login form submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value.trim();
    const password = document.getElementById('passwordLogin').value.trim();
    const rememberMe = document.getElementById('rememberMeLogin').checked;
    const loginError = document.getElementById('loginError');

    if (!email || !password) {
        loginError.style.display = 'block';
        loginError.textContent = 'Please enter both email and password.';
        return;
    }

    if (password.length < 4) {
        loginError.style.display = 'block';
        loginError.textContent = 'Password must be at least 4 characters.';
        return;
    }

    loginError.style.display = 'none';

    // Simulate login success
    const username = email.split('@')[0];
    if (rememberMe) {
        localStorage.setItem('user', username);
    } else {
        sessionStorage.setItem('user', username);
    }

    showSuccess(`Welcome back, ${username}!`, '../index.html');
});

// Sign-up form submit
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nameSignup').value.trim();
    const email = document.getElementById('emailSignup').value.trim();
    const password = document.getElementById('passwordSignup').value.trim();
    const signupError = document.getElementById('signupError');

    if (!name || !email || !password) {
        signupError.style.display = 'block';
        signupError.textContent = 'Please fill out all fields.';
        return;
    }

    if (password.length < 4) {
        signupError.style.display = 'block';
        signupError.textContent = 'Password must be at least 4 characters.';
        return;
    }

    signupError.style.display = 'none';

    // Simulate sign-up success
    showSuccess(`Account created for ${name}! Please login.`);
    loginTab.click(); // Switch to login form
});
