// js/database.js - Database Manager for IndexedDB
class DatabaseManager {
    constructor() {
        this.dbName = 'TechQuizDB';
        this.dbVersion = 2;
        this.db = null;
    }

    // Initialize the database
    async init() {
        return new Promise((resolve, reject) => {
            // Check if IndexedDB is supported
            if (!window.indexedDB) {
                reject('IndexedDB is not supported in this browser');
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Upgrading database to version:', event.newVersion);
                
                // Create users store if it doesn't exist
                if (!db.objectStoreNames.contains('users')) {
                    console.log('Creating users store');
                    const usersStore = db.createObjectStore('users', { keyPath: 'email' });
                    usersStore.createIndex('username', 'username', { unique: false });
                    usersStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Create quizHistory store
                if (!db.objectStoreNames.contains('quizHistory')) {
                    console.log('Creating quizHistory store');
                    const historyStore = db.createObjectStore('quizHistory', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    historyStore.createIndex('userId', 'userId', { unique: false });
                    historyStore.createIndex('date', 'date', { unique: false });
                    historyStore.createIndex('category', 'category', { unique: false });
                }

                // Create userSettings store
                if (!db.objectStoreNames.contains('userSettings')) {
                    console.log('Creating userSettings store');
                    const settingsStore = db.createObjectStore('userSettings', { 
                        keyPath: 'userId' 
                    });
                }
            };
        });
    }

    // User Management Methods
    async registerUser(userData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            // Check if user already exists
            const checkRequest = store.get(userData.email);
            
            checkRequest.onsuccess = () => {
                if (checkRequest.result) {
                    reject('User already exists with this email');
                    return;
                }
                
                // Add new user with default values
                const newUser = {
                    email: userData.email,
                    username: userData.fullName?.split(' ')[0] || userData.email.split('@')[0],
                    password: userData.password,
                    fullName: userData.fullName,
                    avatar: '../img/avatar.png',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    totalQuizzes: 0,
                    averageScore: 0,
                    totalTime: 0,
                    rank: 999,
                    streak: 0,
                    level: 1
                };
                
                const addRequest = store.add(newUser);

                addRequest.onsuccess = async () => {
                    try {
                        // Create default settings for the user
                        await this.createDefaultSettings(userData.email);
                        
                        // Return user without password
                        delete newUser.password;
                        resolve(newUser);
                    } catch (error) {
                        reject('Error creating user settings: ' + error);
                    }
                };

                addRequest.onerror = (event) => {
                    reject('Failed to register user: ' + event.target.error);
                };
            };

            checkRequest.onerror = (event) => {
                reject('Error checking user: ' + event.target.error);
            };
        });
    }

    async loginUser(email, password) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.get(email);

            request.onsuccess = () => {
                const user = request.result;
                if (!user) {
                    reject('User not found');
                    return;
                }

                if (user.password !== password) {
                    reject('Invalid password');
                    return;
                }

                // Update last login time
                user.lastLogin = new Date().toISOString();
                const updateRequest = store.put(user);
                
                updateRequest.onsuccess = () => {
                    // Remove password from returned data
                    const userWithoutPassword = { ...user };
                    delete userWithoutPassword.password;
                    resolve(userWithoutPassword);
                };

                updateRequest.onerror = (event) => {
                    reject('Error updating login time: ' + event.target.error);
                };
            };

            request.onerror = (event) => {
                reject('Login error: ' + event.target.error);
            };
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(email);

