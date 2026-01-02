// initData.js - Initialize sample data
import dbManager from './database.js';

async function initializeSampleData() {
    try {
        await dbManager.init();
        
        // Check if sample data already exists
        const existingUsers = await dbManager.getAllUsers();
        if (existingUsers.length > 0) {
            console.log('Sample data already exists');
            return;
        }

        // Create sample users
        const sampleUsers = [
            {
                email: 'john.doe@example.com',
                username: 'johndoe',
                fullName: 'John Doe',
                password: 'password123',
                avatar: '../img/avatar.png',
                totalQuizzes: 42,
                averageScore: 78,
                totalTime: 75000, // seconds
                streak: 3,
                rank: 15,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                email: 'jane.smith@example.com',
                username: 'janesmith',
                fullName: 'Jane Smith',
                password: 'password123',
                avatar: '../img/avatar2.png',
                totalQuizzes: 28,
                averageScore: 85,
                totalTime: 50000,
                streak: 7,
                rank: 8,
                createdAt: '2024-02-10T14:20:00Z'
            },
            {
                email: 'bob.wilson@example.com',
                username: 'bobwilson',
                fullName: 'Bob Wilson',
                password: 'password123',
                avatar: '../img/avatar3.png',
                totalQuizzes: 15,
                averageScore: 65,
                totalTime: 25000,
                streak: 1,
                rank: 45,
                createdAt: '2024-03-05T09:15:00Z'
            }
        ];

        // Add sample users
        for (const user of sampleUsers) {
            await dbManager.createUser(user);
        }

        // Sample quiz results for John Doe
        const sampleQuizResults = [
            {
                userId: 'john.doe@example.com',
                quizName: 'HTML5 Fundamentals',
                category: 'HTML5',
                score: 85,
                timeSpent: 1200, // 20 minutes
                totalQuestions: 20,
                correctAnswers: 17,
                details: {
                    topics: ['Semantic HTML', 'Forms', 'Media', 'APIs']
                }
            },
            {
                userId: 'john.doe@example.com',
                quizName: 'CSS Layout Mastery',
                category: 'CSS3',
                score: 92,
                timeSpent: 900, // 15 minutes
                totalQuestions: 15,
                correctAnswers: 14,
                details: {
                    topics: ['Flexbox', 'Grid', 'Positioning', 'Responsive Design']
                }
            },
            {
                userId: 'john.doe@example.com',
                quizName: 'JavaScript Basics',
                category: 'JavaScript',
                score: 76,
                timeSpent: 1500, // 25 minutes
                totalQuestions: 25,
                correctAnswers: 19,
                details: {
                    topics: ['Variables', 'Functions', 'Arrays', 'Objects']
                }
            },
            {
                userId: 'john.doe@example.com',
                quizName: 'React Fundamentals',
                category: 'React.js',
                score: 82,
                timeSpent: 1800, // 30 minutes
                totalQuestions: 20,
                correctAnswers: 16,
                details: {
                    topics: ['Components', 'State', 'Props', 'Hooks']
                }
            },
            {
                userId: 'john.doe@example.com',
                quizName: 'Advanced JavaScript',
                category: 'JavaScript',
                score: 68,
                timeSpent: 2100, // 35 minutes
                totalQuestions: 30,
                correctAnswers: 20,
                details: {
                    topics: ['Closures', 'Promises', 'Async/Await', 'Prototypes']
                }
            }
        ];

        // Add sample quiz results with delays to simulate different dates
        const dates = [
            '2024-03-15T10:30:00Z',
            '2024-03-14T14:45:00Z',
            '2024-03-13T09:20:00Z',
            '2024-03-12T16:10:00Z',
            '2024-03-11T11:30:00Z'
        ];

        for (let i = 0; i < sampleQuizResults.length; i++) {
            const result = sampleQuizResults[i];
            result.date = dates[i];
            await dbManager.addQuizResult(result);
        }

        // Initialize achievements for John Doe
        const sampleAchievements = [
            {
                id: 'quick_learner_john',
                userId: 'john.doe@example.com',
                name: 'Quick Learner',
                description: 'Complete 10 quizzes in one week',
                icon: 'fas fa-bolt',
                earnedDate: '2024-03-14T10:30:00Z'
            },
            {
                id: 'perfect_score_john',
                userId: 'john.doe@example.com',
                name: 'Perfect Score',
                description: 'Score 100% on any quiz',
                icon: 'fas fa-star',
                earnedDate: '2024-03-10T14:20:00Z'
            },
            {
                id: 'category_expert_html_john',
                userId: 'john.doe@example.com',
                name: 'HTML Expert',
                description: 'Score 90%+ on HTML quizzes',
                icon: 'fab fa-html5',
                earnedDate: '2024-03-12T09:15:00Z'
            }
        ];

        for (const achievement of sampleAchievements) {
            await dbManager.addAchievement(achievement);
        }

        console.log('Sample data initialized successfully');
        
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize sample data on first load or when needed
    if (localStorage.getItem('sampleDataInitialized') !== 'true') {
        await initializeSampleData();
        localStorage.setItem('sampleDataInitialized', 'true');
    }
});

export { initializeSampleData };