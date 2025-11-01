// Main JavaScript for the website

// Blog author password
const BLOG_AUTHOR_PASSWORD = '1313'; // Same as game password, change if needed
const BLOG_AUTH_STORAGE_KEY = 'blogAuthorAccess';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeSearch();
    initializeBlogPosts(); // Only load posts, not create form
    setActiveNavLink();
});

// Search Functionality
async function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !searchBtn) return;

    async function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        const results = [];
        
        // Search blog posts (from public JSON only)
        try {
            const blogResponse = await fetch('blog-posts.json');
            if (blogResponse.ok) {
                const blogPosts = await blogResponse.json();
                if (Array.isArray(blogPosts)) {
                    blogPosts.forEach(post => {
                        const titleMatch = post.title && post.title.toLowerCase().includes(query);
                        const contentMatch = post.content && post.content.toLowerCase().includes(query);
                        if (titleMatch || contentMatch) {
                            results.push({
                                type: 'Blog Post',
                                title: post.title,
                                content: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
                                url: 'index.html',
                                date: post.date
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Could not search blog posts');
        }

        // Search section content (from public JSON only)
        try {
            const sectionResponse = await fetch('section-content.json');
            if (sectionResponse.ok) {
                const sections = await sectionResponse.json();
                for (const [sectionName, content] of Object.entries(sections)) {
                    if (content && content.toLowerCase().includes(query)) {
                        const sectionUrl = getSectionUrl(sectionName);
                        results.push({
                            type: 'Section',
                            title: sectionName,
                            content: content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                            url: sectionUrl
                        });
                    }
                }
            }
        } catch (error) {
            console.log('Could not search sections');
        }

        // Search reading list (from public JSON only)
        try {
            const readingResponse = await fetch('reading-list.json');
            if (readingResponse.ok) {
                const readingList = await readingResponse.json();
                if (Array.isArray(readingList)) {
                    readingList.forEach(entry => {
                        const nameMatch = entry.name && entry.name.toLowerCase().includes(query);
                        const authorMatch = entry.author && entry.author.toLowerCase().includes(query);
                        const tagMatch = entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query));
                        if (nameMatch || authorMatch || tagMatch) {
                            results.push({
                                type: 'Reading List',
                                title: entry.name + ' by ' + entry.author,
                                content: 'Tags: ' + (entry.tags ? entry.tags.join(', ') : ''),
                                url: 'reading-list.html'
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Could not search reading list');
        }

        // Search PDFs (from public JSON only)
        try {
            const pdfResponse = await fetch('pdfs.json');
            if (pdfResponse.ok) {
                const pdfs = await pdfResponse.json();
                if (Array.isArray(pdfs)) {
                    pdfs.forEach(pdf => {
                        const titleMatch = pdf.title && pdf.title.toLowerCase().includes(query);
                        const descMatch = pdf.description && pdf.description.toLowerCase().includes(query);
                        const sectionMatch = pdf.section && pdf.section.toLowerCase().includes(query);
                        if (titleMatch || descMatch || sectionMatch) {
                            results.push({
                                type: 'PDF',
                                title: pdf.title,
                                content: pdf.description || '',
                                url: pdf.id ? 'view-pdf.html?id=' + pdf.id : 'pdfs.html'
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Could not search PDFs');
        }

        // Display results
        displaySearchResults(query, results);
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function getSectionUrl(sectionName) {
    const urlMap = {
        'Home': 'index.html',
        'About': 'about.html',
        'Notes': 'notes.html',
        'Writing': 'writing.html',
        'Poetry': 'poetry.html',
        'Game': 'game.html',
        'Resume': 'resume.html',
        'Reading List': 'reading-list.html'
    };
    return urlMap[sectionName] || 'index.html';
}

function displaySearchResults(query, results) {
    // Remove any existing modal
    const existingModal = document.getElementById('search-results-modal');
    if (existingModal) {
        existingModal.remove();
    }

    if (results.length === 0) {
        alert('No results found for "' + query + '"\n\nOnly public content (from JSON files) is searchable.');
        return;
    }

    let resultsHTML = '<h2 style="margin-top: 0; color: var(--text-color);">Search Results for "' + escapeHtml(query) + '"</h2>';
    resultsHTML += '<p style="color: #666;">Found ' + results.length + ' result(s) in public content</p><ul style="list-style: none; padding: 0; margin: 0;">';

    results.forEach(result => {
        resultsHTML += '<li style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 3px solid var(--link-color);">';
        resultsHTML += '<strong style="color: var(--link-color); font-size: 12px;">[' + escapeHtml(result.type) + ']</strong> ';
        resultsHTML += '<strong style="color: var(--text-color); display: block; margin-top: 5px;">' + escapeHtml(result.title) + '</strong>';
        if (result.content) {
            resultsHTML += '<p style="color: #666; font-size: 12px; margin: 5px 0;">' + escapeHtml(result.content) + '</p>';
        }
        if (result.date) {
            resultsHTML += '<span style="color: #888; font-size: 11px;">' + escapeHtml(result.date) + '</span><br>';
        }
        resultsHTML += '<a href="' + escapeHtml(result.url) + '" style="color: var(--link-color); text-decoration: underline; font-size: 13px;">View →</a>';
        resultsHTML += '</li>';
    });

    resultsHTML += '</ul>';

    // Create a modal to show results
    const resultsModal = document.createElement('div');
    resultsModal.id = 'search-results-modal';
    resultsModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 10000; overflow-y: auto;';
    resultsModal.innerHTML = '<div style="max-width: 800px; margin: 50px auto; background-color: var(--bg-color); padding: 30px; border: 2px solid var(--border-color); box-shadow: 0 4px 8px rgba(0,0,0,0.3);">' +
        resultsHTML +
        '<button onclick="document.getElementById(\'search-results-modal\').remove()" style="margin-top: 20px; padding: 10px 20px; background-color: var(--link-color); color: white; border: none; cursor: pointer; font-size: 14px;">Close</button>' +
        '</div>';
    
    // Click outside to close
    resultsModal.addEventListener('click', function(e) {
        if (e.target === resultsModal) {
            resultsModal.remove();
        }
    });
    
    document.body.appendChild(resultsModal);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Blog Author Authentication - moved to edit section

// Blog Post Management
function initializeBlogPosts() {
    // Only handle blog form if we're NOT on the edit page
    // The edit page has its own handler for the blog form
    if (window.location.pathname.includes('edit.html')) {
        // Just load and display posts, don't handle form
        loadBlogPosts();
        return;
    }

    const blogForm = document.getElementById('blog-post-form');
    if (!blogForm) {
        // Just load and display posts if no form exists
        loadBlogPosts();
        return;
    }

    // Load and display existing posts
    loadBlogPosts();

    // Handle form submission (only if form exists and not on edit page)
    blogForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('post-title').value.trim();
        const imageUrl = document.getElementById('post-image').value.trim();
        const content = document.getElementById('post-content').value.trim();

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

