// ================= Firebase Auth =================
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ================= DOM Elements =================
const userMenu = document.getElementById('userMenu');
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
const darkModeToggle = document.getElementById('darkModeToggle');

// ================= On Auth State =================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Show user dropdown
        loginBtn.style.display = 'none';
        userDropdown.style.display = 'block';

        const displayName = user.displayName || user.email.split('@')[0];
        document.getElementById('username').textContent = displayName;
        userNameEl.textContent = displayName;
        userEmailEl.textContent = user.email;
        displayNameInput.value = displayName;

        if (user.metadata.creationTime) {
            const date = new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            document.querySelector('.member-since').innerHTML = `<i class="far fa-calendar-alt"></i> Member since ${date}`;
        }

    } else {
        loginBtn.style.display = 'inline-flex';
        userDropdown.style.display = 'none';
    }
});

// ================= Logout =================
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = '/pages/login.html';
    });
}

// ================= Dropdown Toggle =================
if (userBtn) {
    userBtn.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });
}

// Hide dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!userBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
        dropdownContent.classList.remove('show');
    }
});

// ================= Tabs =================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById(tab + 'Tab').classList.add('active');
    });
});

// ================= Profile Update =================
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        const newName = displayNameInput.value;
        if (auth.currentUser && newName) {
            try {
                await updateProfile(auth.currentUser, { displayName: newName });
                userNameEl.textContent = newName;
                document.getElementById('username').textContent = newName;
                alert("Profile updated!");
            } catch (err) {
                alert(err.message);
            }
        }
    });
}

// ================= Avatar Upload =================
if (avatarUploadBtn && avatarFileInput) {
    avatarUploadBtn.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            userAvatar.src = reader.result; 

        };
        reader.readAsDataURL(file);
    });
}

// ================= Dark Mode =================
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        renderPerformanceChart();
    });
}

// ================= Chart.js Performance Chart =================
function renderPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-mode');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
            datasets: [{
                label: 'Score %',
                data: [70, 85, 78, 92],
                borderColor: isDark ? '#4dabf7' : '#4a90e2',
                backgroundColor: isDark ? 'rgba(77, 171, 247, 0.2)' : 'rgba(74, 144, 226, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: isDark ? '#fff' : '#333' } }
            },
            scales: {
                x: { ticks: { color: isDark ? '#fff' : '#333' }, grid: { color: isDark ? '#444' : '#eee' } },
                y: { ticks: { color: isDark ? '#fff' : '#333' }, grid: { color: isDark ? '#444' : '#eee' } }
            }
        }
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', () => renderPerformanceChart());
