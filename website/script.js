// Main JavaScript for the website

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeFontToggle();
    initializeSearch();
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

// Save blog post to localStorage
function saveBlogPost(post) {
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.unshift(post); // Add to beginning
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Load blog posts from localStorage
function loadBlogPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet. Create your first post above!</p>';
        return;
    }

    postsContainer.innerHTML = '';
    posts.forEach(post => {
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
}

// Format content (convert line breaks to <br>)
function formatContent(content) {
    return escapeHtml(content).replace(/\n/g, '<br>');
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

