// ================= UTILITIES =================
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// ================= TABS =================
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

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

// ================= PASSWORD TOGGLE =================
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    toggle.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

setupPasswordToggle('passwordLogin', 'togglePasswordLogin');
setupPasswordToggle('passwordSignup', 'togglePasswordSignup');
setupPasswordToggle('confirmPasswordSignup', 'toggleConfirmPasswordSignup');

// ================= POPUP =================
function showSuccess(message, redirectUrl = null) {
    const popup = document.getElementById('successPopup');
    const msg = document.getElementById('successMessage');

    msg.textContent = message;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
        if (redirectUrl) window.location.href = redirectUrl;
    }, 1500);
}

// ================= LOGIN LIVE VALIDATION =================
const emailLogin = document.getElementById('emailLogin');
const passwordLogin = document.getElementById('passwordLogin');
const loginError = document.getElementById('loginError');

function validateLoginLive() {
    if (!emailLogin.value || !passwordLogin.value) {
        loginError.textContent = 'Email and password are required.';
        loginError.style.display = 'block';
        return false;
    }

    loginError.style.display = 'none';
    return true;
}

emailLogin.addEventListener('input', validateLoginLive);
passwordLogin.addEventListener('input', validateLoginLive);

// ================= LOGIN SUBMIT =================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateLoginLive()) return;

    const users = getUsers();
    const rememberMe = document.getElementById('rememberMeLogin').checked;

    const user = users.find(
        u => u.email === emailLogin.value && u.password === passwordLogin.value
    );

    if (!user) {
        loginError.textContent = 'Invalid email or password.';
        loginError.style.display = 'block';
        return;
    }

    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    showSuccess(`Welcome back, ${user.name}!`, '../index.html');
});

// ================= SIGNUP LIVE VALIDATION =================
const nameSignup = document.getElementById('nameSignup');
const emailSignup = document.getElementById('emailSignup');
const passwordSignup = document.getElementById('passwordSignup');
const confirmPassword = document.getElementById('confirmPasswordSignup');
const signupError = document.getElementById('signupError');

function validateSignupLive() {
    if (!nameSignup.value || !emailSignup.value || !passwordSignup.value || !confirmPassword.value) {
        signupError.textContent = 'All fields are required.';
        signupError.style.display = 'block';
        return false;
    }

    if (passwordSignup.value.length < 4) {
        signupError.textContent = 'Password must be at least 4 characters.';
        signupError.style.display = 'block';
        return false;
    }

    if (passwordSignup.value !== confirmPassword.value) {
        signupError.textContent = 'Passwords do not match.';
        signupError.style.display = 'block';
        return false;
    }

    signupError.style.display = 'none';
    return true;
}

[nameSignup, emailSignup, passwordSignup, confirmPassword]
    .forEach(input => input.addEventListener('input', validateSignupLive));

// ================= SIGNUP SUBMIT =================
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateSignupLive()) return;

    const users = getUsers();

    if (users.some(u => u.email === emailSignup.value)) {
        signupError.textContent = 'Email already exists.';
        signupError.style.display = 'block';
        return;
    }

    users.push({
        name: nameSignup.value,
        email: emailSignup.value,
        password: passwordSignup.value
    });

    saveUsers(users);

    showSuccess('Account created! Please login.');
    loginTab.click();
});
