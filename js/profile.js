import { auth } from './firebase.js';
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ========== Auth State ==========
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = './login.html';
        return;
    }
    document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('displayName').value = user.displayName || '';
    document.getElementById('userEmailInput').value = user.email;
    document.getElementById('username').textContent = user.displayName || user.email.split('@')[0];
});

// ========== Logout ==========
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = './login.html';
});

// ========== Tab Switching ==========
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        contents.forEach(c => c.classList.remove('active'));
        document.getElementById(tabId + 'Tab')?.classList.add('active');
    });
});

// ========== Update Profile ==========
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const newName = document.getElementById('displayName').value;
    if (auth.currentUser && newName) {
        await updateProfile(auth.currentUser, { displayName: newName });
        document.getElementById('userName').textContent = newName;
        document.getElementById('username').textContent = newName;
        alert('Profile updated!');
    }
});

// ========== Chart.js ==========
const ctx = document.getElementById('performanceChart');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
        datasets: [{
            label: 'Score %',
            data: [70, 85, 78, 92],
            borderColor: '#4a90e2',
            backgroundColor: 'rgba(74,144,226,0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});