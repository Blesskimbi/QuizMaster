// ============================================
// QUIZZY - ENHANCED QUIZ MANAGER
// Handles all quiz creation and management functionality with user integration
// ============================================

class QuizManager {
    constructor() {
        this.quizzes = [];
        this.events = [];
        this.submissions = [];
        this.currentQuiz = null;
        this.questions = [];
        
        this.auth = new AuthManager();
        this.currentUser = this.auth.getCurrentUser();
        
        this.loadFromLocalStorage();
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        // Quiz creation modal elements
        this.quizModal = document.getElementById('quiz-modal');
        this.quizForm = document.getElementById('quiz-form');
        
        // Search elements
        this.searchInput = document.getElementById('search-input');
    }
    
    bindEvents() {
        // Create Quiz button
        const createBtn = document.getElementById('create-quiz-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openQuizModal());
        }
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }
    
    // ============================================
    // QUIZ MANAGEMENT
    // ============================================
    
    openQuizModal() {
        // Check if user can create quizzes
        if (this.currentUser.role === 'student') {
            this.showToast('Students cannot create quizzes. Please contact a teacher.', 'error');
            return;
        }
        
        let modalHTML = `
            <div class="modal-overlay" id="quiz-creation-modal">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Create New Quiz</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="quiz-creation-form">
                            <div class="form-group">
                                <label for="quiz-title"><i class="fas fa-heading"></i> Quiz Title</label>
                                <input type="text" id="quiz-title" placeholder="e.g., Introduction to Biology" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="quiz-category"><i class="fas fa-tag"></i> Category</label>
                                    <select id="quiz-category" required>
                                        <option value="">Select category</option>
                                        <option value="Science">Science</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="History">History</option>
                                        <option value="English">English</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="quiz-difficulty"><i class="fas fa-chart-line"></i> Difficulty</label>
                                    <select id="quiz-difficulty" required>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate" selected>Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="quiz-description"><i class="fas fa-align-left"></i> Description</label>
                                <textarea id="quiz-description" rows="3" placeholder="Describe what this quiz covers..."></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                                <button type="submit" class="btn-primary">Create Quiz</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        setTimeout(() => {
            const modal = document.getElementById('quiz-creation-modal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Focus on title input
                document.getElementById('quiz-title')?.focus();
                
                // Add form submit handler
                document.getElementById('quiz-creation-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.createQuiz();
                });
            }
        }, 10);
    }
    
    createQuiz() {
        const title = document.getElementById('quiz-title').value;
        const category = document.getElementById('quiz-category').value;
        const difficulty = document.getElementById('quiz-difficulty').value;
        const description = document.getElementById('quiz-description').value;
        
        if (!title || !category || !difficulty) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const quizData = {
            id: 'quiz-' + Date.now(),
            title,
            category,
            difficulty,
            description,
            createdBy: this.currentUser.id,
            createdAt: new Date().toISOString(),
            questions: 0,
            completions: 0,
            averageScore: 0,
            status: 'draft',
            isPublic: true,
            tags: [],
            timeLimit: 30, // minutes
            passingScore: 60
        };
        
        // Add to quizzes array
        this.quizzes.unshift(quizData);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Show success message
        this.showToast(`"${title}" created successfully!`);
        
        // Close modal
        const modal = document.getElementById('quiz-creation-modal');
        if (modal) modal.remove();
        
        // Refresh dashboard
        const app = new QuizPlatform();
        app.loadDashboardView();
        
        // Add notification for creator
        this.auth.addNotification(this.currentUser.id, {
            type: 'quiz',
            title: 'Quiz Created',
            message: `You created "${title}"`,
            quizId: quizData.id
        });
    }
    
    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    
    handleSearch(query) {
        if (!query.trim()) {
            // Clear search results - reload dashboard
            const app = new QuizPlatform();
            app.loadDashboardView();
            return;
        }
        
        // Search quizzes
        const quizResults = this.searchQuizzes(query);
        
        // Search users (via userManager)
        const userManager = UserManager.getInstance();
        const userResults = userManager ? userManager.auth.searchUsers(query) : [];
        
        // Display combined results
        this.displaySearchResults({
            quizzes: quizResults,
            users: userResults
        });
    }
    
    searchQuizzes(query) {
        const searchTerm = query.toLowerCase();
        
        return this.quizzes.filter(quiz => 
            quiz.isPublic && (
                quiz.title.toLowerCase().includes(searchTerm) ||
                quiz.category.toLowerCase().includes(searchTerm) ||
                quiz.description.toLowerCase().includes(searchTerm) ||
                quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            )
        );
    }
    
    displaySearchResults(results) {
        const dashboardContent = document.getElementById('dashboard-content');
        if (!dashboardContent) return;
        
        let html = `
            <div class="search-results">
                <h3 class="section-title">Search Results</h3>
                <p class="text-muted mb-3">Found ${results.quizzes.length + results.users.length} results</p>
        `;
        
        // Display quiz results
        if (results.quizzes.length > 0) {
            html += `
                <div class="card mb-3">
                    <div class="card-header">
                        <h4><i class="fas fa-question-circle"></i> Quizzes (${results.quizzes.length})</h4>
                    </div>
                    <div class="card-body">
                        <div class="quizzes-grid">
            `;
            
            results.quizzes.forEach(quiz => {
                const creator = this.auth.getUserById(quiz.createdBy);
                const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown';
                
                html += `
                    <div class="quiz-result" onclick="quizManager.viewQuiz('${quiz.id}')">
                        <div class="quiz-result-header">
                            <h5>${quiz.title}</h5>
                            <span class="badge ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span>
                        </div>
                        <p class="text-muted">${quiz.description || 'No description'}</p>
                        <div class="quiz-result-footer">
                            <span class="text-muted">${quiz.category} • ${quiz.questions} questions</span>
                            <span class="text-muted">By ${creatorName}</span>
                        </div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Display user results (only for teachers/admins)
        if (results.users.length > 0 && (this.currentUser.role === 'teacher' || this.currentUser.role === 'admin')) {
            html += `
                <div class="card">
                    <div class="card-header">
                        <h4><i class="fas fa-users"></i> Users (${results.users.length})</h4>
                    </div>
                    <div class="card-body">
                        <div class="users-grid">
            `;
            
            results.users.forEach(user => {
                const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
                
                html += `
                    <div class="user-result" onclick="userManager.viewStudentDetails('${user.id}')">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                            <h5>${user.firstName} ${user.lastName}</h5>
                            <p class="text-muted">${user.email}</p>
                            <span class="user-role-badge ${user.role}">${user.role}</span>
                        </div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }
        
        // No results
        if (results.quizzes.length === 0 && results.users.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>No results found</h4>
                    <p>Try different search terms</p>
                </div>
            `;
        }
        
        html += `</div>`;
        
        // Update dashboard content
        dashboardContent.innerHTML = html;
        
        // Hide view content if visible
        const viewContent = document.getElementById('view-content');
        if (viewContent) {
            viewContent.style.display = 'none';
        }
    }
    
    viewQuiz(quizId) {
        const quiz = this.getQuizById(quizId);
        if (!quiz) return;
        
        let modalHTML = `
            <div class="modal-overlay" id="quiz-view-modal">
                <div class="modal" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-eye"></i> Quiz Details</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="quiz-details-view">
                            <h2>${quiz.title}</h2>
                            <div class="quiz-meta">
                                <span class="badge ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span>
                                <span class="badge">${quiz.category}</span>
                                <span class="badge">${quiz.questions} questions</span>
                                ${quiz.timeLimit ? `<span class="badge">${quiz.timeLimit} min</span>` : ''}
                            </div>
                            
                            <p class="quiz-description">${quiz.description || 'No description provided.'}</p>
                            
                            <div class="quiz-stats">
                                <div class="stat-item">
                                    <i class="fas fa-users"></i>
                                    <div>
                                        <h4>${quiz.completions}</h4>
                                        <p>Completions</p>
                                    </div>
                                </div>
                                
                                <div class="stat-item">
                                    <i class="fas fa-chart-line"></i>
                                    <div>
                                        <h4>${quiz.averageScore}%</h4>
                                        <p>Average Score</p>
                                    </div>
                                </div>
                                
                                <div class="stat-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <div>
                                        <h4>${new Date(quiz.createdAt).toLocaleDateString()}</h4>
                                        <p>Created Date</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                ${this.currentUser.role !== 'student' ? `
                                    <button class="btn-secondary" onclick="quizManager.editQuiz('${quiz.id}')">
                                        <i class="fas fa-edit"></i> Edit Quiz
                                    </button>
                                ` : ''}
                                <button class="btn-primary" onclick="quizManager.startQuiz('${quiz.id}')">
                                    <i class="fas fa-play"></i> Start Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('quiz-view-modal');
            if (modal) modal.style.display = 'flex';
        }, 10);
    }
    
    // ============================================
    // DATA MANAGEMENT
    // ============================================
    
    loadFromLocalStorage() {
        try {
            const savedQuizzes = localStorage.getItem('quizzzy_quizzes');
            const savedEvents = localStorage.getItem('quizzzy_events');
            const savedSubmissions = localStorage.getItem('quizzzy_submissions');
            
            if (savedQuizzes) this.quizzes = JSON.parse(savedQuizzes);
            if (savedEvents) this.events = JSON.parse(savedEvents);
            if (savedSubmissions) this.submissions = JSON.parse(savedSubmissions);
            
            // If no saved data, load demo data
            if (this.quizzes.length === 0) {
                this.loadDemoData();
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            this.loadDemoData();
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('quizzzy_quizzes', JSON.stringify(this.quizzes));
        localStorage.setItem('quizzzy_events', JSON.stringify(this.events));
        localStorage.setItem('quizzzy_submissions', JSON.stringify(this.submissions));
    }
    
    loadDemoData() {
        this.quizzes = [
            {
                id: 'quiz-1',
                title: 'Introduction to Biology',
                category: 'Science',
                difficulty: 'Intermediate',
                description: 'Basic biology concepts and terminology',
                createdBy: 'user-1',
                createdAt: '2024-03-15T10:30:00Z',
                questions: 15,
                completions: 28,
                averageScore: 75,
                status: 'published',
                isPublic: true,
                tags: ['biology', 'science', 'beginner'],
                timeLimit: 45,
                passingScore: 60
            },
            {
                id: 'quiz-2',
                title: 'Algebra Fundamentals',
                category: 'Mathematics',
                difficulty: 'Beginner',
                description: 'Basic algebraic equations and expressions',
                createdBy: 'user-1',
                createdAt: '2024-03-14T14:20:00Z',
                questions: 20,
                completions: 42,
                averageScore: 82,
                status: 'published',
                isPublic: true,
                tags: ['math', 'algebra', 'equations'],
                timeLimit: 60,
                passingScore: 65
            },
            {
                id: 'quiz-3',
                title: 'World History Basics',
                category: 'History',
                difficulty: 'Intermediate',
                description: 'Key events in world history',
                createdBy: 'user-1',
                createdAt: '2024-03-13T09:15:00Z',
                questions: 25,
                completions: 19,
                averageScore: 68,
                status: 'published',
                isPublic: true,
                tags: ['history', 'world', 'events'],
                timeLimit: null,
                passingScore: 55
            }
        ];
        
        this.events = [
            {
                id: 'event-1',
                quizId: 'quiz-1',
                title: 'Science Mid-term Quiz',
                time: 'Today, 2:30 PM',
                participants: 32,
                status: 'active'
            }
        ];
        
        this.submissions = [
            {
                id: 'sub-1',
                quizId: 'quiz-1',
                userId: 'user-2',
                score: 85,
                totalQuestions: 15,
                correctAnswers: 13,
                timeSpent: 25, // minutes
                completedAt: '2024-03-15T14:30:00Z',
                answers: []
            }
        ];
        
        this.saveToLocalStorage();
    }
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    getQuizById(id) {
        return this.quizzes.find(q => q.id === id);
    }
    
    getQuizzesByUser(userId) {
        return this.quizzes.filter(q => q.createdBy === userId);
    }
    
    getRecentQuizzes(limit = 3) {
        return this.quizzes
            .filter(q => q.isPublic && q.status === 'published')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    getPopularQuizzes(limit = 3) {
        return this.quizzes
            .filter(q => q.isPublic && q.status === 'published')
            .sort((a, b) => b.completions - a.completions)
            .slice(0, limit);
    }
    
    getDashboardStats() {
        const totalQuizzes = this.quizzes.length;
        const activeQuizzes = this.quizzes.filter(q => q.status === 'published').length;
        const totalCompletions = this.quizzes.reduce((sum, q) => sum + q.completions, 0);
        const avgCompletionRate = this.quizzes.length > 0 ? 
            Math.round(this.quizzes.reduce((sum, q) => sum + q.averageScore, 0) / this.quizzes.length) : 0;
        
        return {
            totalQuizzes,
            activeQuizzes,
            totalCompletions,
            avgCompletionRate
        };
    }
    
    // ============================================
    // UI METHODS
    // ============================================
    
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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
    
    // Global instance
    static getInstance() {
        if (!QuizManager.instance) {
            QuizManager.instance = new QuizManager();
        }
        return QuizManager.instance;
    }
}

// Create global instance
window.quizManager = QuizManager.getInstance();