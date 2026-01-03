// profile.js
import { auth } from './firebase.js';
import {
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* ================= DOM ELEMENTS ================= */
const loginBtn = document.getElementById('loginBtn');
const userDropdown = document.getElementById('userDropdown');
const userBtn = document.getElementById('userBtn');
const dropdownContent = document.getElementById('dropdownContent');
const logoutBtn = document.getElementById('logoutBtn');

const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const displayNameInput = document.getElementById('displayName');
const saveProfileBtn = document.getElementById('saveProfileBtn');

const avatarUploadBtn = document.getElementById('avatarUploadBtn');
const avatarFileInput = document.getElementById('avatarFileInput');
const userAvatar = document.getElementById('userAvatar');

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, (user) => {
    if (!user) {
        loginBtn.style.display = 'inline-flex';
        userDropdown.style.display = 'none';
        return;
    }

    // UI
    loginBtn.style.display = 'none';
    userDropdown.style.display = 'block';

    const displayName = user.displayName || user.email.split('@')[0];

    document.getElementById('username').textContent = displayName;
    userNameEl.textContent = displayName;
    userEmailEl.textContent = user.email;
    displayNameInput.value = displayName;

    // Member since
    if (user.metadata?.creationTime) {
        const date = new Date(user.metadata.creationTime).toLocaleDateString(
            'en-US',
            { month: 'long', year: 'numeric' }
        );
        document.querySelector('.member-since').innerHTML =
            `<i class="far fa-calendar-alt"></i> Member since ${date}`;
    }

    // Avatar
    if (user.photoURL) {
        userAvatar.src = user.photoURL;
    }
});

/* ================= LOGOUT ================= */
logoutBtn?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '/pages/login.html';
});

/* ================= DROPDOWN ================= */
userBtn?.addEventListener('click', () => {
    dropdownContent.classList.toggle('show');
});

window.addEventListener('click', (e) => {
    if (!userBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
        dropdownContent.classList.remove('show');
    }
});

/* ================= TABS ================= */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll('.tab-btn')
            .forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content')
            .forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(tab + 'Tab').classList.add('active');
    });
});

/* ================= UPDATE PROFILE ================= */
saveProfileBtn?.addEventListener('click', async () => {
    const newName = displayNameInput.value.trim();
    if (!newName || !auth.currentUser) return;

    try {
        await updateProfile(auth.currentUser, { displayName: newName });
        userNameEl.textContent = newName;
        document.getElementById('username').textContent = newName;
        alert('Profile updated!');
    } catch (err) {
        alert(err.message);
    }
});

/* ================= AVATAR UPLOAD ================= */
avatarUploadBtn?.addEventListener('click', () => {
    avatarFileInput.click();
});

avatarFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('Max file size is 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        userAvatar.src = reader.result;

        // Optional: save avatar to Firebase Auth
        try {
            await updateProfile(auth.currentUser, {
                photoURL: reader.result
            });
        } catch (err) {
            console.error(err);
        }
    };
    reader.readAsDataURL(file);
});

/* ================= CHART.JS ================= */
let performanceChart;

function renderPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    if (performanceChart) {
        performanceChart.destroy();
    }

    performanceChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
            datasets: [{
                label: 'Score %',
                data: [70, 85, 78, 92],
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74,144,226,0.15)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

document.addEventListener('DOMContentLoaded', renderPerformanceChart);
