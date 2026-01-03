// profile.js
import { auth } from './firebase.js';
import {
    onAuthStateChanged,
    signOut,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
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

const changePasswordBtn = document.getElementById('changePasswordBtn');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');

const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const deleteDataBtn = document.getElementById('deleteDataBtn');

const avatarModal = document.getElementById('avatarModal');
const closeModal = document.getElementById('closeModal');
const avatarPreview = document.getElementById('avatarPreview');
const avatarUpload = document.getElementById('avatarUpload');
const useDefault = document.getElementById('useDefault');
const cancelUpload = document.getElementById('cancelUpload');
const saveAvatarBtn = document.getElementById('saveAvatar');

/* ================= UTILITY FUNCTIONS ================= */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove
    setTimeout(() => {
        toast.remove();
    }, duration);
}

function showLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, (user) => {
    if (!user) {
        loginBtn.style.display = 'inline-flex';
        userDropdown.style.display = 'none';
        // Redirect to login if not authenticated
        window.location.href = '/pages/login.html';
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
    
    // Update email input in settings
    const userEmailInput = document.getElementById('userEmailInput');
    if (userEmailInput) {
        userEmailInput.value = user.email;
    }

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
        avatarPreview.src = user.photoURL;
    }

    // Load user data
    loadUserData();
});

/* ================= LOAD USER DATA ================= */
function loadUserData() {
    // Load from localStorage or initialize
    const userData = JSON.parse(localStorage.getItem('techQuizUserData') || '{}');
    
    // Update stats
    document.getElementById('totalQuizzes').textContent = userData.totalQuizzes || 0;
    document.getElementById('avgScore').textContent = userData.avgScore || '0%';
    document.getElementById('totalTime').textContent = userData.totalTime || '0m';
    document.getElementById('rank').textContent = userData.rank || '#999';
    
    // Load achievements
    loadAchievements();
    
    // Load history
    loadQuizHistory();
    
    // Load performance data
    renderPerformanceChart();
}

/* ================= ACHIEVEMENTS ================= */
function loadAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    const achievements = [
        { id: 1, name: 'First Quiz', description: 'Complete your first quiz', icon: 'fa-play', earned: true },
        { id: 2, name: 'Perfect Score', description: 'Score 100% on any quiz', icon: 'fa-star', earned: false },
        { id: 3, name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', icon: 'fa-bolt', earned: false },
        { id: 4, name: 'Consistent Learner', description: 'Take 10 quizzes', icon: 'fa-calendar-check', earned: false },
        { id: 5, name: 'HTML Master', description: 'Score 90%+ on HTML quiz', icon: 'fa-code', earned: false },
        { id: 6, name: 'CSS Wizard', description: 'Score 90%+ on CSS quiz', icon: 'fa-palette', earned: false }
    ];
    
    let earnedCount = 0;
    let html = '';
    
    achievements.forEach(achievement => {
        if (achievement.earned) earnedCount++;
        
        html += `
            <div class="badge-card ${achievement.earned ? 'earned' : 'locked'}">
                <div class="badge-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                ${!achievement.earned ? '<span class="progress-text">Locked</span>' : ''}
            </div>
        `;
    });
    
    achievementsGrid.innerHTML = html;
    
    // Update achievement stats
    document.getElementById('earnedCount').textContent = earnedCount;
    document.getElementById('lockedCount').textContent = achievements.length - earnedCount;
    document.getElementById('progressPercentage').textContent = 
        Math.round((earnedCount / achievements.length) * 100) + '%';
}

/* ================= QUIZ HISTORY ================= */
function loadQuizHistory() {
    const historyTableBody = document.getElementById('historyTableBody');
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    
    if (history.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-history" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <p>No quiz history yet</p>
                    <a href="quiz.html" class="btn-small">Take a Quiz</a>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    history.forEach(quiz => {
        const date = new Date(quiz.date).toLocaleDateString();
        const categoryClass = quiz.category.toLowerCase().replace('.', '');
        
        html += `
            <tr>
                <td>${quiz.name}</td>
                <td>
                    <span class="category-badge ${categoryClass}">${quiz.category}</span>
                </td>
                <td><strong>${quiz.score}%</strong></td>
                <td>${quiz.time}</td>
                <td>${date}</td>
                <td>
                    <button class="btn-small" onclick="retakeQuiz('${quiz.id}')">
                        <i class="fas fa-redo"></i> Retake
                    </button>
                </td>
            </tr>
        `;
    });
    
    historyTableBody.innerHTML = html;
}

// Add this to your global scope
window.retakeQuiz = function(quizId) {
    window.location.href = `quiz.html?quiz=${quizId}`;
};

/* ================= LOGOUT ================= */
logoutBtn?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '/pages/login.html';
    } catch (error) {
        showToast('Error logging out: ' + error.message, 'error');
    }
});

