<<<<<<< HEAD
<<<<<<< HEAD
// profile.js - Complete Profile Implementation
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.dbManager = null;
        this.chart = null;
        this.init();
=======
=======
// ================= Firebase Auth =================
>>>>>>> e22587a464c6434108501d33f53322f81e5d4f4a
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

<<<<<<< HEAD
// ========== Update Profile ==========
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const newName = document.getElementById('displayName').value;
    if (auth.currentUser && newName) {
        await updateProfile(auth.currentUser, { displayName: newName });
        document.getElementById('userName').textContent = newName;
        document.getElementById('username').textContent = newName;
        alert('Profile updated!');
>>>>>>> 7e03efeb89bfb2d147d1e816114599c78ec72f0c
    }

<<<<<<< HEAD
    async init() {
        try {
            // Import database manager
            const module = await import('./database.js');
            this.dbManager = module.default || module.dbManager;
            
            // Check if user is logged in
            this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            
            if (!this.currentUser || !this.currentUser.email) {
                window.location.href = 'login.html';
                return;
            }
            
            // Initialize database
            if (!this.dbManager.db) {
                await this.dbManager.init();
            }
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Load profile data
            await this.loadProfile();
            
            // Update header
            this.updateHeader();
            
        } catch (error) {
            console.error('Profile initialization error:', error);
            this.showToast('Error loading profile. Please try logging in again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    async loadProfile() {
        try {
            this.showLoading(true);
            
            // Load user data
            const user = await this.dbManager.getUserByEmail(this.currentUser.email);
            
            if (!user) {
                throw new Error('User not found');
            }
            
            // Update current user
            this.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update basic info
            this.updateBasicInfo(user);
            
            // Load detailed stats
            const stats = await this.dbManager.getUserStats(user.email);
            
            // Update all sections
            await Promise.all([
                this.updateOverview(stats),
                this.loadQuizHistory(),
                this.loadAchievements(),
                this.loadSettings()
            ]);
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showLoading(false);
            this.showToast('Error loading profile data', 'error');
        }
    }

    updateBasicInfo(user) {
        // Update name and email
        document.getElementById('userName').textContent = user.fullName || user.username;
        document.getElementById('userEmail').textContent = user.email;
        
        // Update avatar if exists
        if (user.avatar) {
            document.getElementById('userAvatar').src = user.avatar;
        }
        
        // Update member since
        const memberSince = document.querySelector('.member-since');
        if (memberSince && user.createdAt) {
            const date = new Date(user.createdAt);
            memberSince.innerHTML = `<i class="far fa-calendar-alt"></i> Member since ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        }
    }

    async updateOverview(stats) {
        // Update stat cards
        document.getElementById('totalQuizzes').textContent = stats.basic.totalQuizzes;
        document.getElementById('avgScore').textContent = `${stats.basic.averageScore}%`;
        document.getElementById('totalTime').textContent = this.formatTime(stats.basic.totalTime);
        document.getElementById('rank').textContent = `#${stats.basic.rank}`;
        
        // Update category performance
        this.updateCategoryPerformance(stats.categories);
        
        // Update recent quizzes
        await this.updateRecentQuizzes();
        
        // Update recent activity
        this.updateRecentActivity(stats);
        
        // Update performance chart
        this.updatePerformanceChart(stats.timeline);
    }

    updateCategoryPerformance(categories) {
        const container = document.getElementById('categoryStats');
        if (!container) return;
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="category-stat">
                    <div class="stat-header">
                        <i class="fas fa-chart-line" style="color: #999;"></i>
                        <span>No data yet</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%; background: #999;"></div>
                    </div>
                    <span class="stat-score">0%</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = categories.map(cat => `
            <div class="category-stat">
                <div class="stat-header">
                    <i class="${this.getCategoryIcon(cat.name)}" style="color: ${this.getCategoryColor(cat.name)};"></i>
                    <span>${cat.name}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${cat.averageScore}%; background: ${this.getCategoryColor(cat.name)};"></div>
                </div>
                <span class="stat-score">${cat.averageScore}%</span>
            </div>
        `).join('');
    }

    async updateRecentQuizzes() {
        try {
            const recentQuizzes = await this.dbManager.getRecentQuizzes(this.currentUser.email, 3);
            const container = document.getElementById('recentQuizzes');
            
            if (!container) return;
            
            if (recentQuizzes.length === 0) {
                container.innerHTML = `
                    <div class="quiz-history-item">
                        <div>
                            <strong>No quizzes taken yet</strong>
                            <p>Take your first quiz to see your results here</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = recentQuizzes.map(quiz => `
                <div class="quiz-history-item">
                    <div>
                        <strong>${quiz.quizName}</strong>
                        <p>${this.formatDate(quiz.date)} • ${quiz.totalQuestions} questions</p>
                    </div>
                    <div class="quiz-score">
                        <span class="score-circle" style="background: ${this.getScoreColor(quiz.score)}">${quiz.score}%</span>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent quizzes:', error);
        }
    }

    updateRecentActivity(stats) {
        const container = document.getElementById('activityList');
        if (!container) return;
        
        const activities = [];
        
        if (stats.basic.totalQuizzes === 0) {
            activities.push({
                icon: 'fas fa-info-circle primary',
                title: 'Welcome to TechQuiz!',
                description: 'Complete your first quiz to get started',
                score: null
            });
        } else {
            // Add latest quiz info
            activities.push({
                icon: 'fas fa-check-circle success',
                title: 'Latest quiz completed',
                description: `Average score: ${stats.basic.averageScore}%`,
                score: stats.basic.averageScore
            });
            
            // Add streak info
            if (stats.basic.streak > 0) {
                activities.push({
                    icon: 'fas fa-fire-alt danger',
                    title: `${stats.basic.streak} Day Streak!`,
                    description: 'Keep going to maintain your streak',
                    score: null
                });
            }
            
            // Add best score
            if (stats.recent.bestScore > 0) {
                activities.push({
                    icon: 'fas fa-star warning',
                    title: 'Best Score',
                    description: `${stats.recent.bestScore}% • Your highest so far`,
                    score: stats.recent.bestScore
                });
            }
            
            // Add week performance
            if (stats.recent.weekQuizzes > 0) {
                activities.push({
                    icon: 'fas fa-chart-line info',
                    title: 'Weekly Progress',
                    description: `${stats.recent.weekQuizzes} quizzes this week`,
                    score: stats.recent.weekAverage
                });
=======
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
>>>>>>> e22587a464c6434108501d33f53322f81e5d4f4a
            }
        }
    });
}

<<<<<<< HEAD
// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
=======
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
>>>>>>> 7e03efeb89bfb2d147d1e816114599c78ec72f0c
});
=======
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
>>>>>>> e22587a464c6434108501d33f53322f81e5d4f4a
