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
    // Render history for this user
    renderHistory(user);
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

// ========== Render Quiz History & Stats ==========
function formatTimeSeconds(secs) {
    const s = Number(secs) || 0;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${String(sec).padStart(2, '0')}s`;
}

function renderHistory(user) {
    const key = user ? `quizHistory_${user.uid}` : 'quizHistory';
    const history = JSON.parse(localStorage.getItem(key)) || [];
    const tbody = document.getElementById('historyTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (history.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6">No quiz history available.</td>`;
        tbody.appendChild(tr);
    } else {
        history.slice().reverse().forEach((r, idx) => {
            const tr = document.createElement('tr');
            const quizName = r.quizName || r.quizPage || 'Quiz';
            const category = r.category || 'General';
            const score = (r.percentage ?? 0) + '%';
            const time = r.timeLeft !== undefined ? formatTimeSeconds(r.timeLeft) : (r.timeSpent || '-');
            const date = r.date || '-';
            tr.innerHTML = `
                <td>${quizName}</td>
                <td><span class="category-badge">${category}</span></td>
                <td><span class="score-badge">${score}</span></td>
                <td>${time}</td>
                <td>${date}</td>
                <td>
                    <button class="btn-small btn-view" data-idx="${history.length - 1 - idx}">View</button>
                    <button class="btn-small btn-review" data-idx="${history.length - 1 - idx}">Review</button>
                    <button class="btn-small btn-retake" data-page="${r.quizPage || ''}">Retake</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update stats
    const total = history.length;
    document.getElementById('totalQuizzes').textContent = total;
    const avg = total === 0 ? 0 : Math.round(history.reduce((s, r) => s + (r.percentage || 0), 0) / total);
    document.getElementById('avgScore').textContent = `${avg}%`;
    const totalSeconds = history.reduce((s, r) => s + (Number(r.timeLeft) || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    document.getElementById('totalTime').textContent = `${hours}h ${minutes}m`;

    // Attach actions
    tbody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-idx'));
            const key = user ? `quizHistory_${user.uid}` : 'quizHistory';
            const historyArr = JSON.parse(localStorage.getItem(key)) || [];
            const item = historyArr[idx];
            if (!item) return;
            localStorage.setItem('latestResult', JSON.stringify(item));
            window.location.href = 'result.html';
        });
    });

    tbody.querySelectorAll('.btn-review').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-idx'));
            const key = user ? `quizHistory_${user.uid}` : 'quizHistory';
            const historyArr = JSON.parse(localStorage.getItem(key)) || [];
            const item = historyArr[idx];
            if (!item) return;
            localStorage.setItem('latestResult', JSON.stringify(item));
            localStorage.setItem('reviewMode', 'true');
            if (item.quizPage) window.location.href = item.quizPage;
            else window.location.href = 'result.html';
        });
    });

    tbody.querySelectorAll('.btn-retake').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            if (page) window.location.href = page;
            else window.location.href = 'quiz.html';
        });
    });
}

// Run render on load for non-authenticated users
document.addEventListener('DOMContentLoaded', () => renderHistory(null));



