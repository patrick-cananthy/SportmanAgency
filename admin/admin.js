// Use relative path to avoid port issues
const API_BASE = '/api';

// Check if we should use localStorage (remember me) or sessionStorage (session only)
const useRememberMe = localStorage.getItem('rememberMe') === 'true';
let authToken = useRememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
let currentNewsId = null;
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Activity tracking for auto-logout
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        alert('Your session has expired due to inactivity. You will be logged out.');
        logout();
    }, INACTIVITY_TIMEOUT);
    
    // Refresh token periodically to update lastActivity
    if (authToken) {
        // Update token from storage in case it changed
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        authToken = rememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        
        if (authToken) {
            fetch(`${API_BASE}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).catch(() => {
                // If verification fails, logout
                logout();
            });
        }
    }
}

// Track user activity
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

// Reset timer on page load
resetInactivityTimer();

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
    // Only auto-login if "Remember Me" was checked
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (authToken && rememberMe) {
        verifyToken();
    } else {
        // Clear any existing tokens if remember me is not set
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        authToken = null;
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
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Store remember me preference
            localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
            
            // Store token in localStorage if "Remember Me" is checked, otherwise use sessionStorage
            if (rememberMe) {
                localStorage.setItem('authToken', authToken);
                if (data.user) {
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userRole', data.user.role);
                }
            } else {
                sessionStorage.setItem('authToken', authToken);
                if (data.user) {
                    sessionStorage.setItem('userId', data.user.id);
                    sessionStorage.setItem('userRole', data.user.role);
                }
            }
            
            if (data.user) {
                // Show/hide features based on role
                updateUIForRole(data.user.role);
            }
            resetInactivityTimer();
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
            // Store user info in the same storage as token
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            if (data.user) {
                if (rememberMe) {
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userRole', data.user.role);
                } else {
                    sessionStorage.setItem('userId', data.user.id);
                    sessionStorage.setItem('userRole', data.user.role);
                }
                updateUIForRole(data.user.role);
            }
            showPage('dashboardPage');
            loadNews();
            loadStats();
            resetInactivityTimer();
        } else {
            // Clear all storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('userRole');
            authToken = null;
            showPage('loginPage');
        }
    } catch (error) {
        showPage('loginPage');
    }
}

// Update UI based on user role
function updateUIForRole(role) {
    if (role === 'super_admin') {
        // Super admin can see everything
        document.querySelectorAll('.admin-only, .super-admin-only').forEach(el => {
            el.style.display = 'block';
        });
    } else if (role === 'admin') {
        // Regular admin - hide user management
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.super-admin-only').forEach(el => {
            el.style.display = 'none';
        });
    } else {
        // Editor - hide admin features
        document.querySelectorAll('.admin-only, .super-admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Logout function
function logout() {
    clearTimeout(inactivityTimer);
    // Clear all storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    authToken = null;
    showPage('loginPage');
}

// Logout button
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
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
            document.getElementById('addNewsBtn').style.display = 'block';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
        } else if (page === 'events') {
            showContentPage('eventsPage');
            document.getElementById('pageTitle').textContent = 'Events';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'block';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
            loadEvents();
        } else if (page === 'jobs') {
            showContentPage('jobsPage');
            document.getElementById('pageTitle').textContent = 'Job Openings';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'block';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
            loadJobs();
        } else if (page === 'talents') {
            showContentPage('talentsPage');
            document.getElementById('pageTitle').textContent = 'Talent Roster';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'block';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
            loadTalents();
        } else if (page === 'sales-rentals') {
            showContentPage('salesRentalsPage');
            document.getElementById('pageTitle').textContent = 'Sales/Rentals';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'block';
            loadSalesRentals();
        } else if (page === 'comments') {
            showContentPage('commentsPage');
            document.getElementById('pageTitle').textContent = 'Comments';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
            loadComments();
        } else if (page === 'stats') {
            showContentPage('statsPage');
            document.getElementById('pageTitle').textContent = 'Statistics';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
            loadStats();
        } else if (page === 'users') {
            showContentPage('usersPage');
            document.getElementById('pageTitle').textContent = 'User Management';
            document.getElementById('addNewsBtn').style.display = 'none';
            document.getElementById('addEventBtn').style.display = 'none';
            document.getElementById('addJobBtn').style.display = 'none';
            document.getElementById('addTalentBtn').style.display = 'none';
            document.getElementById('addSalesRentalBtn').style.display = 'none';
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

// Event Management
let currentEventId = null;

// Load events
async function loadEvents() {
    try {
        const response = await fetch(`${API_BASE}/events`);
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsList').innerHTML = '<p>Error loading events</p>';
    }
}

// Display events
function displayEvents(events) {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        eventsList.innerHTML = '<p>No events found. Add your first event!</p>';
        return;
    }
    
    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'news-item';
        
        const eventDate = new Date(event.eventDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        eventItem.innerHTML = `
            <div class="news-item-content">
                <h3>${event.title}</h3>
                <p>${event.shortDescription}</p>
                <div class="news-item-meta">
                    <span>📍 ${event.location}</span>
                    <span>📅 ${formattedDate}</span>
                    ${event.featured ? '<span class="badge">Featured</span>' : ''}
                    ${event.published ? '<span class="badge published">Published</span>' : '<span class="badge draft">Draft</span>'}
                </div>
            </div>
            <div class="news-item-actions">
                <button onclick="editEvent(${event.id})" class="btn btn-sm btn-secondary">Edit</button>
                <button onclick="deleteEvent(${event.id})" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;
        eventsList.appendChild(eventItem);
    });
}

