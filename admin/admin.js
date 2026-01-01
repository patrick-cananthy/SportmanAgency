// Use relative path to avoid port issues
const API_BASE = '/api';

let authToken = localStorage.getItem('authToken');
let currentNewsId = null;

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        verifyToken();
    } else {
        showPage('loginPage');
    }
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            if (data.user) {
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userRole', data.user.role);
                // Show/hide admin-only features
                if (data.user.role === 'admin') {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'block';
                    });
                } else {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'none';
                    });
                }
            }
            showPage('dashboardPage');
            loadNews();
            loadStats();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Verify token
async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            // Store user info
            if (data.user) {
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userRole', data.user.role);
                // Check if user is admin and show/hide admin-only features
                if (data.user.role === 'admin') {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'block';
                    });
                }
            }
            showPage('dashboardPage');
            loadNews();
            loadStats();
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            authToken = null;
            showPage('loginPage');
        }
    } catch (error) {
        showPage('loginPage');
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    authToken = null;
    showPage('loginPage');
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (item.id === 'logoutBtn') return;
        
        e.preventDefault();
        const page = item.dataset.page;
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        if (page === 'news') {
            showContentPage('newsPage');
            document.getElementById('pageTitle').textContent = 'News & Insights';
        } else if (page === 'comments') {
            showContentPage('commentsPage');
            document.getElementById('pageTitle').textContent = 'Comments';
            loadComments();
        } else if (page === 'stats') {
            showContentPage('statsPage');
            document.getElementById('pageTitle').textContent = 'Statistics';
            loadStats();
        } else if (page === 'users') {
            showContentPage('usersPage');
            document.getElementById('pageTitle').textContent = 'User Management';
            loadUsers();
        }
    });
});

// Show page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showContentPage(pageId) {
    document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Load news
async function loadNews() {
    try {
        const response = await fetch(`${API_BASE}/news`);
        const news = await response.json();
        displayNews(news);
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Display news
function displayNews(news) {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '';

    if (news.length === 0) {
        newsList.innerHTML = '<p>No news articles yet. Click "Add New Article" to get started.</p>';
        return;
    }

        news.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            
            const imageUrl = item.image || 'https://via.placeholder.com/150x100?text=No+Image';
            const date = new Date(item.publishDate).toLocaleDateString();
            const badges = [];
            if (item.featured) badges.push('<span class="badge badge-featured">Featured</span>');
            if (item.published) badges.push('<span class="badge badge-published">Published</span>');
            else badges.push('<span class="badge badge-draft">Draft</span>');

            newsItem.innerHTML = `
                <img src="${imageUrl}" alt="${item.title}" class="news-item-image" onerror="this.src='https://via.placeholder.com/150x100?text=No+Image'">
                <div class="news-item-content">
                    <div class="news-item-header">
                        <div>
                            <h3 class="news-item-title">${item.title}</h3>
                            <div class="news-item-meta">
                                ${item.author} • ${date} • ${item.category}
                                ${badges.join(' ')}
                            </div>
                        </div>
                    </div>
                    <p class="news-item-excerpt">${item.excerpt}</p>
                    <div class="news-item-actions">
                        <button class="btn btn-primary" onclick="editNews(${item.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteNews(${item.id})">Delete</button>
                    </div>
                </div>
            `;
            newsList.appendChild(newsItem);
        });
}

// Add news button
document.getElementById('addNewsBtn')?.addEventListener('click', () => {
    currentNewsId = null;
    document.getElementById('modalTitle').textContent = 'Add New Article';
    document.getElementById('newsForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('excerptCount').textContent = '0/200 characters';
    document.getElementById('newsModal').classList.add('active');
});

// Close modal
document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('newsModal').classList.remove('active');
});

document.getElementById('cancelBtn')?.addEventListener('click', () => {
    document.getElementById('newsModal').classList.remove('active');
});

// Excerpt character counter
document.getElementById('newsExcerpt')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('excerptCount').textContent = `${count}/200 characters`;
});