            request.onsuccess = () => {
                if (request.result) {
                    const user = { ...request.result };
                    delete user.password; // Remove password for security
                    resolve(user);
                } else {
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                reject('Error getting user: ' + event.target.error);
            };
        });
    }

    async updateUser(email, updates) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            const getRequest = store.get(email);
            
            getRequest.onsuccess = () => {
                const user = getRequest.result;
                if (!user) {
                    reject('User not found');
                    return;
                }

                // Update user data (except email and password)
                Object.keys(updates).forEach(key => {
                    if (key !== 'email' && key !== 'password') {
                        user[key] = updates[key];
                    }
                });

                const updateRequest = store.put(user);
                
                updateRequest.onsuccess = () => {
                    delete user.password;
                    resolve(user);
                };

                updateRequest.onerror = (event) => {
                    reject('Update error: ' + event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                reject('Error getting user: ' + event.target.error);
            };
        });
    }

    // Settings Management
    async createDefaultSettings(userId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['userSettings'], 'readwrite');
            const store = transaction.objectStore('userSettings');
            
            const settings = {
                userId: userId,
                emailNotifications: true,
                quizReminders: true,
                achievementAlerts: true,
                profileVisibility: 'public',
                showOnLeaderboard: true,
                allowMessages: true,
                theme: 'light'
            };

            const request = store.add(settings);

            request.onsuccess = () => resolve(settings);
            request.onerror = (event) => reject('Error creating settings: ' + event.target.error);
        });
    }

    async getUserSettings(userId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['userSettings'], 'readonly');
            const store = transaction.objectStore('userSettings');
            const request = store.get(userId);

            request.onsuccess = () => resolve(request.result || {});
            request.onerror = (event) => reject('Error getting settings: ' + event.target.error);
        });
    }

    async updateUserSettings(userId, updates) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['userSettings'], 'readwrite');
            const store = transaction.objectStore('userSettings');
            
            const getRequest = store.get(userId);

            getRequest.onsuccess = () => {
                const settings = getRequest.result || { userId: userId };
                Object.assign(settings, updates);

                const request = store.put(settings);
                
                request.onsuccess = () => resolve(settings);
                request.onerror = (event) => reject('Update error: ' + event.target.error);
            };

            getRequest.onerror = (event) => {
                reject('Error getting settings: ' + event.target.error);
            };
        });
    }

    // Quiz History Management
    async addQuizHistory(userId, quizData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['quizHistory', 'users'], 'readwrite');
            const historyStore = transaction.objectStore('quizHistory');
            const usersStore = transaction.objectStore('users');

            // Add to history
            const historyEntry = {
                userId: userId,
                quizName: quizData.quizName,
                category: quizData.category,
                score: quizData.score,
                timeSpent: quizData.timeSpent,
                totalQuestions: quizData.totalQuestions,
                correctAnswers: quizData.correctAnswers,
                date: new Date().toISOString()
            };

            const historyRequest = historyStore.add(historyEntry);

            // Update user stats
            const userRequest = usersStore.get(userId);

            userRequest.onsuccess = () => {
                const user = userRequest.result;
                if (user) {
                    user.totalQuizzes = (user.totalQuizzes || 0) + 1;
                    
                    // Update average score
                    const totalScore = (user.averageScore || 0) * (user.totalQuizzes - 1);
                    user.averageScore = Math.round((totalScore + quizData.score) / user.totalQuizzes);
                    
                    // Update total time
                    user.totalTime = (user.totalTime || 0) + quizData.timeSpent;
                    
                    // Update rank based on average score
                    if (user.averageScore > 80) user.rank = Math.floor(Math.random() * 50) + 1;
                    else if (user.averageScore > 60) user.rank = Math.floor(Math.random() * 100) + 51;
                    else user.rank = Math.floor(Math.random() * 200) + 151;
                    
                    const updateRequest = usersStore.put(user);
                    
                    updateRequest.onerror = (event) => {
                        console.error('Error updating user stats:', event.target.error);
                    };
                }
            };

            historyRequest.onsuccess = () => {
                resolve({ id: historyRequest.result, ...historyEntry });
            };
            
            historyRequest.onerror = (event) => {
                reject('Error adding history: ' + event.target.error);
            };
        });
    }

    async getUserQuizHistory(userId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['quizHistory'], 'readonly');
            const store = transaction.objectStore('quizHistory');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                const history = request.result.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                resolve(history);
            };

            request.onerror = (event) => {
                reject('Error getting history: ' + event.target.error);
            };
        });
    }

    async getAllUsers() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => {
                const users = request.result.map(user => {
                    const userCopy = { ...user };
                    delete userCopy.password;
                    return userCopy;
                });
                resolve(users);
            };

            request.onerror = (event) => {
                reject('Error getting users: ' + event.target.error);
            };
        });
    }

    async deleteUser(email) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }

            const transaction = this.db.transaction(['users', 'userSettings', 'quizHistory'], 'readwrite');
            const usersStore = transaction.objectStore('users');
            const settingsStore = transaction.objectStore('userSettings');
            const historyStore = transaction.objectStore('quizHistory');
            
            // Delete user
            const deleteUserRequest = usersStore.delete(email);
            
            // Delete user settings
            const deleteSettingsRequest = settingsStore.delete(email);
            
            // Delete user's quiz history
            const historyIndex = historyStore.index('userId');
            const clearHistoryRequest = historyIndex.openCursor(IDBKeyRange.only(email));
            
            clearHistoryRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            deleteUserRequest.onsuccess = () => {
                resolve(true);
            };

            deleteUserRequest.onerror = (event) => {
                reject('Error deleting user: ' + event.target.error);
            };
        });
    }
}

// Create a singleton instance
const dbManager = new DatabaseManager();

export default dbManager;