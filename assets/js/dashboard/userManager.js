// ============================================
// USER MANAGER
// Handles user interface and user-related operations
// ============================================

class UserManager {
    constructor() {
        this.auth = new AuthManager();
        this.currentUser = this.auth.getCurrentUser();
    }

    // Initialize user interface
    initialize() {
        this.updateUserInterface();
        this.setupEventListeners();
        this.loadUserNotifications();
    }

    // Update user interface with current user data
    updateUserInterface() {
        if (!this.currentUser) return;

        // Update welcome message
        const welcomeUser = document.getElementById('welcome-user');
        const welcomeRole = document.getElementById('welcome-role');
        
        if (welcomeUser) {
            welcomeUser.textContent = `Welcome back, ${this.currentUser.firstName}!`;
        }
        
        if (welcomeRole) {
            const roleMap = {
                'student': 'Student Dashboard',
                'teacher': 'Teacher Dashboard',
                'admin': 'Admin Dashboard'
            };
            welcomeRole.textContent = roleMap[this.currentUser.role] || 'Dashboard';
        }

        // Update user summary in sidebar
        this.updateUserSummary();

        // Update navigation based on role
        this.updateNavigation();

        // Update stats badges
        this.updateBadges();
    }

    // Update user summary in sidebar
    updateUserSummary() {
        const userSummary = document.getElementById('user-summary');
        
        if (!userSummary || !this.currentUser) return;

        const initials = (this.currentUser.firstName[0] + this.currentUser.lastName[0]).toUpperCase();
        const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        
        userSummary.innerHTML = `
            <div class="user-profile-card">
                <div class="user-avatar" id="user-avatar">
                    ${this.currentUser.profilePic ? 
                        `<img src="${this.currentUser.profilePic}" alt="${fullName}">` : 
                        initials
                    }
                </div>
                <div class="user-info-mini">
                    <h4>${fullName}</h4>
                    <p>${this.currentUser.email}</p>
                    <span class="user-role-badge ${this.currentUser.role}">
                        ${this.currentUser.role.toUpperCase()}
                    </span>
                </div>
            </div>
        `;
    }

    // Update navigation based on user role
    updateNavigation() {
        // Hide students menu for non-teachers
        const studentsNav = document.getElementById('students-nav-item');
        if (studentsNav && this.currentUser.role === 'student') {
            studentsNav.style.display = 'none';
        }

        // Update create button text based on role
        const createBtn = document.getElementById('create-quiz-btn');
        if (createBtn) {
            if (this.currentUser.role === 'student') {
                createBtn.innerHTML = '<i class="fas fa-search"></i><span>Find Quiz</span>';
            }
        }
    }

    // Update navigation badges
    updateBadges() {
        // Update quizzes count
        const quizzesCount = document.getElementById('my-quizzes-count');
        if (quizzesCount) {
            const quizManager = new QuizManager();
            const userQuizzes = quizManager.getQuizzesByUser(this.currentUser.id);
            quizzesCount.textContent = userQuizzes.length;
        }

        // Update students count (for teachers)
        const studentsCount = document.getElementById('students-count');
        if (studentsCount && (this.currentUser.role === 'teacher' || this.currentUser.role === 'admin')) {
            const students = this.auth.getAllStudents();
            studentsCount.textContent = students.length;
        }
    }

