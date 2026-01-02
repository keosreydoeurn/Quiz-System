// Import the 'auth' instance from your firebase.js file
import { auth } from './firebase.js';
// Import necessary Firebase Auth functions directly from the CDN
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ================= DOM ELEMENTS =================
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// ================= TABS TOGGLE =================
if (loginTab && signupTab) {
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

setupPasswordToggle('passwordLogin', 'togglePasswordLogin');
setupPasswordToggle('passwordSignup', 'togglePasswordSignup');
setupPasswordToggle('confirmPasswordSignup', 'toggleConfirmPasswordSignup');

// ================= UTILS =================
function clearErrors() {
    if (loginError) { loginError.textContent = ''; loginError.style.display = 'none'; }
    if (signupError) { signupError.textContent = ''; signupError.style.display = 'none'; }
}

function showSuccess(message) {
    const popup = document.getElementById('successPopup');
    const messageEl = document.getElementById('successMessage');
    if (popup && messageEl) {
        messageEl.textContent = message;
        popup.classList.add('show');
    }
}

// ================= FIREBASE LOGIN SUBMIT =================
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailLogin').value;
        const password = document.getElementById('passwordLogin').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const nameToShow = user.displayName || user.email.split('@')[0];

            showSuccess(`Welcome back, ${nameToShow}!`);
            
            // Redirect to index
            setTimeout(() => window.location.href = '../index.html', 1500);
        } catch (error) {
            console.error(error);
            loginError.textContent = "Invalid email or password.";
            loginError.style.display = 'block';
        }
    });
}

// ================= FIREBASE SIGNUP SUBMIT =================
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('nameSignup').value;
        const email = document.getElementById('emailSignup').value;
        const password = document.getElementById('passwordSignup').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: fullName });
            showSuccess('Account created successfully!');
            setTimeout(() => window.location.href = '../index.html', 1500);
        } catch (error) {
            console.error(error);
            signupError.textContent = error.message.replace("Firebase: ", "");
            signupError.style.display = 'block';
        }
    });
}

// ================= GOOGLE LOGIN =================
const provider = new GoogleAuthProvider();
document.querySelectorAll('.social-btn.google').forEach(btn => {
    btn.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../index.html';
        } catch (error) {
            console.error("Google Auth Error:", error);
        }
    });
});