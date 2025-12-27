// js/profile.js - Profile Management
import dbManager from './database.js';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is logged in
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (!currentUser || !currentUser.email) {
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize database
        if (!dbManager.db) {
            await dbManager.init();
        }
        
        // Load user data
        await loadUserProfile(currentUser.email);
        
        // Set up event listeners
        setupEventListeners();
        
        // Update header
        updateHeader();
        
    } catch (error) {
        console.error('Profile initialization error:', error);
        alert('Error loading profile. Please try logging in again.');
        window.location.href = 'login.html';
    }
});

// Load user profile data
async function loadUserProfile(email) {
    try {
        const user = await dbManager.getUserByEmail(email);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Update UI with user data
        document.getElementById('userName').textContent = user.fullName || user.username;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('totalQuizzes').textContent = user.totalQuizzes || 0;
        document.getElementById('avgScore').textContent = `${Math.round(user.averageScore || 0)}%`;
        document.getElementById('totalTime').textContent = formatTime(user.totalTime || 0);
        document.getElementById('rank').textContent = `#${user.rank || '999'}`;
        
        // Update member since
        const memberSince = document.querySelector('.member-since');
        if (memberSince && user.createdAt) {
            const date = new Date(user.createdAt);
            memberSince.innerHTML = `<i class="far fa-calendar-alt"></i> Member since ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        }
        
        // Update settings form
        const displayNameInput = document.getElementById('displayName');
        const emailInput = document.getElementById('userEmailInput');
        if (displayNameInput) displayNameInput.value = user.fullName || user.username;
        if (emailInput) emailInput.value = user.email;
        
        // Load performance chart
        loadPerformanceChart();
        
        // Load quiz history
        await loadQuizHistory(user.email);
        
        // Load achievements
        loadAchievements(user);
        
        // Load settings
        await loadUserSettings(user.email);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        throw error;
    }
}

// Format time from seconds to readable format
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Load quiz history
async function loadQuizHistory(userId) {
    try {
        const history = await dbManager.getUserQuizHistory(userId);
        
        // Update the history table if it exists
        const historyTable = document.querySelector('.history-table tbody');
        if (historyTable && history.length > 0) {
            historyTable.innerHTML = history.map(item => `
                <tr>
                    <td>${item.quizName}</td>
                    <td><span class="category-badge ${item.category.toLowerCase()}">${item.category}</span></td>
                    <td><span class="score-badge">${item.score}%</span></td>
                    <td>${formatTime(item.timeSpent)}</td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td><button class="btn-small" onclick="retakeQuiz('${item.quizName}')">Retake</button></td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading quiz history:', error);
    }
}

// Load achievements
function loadAchievements(user) {
    const badgesGrid = document.querySelector('.badges-grid');
    if (!badgesGrid) return;
    
    const achievements = [
        {
            id: 'quick-learner',
            title: 'Quick Learner',
            description: 'Complete 10 quizzes in one week',
            icon: 'fas fa-bolt',
            earned: (user.totalQuizzes || 0) >= 10,
            progress: user.totalQuizzes || 0
        },
        {
            id: 'perfect-score',
            title: 'Perfect Score',
            description: 'Score 100% on any quiz',
            icon: 'fas fa-star',
            earned: (user.averageScore || 0) >= 100,
            progress: user.averageScore >= 100 ? 1 : 0
        },
        {
            id: 'streak-master',
            title: 'Streak Master',
            description: '7-day quiz streak',
            icon: 'fas fa-fire',
            earned: (user.streak || 0) >= 7,
            progress: user.streak || 0
        },
        {
            id: 'quiz-master',
            title: 'Quiz Master',
            description: 'Complete 50 quizzes',
            icon: 'fas fa-crown',
            earned: (user.totalQuizzes || 0) >= 50,
            progress: Math.min((user.totalQuizzes || 0), 50)
        },
        {
            id: 'speed-demon',
            title: 'Speed Demon',
            description: 'Complete quiz in under 5 minutes',
            icon: 'fas fa-brain',
            earned: false,
            progress: 0
        },
        {
            id: 'global-champion',
            title: 'Global Champion',
            description: 'Reach #1 on leaderboard',
            icon: 'fas fa-globe',
            earned: (user.rank || 999) === 1,
            progress: user.rank === 1 ? 1 : 0
        }
    ];
    
    badgesGrid.innerHTML = achievements.map(achievement => `
        <div class="badge-card ${achievement.earned ? 'earned' : 'locked'}">
            <div class="badge-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
            ${!achievement.earned && achievement.progress > 0 ? 
                `<span class="progress-text">${achievement.progress}/${achievement.id === 'quiz-master' ? '50' : '1'}</span>` : ''}
        </div>
    `).join('');
}

// Load user settings
async function loadUserSettings(userId) {
    try {
        const settings = await dbManager.getUserSettings(userId);
        
        if (settings) {
            const emailNotifications = document.getElementById('emailNotifications');
            const quizReminders = document.getElementById('quizReminders');
            const achievementAlerts = document.getElementById('achievementAlerts');
            const profileVisibility = document.getElementById('profileVisibility');
            const showOnLeaderboard = document.getElementById('showOnLeaderboard');
            const allowMessages = document.getElementById('allowMessages');
            
            if (emailNotifications) emailNotifications.checked = settings.emailNotifications !== false;
            if (quizReminders) quizReminders.checked = settings.quizReminders !== false;
            if (achievementAlerts) achievementAlerts.checked = settings.achievementAlerts !== false;
            if (profileVisibility) profileVisibility.value = settings.profileVisibility || 'public';
            if (showOnLeaderboard) showOnLeaderboard.checked = settings.showOnLeaderboard !== false;
            if (allowMessages) allowMessages.checked = settings.allowMessages !== false;
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Initialize performance chart
function loadPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const chartCtx = ctx.getContext('2d');
    
    // Sample data - in real app, you would fetch this from database
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Average Score',
            data: [65, 70, 75, 78, 80, 78],
            borderColor: '#4A6FFF',
            backgroundColor: 'rgba(74, 111, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#4A6FFF',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
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
    };
    
    // Destroy existing chart if it exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Create new chart
    ctx.chart = new Chart(chartCtx, config);
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabName = this.getAttribute('data-tab') || 
                           this.textContent.toLowerCase().includes('overview') ? 'overview' :
                           this.textContent.toLowerCase().includes('history') ? 'history' :
                           this.textContent.toLowerCase().includes('achievements') ? 'achievements' :
                           this.textContent.toLowerCase().includes('settings') ? 'settings' : 'overview';
            
            const tabContent = document.getElementById(`${tabName}Tab`);
            if (tabContent) {
                tabContent.classList.add('active');
                
                // Refresh chart if it's overview tab
                if (tabName === 'overview') {
                    setTimeout(() => {
                        loadPerformanceChart();
                    }, 100);
                }
            }
        });
    });
    
    // Profile update form
    const updateProfileBtn = document.querySelector('button[onclick="updateProfile()"]');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', updateProfile);
    }
    
    // Password change form
    const changePasswordBtn = document.querySelector('button[onclick="changePassword()"]');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
    
    // Settings changes
    document.querySelectorAll('#settingsTab input, #settingsTab select').forEach(element => {
        element.addEventListener('change', saveSettings);
    });
    
    // Avatar change
    const avatarEditBtn = document.querySelector('.avatar-edit');
    if (avatarEditBtn) {
        avatarEditBtn.addEventListener('click', changeAvatar);
    }
}