/* ================= DROPDOWN ================= */
userBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownContent.classList.toggle('show');
});

window.addEventListener('click', (e) => {
    if (!userBtn?.contains(e.target) && !dropdownContent?.contains(e.target)) {
        dropdownContent?.classList.remove('show');
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
    if (!newName || !auth.currentUser) {
        showToast('Please enter a valid name', 'error');
        return;
    }

    try {
        showLoading(true);
        await updateProfile(auth.currentUser, { displayName: newName });
        userNameEl.textContent = newName;
        document.getElementById('username').textContent = newName;
        showToast('Profile updated successfully!', 'success');
        
        // Save to localStorage
        const userData = JSON.parse(localStorage.getItem('techQuizUserData') || '{}');
        userData.displayName = newName;
        localStorage.setItem('techQuizUserData', JSON.stringify(userData));
    } catch (err) {
        showToast('Error updating profile: ' + err.message, 'error');
    } finally {
        showLoading(false);
    }
});

/* ================= CHANGE PASSWORD ================= */
changePasswordBtn?.addEventListener('click', async () => {
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        showToast('Please fill all password fields', 'error');
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (newPassword.value.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showLoading(true);
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
        
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword.value);
        
        showToast('Password updated successfully!', 'success');
        
        // Clear password fields
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (error) {
        showToast('Error updating password: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
});

/* ================= AVATAR MODAL ================= */
avatarUploadBtn?.addEventListener('click', () => {
    avatarModal.style.display = 'flex';
});

closeModal?.addEventListener('click', () => {
    avatarModal.style.display = 'none';
});

cancelUpload?.addEventListener('click', () => {
    avatarModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === avatarModal) {
        avatarModal.style.display = 'none';
    }
});

// Preview avatar when file selected
avatarUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('Max file size is 2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        avatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// Use default avatar
useDefault?.addEventListener('click', () => {
    avatarPreview.src = '../img/avatar.png';
});

// Save avatar changes
saveAvatarBtn?.addEventListener('click', async () => {
    try {
        showLoading(true);
        const user = auth.currentUser;
        
        // Update Firebase profile
        await updateProfile(user, {
            photoURL: avatarPreview.src
        });
        
        // Update UI
        userAvatar.src = avatarPreview.src;
        
        showToast('Profile picture updated!', 'success');
        avatarModal.style.display = 'none';
    } catch (error) {
        showToast('Error updating profile picture: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
});

/* ================= DATA MANAGEMENT ================= */
clearHistoryBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your quiz history?')) {
        localStorage.removeItem('quizHistory');
        loadQuizHistory();
        showToast('Quiz history cleared', 'success');
    }
});

exportDataBtn?.addEventListener('click', () => {
    const userData = JSON.parse(localStorage.getItem('techQuizUserData') || '{}');
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    
    const data = {
        userData,
        quizHistory: history,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `techquiz-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully', 'success');
});

deleteDataBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all your local data? This cannot be undone.')) {
        localStorage.removeItem('techQuizUserData');
        localStorage.removeItem('quizHistory');
        loadUserData();
        showToast('All data cleared', 'success');
    }
});

/* ================= CHART.JS ================= */
let performanceChart;

function renderPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    if (performanceChart) {
        performanceChart.destroy();
    }

    // Get performance data from localStorage
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const recentScores = history.slice(-5).map(q => q.score);
    const recentNames = history.slice(-5).map(q => q.name);

    performanceChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: recentNames.length > 0 ? recentNames : ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
            datasets: [{
                label: 'Score %',
                data: recentScores.length > 0 ? recentScores : [70, 85, 78, 92],
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74,144,226,0.15)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/* ================= FILTERS ================= */
document.getElementById('categoryFilter')?.addEventListener('change', filterHistory);
document.getElementById('dateFilter')?.addEventListener('change', filterHistory);

function filterHistory() {
    const category = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    // This would filter the displayed history
    // For now, we'll just reload with a message
    showToast('Filters applied', 'info');
}

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tabs
    const defaultTab = window.location.hash.substring(1) || 'overview';
    const tabBtn = document.querySelector(`[data-tab="${defaultTab}"]`);
    if (tabBtn) {
        tabBtn.click();
    }
    
    // Check if user is logged in
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/pages/login.html';
        }
    });
});