// Add event button
document.getElementById('addEventBtn')?.addEventListener('click', () => {
    currentEventId = null;
    document.getElementById('eventModalTitle').textContent = 'Add New Event';
    document.getElementById('eventForm').reset();
    document.getElementById('eventImagePreview').innerHTML = '';
    document.getElementById('eventShortDescCount').textContent = '0/200 characters';
    document.getElementById('eventModal').classList.add('active');
});

// Close event modal
document.getElementById('closeEventModal')?.addEventListener('click', () => {
    document.getElementById('eventModal').classList.remove('active');
});

document.getElementById('cancelEventBtn')?.addEventListener('click', () => {
    document.getElementById('eventModal').classList.remove('active');
});

// Event short description character counter
document.getElementById('eventShortDescription')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('eventShortDescCount').textContent = `${count}/200 characters`;
});

// Event image preview
document.getElementById('eventImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('eventImagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Submit event form
document.getElementById('eventForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('eventTitle').value);
    formData.append('description', document.getElementById('eventDescription').value);
    formData.append('shortDescription', document.getElementById('eventShortDescription').value);
    formData.append('location', document.getElementById('eventLocation').value);
    formData.append('eventDate', document.getElementById('eventDate').value);
    formData.append('eventTime', document.getElementById('eventTime').value);
    formData.append('category', document.getElementById('eventCategory').value);
    formData.append('featured', document.getElementById('eventFeatured').checked);
    formData.append('published', document.getElementById('eventPublished').checked);
    formData.append('registrationUrl', document.getElementById('eventRegistrationUrl').value);
    formData.append('contactEmail', document.getElementById('eventContactEmail').value);
    formData.append('contactPhone', document.getElementById('eventContactPhone').value);
    
    const imageFile = document.getElementById('eventImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const url = currentEventId 
            ? `${API_BASE}/events/${currentEventId}`
            : `${API_BASE}/events`;
        
        const response = await fetch(url, {
            method: currentEventId ? 'PUT' : 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            document.getElementById('eventModal').classList.remove('active');
            loadEvents();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.message || 'Failed to save event'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

// Edit event
async function editEvent(id) {
    try {
        const response = await fetch(`${API_BASE}/events/${id}`);
        const event = await response.json();
        
        currentEventId = id;
        document.getElementById('eventModalTitle').textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventShortDescription').value = event.shortDescription;
        document.getElementById('eventLocation').value = event.location;
        
        // Format date for datetime-local input
        const eventDate = new Date(event.eventDate);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const hours = String(eventDate.getHours()).padStart(2, '0');
        const minutes = String(eventDate.getMinutes()).padStart(2, '0');
        document.getElementById('eventDate').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        document.getElementById('eventTime').value = event.eventTime || '';
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventFeatured').checked = event.featured;
        document.getElementById('eventPublished').checked = event.published;
        document.getElementById('eventRegistrationUrl').value = event.registrationUrl || '';
        document.getElementById('eventContactEmail').value = event.contactEmail || '';
        document.getElementById('eventContactPhone').value = event.contactPhone || '';
        document.getElementById('eventShortDescCount').textContent = `${event.shortDescription.length}/200 characters`;
        
        if (event.image) {
            document.getElementById('eventImagePreview').innerHTML = `<img src="${event.image}" alt="Current image">`;
        }
        
        document.getElementById('eventModal').classList.add('active');
    } catch (error) {
        alert('Error loading event');
    }
}

// Delete event
async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/events/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            loadEvents();
        } else {
            alert('Error deleting event');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Job Management
let currentJobId = null;

// Load jobs
async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs`);
        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsList').innerHTML = '<p>Error loading jobs</p>';
    }
}

// Display jobs
function displayJobs(jobs) {
    const jobsList = document.getElementById('jobsList');
    jobsList.innerHTML = '';
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<p>No jobs found. Add your first job opening!</p>';
        return;
    }
    
    jobs.forEach(job => {
        const jobItem = document.createElement('div');
        jobItem.className = 'news-item';
        
        const postedDate = new Date(job.postedDate);
        const formattedDate = postedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        jobItem.innerHTML = `
            <div class="news-item-content">
                <h3>${job.title}</h3>
                <p>${job.shortDescription}</p>
                <div class="news-item-meta">
                    <span>📍 ${job.location}</span>
                    <span>💼 ${job.jobType}</span>
                    ${job.department ? `<span>🏢 ${job.department}</span>` : ''}
                    ${job.featured ? '<span class="badge">Featured</span>' : ''}
                    ${job.published ? '<span class="badge published">Published</span>' : '<span class="badge draft">Draft</span>'}
                    <span>📅 ${formattedDate}</span>
                </div>
            </div>
            <div class="news-item-actions">
                <button onclick="editJob(${job.id})" class="btn btn-sm btn-secondary">Edit</button>
                <button onclick="deleteJob(${job.id})" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;
        jobsList.appendChild(jobItem);
    });
}

// Add job button
document.getElementById('addJobBtn')?.addEventListener('click', () => {
    currentJobId = null;
    document.getElementById('jobModalTitle').textContent = 'Add New Job';
    document.getElementById('jobForm').reset();
    document.getElementById('jobShortDescCount').textContent = '0/200 characters';
    document.getElementById('jobModal').classList.add('active');
});

// Close job modal
document.getElementById('closeJobModal')?.addEventListener('click', () => {
    document.getElementById('jobModal').classList.remove('active');
});

document.getElementById('cancelJobBtn')?.addEventListener('click', () => {
    document.getElementById('jobModal').classList.remove('active');
});

// Job short description character counter
document.getElementById('jobShortDescription')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('jobShortDescCount').textContent = `${count}/200 characters`;
});

