// Main JavaScript for the website

// Blog author password
const BLOG_AUTHOR_PASSWORD = '1313'; // Same as game password, change if needed
const BLOG_AUTH_STORAGE_KEY = 'blogAuthorAccess';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeFontToggle();
    initializeDarkMode();
    initializeSearch();
    initializeBlogAuth();
    initializeBlogPosts();
    setActiveNavLink();
});

// Font Toggle (IBM BIOS Font)
function initializeFontToggle() {
    const fontToggle = document.getElementById('bios-font-toggle');
    if (!fontToggle) return;

    // Check if font toggle was previously enabled
    const savedFontPreference = localStorage.getItem('biosFontEnabled');
    if (savedFontPreference === 'true') {
        fontToggle.checked = true;
        document.body.classList.add('bios-font');
    }

    // Toggle font on checkbox change
    fontToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('bios-font');
            localStorage.setItem('biosFontEnabled', 'true');
        } else {
            document.body.classList.remove('bios-font');
            localStorage.setItem('biosFontEnabled', 'false');
        }
    });
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !searchBtn) return;

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        // Simple search - redirect to search results or highlight matches
        // For now, just show an alert (can be enhanced later)
        if (query.length > 0) {
            alert('Search functionality: "' + query + '"\n\nThis is a basic search. You can enhance this to search through blog posts and page content.');
            // Future: Implement actual search through blog posts and pages
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Dark Mode Toggle
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;

    // Check if dark mode was previously enabled
    const savedDarkMode = localStorage.getItem('darkModeEnabled');
    if (savedDarkMode === 'true') {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }

    // Toggle dark mode on checkbox change
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkModeEnabled', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkModeEnabled', 'false');
        }
    });
}

// Blog Author Authentication
function initializeBlogAuth() {
    const blogAuth = document.getElementById('blog-auth');
    const blogFormContainer = document.getElementById('blog-form-container');
    
    if (!blogAuth || !blogFormContainer) return;

    // Check if already authenticated
    const hasAccess = sessionStorage.getItem(BLOG_AUTH_STORAGE_KEY) === 'true';
    
    if (hasAccess) {
        blogAuth.style.display = 'none';
        blogFormContainer.style.display = 'block';
    } else {
        blogAuth.style.display = 'block';
        blogFormContainer.style.display = 'none';
        
        const passwordInput = document.getElementById('blog-password-input');
        const passwordSubmit = document.getElementById('blog-password-submit');
        const passwordError = document.getElementById('blog-password-error');
        const blogLogout = document.getElementById('blog-logout');
        
        if (passwordSubmit && passwordInput) {
            function checkPassword() {
                const enteredPassword = passwordInput.value.trim();
                
                if (enteredPassword === BLOG_AUTHOR_PASSWORD) {
                    sessionStorage.setItem(BLOG_AUTH_STORAGE_KEY, 'true');
                    blogAuth.style.display = 'none';
                    blogFormContainer.style.display = 'block';
                    if (passwordError) passwordError.textContent = '';
                    passwordInput.value = '';
                } else {
                    if (passwordError) {
                        passwordError.textContent = 'Incorrect password. Please try again.';
                    }
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }

            passwordSubmit.addEventListener('click', checkPassword);
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkPassword();
                }
            });
            passwordInput.focus();
        }
        
        // Logout button
        if (blogLogout) {
            blogLogout.addEventListener('click', function() {
                sessionStorage.removeItem(BLOG_AUTH_STORAGE_KEY);
                blogAuth.style.display = 'block';
                blogFormContainer.style.display = 'none';
            });
        }
    }
    
    // Export posts button
    const exportBtn = document.getElementById('export-posts');
    const exportResult = document.getElementById('export-result');
    const exportJson = document.getElementById('export-json');
    
    if (exportBtn && exportResult && exportJson) {
        exportBtn.addEventListener('click', function() {
            const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            
            if (localPosts.length === 0) {
                alert('No local posts to export. Create some posts first!');
                return;
            }
            
            // Format JSON nicely
            const jsonString = JSON.stringify(localPosts, null, 2);
            exportJson.value = jsonString;
            exportResult.style.display = 'block';
            exportJson.focus();
            exportJson.select();
        });
    }
}

// Blog Post Management
function initializeBlogPosts() {
    const blogForm = document.getElementById('blog-post-form');
    if (!blogForm) return;

    // Load and display existing posts
    loadBlogPosts();

    // Handle form submission
    blogForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('post-title').value;
        const imageUrl = document.getElementById('post-image').value;
        const content = document.getElementById('post-content').value;

        if (!title || !content) {
            alert('Please fill in the title and content.');
            return;
        }

        // Create blog post object
        const post = {
            id: Date.now(),
            title: title,
            imageUrl: imageUrl,
            content: content,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };

        // Save to localStorage
        saveBlogPost(post);

        // Display the post
        displayBlogPost(post);

        // Reset form
        blogForm.reset();
    });
}

// Save blog post to localStorage (temporary storage)
// Note: Posts saved here are only visible on your device
// To make posts visible to everyone, you'll need to manually add them to blog-posts.json
function saveBlogPost(post) {
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.unshift(post); // Add to beginning
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // Show message about making posts public
    alert('Post saved locally! To make this post visible to everyone, you need to:\n\n' +
          '1. Open blog-posts.json in your repository\n' +
          '2. Add this post to the JSON array\n' +
          '3. Commit and push to GitHub\n\n' +
          'For now, this post is only visible on this browser.');
}

// Load blog posts - from JSON file first, then localStorage
async function loadBlogPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    let allPosts = [];
    
    // First, try to load from JSON file (shared posts everyone can see)
    try {
        const response = await fetch('blog-posts.json');
        if (response.ok) {
            const jsonPosts = await response.json();
            if (Array.isArray(jsonPosts)) {
                allPosts = jsonPosts;
            }
        }
    } catch (error) {
        console.log('Could not load blog-posts.json, using localStorage only');
    }
    
    // Also load from localStorage (local posts)
    const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    // Combine both sources, localStorage posts first (most recent)
    allPosts = [...localPosts, ...allPosts];
    
    // Remove duplicates based on ID
    const uniquePosts = [];
    const seenIds = new Set();
    allPosts.forEach(post => {
        if (!seenIds.has(post.id)) {
            seenIds.add(post.id);
            uniquePosts.push(post);
        }
    });
    
    // Sort by ID (newest first)
    uniquePosts.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    if (uniquePosts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet. Create your first post above!</p>';
        return;
    }

    postsContainer.innerHTML = '';
    uniquePosts.forEach(post => {
        displayBlogPost(post, postsContainer);
    });
}

// Display a single blog post
function displayBlogPost(post, container) {
    if (!container) {
        container = document.getElementById('posts-container');
    }
    if (!container) return;

    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    let imageHtml = '';
    if (post.imageUrl) {
        imageHtml = `<img src="${post.imageUrl}" alt="${post.title}" class="post-image" onerror="this.style.display='none'">`;
    }

    postElement.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <div class="post-date">${post.date}</div>
        </div>
        ${imageHtml}
        <div class="post-content">${formatContent(post.content)}</div>
    `;

    container.appendChild(postElement);
    
    // Render LaTeX in the post content
    const postContent = postElement.querySelector('.post-content');
    if (postContent) {
        renderMathJax(postContent);
    }
}

// Format content (convert line breaks to <br> and render LaTeX)
function formatContent(content) {
    // Escape HTML first
    let formatted = escapeHtml(content);
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

// Render MathJax after content is inserted
function renderMathJax(element) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([element]).catch(function (err) {
            console.log('MathJax rendering error:', err);
        });
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set active navigation link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

