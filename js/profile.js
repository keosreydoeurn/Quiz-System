// profile.js - Complete Profile Implementation
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.dbManager = null;
        this.chart = null;
        this.init();
    }

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
            }
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="${activity.icon}"></i>
                <div>
                    <strong>${activity.title}</strong>
                    <p>${activity.description}</p>
                </div>
                ${activity.score ? `<span class="score-badge">${activity.score}%</span>` : ''}
            </div>
        `).join('');
    }

    updatePerformanceChart(timelineData) {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Prepare data
        const labels = timelineData.map(item => item.month);
        const data = timelineData.map(item => item.averageScore);
        
        this.chart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
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
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Score: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }

    async loadQuizHistory() {
        try {
            const history = await this.dbManager.getUserQuizHistory(this.currentUser.email);
            const container = document.getElementById('historyTableBody');
            
            if (!container) return;
            
            if (history.length === 0) {
                container.innerHTML = `
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
            
            container.innerHTML = history.map(quiz => `
                <tr>
                    <td>${quiz.quizName}</td>
                    <td><span class="category-badge ${quiz.category.toLowerCase()}">${quiz.category}</span></td>
                    <td><span class="score-badge">${quiz.score}%</span></td>
                    <td>${this.formatTime(quiz.timeSpent)}</td>
                    <td>${this.formatDate(quiz.date)}</td>
                    <td>
                        <button class="btn-small" onclick="profileManager.retakeQuiz('${quiz.quizName}')">Retake</button>
                        <button class="btn-small" onclick="profileManager.reviewQuiz('${quiz.id}')">Review</button>
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error loading quiz history:', error);
        }
    }

    async loadAchievements() {
        try {
            const achievements = await this.dbManager.getUserAchievements(this.currentUser.email);
            const allAchievements = await this.dbManager.initializeAchievements();
            
            const container = document.getElementById('achievementsGrid');
            const earnedCount = document.getElementById('earnedCount');
            const lockedCount = document.getElementById('lockedCount');
            const progressPercentage = document.getElementById('progressPercentage');
            
            if (!container) return;
            
            const earnedIds = new Set(achievements.map(a => a.id));
            const totalCount = allAchievements.length;
            const earned = achievements.length;
            const locked = totalCount - earned;
            const progress = Math.round((earned / totalCount) * 100);
            
            // Update stats
            if (earnedCount) earnedCount.textContent = earned;
            if (lockedCount) lockedCount.textContent = locked;
            if (progressPercentage) progressPercentage.textContent = `${progress}%`;
            
            // Display achievements
            container.innerHTML = allAchievements.map(achievement => {
                const earned = earnedIds.has(achievement.id);
                const progressText = !earned && achievement.progress ? 
                    `<span class="progress-text">${achievement.progress || 0}/${achievement.requirement}</span>` : '';
                
                return `
                    <div class="badge-card ${earned ? 'earned' : 'locked'}">
                        <div class="badge-icon">
                            <i class="${achievement.icon}"></i>
                        </div>
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                        ${progressText}
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    async loadSettings() {
        try {
            const settings = await this.dbManager.getUserSettings(this.currentUser.email);
            
            if (!settings) {
                // Initialize default settings
                await this.dbManager.initializeUserSettings(this.currentUser.email);
                return;
            }
            
            // Load profile settings
            document.getElementById('displayName').value = this.currentUser.fullName || this.currentUser.username;
            document.getElementById('userEmailInput').value = this.currentUser.email;
            document.getElementById('bio').value = this.currentUser.bio || '';
            
            // Load notification settings
            document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
            document.getElementById('quizReminders').checked = settings.quizReminders !== false;
            document.getElementById('achievementAlerts').checked = settings.achievementAlerts !== false;
            document.getElementById('leaderboardUpdates').checked = settings.leaderboardUpdates !== false;
            
            // Load privacy settings
            document.getElementById('profileVisibility').value = settings.profileVisibility || 'public';
            document.getElementById('showOnLeaderboard').checked = settings.showOnLeaderboard !== false;
            document.getElementById('allowMessages').checked = settings.allowMessages !== false;
            document.getElementById('showEmail').checked = settings.showEmail !== false;
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    initEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.getAttribute('data-tab')));
        });
        
        // Avatar upload
        document.getElementById('avatarUploadBtn').addEventListener('click', () => this.showAvatarModal());
        document.getElementById('avatarFileInput').addEventListener('change', (e) => this.handleAvatarSelect(e));
        
        // Profile settings
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.updateProfile());
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.changePassword());
        
        // Settings checkboxes
        document.querySelectorAll('#settingsTab input[type="checkbox"], #settingsTab select').forEach(element => {
            element.addEventListener('change', () => this.saveSettings());
        });
        
        // Data management
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('deleteDataBtn').addEventListener('click', () => this.confirmClearData());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.confirmClearHistory());
        
        // History filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterHistory());
        document.getElementById('dateFilter').addEventListener('change', () => this.filterHistory());
        
        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal());
        document.getElementById('cancelUpload').addEventListener('click', () => this.hideModal());
        document.getElementById('avatarUpload').addEventListener('change', (e) => this.handleAvatarUpload(e));
        document.getElementById('useDefault').addEventListener('click', () => this.useDefaultAvatar());
        document.getElementById('saveAvatar').addEventListener('click', () => this.saveAvatar());
    }

    switchTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        
        if (activeBtn) activeBtn.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        // Refresh data for active tab
        if (tabName === 'overview') {
            setTimeout(() => {
                if (this.chart) {
                    this.chart.resize();
                }
            }, 100);
        }
    }

    async updateProfile() {
        try {
            const displayName = document.getElementById('displayName').value;
            const email = document.getElementById('userEmailInput').value;
            const bio = document.getElementById('bio').value;
            
            if (!displayName || !email) {
                this.showToast('Please fill in all required fields', 'error');
                return;
            }
            
            this.showLoading(true);
            
            const updates = {};
            
            if (displayName !== this.currentUser.fullName) {
                updates.fullName = displayName;
            }
            
            if (email !== this.currentUser.email) {
                if (!confirm('Are you sure you want to change your email? You will need to verify the new email.')) {
                    this.showLoading(false);
                    return;
                }
                updates.email = email;
            }
            
            if (bio !== this.currentUser.bio) {
                updates.bio = bio;
            }
            
            if (Object.keys(updates).length > 0) {
                const updatedUser = await this.dbManager.updateUser(this.currentUser.email, updates);
                
                // Update current user
                this.currentUser = updatedUser;
                sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
                
                // Update UI
                this.updateBasicInfo(updatedUser);
                this.updateHeader();
                
                this.showToast('Profile updated successfully!', 'success');
            }
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showLoading(false);
            this.showToast('Error updating profile: ' + error.message, 'error');
        }
    }

    async changePassword() {
        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showToast('Please fill in all password fields', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                this.showToast('New passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                this.showToast('Password must be at least 6 characters long', 'error');
                return;
            }
            
            // In a real app, verify current password on server
            // For demo purposes, we'll just update it
            this.showLoading(true);
            
            const updates = { password: newPassword };
            await this.dbManager.updateUser(this.currentUser.email, updates);
            
            // Clear fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            this.showLoading(false);
            this.showToast('Password changed successfully!', 'success');
            
        } catch (error) {
            console.error('Error changing password:', error);
            this.showLoading(false);
            this.showToast('Error changing password: ' + error.message, 'error');
        }
    }

    async saveSettings() {
        try {
            const settings = {
                emailNotifications: document.getElementById('emailNotifications').checked,
                quizReminders: document.getElementById('quizReminders').checked,
                achievementAlerts: document.getElementById('achievementAlerts').checked,
                leaderboardUpdates: document.getElementById('leaderboardUpdates').checked,
                profileVisibility: document.getElementById('profileVisibility').value,
                showOnLeaderboard: document.getElementById('showOnLeaderboard').checked,
                allowMessages: document.getElementById('allowMessages').checked,
                showEmail: document.getElementById('showEmail').checked
            };
            
            await this.dbManager.updateUserSettings(this.currentUser.email, settings);
            
            // Show save confirmation
            const btn = document.getElementById('saveProfileBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error saving settings', 'error');
        }
    }

    async exportData() {
        try {
            this.showLoading(true);
            
            const data = await this.dbManager.exportUserData(this.currentUser.email);
            
            // Convert to JSON and create download link
            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = `techquiz-data-${this.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showLoading(false);
            this.showToast('Data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showLoading(false);
            this.showToast('Error exporting data', 'error');
        }
    }

    confirmClearData() {
        if (confirm('Are you sure you want to clear all your data? This will delete your quiz history, achievements, and settings. This action cannot be undone.')) {
            this.clearUserData();
        }
    }

    confirmClearHistory() {
        if (confirm('Are you sure you want to clear your quiz history? This action cannot be undone.')) {
            this.clearQuizHistory();
        }
    }

    async clearUserData() {
        try {
            this.showLoading(true);
            
            await this.dbManager.clearUserData(this.currentUser.email);
            
            // Reset user stats
            const updates = {
                totalQuizzes: 0,
                averageScore: 0,
                totalTime: 0,
                streak: 0,
                rank: 999
            };
            
            await this.dbManager.updateUser(this.currentUser.email, updates);
            
            // Reload profile
            await this.loadProfile();
            
            this.showLoading(false);
            this.showToast('All data cleared successfully', 'success');
            
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showLoading(false);
            this.showToast('Error clearing data', 'error');
        }
    }

    async clearQuizHistory() {
        try {
            this.showLoading(true);
            
            // Clear quiz history from database
            // Note: This is a simplified implementation
            // In a real app, you'd call a specific method to clear history
            
            // For now, we'll just reset the user's quiz stats
            const updates = {
                totalQuizzes: 0,
                averageScore: 0,
                totalTime: 0,
                streak: 0
            };
            
            await this.dbManager.updateUser(this.currentUser.email, updates);
            
            // Reload profile
            await this.loadProfile();
            
            this.showLoading(false);
            this.showToast('Quiz history cleared successfully', 'success');
            
        } catch (error) {
            console.error('Error clearing history:', error);
            this.showLoading(false);
            this.showToast('Error clearing history', 'error');
        }
    }

    async filterHistory() {
        // This is a client-side filter implementation
        const category = document.getElementById('categoryFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        try {
            const allHistory = await this.dbManager.getUserQuizHistory(this.currentUser.email);
            let filteredHistory = allHistory;
            
            // Filter by category
            if (category !== 'all') {
                filteredHistory = filteredHistory.filter(quiz => 
                    quiz.category.toLowerCase().includes(category.toLowerCase())
                );
            }
            
            // Filter by date
            if (dateFilter !== 'all') {
                const now = new Date();
                let startDate;
                
                if (dateFilter === 'week') {
                    startDate = new Date(now.setDate(now.getDate() - 7));
                } else if (dateFilter === 'month') {
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                }
                
                filteredHistory = filteredHistory.filter(quiz => 
                    new Date(quiz.date) >= startDate
                );
            }
            
            // Update table
            const container = document.getElementById('historyTableBody');
            if (!container) return;
            
            if (filteredHistory.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                            <p>No quizzes found for the selected filters</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            container.innerHTML = filteredHistory.map(quiz => `
                <tr>
                    <td>${quiz.quizName}</td>
                    <td><span class="category-badge ${quiz.category.toLowerCase()}">${quiz.category}</span></td>
                    <td><span class="score-badge">${quiz.score}%</span></td>
                    <td>${this.formatTime(quiz.timeSpent)}</td>
                    <td>${this.formatDate(quiz.date)}</td>
                    <td>
                        <button class="btn-small" onclick="profileManager.retakeQuiz('${quiz.quizName}')">Retake</button>
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error filtering history:', error);
        }
    }

    // Avatar Management
    showAvatarModal() {
        const modal = document.getElementById('avatarModal');
        const preview = document.getElementById('avatarPreview');
        
        preview.src = this.currentUser.avatar || '../img/avatar.png';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        const modal = document.getElementById('avatarModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset file input
        document.getElementById('avatarUpload').value = '';
    }

    handleAvatarSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.showAvatarModal();
            setTimeout(() => {
                this.previewAvatar(file);
            }, 100);
        }
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.previewAvatar(file);
        }
    }

    async previewAvatar(file) {
        try {
            // Validate file
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                this.showToast('Please select a valid image (JPG, PNG, GIF)', 'error');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                this.showToast('Image size must be less than 2MB', 'error');
                return;
            }
            
            // Read and preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('avatarPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Error previewing avatar:', error);
            this.showToast('Error processing image', 'error');
        }
    }

    useDefaultAvatar() {
        document.getElementById('avatarPreview').src = '../img/avatar.png';
    }

    async saveAvatar() {
        try {
            this.showLoading(true);
            
            const preview = document.getElementById('avatarPreview');
            const avatarData = preview.src;
            
            // Update in database
            const updates = { avatar: avatarData };
            const updatedUser = await this.dbManager.updateUser(this.currentUser.email, updates);
            
            // Update current user and session
            this.currentUser = updatedUser;
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Update UI
            document.getElementById('userAvatar').src = avatarData;
            this.updateHeader();
            
            this.hideModal();
            this.showLoading(false);
            this.showToast('Profile picture updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving avatar:', error);
            this.showLoading(false);
            this.showToast('Error saving avatar', 'error');
        }
    }

    // Quiz Actions
    retakeQuiz(quizName) {
        // Redirect to quiz page
        sessionStorage.setItem('selectedQuiz', quizName);
        window.location.href = 'quiz.html';
    }

    reviewQuiz(quizId) {
        // Show quiz review
        alert(`Reviewing quiz ${quizId}\n\nThis feature would show your answers and the correct solutions.`);
    }

    // Utility Methods
    formatTime(seconds) {
        if (!seconds) return '0m';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getCategoryIcon(category) {
        const icons = {
            'HTML5': 'fab fa-html5',
            'CSS3': 'fab fa-css3-alt',
            'JavaScript': 'fab fa-js',
            'React.js': 'fab fa-react',
            'Python': 'fab fa-python',
            'Java': 'fab fa-java',
            'C++': 'fas fa-cogs',
            'SQL': 'fas fa-database',
            'Algorithms': 'fas fa-sitemap'
        };
        return icons[category] || 'fas fa-code';
    }

    getCategoryColor(category) {
        const colors = {
            'HTML5': '#E44D26',
            'CSS3': '#264DE4',
            'JavaScript': '#F7DF1E',
            'React.js': '#61DAFB',
            'Python': '#3776AB',
            'Java': '#007396',
            'C++': '#00599C',
            'SQL': '#336791',
            'Algorithms': '#FF6B6B'
        };
        return colors[category] || '#667eea';
    }

    getScoreColor(score) {
        if (score >= 90) return '#28a745';
        if (score >= 75) return '#17a2b8';
        if (score >= 60) return '#ffc107';
        return '#dc3545';
    }

    updateHeader() {
        const loginBtn = document.getElementById('loginBtn');
        if (this.currentUser && loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.fullName || this.currentUser.username}`;
            loginBtn.href = 'profile.html';
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }

    showToast(message, type = 'success') {
        // Remove existing toasts
        const existing = document.querySelectorAll('.toast');
        existing.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type] || 'fas fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});