// Submit job form
document.getElementById('jobForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const jobData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        shortDescription: document.getElementById('jobShortDescription').value,
        location: document.getElementById('jobLocation').value,
        jobType: document.getElementById('jobType').value,
        department: document.getElementById('jobDepartment').value,
        requirements: document.getElementById('jobRequirements').value,
        salary: document.getElementById('jobSalary').value,
        applicationUrl: document.getElementById('jobApplicationUrl').value,
        contactEmail: document.getElementById('jobContactEmail').value,
        featured: document.getElementById('jobFeatured').checked,
        published: document.getElementById('jobPublished').checked,
        closingDate: document.getElementById('jobClosingDate').value || null
    };
    
    try {
        const url = currentJobId 
            ? `${API_BASE}/jobs/${currentJobId}`
            : `${API_BASE}/jobs`;
        
        const response = await fetch(url, {
            method: currentJobId ? 'PUT' : 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
            document.getElementById('jobModal').classList.remove('active');
            loadJobs();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.message || 'Failed to save job'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

// Edit job
async function editJob(id) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${id}`);
        const job = await response.json();
        
        currentJobId = id;
        document.getElementById('jobModalTitle').textContent = 'Edit Job';
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobDescription').value = job.description;
        document.getElementById('jobShortDescription').value = job.shortDescription;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobType').value = job.jobType;
        document.getElementById('jobDepartment').value = job.department;
        document.getElementById('jobRequirements').value = job.requirements || '';
        document.getElementById('jobSalary').value = job.salary || '';
        document.getElementById('jobApplicationUrl').value = job.applicationUrl || '';
        document.getElementById('jobContactEmail').value = job.contactEmail || '';
        document.getElementById('jobFeatured').checked = job.featured;
        document.getElementById('jobPublished').checked = job.published;
        document.getElementById('jobShortDescCount').textContent = `${job.shortDescription.length}/200 characters`;
        
        if (job.closingDate) {
            const closingDate = new Date(job.closingDate);
            const year = closingDate.getFullYear();
            const month = String(closingDate.getMonth() + 1).padStart(2, '0');
            const day = String(closingDate.getDate()).padStart(2, '0');
            document.getElementById('jobClosingDate').value = `${year}-${month}-${day}`;
        }
        
        document.getElementById('jobModal').classList.add('active');
    } catch (error) {
        alert('Error loading job');
    }
}

// Delete job
async function deleteJob(id) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/jobs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            loadJobs();
        } else {
            alert('Error deleting job');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Talent Management
let currentTalentId = null;

// Load talents
async function loadTalents() {
    try {
        const response = await fetch(`${API_BASE}/talents`);
        const talents = await response.json();
        displayTalents(talents);
    } catch (error) {
        console.error('Error loading talents:', error);
        document.getElementById('talentsList').innerHTML = '<p>Error loading talents</p>';
    }
}

// Display talents
function displayTalents(talents) {
    const talentsList = document.getElementById('talentsList');
    talentsList.innerHTML = '';
    
    if (talents.length === 0) {
        talentsList.innerHTML = '<p>No talents found. Add your first talent!</p>';
        return;
    }
    
    talents.forEach(talent => {
        const talentItem = document.createElement('div');
        talentItem.className = 'news-item';
        
        talentItem.innerHTML = `
            <div class="news-item-content">
                <h3>${talent.name}</h3>
                <p>${talent.shortBio}</p>
                <div class="news-item-meta">
                    <span>🏆 ${talent.sport}</span>
                    ${talent.nationality ? `<span>🌍 ${talent.nationality}</span>` : ''}
                    ${talent.age ? `<span>👤 Age ${talent.age}</span>` : ''}
                    ${talent.featured ? '<span class="badge">Featured</span>' : ''}
                    ${talent.published ? '<span class="badge published">Published</span>' : '<span class="badge draft">Draft</span>'}
                </div>
            </div>
            <div class="news-item-actions">
                <button onclick="editTalent(${talent.id})" class="btn btn-sm btn-secondary">Edit</button>
                <button onclick="deleteTalent(${talent.id})" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;
        talentsList.appendChild(talentItem);
    });
}