    // Load user notifications
    loadUserNotifications() {
        const notificationCount = document.getElementById('notification-count');
        const notifications = this.currentUser.notifications || [];
        
        if (notificationCount) {
            const unreadCount = notifications.filter(n => !n.read).length;
            notificationCount.textContent = unreadCount;
            notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Notifications
        const notificationsBtn = document.getElementById('notifications');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    // Handle search
    handleSearch(query) {
        if (!query.trim()) {
            // Clear search results
            this.clearSearchResults();
            return;
        }

        const searchResults = {
            users: this.auth.searchUsers(query),
            quizzes: [] // Will be populated by quiz manager
        };

        // Show search results
        this.displaySearchResults(searchResults);
    }

    // Display search results
    displaySearchResults(results) {
        const dashboardContent = document.getElementById('dashboard-content');
        const viewContent = document.getElementById('view-content');
        
        if (!dashboardContent) return;

        let resultsHTML = `
            <div class="search-results">
                <h3 class="section-title">Search Results</h3>
                <p class="text-muted mb-3">Found ${results.users.length + results.quizzes.length} results</p>
        `;

        // Display user results
        if (results.users.length > 0) {
            resultsHTML += `
                <div class="card mb-3">
                    <div class="card-header">
                        <h4><i class="fas fa-users"></i> Users (${results.users.length})</h4>
                    </div>
                    <div class="card-body">
                        <div class="users-grid">
            `;

            results.users.forEach(user => {
                const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
                resultsHTML += `
                    <div class="user-result">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                            <h5>${user.firstName} ${user.lastName}</h5>
                            <p class="text-muted">${user.email}</p>
                            <span class="user-role-badge ${user.role}">${user.role}</span>
                        </div>
                    </div>
                `;
            });

            resultsHTML += `
                        </div>
                    </div>
                </div>
            `;
        }

        // Display quiz results
        if (results.quizzes.length > 0) {
            resultsHTML += `
                <div class="card">
                    <div class="card-header">
                        <h4><i class="fas fa-question-circle"></i> Quizzes (${results.quizzes.length})</h4>
                    </div>
                    <div class="card-body">
                        <div class="quizzes-grid">
            `;

            results.quizzes.forEach(quiz => {
                resultsHTML += `
                    <div class="quiz-result">
                        <h5>${quiz.title}</h5>
                        <p class="text-muted">${quiz.category} • ${quiz.questions} questions</p>
                        <span class="badge ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span>
                    </div>
                `;
            });

            resultsHTML += `
                        </div>
                    </div>
                </div>
            `;
        }

        resultsHTML += `</div>`;

        // Update content area
        dashboardContent.innerHTML = resultsHTML;
        
        if (viewContent) {
            viewContent.style.display = 'none';
        }
    }

    // Clear search results
    clearSearchResults() {
        // Reload default dashboard view
        const app = new QuizPlatform();
        app.loadDashboardView();
    }

    // Show notifications modal
    showNotifications() {
        const notifications = this.currentUser.notifications || [];
        
        let modalHTML = `
            <div class="modal-overlay" id="notifications-modal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-bell"></i> Notifications</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
        `;

        if (notifications.length === 0) {
            modalHTML += `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h4>No notifications</h4>
                    <p>You're all caught up!</p>
                </div>
            `;
        } else {
            modalHTML += `
                <div class="notifications-list">
            `;

            notifications.forEach(notification => {
                const iconMap = {
                    'quiz': 'fas fa-question-circle',
                    'message': 'fas fa-envelope',
                    'system': 'fas fa-cog',
                    'achievement': 'fas fa-trophy',
                    'warning': 'fas fa-exclamation-triangle'
                };

                modalHTML += `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                        <div class="notification-icon">
                            <i class="${iconMap[notification.type] || 'fas fa-info-circle'}"></i>
                        </div>
                        <div class="notification-content">
                            <h5>${notification.title}</h5>
                            <p>${notification.message}</p>
                            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                        </div>
                        ${!notification.read ? '<div class="notification-dot"></div>' : ''}
                    </div>
                `;
            });

            modalHTML += `
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="userManager.markAllAsRead()">Mark all as read</button>
                    <button class="btn-danger" onclick="userManager.clearAllNotifications()">Clear all</button>
                </div>
            `;
        }

        modalHTML += `
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        setTimeout(() => {
            const modal = document.getElementById('notifications-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        }, 10);
    }

    // Mark all notifications as read
    markAllAsRead() {
        this.currentUser.notifications?.forEach(notification => {
            notification.read = true;
        });
        
        this.auth.saveUsers();
        this.loadUserNotifications();
        
        // Close modal
        const modal = document.getElementById('notifications-modal');
        if (modal) {
            modal.remove();
        }
        
        this.showToast('All notifications marked as read');
    }

    // Clear all notifications
    clearAllNotifications() {
        this.currentUser.notifications = [];
        this.auth.saveUsers();
        this.loadUserNotifications();
        
        // Close modal
        const modal = document.getElementById('notifications-modal');
        if (modal) {
            modal.remove();
        }
        
        this.showToast('All notifications cleared');
    }

    // Format timestamp
    formatTime(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diff = now - date;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Logout user
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.auth.logout();
            window.location.href = 'login.html';
        }
    }

    // Load profile settings view
    loadProfileSettings() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        // Hide dashboard, show view content
        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = this.getProfileSettingsHTML();
    }

    // Get profile settings HTML
    getProfileSettingsHTML() {
        return `
            <div class="profile-settings">
                <div class="profile-header">
                    <div class="profile-avatar-large" id="profile-avatar-large">
                        ${this.currentUser.profilePic ? 
                            `<img src="${this.currentUser.profilePic}" alt="${this.currentUser.firstName}">` : 
                            (this.currentUser.firstName[0] + this.currentUser.lastName[0]).toUpperCase()
                        }
                        <div class="avatar-upload" onclick="userManager.uploadProfilePicture()">
                            <i class="fas fa-camera"></i> Change Photo
                        </div>
                    </div>
                    <div class="profile-info">
                        <h2>${this.currentUser.firstName} ${this.currentUser.lastName}</h2>
                        <p class="text-muted">${this.currentUser.email}</p>
                        <span class="user-role-badge ${this.currentUser.role}">${this.currentUser.role.toUpperCase()}</span>
                        <p class="mt-2">${this.currentUser.bio || 'No bio added yet.'}</p>
                    </div>
                </div>

                <form class="settings-form" id="profile-form" onsubmit="userManager.updateProfile(event)">
                    <div class="form-section">
                        <h3 class="section-title"><i class="fas fa-user"></i> Personal Information</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="profile-first-name">First Name</label>
                                <input type="text" id="profile-first-name" value="${this.currentUser.firstName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="profile-last-name">Last Name</label>
                                <input type="text" id="profile-last-name" value="${this.currentUser.lastName}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-email">Email Address</label>
                            <input type="email" id="profile-email" value="${this.currentUser.email}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-bio">Bio</label>
                            <textarea id="profile-bio" rows="3">${this.currentUser.bio || ''}</textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3 class="section-title"><i class="fas fa-lock"></i> Security</h3>
                        
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input type="password" id="current-password" placeholder="Enter current password">
                        </div>
                        
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <input type="password" id="new-password" placeholder="Enter new password">
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-new-password">Confirm New Password</label>
                            <input type="password" id="confirm-new-password" placeholder="Confirm new password">
                        </div>
                    </div>

                    <div class="form-section">
                        <h3 class="section-title"><i class="fas fa-cog"></i> Preferences</h3>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="email-notifications" checked>
                                <span>Email notifications</span>
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="push-notifications" checked>
                                <span>Push notifications</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="userManager.cancelProfileEdit()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Upload profile picture
    uploadProfilePicture() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Read file as data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Update profile picture
                    this.currentUser.profilePic = e.target.result;
                    this.auth.updateProfile(this.currentUser.id, {
                        profilePic: e.target.result
                    });
                    
                    // Update UI
                    this.updateUserSummary();
                    
                    // Update profile settings view if open
                    const profileAvatar = document.getElementById('profile-avatar-large');
                    if (profileAvatar) {
                        profileAvatar.innerHTML = `
                            <img src="${e.target.result}" alt="${this.currentUser.firstName}">
                            <div class="avatar-upload" onclick="userManager.uploadProfilePicture()">
                                <i class="fas fa-camera"></i> Change Photo
                            </div>
                        `;
                    }
                    
                    this.showToast('Profile picture updated successfully');
                };
                reader.readAsDataURL(file);
            }
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    // Update profile
    updateProfile(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('profile-first-name').value;
        const lastName = document.getElementById('profile-last-name').value;
        const email = document.getElementById('profile-email').value;
        const bio = document.getElementById('profile-bio').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        // Validate email
        if (email !== this.currentUser.email) {
            const existingUser = this.auth.users.find(u => u.email === email && u.id !== this.currentUser.id);
            if (existingUser) {
                alert('This email is already in use by another account');
                return;
            }
        }
        
        // Validate password change
        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            if (!currentPassword) {
                alert('Please enter your current password to change it');
                return;
            }
            
            if (currentPassword !== this.currentUser.password) {
                alert('Current password is incorrect');
                return;
            }
        }
        
        // Prepare updates
        const updates = {
            firstName,
            lastName,
            email,
            bio
        };
        
        // Add password if changed
        if (newPassword && newPassword === confirmPassword) {
            updates.password = newPassword;
        }
        
        // Update profile
        const updatedUser = this.auth.updateProfile(this.currentUser.id, updates);
        
        if (updatedUser) {
            this.currentUser = updatedUser;
            this.updateUserInterface();
            this.showToast('Profile updated successfully');
            
            // Go back to dashboard
            this.cancelProfileEdit();
        }
    }

