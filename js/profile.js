// TechQuiz Profile JavaScript

class TechQuizProfile {
    constructor() {
        this.currentUser = null;
        this.chart = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.renderProfile();
        this.initChart();
        this.checkAuth();
    }

    async loadUserData() {
        // Try to load from localStorage
        const savedUser = localStorage.getItem('techquiz_user');
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        } else {
            // Demo user data
            this.currentUser = {
                id: 1,
                name: "John Doe",
                email: "john.doe@example.com",
                memberSince: "2024-01-15",
                stats: {
                    quizzesTaken: 42,
                    averageScore: 78,
                    totalTime: 1250, // minutes
                    rank: 15,
                    categoryScores: {
                        html: 85,
                        css: 92,
                        js: 78,
                        react: 65
                    }
                },
                recentActivity: [
                    { type: 'quiz_complete', title: 'HTML5 Quiz', score: 85, time: '15 minutes ago' },
                    { type: 'badge_earned', title: 'JavaScript Expert Badge', time: '1 hour ago' },
                    { type: 'streak', title: '3 Day Streak!', time: '2 days ago' },
                    { type: 'high_score', title: 'New High Score', score: 92, time: '3 days ago' }
                ],
                quizHistory: [
                    { name: 'Advanced JavaScript', category: 'js', score: 76, time: '18m 30s', date: '2024-03-15' },
                    { name: 'CSS Layout Mastery', category: 'css', score: 88, time: '15m 45s', date: '2024-03-14' },
                    { name: 'HTML5 Semantic Elements', category: 'html', score: 94, time: '12m 20s', date: '2024-03-13' },
                    { name: 'React Fundamentals', category: 'react', score: 82, time: '20m 15s', date: '2024-03-12' }
                ],
                achievements: [
                    { id: 1, name: 'Quick Learner', description: 'Complete 10 quizzes in one week', earned: true },
                    { id: 2, name: 'Perfect Score', description: 'Score 100% on any quiz', earned: true },
                    { id: 3, name: 'Streak Master', description: '7-day quiz streak', earned: true },
                    { id: 4, name: 'Quiz Master', description: 'Complete 50 quizzes', earned: false, progress: 42 },
                    { id: 5, name: 'Speed Demon', description: 'Complete quiz in under 5 minutes', earned: false },
                    { id: 6, name: 'Global Champion', description: 'Reach #1 on leaderboard', earned: false }
                ],
                settings: {
                    displayName: 'John Doe',
                    email: 'john.doe@example.com',
                    notifications: {
                        email: true,
                        quizReminders: true,
                        achievements: false
                    },
                    privacy: {
                        profileVisibility: 'public',
                        showOnLeaderboard: true,
                        allowMessages: false
                    }
                }
            };
            
            localStorage.setItem('techquiz_user', JSON.stringify(this.currentUser));
        }
    }

    renderProfile() {
        if (!this.currentUser) return;

        // Update user info
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userEmail').textContent = this.currentUser.email;
        
        // Format member since date
        const memberSince = new Date(this.currentUser.memberSince);
        const options = { year: 'numeric', month: 'long' };
        document.querySelector('.member-since').innerHTML = 
            `<i class="far fa-calendar-alt"></i> Member since ${memberSince.toLocaleDateString('en-US', options)}`;

        // Update stats
        document.getElementById('totalQuizzes').textContent = this.currentUser.stats.quizzesTaken;
        document.getElementById('avgScore').textContent = `${this.currentUser.stats.averageScore}%`;
        
        // Format total time
        const hours = Math.floor(this.currentUser.stats.totalTime / 60);
        const minutes = this.currentUser.stats.totalTime % 60;
        document.getElementById('totalTime').textContent = `${hours}h ${minutes}m`;
        
        document.getElementById('rank').textContent = `#${this.currentUser.stats.rank}`;

        // Update progress bars for category stats
        const categories = ['html', 'css', 'js', 'react'];
        categories.forEach(category => {
            const score = this.currentUser.stats.categoryScores[category];
            const progressBar = document.querySelector(`.category-stat:nth-child(${categories.indexOf(category) + 1}) .progress`);
            const scoreSpan = document.querySelector(`.category-stat:nth-child(${categories.indexOf(category) + 1}) .stat-score`);
            
            if (progressBar) {
                progressBar.style.width = `${score}%`;
            }
            if (scoreSpan) {
                scoreSpan.textContent = `${score}%`;
            }
        });
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('onclick').match(/switchTab\('(\w+)'\)/)[1];
                this.switchTab(tabName);
            });
        });

        // Settings form
        const displayNameInput = document.getElementById('displayName');
        if (displayNameInput) {
            displayNameInput.value = this.currentUser?.settings?.displayName || '';
            displayNameInput.addEventListener('change', () => this.saveSettings());
        }

        const emailInput = document.getElementById('userEmailInput');
        if (emailInput) {
            emailInput.value = this.currentUser?.settings?.email || '';
            emailInput.addEventListener('change', () => this.saveSettings());
        }

        // Notification checkboxes
        ['emailNotifications', 'quizReminders', 'achievementAlerts'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && this.currentUser?.settings?.notifications) {
                const key = id.replace('Notifications', '').replace('Reminders', '').replace('Alerts', '').toLowerCase();
                checkbox.checked = this.currentUser.settings.notifications[key] || false;
                checkbox.addEventListener('change', () => this.saveSettings());
            }
        });

        // Privacy settings
        const visibilitySelect = document.getElementById('profileVisibility');
        if (visibilitySelect && this.currentUser?.settings?.privacy) {
            visibilitySelect.value = this.currentUser.settings.privacy.profileVisibility;
            visibilitySelect.addEventListener('change', () => this.saveSettings());
        }

        const leaderboardCheckbox = document.getElementById('showOnLeaderboard');
        if (leaderboardCheckbox && this.currentUser?.settings?.privacy) {
            leaderboardCheckbox.checked = this.currentUser.settings.privacy.showOnLeaderboard;
            leaderboardCheckbox.addEventListener('change', () => this.saveSettings());
        }

        const messagesCheckbox = document.getElementById('allowMessages');
        if (messagesCheckbox && this.currentUser?.settings?.privacy) {
            messagesCheckbox.checked = this.currentUser.settings.privacy.allowMessages;
            messagesCheckbox.addEventListener('change', () => this.saveSettings());
        }

        // Filter dropdowns
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterHistory());
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterHistory());
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activate selected tab
        const activeButton = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        // Load tab-specific content
        switch(tabName) {
            case 'history':
                this.renderQuizHistory();
                break;
            case 'achievements':
                this.renderAchievements();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    initChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Average Score',
                    data: [65, 72, 78, 75, 82, 85],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    renderQuizHistory() {
        const tableBody = document.querySelector('#historyTab tbody');
        if (!tableBody || !this.currentUser) return;

        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const dateFilter = document.getElementById('dateFilter')?.value || 'all';

        let filteredHistory = this.currentUser.quizHistory;

        // Filter by category
        if (categoryFilter !== 'all') {
            filteredHistory = filteredHistory.filter(quiz => quiz.category === categoryFilter);
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date();
            const cutoff = new Date();
            
            if (dateFilter === 'week') {
                cutoff.setDate(now.getDate() - 7);
            } else if (dateFilter === 'month') {
                cutoff.setMonth(now.getMonth() - 1);
            }
            
            filteredHistory = filteredHistory.filter(quiz => new Date(quiz.date) >= cutoff);
        }

        // Render table rows
        tableBody.innerHTML = filteredHistory.map(quiz => `
            <tr>
                <td>${quiz.name}</td>
                <td><span class="category-badge ${quiz.category}">${this.getCategoryName(quiz.category)}</span></td>
                <td><span class="score-badge">${quiz.score}%</span></td>
                <td>${quiz.time}</td>
                <td>${new Date(quiz.date).toLocaleDateString()}</td>
                <td><button class="btn-small" onclick="profile.retakeQuiz('${quiz.name}')">Retake</button></td>
            </tr>
        `).join('');
    }

    getCategoryName(category) {
        const categories = {
            'html': 'HTML5',
            'css': 'CSS3',
            'js': 'JavaScript',
            'react': 'React.js'
        };
        return categories[category] || category;
    }

    renderAchievements() {
        const badgesGrid = document.querySelector('.badges-grid');
        if (!badgesGrid || !this.currentUser) return;

        badgesGrid.innerHTML = this.currentUser.achievements.map(achievement => {
            const earnedClass = achievement.earned ? 'earned' : 'locked';
            const progressText = achievement.progress ? `<span class="progress-text">${achievement.progress}/50</span>` : '';
            
            return `
                <div class="badge-card ${earnedClass}">
                    <div class="badge-icon">
                        <i class="fas ${this.getAchievementIcon(achievement.id)}"></i>
                    </div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${progressText}
                </div>
            `;
        }).join('');
    }

    getAchievementIcon(id) {
        const icons = {
            1: 'fa-bolt',
            2: 'fa-star',
            3: 'fa-fire',
            4: 'fa-crown',
            5: 'fa-brain',
            6: 'fa-globe'
        };
        return icons[id] || 'fa-trophy';
    }

    renderSettings() {
        // Settings are already loaded in setupEventListeners
        // This function is kept for consistency
        console.log('Settings tab rendered');
    }

    saveSettings() {
        if (!this.currentUser) return;

        // Update settings from form
        this.currentUser.settings.displayName = document.getElementById('displayName').value;
        this.currentUser.settings.email = document.getElementById('userEmailInput').value;

        // Update notifications
        this.currentUser.settings.notifications = {
            email: document.getElementById('emailNotifications').checked,
            quizReminders: document.getElementById('quizReminders').checked,
            achievements: document.getElementById('achievementAlerts').checked
        };

        // Update privacy
        this.currentUser.settings.privacy = {
            profileVisibility: document.getElementById('profileVisibility').value,
            showOnLeaderboard: document.getElementById('showOnLeaderboard').checked,
            allowMessages: document.getElementById('allowMessages').checked
        };

        // Update user name if display name changed
        if (document.getElementById('displayName').value !== this.currentUser.name) {
            this.currentUser.name = document.getElementById('displayName').value;
            this.renderProfile();
        }

        // Save to localStorage
        localStorage.setItem('techquiz_user', JSON.stringify(this.currentUser));

        this.showNotification('Settings saved successfully!', 'success');
    }

    updateProfile() {
        const displayName = document.getElementById('displayName').value.trim();
        const email = document.getElementById('userEmailInput').value.trim();

        if (!displayName || !email) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        this.saveSettings();
        this.showNotification('Profile updated successfully!', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        // In real app, verify current password with server
        // For demo, just show success

        // Clear fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        this.showNotification('Password updated successfully!', 'success');
    }

    filterHistory() {
        this.renderQuizHistory();
    }

    retakeQuiz(quizName) {
        this.showNotification(`Starting quiz: ${quizName}`, 'info');
        // In real app, redirect to quiz page
        setTimeout(() => {
            window.location.href = 'quiz.html';
        }, 1000);
    }

    changeAvatar() {
        this.showNotification('Avatar upload feature coming soon!', 'info');
    }

    logout() {
        // Clear user session
        localStorage.removeItem('techquiz_user');
        localStorage.removeItem('isLoggedIn');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            this.showNotification('Please login to view your profile', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            min-width: 300px;
            max-width: 400px;
        `;
        
        // Add CSS for animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profile = new TechQuizProfile();
});

// Global functions for inline onclick handlers
function switchTab(tabName) {
    if (window.profile) {
        window.profile.switchTab(tabName);
    }
}

function updateProfile() {
    if (window.profile) {
        window.profile.updateProfile();
    }
}

function changePassword() {
    if (window.profile) {
        window.profile.changePassword();
    }
}

function changeAvatar() {
    if (window.profile) {
        window.profile.changeAvatar();
    }
}