// Add talent button
document.getElementById('addTalentBtn')?.addEventListener('click', () => {
    currentTalentId = null;
    document.getElementById('talentModalTitle').textContent = 'Add New Talent';
    document.getElementById('talentForm').reset();
    document.getElementById('talentImagePreview').innerHTML = '';
    document.getElementById('talentShortBioCount').textContent = '0/200 characters';
    document.getElementById('talentModal').classList.add('active');
});

// Close talent modal
document.getElementById('closeTalentModal')?.addEventListener('click', () => {
    document.getElementById('talentModal').classList.remove('active');
});

document.getElementById('cancelTalentBtn')?.addEventListener('click', () => {
    document.getElementById('talentModal').classList.remove('active');
});

// Talent short bio character counter
document.getElementById('talentShortBio')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('talentShortBioCount').textContent = `${count}/200 characters`;
});

// Talent image preview
document.getElementById('talentImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('talentImagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Submit talent form
document.getElementById('talentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('talentName').value);
    formData.append('sport', document.getElementById('talentSport').value);
    formData.append('bio', document.getElementById('talentBio').value);
    formData.append('shortBio', document.getElementById('talentShortBio').value);
    formData.append('nationality', document.getElementById('talentNationality').value);
    formData.append('age', document.getElementById('talentAge').value);
    formData.append('position', document.getElementById('talentPosition').value);
    formData.append('team', document.getElementById('talentTeam').value);
    formData.append('achievements', document.getElementById('talentAchievements').value);
    formData.append('stats', document.getElementById('talentStats').value);
    formData.append('socialMedia', document.getElementById('talentSocialMedia').value);
    formData.append('featured', document.getElementById('talentFeatured').checked);
    formData.append('published', document.getElementById('talentPublished').checked);
    
    const imageFile = document.getElementById('talentImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const url = currentTalentId 
            ? `${API_BASE}/talents/${currentTalentId}`
            : `${API_BASE}/talents`;
        
        const response = await fetch(url, {
            method: currentTalentId ? 'PUT' : 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            document.getElementById('talentModal').classList.remove('active');
            loadTalents();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.message || 'Failed to save talent'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

// Edit talent
async function editTalent(id) {
    try {
        const response = await fetch(`${API_BASE}/talents/${id}`);
        const talent = await response.json();
        
        currentTalentId = id;
        document.getElementById('talentModalTitle').textContent = 'Edit Talent';
        document.getElementById('talentName').value = talent.name;
        document.getElementById('talentSport').value = talent.sport;
        document.getElementById('talentBio').value = talent.bio;
        document.getElementById('talentShortBio').value = talent.shortBio;
        document.getElementById('talentNationality').value = talent.nationality || '';
        document.getElementById('talentAge').value = talent.age || '';
        document.getElementById('talentPosition').value = talent.position || '';
        document.getElementById('talentTeam').value = talent.team || '';
        document.getElementById('talentAchievements').value = talent.achievements || '';
        document.getElementById('talentStats').value = talent.stats || '';
        document.getElementById('talentSocialMedia').value = talent.socialMedia || '';
        document.getElementById('talentFeatured').checked = talent.featured;
        document.getElementById('talentPublished').checked = talent.published;
        document.getElementById('talentShortBioCount').textContent = `${talent.shortBio.length}/200 characters`;
        
        if (talent.image) {
            document.getElementById('talentImagePreview').innerHTML = `<img src="${talent.image}" alt="Current image">`;
        }
        
        document.getElementById('talentModal').classList.add('active');
    } catch (error) {
        alert('Error loading talent');
    }
}

// Delete talent
async function deleteTalent(id) {
    if (!confirm('Are you sure you want to delete this talent?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/talents/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            loadTalents();
        } else {
            alert('Error deleting talent');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Sales/Rentals Management
let currentSalesRentalId = null;

// Load sales/rentals
async function loadSalesRentals() {
    try {
        const response = await fetch(`${API_BASE}/sales-rentals`);
        const items = await response.json();
        displaySalesRentals(items);
    } catch (error) {
        console.error('Error loading sales/rentals:', error);
        document.getElementById('salesRentalsList').innerHTML = '<p>Error loading items</p>';
    }
}

// Display sales/rentals
function displaySalesRentals(items) {
    const salesRentalsList = document.getElementById('salesRentalsList');
    salesRentalsList.innerHTML = '';
    
    if (items.length === 0) {
        salesRentalsList.innerHTML = '<p>No items found. Add your first item!</p>';
        return;
    }
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'news-item';
        
        const typeLabel = item.type === 'sale' ? 'For Sale' : 'For Rent';
        const priceDisplay = item.priceDisplay || (item.price ? `$${parseFloat(item.price).toLocaleString()}` : 'Contact for price');
        
        itemElement.innerHTML = `
            <div class="news-item-content">
                <h3>${item.title}</h3>
                <p>${item.shortDescription}</p>
                <div class="news-item-meta">
                    <span>${typeLabel === 'For Sale' ? '💰' : '🏠'} ${typeLabel}</span>
                    ${item.category ? `<span>📦 ${item.category}</span>` : ''}
                    ${item.location ? `<span>📍 ${item.location}</span>` : ''}
                    <span>💵 ${priceDisplay}</span>
                    ${item.featured ? '<span class="badge">Featured</span>' : ''}
                    ${item.published ? '<span class="badge published">Published</span>' : '<span class="badge draft">Draft</span>'}
                    ${!item.availability ? '<span class="badge" style="background: #dc3545;">Unavailable</span>' : ''}
                </div>
            </div>
            <div class="news-item-actions">
                <button onclick="editSalesRental(${item.id})" class="btn btn-sm btn-secondary">Edit</button>
                <button onclick="deleteSalesRental(${item.id})" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;
        salesRentalsList.appendChild(itemElement);
    });
}

// Add sales/rental button
document.getElementById('addSalesRentalBtn')?.addEventListener('click', () => {
    currentSalesRentalId = null;
    document.getElementById('salesRentalModalTitle').textContent = 'Add New Item';
    document.getElementById('salesRentalForm').reset();
    document.getElementById('salesRentalImagePreview').innerHTML = '';
    document.getElementById('salesRentalShortDescCount').textContent = '0/200 characters';
    document.getElementById('salesRentalAvailability').checked = true;
    document.getElementById('salesRentalModal').classList.add('active');
});

// Close sales/rental modal
document.getElementById('closeSalesRentalModal')?.addEventListener('click', () => {
    document.getElementById('salesRentalModal').classList.remove('active');
});

document.getElementById('cancelSalesRentalBtn')?.addEventListener('click', () => {
    document.getElementById('salesRentalModal').classList.remove('active');
});

// Sales/rental short description character counter
document.getElementById('salesRentalShortDescription')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('salesRentalShortDescCount').textContent = `${count}/200 characters`;
});

// Sales/rental image preview
document.getElementById('salesRentalImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('salesRentalImagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Submit sales/rental form
document.getElementById('salesRentalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('salesRentalTitle').value);
    formData.append('description', document.getElementById('salesRentalDescription').value);
    formData.append('shortDescription', document.getElementById('salesRentalShortDescription').value);
    formData.append('type', document.getElementById('salesRentalType').value);
    formData.append('category', document.getElementById('salesRentalCategory').value);
    formData.append('price', document.getElementById('salesRentalPrice').value);
    formData.append('priceDisplay', document.getElementById('salesRentalPriceDisplay').value);
    formData.append('location', document.getElementById('salesRentalLocation').value);
    formData.append('condition', document.getElementById('salesRentalCondition').value);
    formData.append('contactEmail', document.getElementById('salesRentalContactEmail').value);
    formData.append('contactPhone', document.getElementById('salesRentalContactPhone').value);
    formData.append('availability', document.getElementById('salesRentalAvailability').checked);
    formData.append('featured', document.getElementById('salesRentalFeatured').checked);
    formData.append('published', document.getElementById('salesRentalPublished').checked);
    
    const imageFile = document.getElementById('salesRentalImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const url = currentSalesRentalId 
            ? `${API_BASE}/sales-rentals/${currentSalesRentalId}`
            : `${API_BASE}/sales-rentals`;
        
        const response = await fetch(url, {
            method: currentSalesRentalId ? 'PUT' : 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        
        if (response.ok) {
            document.getElementById('salesRentalModal').classList.remove('active');
            loadSalesRentals();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.message || 'Failed to save item'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

// Edit sales/rental
async function editSalesRental(id) {
    try {
        const response = await fetch(`${API_BASE}/sales-rentals/${id}`);
        const item = await response.json();
        
        currentSalesRentalId = id;
        document.getElementById('salesRentalModalTitle').textContent = 'Edit Item';
        document.getElementById('salesRentalTitle').value = item.title;
        document.getElementById('salesRentalDescription').value = item.description;
        document.getElementById('salesRentalShortDescription').value = item.shortDescription;
        document.getElementById('salesRentalType').value = item.type;
        document.getElementById('salesRentalCategory').value = item.category || '';
        document.getElementById('salesRentalPrice').value = item.price || '';
        document.getElementById('salesRentalPriceDisplay').value = item.priceDisplay || '';
        document.getElementById('salesRentalLocation').value = item.location || '';
        document.getElementById('salesRentalCondition').value = item.condition || '';
        document.getElementById('salesRentalContactEmail').value = item.contactEmail || '';
        document.getElementById('salesRentalContactPhone').value = item.contactPhone || '';
        document.getElementById('salesRentalAvailability').checked = item.availability !== false;
        document.getElementById('salesRentalFeatured').checked = item.featured;
        document.getElementById('salesRentalPublished').checked = item.published;
        document.getElementById('salesRentalShortDescCount').textContent = `${item.shortDescription.length}/200 characters`;
        
        if (item.image) {
            document.getElementById('salesRentalImagePreview').innerHTML = `<img src="${item.image}" alt="Current image">`;
        }
        
        document.getElementById('salesRentalModal').classList.add('active');
    } catch (error) {
        alert('Error loading item');
    }
}

// Delete sales/rental
async function deleteSalesRental(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/sales-rentals/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            loadSalesRentals();
        } else {
            alert('Error deleting item');
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
    const currentUserRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const isSuperAdmin = currentUserRole === 'super_admin';
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
                ${isSuperAdmin ? `<button class="btn btn-sm btn-secondary" onclick="window.editUser(${user.id})">Edit</button>` : ''}
                ${isSuperAdmin && user.id !== parseInt((localStorage.getItem('userId') || sessionStorage.getItem('userId')) || '0') ? 
                    `<button class="btn btn-sm btn-warning" onclick="resetUserPassword(${user.id}, '${user.username}')">Reset Password</button>` : 
                    ''
                }
                ${isSuperAdmin && user.id !== parseInt((localStorage.getItem('userId') || sessionStorage.getItem('userId')) || '0') ? 
                    `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>` : 
                    user.id === parseInt((localStorage.getItem('userId') || sessionStorage.getItem('userId')) || '0') ? '<span class="text-muted">Cannot delete yourself</span>' : ''
                }
            </div>
        `;
        usersList.appendChild(userDiv);
    });
}

// Add user button (only for super admin)
document.getElementById('addUserBtn')?.addEventListener('click', () => {
    const currentUserRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    if (currentUserRole === 'super_admin') {
        showUserModal();
    } else {
        alert('Only super admin can create users.');
    }
});

// Reset user password (super admin only)
async function resetUserPassword(userId, username) {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    if (!confirm(`Are you sure you want to reset the password for ${username}?`)) return;
    
    try {
        // Get fresh token from storage
        const useRememberMe = localStorage.getItem('rememberMe') === 'true';
        const currentToken = useRememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        
        if (!currentToken) {
            alert('Session expired. Please log in again.');
            logout();
            return;
        }
        
        const response = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });
        
        if (response.status === 401) {
            alert('Session expired. Please log in again.');
            logout();
            return;
        }
        
        if (response.ok) {
            alert('Password reset successfully!');
            loadUsers();
        } else {
            const data = await response.json().catch(() => ({}));
            alert('Error: ' + (data.message || 'Failed to reset password'));
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('Network error. Please try again.');
    }
}

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
    console.log('showUserModal called with user:', user);
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    const passwordInput = document.getElementById('userPassword');
    const passwordHelp = document.getElementById('passwordHelp');
    
    if (!modal) {
        console.error('User modal not found!');
        alert('Error: User modal not found. Please refresh the page.');
        return;
    }
    
    if (user) {
        // Edit mode
        console.log('Setting up edit mode for user:', user);
        title.textContent = 'Edit User';
        document.getElementById('userId').value = user.id || '';
        document.getElementById('userUsername').value = user.username || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userRole').value = user.role || 'editor';
        if (passwordInput) {
            passwordInput.required = false;
            passwordInput.value = '';
        }
        if (passwordHelp) {
            passwordHelp.style.display = 'block';
        }
    } else {
        // Add mode
        console.log('Setting up add mode');
        title.textContent = 'Add New User';
        if (form) form.reset();
        document.getElementById('userId').value = '';
        if (passwordInput) {
            passwordInput.required = true;
        }
        if (passwordHelp) {
            passwordHelp.style.display = 'none';
        }
    }
    
    modal.classList.add('active');
    console.log('Modal should be visible now');
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
        console.log('Form submitted. UserId:', userId, 'UserData:', userData);
        if (userId) {
            await updateUser(userId, userData);
        } else {
            await createUser(userData);
        }
    } catch (error) {
        console.error('Form submission error:', error);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.add('show');
    } finally {
        const submitBtn = document.querySelector('#userForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = userId ? 'Update User' : 'Create User';
        }
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
        // Get fresh token from storage
        const useRememberMe = localStorage.getItem('rememberMe') === 'true';
        const currentToken = useRememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        
        if (!currentToken) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
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
        // Get fresh token from storage
        const useRememberMe = localStorage.getItem('rememberMe') === 'true';
        const currentToken = useRememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        
        if (!currentToken) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const updateData = { ...userData };
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }
        
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        let errorMessage = 'Failed to update user';
        
        if (response.status === 401) {
            errorDiv.textContent = 'Session expired. Please log in again.';
            errorDiv.classList.add('show');
            setTimeout(() => logout(), 2000);
            return;
        }
        
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
    console.log('editUser called with id:', id);
    try {
        // Get fresh token from storage
        const useRememberMe = localStorage.getItem('rememberMe') === 'true';
        const currentToken = useRememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        
        console.log('Current token exists:', !!currentToken);
        
        if (!currentToken) {
            alert('Session expired. Please log in again.');
            logout();
            return;
        }
        
        console.log('Fetching user:', `${API_BASE}/users/${id}`);
        const response = await fetch(`${API_BASE}/users/${id}`, {
            headers: { 
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
            alert('Session expired. Please log in again.');
            logout();
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error response:', errorData);
            throw new Error(errorData.message || 'Failed to load user');
        }
        
        const user = await response.json();
        console.log('User loaded:', user);
        showUserModal(user);
    } catch (error) {
        console.error('Error loading user:', error);
        alert('Error loading user: ' + (error.message || 'Unknown error'));
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        // Get fresh token from storage
        const useRememberMe = localStorage.getItem('rememberMe') === 'true';
        const currentToken = useRememberMe ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        
        if (!currentToken) {
            alert('Session expired. Please log in again.');
            logout();
            return;
        }
        
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
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
window.resetUserPassword = resetUserPassword;
window.editNews = editNews;
window.deleteNews = deleteNews;
window.approveComment = approveComment;
window.rejectComment = rejectComment;
window.deleteComment = deleteComment;
window.editUser = editUser;
window.deleteUser = deleteUser;