// Update profile information
async function updateProfile() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const displayName = document.getElementById('displayName')?.value;
        const email = document.getElementById('userEmailInput')?.value;
        
        if (!displayName || !email) {
            alert('Please fill in all fields');
            return;
        }
        
        const updates = {};
        
        // Only update if changed
        if (displayName !== currentUser.fullName) {
            updates.fullName = displayName;
        }
        
        if (email !== currentUser.email) {
            // Email change requires verification
            if (!confirm('Are you sure you want to change your email? You will need to verify the new email.')) {
                return;
            }
            updates.email = email;
        }
        
        if (Object.keys(updates).length > 0) {
            const updatedUser = await dbManager.updateUser(currentUser.email, updates);
            
            // Update session storage with new email if changed
            if (updates.email) {
                updatedUser.email = updates.email;
            }
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Reload profile data
            await loadUserProfile(updatedUser.email);
            
            alert('Profile updated successfully!');
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
    }
}

// Change password
async function changePassword() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }
        
        // Note: In production, you should verify current password first
        // For this demo, we'll just update it
        const updates = { password: newPassword };
        await dbManager.updateUser(currentUser.email, updates);
        
        alert('Password changed successfully!');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password: ' + error.message);
    }
}

// Save settings
async function saveSettings() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const settings = {
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            quizReminders: document.getElementById('quizReminders')?.checked || false,
            achievementAlerts: document.getElementById('achievementAlerts')?.checked || false,
            profileVisibility: document.getElementById('profileVisibility')?.value || 'public',
            showOnLeaderboard: document.getElementById('showOnLeaderboard')?.checked || false,
            allowMessages: document.getElementById('allowMessages')?.checked || false
        };
        
        await dbManager.updateUserSettings(currentUser.email, settings);
        
        // Show save confirmation
        const saveBtn = document.querySelector('#settingsTab .btn');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Change avatar (placeholder)
function changeAvatar() {
    alert('Avatar change functionality would be implemented here. In a real app, this would allow you to upload a profile picture.');
}

// Update header based on login state
function updateHeader() {
    const loginBtn = document.getElementById('loginBtn');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser && loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.fullName || currentUser.username}`;
        loginBtn.href = 'profile.html';
    }
}

// Retake quiz function
function retakeQuiz(quizName) {
    alert(`Redirecting to ${quizName} quiz...`);
    // In a real app, this would redirect to the quiz page
    // window.location.href = `quiz.html?quiz=${encodeURIComponent(quizName)}`;
}

// Make functions available globally
window.switchTab = function(tabName) {
    const btn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`) ||
                document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (btn) btn.click();
};

window.changeAvatar = changeAvatar;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.retakeQuiz = retakeQuiz;