// ============================================
// AUTHENTICATION MANAGER
// Handles user login, registration, and session management
// ============================================

class AuthManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.isLoggedIn = false;
    }

    // Load users from localStorage
    loadUsers() {
        try {
            const users = localStorage.getItem('quizzzy_users');
            if (users) {
                return JSON.parse(users);
            }
        } catch (e) {
            console.error('Error loading users:', e);
        }

        // Return demo users if none exist
        return this.createDemoUsers();
    }

    // Create demo users
    createDemoUsers() {
        const demoUsers = [
            {
                id: 'user-1',
                firstName: 'John',
                lastName: 'Smith',
                email: 'teacher@quizzzy.com',
                password: 'password123',
                role: 'teacher',
                bio: 'Experienced mathematics teacher with 10+ years of experience.',
                profilePic: '',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                level: 'Advanced',
                quizzesTaken: 0,
                averageScore: 0,
                notifications: [],
                isActive: true
            },
            {
                id: 'user-2',
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'student@quizzzy.com',
                password: 'password123',
                role: 'student',
                bio: 'Computer Science student passionate about learning.',
                profilePic: '',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                level: 'Intermediate',
                quizzesTaken: 15,
                averageScore: 85,
                notifications: [],
                isActive: true
            },
            {
                id: 'user-3',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@quizzzy.com',
                password: 'password123',
                role: 'admin',
                bio: 'System administrator',
                profilePic: '',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                level: 'Expert',
                quizzesTaken: 0,
                averageScore: 0,
                notifications: [],
                isActive: true
            }
        ];

        // Save demo users to localStorage
        localStorage.setItem('quizzzy_users', JSON.stringify(demoUsers));
        return demoUsers;
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('quizzzy_users', JSON.stringify(this.users));
    }

    // Signup a new user
    signup(firstName, lastName, email, password, role, bio = '') {
        // Check if user already exists
        if (this.users.find(user => user.email === email)) {
            alert('User with this email already exists!');
            return null;
        }

        // Create new user object
        const newUser = {
            id: 'user-' + Date.now(),
            firstName,
            lastName,
            email,
            password, // In production, this should be hashed
            role,
            bio,
            profilePic: '',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            level: role === 'student' ? 'Beginner' : 'N/A',
            quizzesTaken: 0,
            averageScore: 0,
            notifications: [],
            isActive: true
        };

        // Add to users array
        this.users.push(newUser);
        this.saveUsers();

        // Set as current user
        this.currentUser = newUser;
        this.isLoggedIn = true;

        // Show success message
        alert(`Welcome to Quizzzy, ${firstName}! Your account has been created successfully.`);

        return newUser;
    }

    // Login user
    login(email, password) {
        const user = this.users.find(u => 
            u.email === email && u.password === password && u.isActive
        );

        if (user) {
            // Update last active time
            user.lastActive = new Date().toISOString();
            this.saveUsers();

            // Set as current user
            this.currentUser = user;
            this.isLoggedIn = true;

            // Show welcome message
            console.log(`Welcome back, ${user.firstName}!`);

            return user;
        }

        return null;
    }

    // Logout user
    logout() {
        if (this.currentUser) {
            console.log(`Goodbye, ${this.currentUser.firstName}!`);
        }
        
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Clear session data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        
        return true;
    }

    // Get current user
    getCurrentUser() {
        if (!this.currentUser) {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.isLoggedIn = true;
            }
        }
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        if (!this.isLoggedIn) {
            const storedUser = localStorage.getItem('currentUser');
            const storedLogin = localStorage.getItem('isLoggedIn');
            
            if (storedUser && storedLogin === 'true') {
                this.currentUser = JSON.parse(storedUser);
                this.isLoggedIn = true;
            }
        }
        
        return this.isLoggedIn;
    }

    // Update user profile
    updateProfile(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Update user data
            this.users[userIndex] = {
                ...this.users[userIndex],
                ...updates,
                lastActive: new Date().toISOString()
            };

            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = this.users[userIndex];
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            this.saveUsers();
            return this.users[userIndex];
        }

        return null;
    }

    // Get user by ID
    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    }

    // Get all users by role
    getUsersByRole(role) {
        return this.users.filter(u => u.role === role);
    }

    // Get all students
    getAllStudents() {
        return this.getUsersByRole('student');
    }

    // Get all teachers
    getAllTeachers() {
        return this.users.filter(u => u.role === 'teacher' || u.role === 'admin');
    }

    // Update user role (admin only)
    updateUserRole(userId, newRole) {
        const user = this.getUserById(userId);
        
        if (user) {
            user.role = newRole;
            user.lastActive = new Date().toISOString();
            this.saveUsers();
            
            // Update current user if needed
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser.role = newRole;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            return user;
        }
        
        return null;
    }

    // Add notification to user
    addNotification(userId, notification) {
        const user = this.getUserById(userId);
        
        if (user) {
            if (!user.notifications) {
                user.notifications = [];
            }
            
            user.notifications.unshift({
                id: 'notif-' + Date.now(),
                ...notification,
                read: false,
                timestamp: new Date().toISOString()
            });
            
            // Keep only latest 20 notifications
            if (user.notifications.length > 20) {
                user.notifications = user.notifications.slice(0, 20);
            }
            
            this.saveUsers();
            return true;
        }
        
        return false;
    }

    // Mark notification as read
    markNotificationAsRead(userId, notificationId) {
        const user = this.getUserById(userId);
        
        if (user && user.notifications) {
            const notification = user.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                this.saveUsers();
                return true;
            }
        }
        
        return false;
    }

    // Clear all notifications
    clearNotifications(userId) {
        const user = this.getUserById(userId);
        
        if (user) {
            user.notifications = [];
            this.saveUsers();
            return true;
        }
        
        return false;
    }

    // Search users
    searchUsers(query) {
        const searchTerm = query.toLowerCase();
        
        return this.users.filter(user => 
            user.isActive && (
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.bio.toLowerCase().includes(searchTerm)
            )
        );
    }

    // Get user statistics
    getUserStats(userId) {
        const user = this.getUserById(userId);
        
        if (!user) return null;
        
        const stats = {
            totalQuizzesTaken: user.quizzesTaken || 0,
            averageScore: user.averageScore || 0,
            level: user.level || 'Beginner',
            joinDate: new Date(user.createdAt).toLocaleDateString(),
            lastActive: new Date(user.lastActive).toLocaleDateString(),
            daysActive: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
        };
        
        return stats;
    }

    // Get active users count
    getActiveUsersCount() {
        return this.users.filter(u => u.isActive).length;
    }

    // Get new users this month
    getNewUsersThisMonth() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.users.filter(user => {
            const userDate = new Date(user.createdAt);
            return userDate.getMonth() === currentMonth && 
                   userDate.getFullYear() === currentYear;
        }).length;
    }
}