// Image preview
document.getElementById('newsImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Submit news form
document.getElementById('newsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('newsTitle').value);
    formData.append('content', document.getElementById('newsContent').value);
    formData.append('excerpt', document.getElementById('newsExcerpt').value);
    formData.append('author', document.getElementById('newsAuthor').value);
    formData.append('category', document.getElementById('newsCategory').value);
    formData.append('featured', document.getElementById('newsFeatured').checked);
    formData.append('published', document.getElementById('newsPublished').checked);
    
    const imageFile = document.getElementById('newsImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const url = currentNewsId 
            ? `${API_BASE}/news/${currentNewsId}`
            : `${API_BASE}/news`;
        
        const response = await fetch(url, {
            method: currentNewsId ? 'PUT' : 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        if (response.ok) {
            document.getElementById('newsModal').classList.remove('active');
            loadNews();
            loadStats();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.message || 'Failed to save article'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

// Edit news
async function editNews(id) {
    try {
        const response = await fetch(`${API_BASE}/news/${id}`);
        const news = await response.json();
        
        currentNewsId = id;
        document.getElementById('modalTitle').textContent = 'Edit Article';
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsContent').value = news.content;
        document.getElementById('newsExcerpt').value = news.excerpt;
        document.getElementById('newsAuthor').value = news.author;
        document.getElementById('newsCategory').value = news.category;
        document.getElementById('newsFeatured').checked = news.featured;
        document.getElementById('newsPublished').checked = news.published;
        document.getElementById('excerptCount').textContent = `${news.excerpt.length}/200 characters`;
        
        if (news.image) {
            document.getElementById('imagePreview').innerHTML = `<img src="${news.image}" alt="Current image">`;
        }
        
        document.getElementById('newsModal').classList.add('active');
    } catch (error) {
        alert('Error loading article');
    }
}

// Delete news
async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/news/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            loadNews();
            loadStats();
        } else {
            alert('Error deleting article');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/content/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const stats = await response.json();
        
        document.getElementById('totalNews').textContent = stats.news.total;
        document.getElementById('publishedNews').textContent = stats.news.published;
        document.getElementById('featuredNews').textContent = stats.news.featured;
        document.getElementById('draftNews').textContent = stats.news.draft;
        
        // Load likes and comments stats
        if (stats.likes !== undefined) {
            document.getElementById('totalLikes').textContent = stats.likes || 0;
        }
        if (stats.comments !== undefined) {
            document.getElementById('totalComments').textContent = stats.comments.total || 0;
            document.getElementById('pendingComments').textContent = stats.comments.pending || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load comments
let currentCommentFilter = 'all';
async function loadComments(filter = 'all') {
    try {
        currentCommentFilter = filter;
        const url = filter === 'all' 
            ? `${API_BASE}/comments`
            : `${API_BASE}/comments?approved=${filter === 'approved' ? 'true' : 'false'}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const comments = await response.json();
        displayComments(comments);
    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('commentsList').innerHTML = '<p>Error loading comments</p>';
    }
}

// Display comments
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p>No comments found.</p>';
        return;
    }
    
    comments.forEach(comment => {
        const date = new Date(comment.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item-admin';
        commentDiv.innerHTML = `
            <div class="comment-header-admin">
                <div>
                    <strong>${comment.authorName}</strong> (${comment.authorEmail})
                    <span class="comment-date">${date}</span>
                </div>
                <div class="comment-status ${comment.approved ? 'approved' : 'pending'}">
                    ${comment.approved ? '✓ Approved' : '⏳ Pending'}
                </div>
            </div>
            <div class="comment-article-link">
                Article ID: ${comment.newsId}
            </div>
            <div class="comment-content-admin">${comment.content}</div>
            <div class="comment-actions">
                ${!comment.approved ? 
                    `<button class="btn btn-sm btn-success" onclick="approveComment(${comment.id})">Approve</button>` : 
                    `<button class="btn btn-sm btn-warning" onclick="rejectComment(${comment.id})">Reject</button>`
                }
                <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.id})">Delete</button>
            </div>
        `;
        commentsList.appendChild(commentDiv);
    });
}

// Comment filter buttons
document.querySelectorAll('.filter-btn')?.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadComments(btn.dataset.filter);
    });
});

// Approve comment
async function approveComment(id) {
    try {
        const response = await fetch(`${API_BASE}/comments/${id}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ approved: true })
        });
        
        if (response.ok) {
            loadComments(currentCommentFilter);
            loadStats();
        } else {
            alert('Error approving comment');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Reject comment
async function rejectComment(id) {
    try {
        const response = await fetch(`${API_BASE}/comments/${id}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ approved: false })
        });
        
        if (response.ok) {
            loadComments(currentCommentFilter);
            loadStats();
        } else {
            alert('Error rejecting comment');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Delete comment
async function deleteComment(id) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/comments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadComments(currentCommentFilter);
            loadStats();
        } else {
            alert('Error deleting comment');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Load users (admin only)
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) {
        console.error('Users list element not found');
        return;
    }
    
    usersList.innerHTML = '<div class="loading">Loading users...</div>';
    
    try {
        if (!authToken) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const response = await fetch(`${API_BASE}/users`, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            usersList.innerHTML = '<p style="color: var(--danger);">Session expired. Please log in again.</p>';
            localStorage.removeItem('authToken');
            showPage('loginPage');
            return;
        }
        
        if (response.status === 403) {
            usersList.innerHTML = '<p style="color: var(--danger);">Access denied. Admin privileges required.</p>';
            return;
        }
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorMessage = errorData.errors.map(e => e.msg || e.message).join(', ');
                }
            } catch (e) {
                const text = await response.text().catch(() => '');
                if (text) {
                    errorMessage = text.substring(0, 100);
                }
            }
            throw new Error(errorMessage);
        }
        
        const users = await response.json();
        
        if (!Array.isArray(users)) {
            throw new Error('Invalid response format: Expected array');
        }
        
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        usersList.innerHTML = `<p style="color: var(--danger); padding: 20px;">Error loading users: ${errorMsg}</p>`;
    }
}

// Display users
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users found.</p>';
        return;
    }
    
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <div class="user-info">
                <div>
                    <strong>${user.username}</strong>
                    <span class="user-email">${user.email}</span>
                </div>
                <div class="user-role ${user.role}">${user.role.toUpperCase()}</div>
            </div>
            <div class="user-actions">
                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                ${user.id !== parseInt(localStorage.getItem('userId') || '0') ? 
                    `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>` : 
                    '<span class="text-muted">Cannot delete yourself</span>'
                }
            </div>
        `;
        usersList.appendChild(userDiv);
    });
}

// Add user button
document.getElementById('addUserBtn')?.addEventListener('click', () => {
    showUserModal();
});

// Close user modal function
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userError').textContent = '';
    document.getElementById('userError').classList.remove('show');
}

// Close user modal
document.getElementById('closeUserModal')?.addEventListener('click', closeUserModal);

document.getElementById('cancelUserBtn')?.addEventListener('click', closeUserModal);

// Close modal when clicking outside
document.getElementById('userModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'userModal') {
        closeUserModal();
    }
});

// Show user modal
function showUserModal(user = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    const passwordInput = document.getElementById('userPassword');
    const passwordHelp = document.getElementById('passwordHelp');
    
    if (user) {
        // Edit mode
        title.textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        passwordInput.required = false;
        passwordHelp.style.display = 'block';
    } else {
        // Add mode
        title.textContent = 'Add New User';
        form.reset();
        document.getElementById('userId').value = '';
        passwordInput.required = true;
        passwordHelp.style.display = 'none';
    }
    
    modal.classList.add('active');
}

// Submit user form
document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('userUsername').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const errorDiv = document.getElementById('userError');
    
    // Validation
    if (!username || !email || !role) {
        errorDiv.textContent = 'Please fill in all required fields.';
        errorDiv.classList.add('show');
        return;
    }
    
    if (!userId && !password) {
        errorDiv.textContent = 'Password is required for new users.';
        errorDiv.classList.add('show');
        return;
    }
    
    if (password && password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
        errorDiv.classList.add('show');
        return;
    }
    
    const userData = {
        username,
        email,
        role
    };
    
    if (password) {
        userData.password = password;
    }
    
    try {
        if (userId) {
            await updateUser(userId, userData);
        } else {
            await createUser(userData);
        }
    } catch (error) {
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Create user
async function createUser(userData) {
    const errorDiv = document.getElementById('userError');
    const submitBtn = document.querySelector('#userForm button[type="submit"]');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
    }
    
    try {
        if (!authToken) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        let errorMessage = 'Failed to create user';
        
        if (!response.ok) {
            try {
                const errorData = await response.json();
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorMessage = errorData.errors.map(e => e.msg || e.message).join(', ');
                } else {
                    errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
                }
            } catch (e) {
                const text = await response.text().catch(() => '');
                errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
            return;
        }
        
        const data = await response.json();
        
        // Success
        document.getElementById('userModal').classList.remove('active');
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
        loadUsers();
    } catch (error) {
        console.error('Create user error:', error);
        const errorMsg = error.message || 'Network error. Please check your connection and try again.';
        errorDiv.textContent = errorMsg;
        errorDiv.classList.add('show');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save User';
        }
    }
}