    // Cancel profile edit
    cancelProfileEdit() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (viewContent && dashboardContent) {
            viewContent.style.display = 'none';
            dashboardContent.style.display = 'block';
        }
    }

    // Load students view (for teachers)
    loadStudentsView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        // Check if user is teacher or admin
        if (this.currentUser.role === 'student') {
            this.showToast('Access denied. This page is for teachers only.', 'error');
            return;
        }

        // Hide dashboard, show view content
        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = this.getStudentsViewHTML();
    }

    // Get students view HTML
    getStudentsViewHTML() {
        const students = this.auth.getAllStudents();
        
        let html = `
            <div class="students-management">
                <div class="management-header">
                    <h2><i class="fas fa-users"></i> Students Management</h2>
                    <div class="management-actions">
                        <button class="btn-secondary" onclick="userManager.exportStudents()">
                            <i class="fas fa-download"></i> Export
                        </button>
                        ${this.currentUser.role === 'admin' ? `
                            <button class="btn-primary" onclick="userManager.showAddStudentModal()">
                                <i class="fas fa-user-plus"></i> Add Student
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="stats-grid mb-3">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-value">${students.length}</div>
                        <div class="stat-title">Total Students</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-value">${this.getAverageStudentScore()}%</div>
                        <div class="stat-title">Average Score</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-user-check"></i></div>
                        <div class="stat-value">${this.getActiveStudentsCount()}</div>
                        <div class="stat-title">Active Today</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-graduation-cap"></i></div>
                        <div class="stat-value">${this.getStudentsByLevel('Advanced')}</div>
                        <div class="stat-title">Advanced Level</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-list"></i> All Students</h3>
                        <div class="header-actions">
                            <div class="search-box" style="width: 250px;">
                                <i class="fas fa-search"></i>
                                <input type="text" id="search-students" placeholder="Search students...">
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="students-table-container">
                            <table class="students-table" id="students-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Level</th>
                                        <th>Quizzes Taken</th>
                                        <th>Average Score</th>
                                        <th>Last Active</th>
                                        <th>Status</th>
                                        ${this.currentUser.role === 'admin' ? '<th>Actions</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody id="students-table-body">
        `;

        students.forEach(student => {
            const lastActive = new Date(student.lastActive);
            const now = new Date();
            const hoursDiff = Math.floor((now - lastActive) / (1000 * 60 * 60));
            
            let status = 'offline';
            let statusText = 'Offline';
            
            if (hoursDiff < 1) {
                status = 'online';
                statusText = 'Online';
            } else if (hoursDiff < 24) {
                status = 'idle';
                statusText = 'Recently';
            }
            
            html += `
                <tr>
                    <td>
                        <div class="flex items-center gap-2">
                            <div class="student-avatar">
                                ${student.profilePic ? 
                                    `<img src="${student.profilePic}" alt="${student.firstName}">` : 
                                    (student.firstName[0] + student.lastName[0]).toUpperCase()
                                }
                            </div>
                            <div>
                                <div class="student-name">${student.firstName} ${student.lastName}</div>
                                <div class="student-email">${student.email}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="student-level">${student.level}</span></td>
                    <td>${student.quizzesTaken || 0}</td>
                    <td><strong>${student.averageScore || 0}%</strong></td>
                    <td>${lastActive.toLocaleDateString()}</td>
                    <td>
                        <div class="student-status">
                            <div class="status-dot ${status}"></div>
                            <span>${statusText}</span>
                        </div>
                    </td>
            `;
            
            if (this.currentUser.role === 'admin') {
                html += `
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="userManager.viewStudentDetails('${student.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="userManager.sendMessage('${student.id}')" title="Send Message">
                                <i class="fas fa-envelope"></i>
                            </button>
                            <button class="btn-icon" onclick="userManager.promoteToTeacher('${student.id}')" title="Promote to Teacher">
                                <i class="fas fa-user-graduate"></i>
                            </button>
                        </div>
                    </td>
                `;
            }
            
            html += `</tr>`;
        });

        html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Add search functionality
                document.getElementById('search-students').addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const rows = document.querySelectorAll('#students-table tbody tr');
                    
                    rows.forEach(row => {
                        const name = row.querySelector('.student-name').textContent.toLowerCase();
                        const email = row.querySelector('.student-email').textContent.toLowerCase();
                        
                        if (name.includes(searchTerm) || email.includes(searchTerm)) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            </script>
        `;

        return html;
    }

    // Get average student score
    getAverageStudentScore() {
        const students = this.auth.getAllStudents();
        if (students.length === 0) return 0;
        
        const total = students.reduce((sum, student) => sum + (student.averageScore || 0), 0);
        return Math.round(total / students.length);
    }

    // Get active students count (active in last 24 hours)
    getActiveStudentsCount() {
        const students = this.auth.getAllStudents();
        const now = new Date();
        
        return students.filter(student => {
            const lastActive = new Date(student.lastActive);
            const hoursDiff = Math.floor((now - lastActive) / (1000 * 60 * 60));
            return hoursDiff < 24;
        }).length;
    }

    // Get students by level
    getStudentsByLevel(level) {
        const students = this.auth.getAllStudents();
        return students.filter(student => student.level === level).length;
    }

    // Export students data
    exportStudents() {
        const students = this.auth.getAllStudents();
        
        // Create CSV content
        let csv = 'Name,Email,Level,Quizzes Taken,Average Score,Last Active,Status\n';
        students.forEach(student => {
            const lastActive = new Date(student.lastActive);
            const now = new Date();
            const hoursDiff = Math.floor((now - lastActive) / (1000 * 60 * 60));
            
            let status = 'Offline';
            if (hoursDiff < 1) status = 'Online';
            else if (hoursDiff < 24) status = 'Recently Active';
            
            csv += `"${student.firstName} ${student.lastName}",${student.email},${student.level},${student.quizzesTaken || 0},${student.averageScore || 0},${lastActive.toLocaleDateString()},${status}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizzzy-students-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Students data exported successfully');
    }

    // View student details
    viewStudentDetails(studentId) {
        const student = this.auth.getUserById(studentId);
        if (!student) return;

        let modalHTML = `
            <div class="modal-overlay" id="student-modal">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-graduate"></i> Student Details</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="student-profile">
                            <div class="profile-header">
                                <div class="profile-avatar-large">
                                    ${student.profilePic ? 
                                        `<img src="${student.profilePic}" alt="${student.firstName}">` : 
                                        (student.firstName[0] + student.lastName[0]).toUpperCase()
                                    }
                                </div>
                                <div class="profile-info">
                                    <h2>${student.firstName} ${student.lastName}</h2>
                                    <p class="text-muted">${student.email}</p>
                                    <span class="user-role-badge ${student.role}">${student.role.toUpperCase()}</span>
                                    <p class="mt-2">${student.bio || 'No bio available.'}</p>
                                </div>
                            </div>
                            
                            <div class="stats-grid mt-3">
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-graduation-cap"></i></div>
                                    <div class="stat-value">${student.level}</div>
                                    <div class="stat-title">Level</div>
                                </div>
                                
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-question-circle"></i></div>
                                    <div class="stat-value">${student.quizzesTaken || 0}</div>
                                    <div class="stat-title">Quizzes Taken</div>
                                </div>
                                
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                                    <div class="stat-value">${student.averageScore || 0}%</div>
                                    <div class="stat-title">Average Score</div>
                                </div>
                                
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                                    <div class="stat-value">${new Date(student.createdAt).toLocaleDateString()}</div>
                                    <div class="stat-title">Joined Date</div>
                                </div>
                            </div>
                            
                            <div class="form-actions mt-3">
                                <button class="btn-secondary" onclick="userManager.sendMessage('${student.id}')">
                                    <i class="fas fa-envelope"></i> Send Message
                                </button>
                                ${this.currentUser.role === 'admin' ? `
                                    <button class="btn-primary" onclick="userManager.promoteToTeacher('${student.id}')">
                                        <i class="fas fa-user-graduate"></i> Promote to Teacher
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('student-modal');
            if (modal) modal.style.display = 'flex';
        }, 10);
    }

    // Promote student to teacher
    promoteToTeacher(studentId) {
        if (confirm('Are you sure you want to promote this student to teacher? This action cannot be undone.')) {
            const updatedUser = this.auth.updateUserRole(studentId, 'teacher');
            
            if (updatedUser) {
                this.showToast(`${updatedUser.firstName} has been promoted to teacher`);
                
                // Close modal if open
                const modal = document.getElementById('student-modal');
                if (modal) modal.remove();
                
                // Refresh students view
                this.loadStudentsView();
            }
        }
    }

    // Send message to user
    sendMessage(userId) {
        const user = this.auth.getUserById(userId);
        if (!user) return;

        let modalHTML = `
            <div class="modal-overlay" id="message-modal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-envelope"></i> Send Message</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="message-form" onsubmit="userManager.sendMessageSubmit(event, '${userId}')">
                            <div class="form-group">
                                <label>To:</label>
                                <div class="recipient-info">
                                    <strong>${user.firstName} ${user.lastName}</strong>
                                    <span class="text-muted">(${user.email})</span>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="message-subject">Subject</label>
                                <input type="text" id="message-subject" placeholder="Enter message subject" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="message-content">Message</label>
                                <textarea id="message-content" rows="5" placeholder="Type your message here..." required></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                                <button type="submit" class="btn-primary">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('message-modal');
            if (modal) modal.style.display = 'flex';
        }, 10);
    }

    // Submit message form
    sendMessageSubmit(event, userId) {
        event.preventDefault();
        
        const subject = document.getElementById('message-subject').value;
        const content = document.getElementById('message-content').value;
        
        // Add notification to recipient
        const recipient = this.auth.getUserById(userId);
        if (recipient) {
            this.auth.addNotification(recipient.id, {
                type: 'message',
                title: `New message from ${this.currentUser.firstName}`,
                message: subject,
                content: content,
                senderId: this.currentUser.id
            });
            
            this.showToast(`Message sent to ${recipient.firstName}`);
        }
        
        // Close modal
        const modal = document.getElementById('message-modal');
        if (modal) modal.remove();
    }

    // Global instance
    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }
}

// Create global instance
window.userManager = UserManager.getInstance();