// ============================================
// QUIZZY PLATFORM - MAIN APPLICATION
// Orchestrates all components and manages views
// ============================================

class QuizPlatform {
    constructor() {
        this.auth = new AuthManager();
        this.userManager = UserManager.getInstance();
        this.quizManager = QuizManager.getInstance();
        this.currentView = 'dashboard';
        this.currentUser = this.auth.getCurrentUser();
    }

    // Initialize the platform
    initialize() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.updateUserInterface();
        this.loadDashboardView();
        this.setupNavigation();
    }

    // Setup event listeners
    setupEventListeners() {
        // Hamburger menu for mobile
        const hamburgerMenu = document.getElementById('hamburger-menu');
        const sidebar = document.querySelector('.sidebar');
        
        if (hamburgerMenu && sidebar) {
            hamburgerMenu.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const isSidebar = e.target.closest('.sidebar');
                const isHamburger = e.target.closest('#hamburger-menu');
                
                if (!isSidebar && !isHamburger && sidebar) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Setup navigation
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                navItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Get page to load
                const page = item.getAttribute('data-page');
                this.loadView(page);
            });
        });
    }

    // Load a specific view
    loadView(view) {
        this.currentView = view;
        
        switch(view) {
            case 'dashboard':
                this.loadDashboardView();
                break;
                
            case 'quizzes':
                this.loadQuizzesView();
                break;
                
            case 'students':
                this.userManager.loadStudentsView();
                break;
                
            case 'profile':
                this.userManager.loadProfileSettings();
                break;
                
            case 'analytics':
                this.loadAnalyticsView();
                break;
                
            case 'courses':
                this.loadCoursesView();
                break;
                
            case 'reports':
                this.loadReportsView();
                break;
                
            case 'calendar':
                this.loadCalendarView();
                break;
                
            case 'account':
                this.loadAccountView();
                break;
                
            default:
                this.loadDashboardView();
        }
    }

    // Load dashboard view
    loadDashboardView() {
        const dashboardContent = document.getElementById('dashboard-content');
        const viewContent = document.getElementById('view-content');
        
        if (!dashboardContent || !viewContent) return;

        // Show dashboard content, hide view content
        dashboardContent.style.display = 'block';
        viewContent.style.display = 'none';

        // Get dashboard stats
        const stats = this.quizManager.getDashboardStats();
        const recentQuizzes = this.quizManager.getRecentQuizzes();
        const popularQuizzes = this.quizManager.getPopularQuizzes();
        const authStats = this.auth.getUserStats(this.currentUser.id);

        // Build dashboard HTML
        let html = `
            <div class="dashboard-content-inner fade-in">
                <h2 class="section-title">Dashboard Overview</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-question-circle"></i></div>
                        <div class="stat-value">${stats.totalQuizzes}</div>
                        <div class="stat-title">Total Quizzes</div>
                        <div class="stat-change text-success">
                            <i class="fas fa-arrow-up"></i> +12.5%
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-value">${stats.activeQuizzes}</div>
                        <div class="stat-title">Active Quizzes</div>
                        <div class="stat-change text-success">
                            <i class="fas fa-arrow-up"></i> +8.2%
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-value">${stats.totalCompletions}</div>
                        <div class="stat-title">Total Completions</div>
                        <div class="stat-change text-success">
                            <i class="fas fa-arrow-up"></i> +15.3%
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                        <div class="stat-value">${stats.avgCompletionRate}%</div>
                        <div class="stat-title">Avg. Completion</div>
                        <div class="stat-change text-success">
                            <i class="fas fa-arrow-up"></i> +3.7%
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-left">
        `;

        // Recent Quizzes Section
        html += `
            <div class="card recent-quizzes">
                <div class="card-header">
                    <h3>Recent Quizzes</h3>
                    <p>Your recently published quizzes</p>
                </div>
                <div class="card-body">
        `;

        if (recentQuizzes.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <h4>No quizzes yet</h4>
                    <p>Create your first quiz to get started</p>
                    ${this.currentUser.role !== 'student' ? 
                        `<button class="btn-primary mt-2" onclick="quizManager.openQuizModal()">Create Quiz</button>` : 
                        `<button class="btn-primary mt-2" onclick="quizManager.handleSearch('beginner')">Browse Quizzes</button>`
                    }
                </div>
            `;
        } else {
            recentQuizzes.forEach(quiz => {
                html += `
                    <div class="quiz-item">
                        <div class="quiz-details">
                            <h4>${quiz.title}</h4>
                            <p>
                                <span><i class="fas fa-tag"></i> ${quiz.category}</span>
                                <span><i class="fas fa-question-circle"></i> ${quiz.questions} questions</span>
                                <span><i class="fas fa-users"></i> ${quiz.completions} completions</span>
                            </p>
                        </div>
                        <div class="quiz-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${quiz.averageScore}%"></div>
                            </div>
                            <div class="progress-text">${quiz.averageScore}%</div>
                            <div class="quiz-arrow" onclick="quizManager.viewQuiz('${quiz.id}')">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        // Student Stats (for students) or Teacher Stats (for teachers)
        if (this.currentUser.role === 'student') {
            html += `
                <div class="card student-stats mt-3">
                    <div class="card-header">
                        <h3>My Progress</h3>
                        <p>Your learning journey</p>
                    </div>
                    <div class="card-body">
                        <div class="progress-stats">
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Quizzes Taken</span>
                                    <span>${authStats?.totalQuizzesTaken || 0}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min((authStats?.totalQuizzesTaken || 0) * 10, 100)}%"></div>
                                </div>
                            </div>
                            
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Average Score</span>
                                    <span>${authStats?.averageScore || 0}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${authStats?.averageScore || 0}%"></div>
                                </div>
                            </div>
                            
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Current Level</span>
                                    <span>${authStats?.level || 'Beginner'}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${this.calculateLevelProgress(authStats?.level || 'Beginner')}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Teacher/Admin Stats
            const students = this.auth.getAllStudents();
            const activeStudents = students.filter(s => {
                const lastActive = new Date(s.lastActive);
                const now = new Date();
                const hoursDiff = Math.floor((now - lastActive) / (1000 * 60 * 60));
                return hoursDiff < 24;
            }).length;

            html += `
                <div class="card teacher-stats mt-3">
                    <div class="card-header">
                        <h3>Class Overview</h3>
                        <p>Student performance insights</p>
                    </div>
                    <div class="card-body">
                        <div class="stats-grid-small">
                            <div class="stat-small">
                                <div class="stat-icon-small"><i class="fas fa-users"></i></div>
                                <div>
                                    <div class="stat-value-small">${students.length}</div>
                                    <div class="stat-title-small">Total Students</div>
                                </div>
                            </div>
                            
                            <div class="stat-small">
                                <div class="stat-icon-small"><i class="fas fa-user-check"></i></div>
                                <div>
                                    <div class="stat-value-small">${activeStudents}</div>
                                    <div class="stat-title-small">Active Today</div>
                                </div>
                            </div>
                            
                            <div class="stat-small">
                                <div class="stat-icon-small"><i class="fas fa-graduation-cap"></i></div>
                                <div>
                                    <div class="stat-value-small">${this.userManager.getAverageStudentScore()}%</div>
                                    <div class="stat-title-small">Avg. Score</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="view-all-link">
                            <a href="#" onclick="userManager.loadStudentsView()">View all students <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            `;
        }

        html += `
                    </div>
                    <div class="dashboard-right">
        `;

        // Popular Quizzes Section
        html += `
            <div class="card popular-quizzes">
                <div class="card-header">
                    <h3>Popular Quizzes</h3>
                    <p>Most attempted quizzes</p>
                </div>
                <div class="card-body">
        `;

        if (popularQuizzes.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h4>No popular quizzes</h4>
                    <p>Quizzes will appear here as they gain popularity</p>
                </div>
            `;
        } else {
            popularQuizzes.forEach(quiz => {
                html += `
                    <div class="quiz-item">
                        <div class="quiz-details">
                            <h4>${quiz.title}</h4>
                            <p>
                                <span><i class="fas fa-tag"></i> ${quiz.category}</span>
                                <span><i class="fas fa-chart-line"></i> ${quiz.difficulty}</span>
                            </p>
                        </div>
                        <div class="quiz-popularity">
                            <span class="popularity-badge">
                                <i class="fas fa-fire"></i> ${quiz.completions}
                            </span>
                            <div class="quiz-arrow" onclick="quizManager.viewQuiz('${quiz.id}')">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        // Quick Actions Card
        html += `
            <div class="card quick-actions mt-3">
                <div class="card-header">
                    <h3>Quick Actions</h3>
                    <p>Get things done faster</p>
                </div>
                <div class="card-body">
                    <div class="actions-grid">
        `;

        if (this.currentUser.role === 'student') {
            html += `
                <button class="action-btn" onclick="quizManager.handleSearch('beginner')">
                    <i class="fas fa-search"></i>
                    <span>Find Quiz</span>
                </button>
                
                <button class="action-btn" onclick="this.loadView('analytics')">
                    <i class="fas fa-chart-pie"></i>
                    <span>My Analytics</span>
                </button>
                
                <button class="action-btn" onclick="this.userManager.loadProfileSettings()">
                    <i class="fas fa-user-edit"></i>
                    <span>Edit Profile</span>
                </button>
                
                <button class="action-btn" onclick="this.showHelp()">
                    <i class="fas fa-question-circle"></i>
                    <span>Get Help</span>
                </button>
            `;
        } else {
            html += `
                <button class="action-btn" onclick="quizManager.openQuizModal()">
                    <i class="fas fa-plus-circle"></i>
                    <span>Create Quiz</span>
                </button>
                
                <button class="action-btn" onclick="this.userManager.loadStudentsView()">
                    <i class="fas fa-users"></i>
                    <span>View Students</span>
                </button>
                
                <button class="action-btn" onclick="this.loadView('analytics')">
                    <i class="fas fa-chart-bar"></i>
                    <span>Analytics</span>
                </button>
                
                <button class="action-btn" onclick="this.loadView('reports')">
                    <i class="fas fa-file-alt"></i>
                    <span>Reports</span>
                </button>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        // Recent Activity
        html += `
            <div class="card recent-activity mt-3">
                <div class="card-header">
                    <h3>Recent Activity</h3>
                    <p>Latest platform updates</p>
                </div>
                <div class="card-body">
                    <div class="activity-list">
        `;

        const activities = this.getRecentActivities();
        if (activities.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h4>No recent activity</h4>
                    <p>Your activity will appear here</p>
                </div>
            `;
        } else {
            activities.forEach(activity => {
                html += `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas ${activity.icon}"></i>
                        </div>
                        <div class="activity-content">
                            <h5>${activity.title}</h5>
                            <p class="text-muted">${activity.description}</p>
                            <span class="activity-time">${activity.time}</span>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        html += `
                    </div>
                </div>
            </div>
        `;

        // Update dashboard content
        dashboardContent.innerHTML = html;
    }

    // Calculate level progress
    calculateLevelProgress(level) {
        const levels = {
            'Beginner': 25,
            'Intermediate': 50,
            'Advanced': 75,
            'Expert': 100
        };
        return levels[level] || 25;
    }

    // Get recent activities
    getRecentActivities() {
        const activities = [];
        const now = new Date();

        // Add user's recent quizzes
        const userQuizzes = this.quizManager.getQuizzesByUser(this.currentUser.id);
        userQuizzes.slice(0, 2).forEach(quiz => {
            activities.push({
                icon: 'fa-question-circle',
                title: `Created: ${quiz.title}`,
                description: `${quiz.category} • ${quiz.questions} questions`,
                time: this.formatTimeAgo(new Date(quiz.createdAt))
            });
        });

        // Add recent student submissions (for teachers)
        if (this.currentUser.role !== 'student') {
            const students = this.auth.getAllStudents();
            const recentStudents = students
                .filter(s => {
                    const lastActive = new Date(s.lastActive);
                    const hoursDiff = Math.floor((now - lastActive) / (1000 * 60 * 60));
                    return hoursDiff < 24;
                })
                .slice(0, 2);

            recentStudents.forEach(student => {
                activities.push({
                    icon: 'fa-user-check',
                    title: `${student.firstName} completed a quiz`,
                    description: `Score: ${student.averageScore || 0}%`,
                    time: this.formatTimeAgo(new Date(student.lastActive))
                });
            });
        }

        // Add system notifications
        const notifications = this.currentUser.notifications || [];
        notifications.slice(0, 2).forEach(notification => {
            activities.push({
                icon: 'fa-bell',
                title: notification.title,
                description: notification.message,
                time: this.formatTimeAgo(new Date(notification.timestamp))
            });
        });

        return activities.slice(0, 5); // Limit to 5 activities
    }

    // Format time ago
    formatTimeAgo(date) {
        const now = new Date();
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

    // Update user interface
    updateUserInterface() {
        this.userManager.updateUserInterface();
    }

    // Load other views (stubs for now)
    loadQuizzesView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = `
            <div class="view-content-inner">
                <h2 class="section-title">My Quizzes</h2>
                <p class="text-muted mb-3">Manage all your created quizzes</p>
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <h4>Quizzes Management</h4>
                    <p>This section is under development</p>
                    <button class="btn-primary mt-2" onclick="quizManager.openQuizModal()">Create New Quiz</button>
                </div>
            </div>
        `;
    }

    loadAnalyticsView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = `
            <div class="view-content-inner">
                <h2 class="section-title">Analytics</h2>
                <p class="text-muted mb-3">Detailed performance insights</p>
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h4>Analytics Dashboard</h4>
                    <p>This section is under development</p>
                </div>
            </div>
        `;
    }

    loadCoursesView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = `
            <div class="view-content-inner">
                <h2 class="section-title">Courses</h2>
                <p class="text-muted mb-3">Browse available courses</p>
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h4>Course Catalog</h4>
                    <p>This section is under development</p>
                    <button class="btn-primary mt-2" onclick="quizManager.handleSearch('')">Browse Quizzes</button>
                </div>
            </div>
        `;
    }

    loadReportsView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = `
            <div class="view-content-inner">
                <h2 class="section-title">Reports</h2>
                <p class="text-muted mb-3">Generate and view reports</p>
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h4>Reports Section</h4>
                    <p>This section is under development</p>
                </div>
            </div>
        `;
    }

    loadCalendarView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = `
            <div class="view-content-inner">
                <h2 class="section-title">Calendar</h2>
                <p class="text-muted mb-3">Schedule and events</p>
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h4>Calendar</h4>
                    <p>This section is under development</p>
                </div>
            </div>
        `;
    }

    loadAccountView() {
        const viewContent = document.getElementById('view-content');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (!viewContent || !dashboardContent) return;

        dashboardContent.style.display = 'none';
        viewContent.style.display = 'block';
        viewContent.innerHTML = `
            <div class="view-content-inner">
                <h2 class="section-title">Account Settings</h2>
                <p class="text-muted mb-3">Manage your account preferences</p>
                <div class="empty-state">
                    <i class="fas fa-cog"></i>
                    <h4>Account Management</h4>
                    <p>This section is under development</p>
                    <button class="btn-primary mt-2" onclick="this.userManager.loadProfileSettings()">Go to Profile Settings</button>
                </div>
            </div>
        `;
    }

    // Show help modal
    showHelp() {
        let modalHTML = `
            <div class="modal-overlay" id="help-modal">
                <div class="modal" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-question-circle"></i> Help & Support</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="help-content">
                            <h4>Getting Started</h4>
                            <p>Welcome to Quizzzy! Here's how to get started:</p>
                            
                            <div class="help-steps">
                                <div class="help-step">
                                    <div class="step-number">1</div>
                                    <div>
                                        <h5>Explore Quizzes</h5>
                                        <p>Use the search bar to find quizzes by topic or difficulty.</p>
                                    </div>
                                </div>
                                
                                <div class="help-step">
                                    <div class="step-number">2</div>
                                    <div>
                                        <h5>Take Quizzes</h5>
                                        <p>Click on any quiz to view details and start taking it.</p>
                                    </div>
                                </div>
                                
                                <div class="help-step">
                                    <div class="step-number">3</div>
                                    <div>
                                        <h5>Track Progress</h5>
                                        <p>View your performance in the dashboard analytics.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="help-contact">
                                <h4>Need More Help?</h4>
                                <p>Contact our support team:</p>
                                <ul>
                                    <li><i class="fas fa-envelope"></i> support@quizzzy.com</li>
                                    <li><i class="fas fa-phone"></i> +1 (555) 123-4567</li>
                                    <li><i class="fas fa-globe"></i> <a href="#">quizzzy.com/help</a></li>
                                </ul>
                            </div>
                            
                            <div class="form-actions">
                                <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Got it!</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('help-modal');
            if (modal) modal.style.display = 'flex';
        }, 10);
    }
}

// Initialize the platform when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const platform = new QuizPlatform();
    window.quizPlatform = platform;
    
    // Check if we're on dashboard page
    if (document.getElementById('dashboard-container')) {
        platform.initialize();
    }
});