// Update user
async function updateUser(id, userData) {
    const errorDiv = document.getElementById('userError');
    const submitBtn = document.querySelector('#userForm button[type="submit"]');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
    }
    
    try {
        if (!authToken) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const updateData = { ...userData };
        if (!updateData.password) delete updateData.password;
        
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        let errorMessage = 'Failed to update user';
        
        if (!response.ok) {
            try {
                const errorData = await response.json();
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorMessage = errorData.errors.map(e => e.msg || e.message).join(', ');
                } else {
                    errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
                }
            } catch (e) {
                const text = await response.text().catch(() => '');
                errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
            return;
        }
        
        const data = await response.json();
        
        // Success
        document.getElementById('userModal').classList.remove('active');
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
        loadUsers();
    } catch (error) {
        console.error('Update user error:', error);
        const errorMsg = error.message || 'Network error. Please check your connection and try again.';
        errorDiv.textContent = errorMsg;
        errorDiv.classList.add('show');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save User';
        }
    }
}

// Edit user
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load user');
        }
        
        const user = await response.json();
        showUserModal(user);
    } catch (error) {
        alert('Error loading user: ' + error.message);
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.message || 'Failed to delete user'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Make functions global
window.editNews = editNews;
window.deleteNews = deleteNews;
window.approveComment = approveComment;
window.rejectComment = rejectComment;
window.deleteComment = deleteComment;
window.editUser = editUser;
window.deleteUser = deleteUser;

