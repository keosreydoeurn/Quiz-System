import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// Tab Switching
if (loginTab && signupTab) {
    [loginTab, signupTab].forEach(tab => {
        tab.addEventListener('click', () => {
            loginTab.classList.toggle('active-toggle');
            signupTab.classList.toggle('active-toggle');
            loginForm.classList.toggle('active-form');
            loginForm.classList.toggle('hidden-form');
            signupForm.classList.toggle('active-form');
            signupForm.classList.toggle('hidden-form');
            if (loginError) loginError.textContent = '';
            if (signupError) signupError.textContent = '';
        });
    });
}

// Success Popup Utility
function showSuccess(message) {
    const popup = document.getElementById('successPopup');
    if (popup) {
        document.getElementById('successMessage').textContent = message;
        popup.classList.add('show');
    }
}

// Firebase Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailLogin').value;
        const password = document.getElementById('passwordLogin').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showSuccess("Welcome back!");
            setTimeout(() => window.location.href = '../index.html', 1500);
        } catch (error) {
            loginError.textContent = "Invalid email or password.";
            loginError.style.display = 'block';
        }
    });
}

// Firebase Signup
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nameSignup').value;
        const email = document.getElementById('emailSignup').value;
        const password = document.getElementById('passwordSignup').value;

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName: name });
            showSuccess("Account created successfully!");
            setTimeout(() => window.location.href = '../index.html', 1500);
        } catch (error) {
            signupError.textContent = error.message.replace("Firebase: ", "");
            signupError.style.display = 'block';
        }
    });
}

// Google Login
const provider = new GoogleAuthProvider();
document.querySelectorAll('.social-btn.google').forEach(btn => {
    btn.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../index.html';
        } catch (error) {
            console.error(error);
        }
    });
});