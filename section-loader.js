// Section Content Loader - Loads dynamic content for sections

document.addEventListener('DOMContentLoaded', function() {
    // Only load if we're not on the game page with password protection active
    const gameContent = document.getElementById('game-content');
    const isGameProtected = gameContent && gameContent.style.display === 'none';
    
    if (isGameProtected) {
        // Wait for game.js to show content
        return;
    }
    
    // Get current page name from URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = currentPage.replace('.html', '');
    
    // Map page names to section names
    const pageToSection = {
        'index': 'Home',
        'about': 'About',
        'notes': 'Notes',
        'writing': 'Writing',
        'poetry': 'Writing', // Poetry now redirects to Writing
        'math': 'Math',
        'game': 'Game',
        'resume': 'Resume',
        'reading-list': 'Reading List'
    };
    
    const sectionName = pageToSection[pageName];
    
    if (sectionName) {
        loadSectionContent(sectionName);
    }
});

// Function to reload section content (for game section after password)
function reloadSectionContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = currentPage.replace('.html', '');
    const pageToSection = {
        'index': 'Home',
        'about': 'About',
        'notes': 'Notes',
        'writing': 'Writing',
        'poetry': 'Writing', // Poetry now redirects to Writing
        'math': 'Math',
        'game': 'Game',
        'resume': 'Resume',
        'reading-list': 'Reading List'
    };
    const sectionName = pageToSection[pageName];
    if (sectionName) {
        loadSectionContentForPage(sectionName);
    }
}

// Load section content for a specific page
async function loadSectionContentForPage(sectionName) {
    const container = document.getElementById('section-content') || document.querySelector('.section-content');
    if (!container) return;

    try {
        // Try to load from JSON file first
        const response = await fetch('section-content.json');
        if (response.ok) {
            const sections = await response.json();
            const content = sections[sectionName] || '';
            
            if (content) {
                // Check if content contains HTML tags (like <img>)
                if (content.includes('<') && content.includes('>')) {
                    container.innerHTML = content;
                } else {
                    container.innerHTML = formatContent(content);
                }
                renderMathJax(container);
                return;
            }
        }
    } catch (error) {
        console.log('Could not load section-content.json');
    }
    
    // Fallback to localStorage
    const sections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
    const content = sections[sectionName] || '';
    
    if (content) {
        // Check if content contains HTML tags (like <img>)
        if (content.includes('<') && content.includes('>')) {
            container.innerHTML = content;
        } else {
            container.innerHTML = formatContent(content);
        }
        renderMathJax(container);
    }
}

// Make it available globally
window.reloadSectionContent = reloadSectionContent;

// Load section content from JSON or localStorage
async function loadSectionContent(sectionName) {
    const container = document.getElementById('section-content') || document.querySelector('.section-content');
    if (!container) return;

    try {
        // Try to load from JSON file first
        const response = await fetch('section-content.json');
        if (response.ok) {
            const sections = await response.json();
            const content = sections[sectionName] || '';
            
            if (content) {
                // Check if content contains HTML tags (like <img>)
                if (content.includes('<') && content.includes('>')) {
                    container.innerHTML = content;
                } else {
                    container.innerHTML = formatContent(content);
                }
                renderMathJax(container);
                return;
            }
        }
    } catch (error) {
        console.log('Could not load section-content.json');
    }
    
    // Fallback to localStorage
    const sections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
    const content = sections[sectionName] || '';
    
    if (content) {
        // Check if content contains HTML tags (like <img>)
        if (content.includes('<') && content.includes('>')) {
            container.innerHTML = content;
        } else {
            container.innerHTML = formatContent(content);
        }
        renderMathJax(container);
    }
}

// Render MathJax in content
function renderMathJax(element) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([element]).catch(function(err) {
            console.log('MathJax rendering error:', err);
        });
    }
}

// Format content from text to HTML
function formatContent(text) {
    if (!text) return '';
    
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Handle headings
        if (trimmed.startsWith('===') && trimmed.endsWith('===')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            const headingText = trimmed.replace(/===/g, '').trim();
            html += `<h3>${escapeHtml(headingText)}</h3>\n`;
        } else if (trimmed.startsWith('###') && trimmed.endsWith('###')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            const headingText = trimmed.replace(/###/g, '').trim();
            html += `<h4>${escapeHtml(headingText)}</h4>\n`;
        }
        // Handle bullet points
        else if (trimmed.startsWith('- ')) {
            if (!inList) {
                html += '<ul>\n';
                inList = true;
            }
            const bulletText = trimmed.substring(2).trim();
            html += `<li>${escapeHtml(bulletText)}</li>\n`;
        }
        // Handle empty lines
        else if (trimmed === '') {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            html += '<br>\n';
        }
        // Handle regular paragraphs
        else {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            html += `<p>${escapeHtml(line)}</p>\n`;
        }
    });
    
    // Close any open list
    if (inList) {
        html += '</ul>';
    }
    
    return html;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

