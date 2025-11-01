// Edit Section JavaScript

const EDIT_AUTHOR_PASSWORD = '1313';
const EDIT_AUTH_STORAGE_KEY = 'editAuthorAccess';

document.addEventListener('DOMContentLoaded', function() {
    initializeEditAuth();
    initializeTabs();
    initializeBlogEditor();
    initializePDFEditor();
    initializeReadingEditor();
    initializeSectionEditor();
    initializeNewSection();
});

// Edit Author Authentication
function initializeEditAuth() {
    const editAuth = document.getElementById('edit-auth');
    const editContent = document.getElementById('edit-content');
    
    if (!editAuth || !editContent) return;

    const hasAccess = sessionStorage.getItem(EDIT_AUTH_STORAGE_KEY) === 'true';
    
    if (hasAccess) {
        editAuth.style.display = 'none';
        editContent.style.display = 'block';
    } else {
        editAuth.style.display = 'block';
        editContent.style.display = 'none';
        
        const passwordInput = document.getElementById('edit-password-input');
        const passwordSubmit = document.getElementById('edit-password-submit');
        const passwordError = document.getElementById('edit-password-error');
        
        if (passwordSubmit && passwordInput) {
            function checkPassword() {
                const enteredPassword = passwordInput.value.trim();
                
                if (enteredPassword === EDIT_AUTHOR_PASSWORD) {
                    sessionStorage.setItem(EDIT_AUTH_STORAGE_KEY, 'true');
                    editAuth.style.display = 'none';
                    editContent.style.display = 'block';
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
    }
}

// Tab Navigation
function initializeTabs() {
    const tabs = document.querySelectorAll('.edit-tab');
    const tabContents = document.querySelectorAll('.edit-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(`edit-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Blog Editor (from script.js)
function initializeBlogEditor() {
    const blogForm = document.getElementById('blog-post-form');
    if (!blogForm) return;

    blogForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('post-title').value;
        const imageUrl = document.getElementById('post-image').value;
        const content = document.getElementById('post-content').value;

        if (!title || !content) {
            alert('Please fill in the title and content.');
            return;
        }

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

        saveBlogPost(post);
        alert('Post saved locally! Export to make it visible to everyone.');
        blogForm.reset();
    });

    // Export button
    const exportBtn = document.getElementById('blog-export');
    const exportResult = document.getElementById('blog-export-result');
    const exportJson = document.getElementById('blog-export-json');
    
    if (exportBtn && exportResult && exportJson) {
        exportBtn.addEventListener('click', function() {
            const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            
            if (localPosts.length === 0) {
                alert('No local posts to export. Create some posts first!');
                return;
            }
            
            const jsonString = JSON.stringify(localPosts, null, 2);
            exportJson.value = jsonString;
            exportResult.style.display = 'block';
            exportJson.focus();
            exportJson.select();
        });
    }
}

function saveBlogPost(post) {
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.unshift(post);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// PDF Editor (simplified version)
function initializePDFEditor() {
    const pdfForm = document.getElementById('pdf-form');
    if (!pdfForm) return;

    const sourceRadios = document.querySelectorAll('input[name="pdf-source"]');
    const urlInputGroup = document.getElementById('url-input-group');
    const fileInputGroup = document.getElementById('file-input-group');
    const fileInput = document.getElementById('pdf-file');
    const fileInfo = document.getElementById('file-info');

    // Toggle between URL and file upload
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'url') {
                urlInputGroup.style.display = 'block';
                fileInputGroup.style.display = 'none';
            } else {
                urlInputGroup.style.display = 'none';
                fileInputGroup.style.display = 'block';
            }
        });
    });

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type !== 'application/pdf') {
                    fileInfo.textContent = 'Error: Please select a PDF file.';
                    fileInfo.style.color = '#cc0000';
                    this.value = '';
                    return;
                }
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                fileInfo.textContent = `Selected: ${file.name} (${fileSize} MB)`;
                fileInfo.style.color = '#666';
            } else {
                fileInfo.textContent = '';
            }
        });
    }

    pdfForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('pdf-title').value;
        const section = document.getElementById('pdf-section').value;
        const description = document.getElementById('pdf-description').value;
        const source = document.querySelector('input[name="pdf-source"]:checked').value;

        if (!title || !section) {
            alert('Please fill in all required fields.');
            return;
        }

        if (source === 'url') {
            const url = document.getElementById('pdf-url').value;
            if (!url) {
                alert('Please enter a PDF URL.');
                return;
            }
            addPDFByURL(title, section, description, url);
        } else {
            const file = document.getElementById('pdf-file').files[0];
            if (!file) {
                alert('Please select a PDF file.');
                return;
            }
            addPDFByFile(title, section, description, file);
        }
    });

    // Export button
    const exportBtn = document.getElementById('pdf-export');
    const exportResult = document.getElementById('pdf-export-result');
    const exportJson = document.getElementById('pdf-export-json');
    
    if (exportBtn && exportResult && exportJson) {
        exportBtn.addEventListener('click', function() {
            const localPDFs = JSON.parse(localStorage.getItem('pdfs') || '[]');
            
            if (localPDFs.length === 0) {
                alert('No local PDFs to export. Create some PDFs first!');
                return;
            }
            
            const jsonString = JSON.stringify(localPDFs, null, 2);
            exportJson.value = jsonString;
            exportResult.style.display = 'block';
            exportJson.focus();
            exportJson.select();
        });
    }
}

function addPDFByURL(title, section, description, url) {
    const pdf = {
        id: Date.now(),
        title: title,
        section: section,
        description: description || '',
        url: url,
        type: 'url',
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    };

    savePDF(pdf);
    document.getElementById('pdf-form').reset();
    document.getElementById('file-info').textContent = '';
    alert('PDF saved locally! Export to make it visible to everyone.');
}

function addPDFByFile(title, section, description, file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        const pdf = {
            id: Date.now(),
            title: title,
            section: section,
            description: description || '',
            fileName: file.name,
            data: base64Data,
            type: 'base64',
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };

        savePDF(pdf);
        document.getElementById('pdf-form').reset();
        document.getElementById('file-info').textContent = '';
        alert('PDF saved locally! Export to make it visible to everyone.');
    };

    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
}

function savePDF(pdf) {
    let pdfs = JSON.parse(localStorage.getItem('pdfs') || '[]');
    pdfs.unshift(pdf);
    localStorage.setItem('pdfs', JSON.stringify(pdfs));
}

// Reading List Editor
function initializeReadingEditor() {
    const readingForm = document.getElementById('reading-entry-form');
    if (!readingForm) return;

    // Set today's date as default
    const dateInput = document.getElementById('edit-entry-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    readingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('edit-entry-name').value.trim();
        const author = document.getElementById('edit-entry-author').value.trim();
        const tagsInput = document.getElementById('edit-entry-tags').value.trim();
        const complete = document.getElementById('edit-entry-complete').value;
        const date = document.getElementById('edit-entry-date').value;

        if (!name || !author || !date) {
            alert('Please fill in all required fields.');
            return;
        }

        // Parse tags
        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

        const entry = {
            id: Date.now(),
            name: name,
            author: author,
            tags: tags,
            complete: complete,
            date: new Date(date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };

        saveReadingEntry(entry);
        alert('Entry saved locally! Export to make it visible to everyone.');
        readingForm.reset();
        
        // Reset date to today
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    });

    // Export button
    const exportBtn = document.getElementById('reading-export');
    const exportResult = document.getElementById('reading-export-result');
    const exportJson = document.getElementById('reading-export-json');
    
    if (exportBtn && exportResult && exportJson) {
        exportBtn.addEventListener('click', function() {
            const localEntries = JSON.parse(localStorage.getItem('readingList') || '[]');
            
            if (localEntries.length === 0) {
                alert('No local entries to export. Create some entries first!');
                return;
            }
            
            const jsonString = JSON.stringify(localEntries, null, 2);
            exportJson.value = jsonString;
            exportResult.style.display = 'block';
            exportJson.focus();
            exportJson.select();
        });
    }
}

function saveReadingEntry(entry) {
    let entries = JSON.parse(localStorage.getItem('readingList') || '[]');
    entries.unshift(entry);
    localStorage.setItem('readingList', JSON.stringify(entries));
}

// Section Content Editor
function initializeSectionEditor() {
    const sectionSelect = document.getElementById('section-select');
    const sectionEditor = document.getElementById('section-editor');
    const sectionContentText = document.getElementById('section-content-text');
    const saveBtn = document.getElementById('save-section');
    const exportBtn = document.getElementById('section-export');
    const exportResult = document.getElementById('section-export-result');
    const exportJson = document.getElementById('section-export-json');
    const insertImageUrlBtn = document.getElementById('insert-image-url');
    const uploadImageBtn = document.getElementById('upload-image');
    const imageFileInput = document.getElementById('image-file-input');

    if (!sectionSelect) return;

    // Load available sections
    loadSectionOptions();

    sectionSelect.addEventListener('change', async function() {
        const sectionName = this.value;
        if (sectionName) {
            await loadSectionContent(sectionName);
            if (sectionEditor) sectionEditor.style.display = 'block';
        } else {
            if (sectionEditor) sectionEditor.style.display = 'none';
        }
    });

    // Insert Image URL
    if (insertImageUrlBtn && sectionContentText) {
        insertImageUrlBtn.addEventListener('click', function() {
            const url = prompt('Enter image URL:');
            if (!url) return;
            
            const alt = prompt('Enter image description (alt text):', '');
            const imgTag = `<img src="${url}" alt="${alt || ''}" style="max-width: 100%; height: auto;">`;
            
            const cursorPos = sectionContentText.selectionStart || sectionContentText.value.length;
            const textBefore = sectionContentText.value.substring(0, cursorPos);
            const textAfter = sectionContentText.value.substring(cursorPos);
            
            sectionContentText.value = textBefore + imgTag + '\n\n' + textAfter;
            
            // Set cursor after inserted image
            const newCursorPos = cursorPos + imgTag.length + 2;
            sectionContentText.focus();
            sectionContentText.setSelectionRange(newCursorPos, newCursorPos);
        });
    }

    // Upload Image (convert to base64)
    if (uploadImageBtn && imageFileInput && sectionContentText) {
        uploadImageBtn.addEventListener('click', function() {
            imageFileInput.click();
        });

        imageFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                const alt = prompt('Enter image description (alt text):', file.name);
                const imgTag = `<img src="${base64}" alt="${alt || ''}" style="max-width: 100%; height: auto;">`;
                
                const cursorPos = sectionContentText.selectionStart || sectionContentText.value.length;
                const textBefore = sectionContentText.value.substring(0, cursorPos);
                const textAfter = sectionContentText.value.substring(cursorPos);
                
                sectionContentText.value = textBefore + imgTag + '\n\n' + textAfter;
                
                // Set cursor after inserted image
                const newCursorPos = cursorPos + imgTag.length + 2;
                sectionContentText.focus();
                sectionContentText.setSelectionRange(newCursorPos, newCursorPos);

                // Reset file input
                imageFileInput.value = '';
            };
            reader.readAsDataURL(file);
        });
    }

    if (saveBtn && sectionContentText) {
        saveBtn.addEventListener('click', function() {
            const sectionName = sectionSelect.value;
            if (!sectionName) {
                alert('Please select a section first.');
                return;
            }

            const content = sectionContentText.value;
            saveSectionContent(sectionName, content);
            alert('Section content saved! Export to make it visible to everyone.');
        });
    }

    if (exportBtn && exportResult && exportJson) {
        exportBtn.addEventListener('click', function() {
            const allSections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
            
            if (Object.keys(allSections).length === 0) {
                alert('No section content to export. Edit some sections first!');
                return;
            }
            
            const jsonString = JSON.stringify(allSections, null, 2);
            exportJson.value = jsonString;
            exportResult.style.display = 'block';
            exportJson.focus();
            exportJson.select();
        });
    }
}

function loadSectionOptions() {
    const sectionSelect = document.getElementById('section-select');
    if (!sectionSelect) return;

    // Clear existing options to prevent duplicates
    sectionSelect.innerHTML = '';
    
    // Add default sections
    const defaultSections = ['Notes', 'Writing', 'Poetry', 'About', 'Home', 'Game', 'Resume', 'Reading List'];
    defaultSections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionSelect.appendChild(option);
    });
}

async function loadSectionContent(sectionName) {
    const sectionContentText = document.getElementById('section-content-text');
    if (!sectionContentText) return;

    let content = '';
    
    // Try localStorage first
    const sections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
    content = sections[sectionName] || '';
    
    // If not in localStorage, try to load from JSON file
    if (!content) {
        try {
            const response = await fetch('section-content.json');
            if (response.ok) {
                const jsonSections = await response.json();
                content = jsonSections[sectionName] || '';
            }
        } catch (error) {
            console.log('Could not load section-content.json');
        }
    }
    
    sectionContentText.value = content;
}

function saveSectionContent(sectionName, content) {
    let sections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
    sections[sectionName] = content;
    localStorage.setItem('sectionContent', JSON.stringify(sections));
}

// New Section Creator
function initializeNewSection() {
    const newSectionForm = document.getElementById('new-section-form');
    if (!newSectionForm) return;

    newSectionForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('new-section-name').value.trim();
        const url = document.getElementById('new-section-url').value.trim();
        const content = document.getElementById('new-section-content').value;

        if (!name || !url) {
            alert('Please fill in section name and URL.');
            return;
        }

        if (!url.endsWith('.html')) {
            alert('URL must end with .html');
            return;
        }

        // Save section info
        let sections = JSON.parse(localStorage.getItem('customSections') || '[]');
        sections.push({
            name: name,
            url: url,
            content: content
        });
        localStorage.setItem('customSections', JSON.stringify(sections));

        // Generate HTML template
        const htmlTemplate = generateSectionHTML(name, content);
        
        const resultDiv = document.getElementById('new-section-result');
        const htmlTextarea = document.getElementById('new-section-html');
        
        if (resultDiv) resultDiv.style.display = 'block';
        if (htmlTextarea) htmlTextarea.value = htmlTemplate;
        
        newSectionForm.reset();
        alert('Section created! Copy the HTML below and create the file in your repository.');
    });
}

function generateSectionHTML(sectionName, content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sectionName} - Personal Website</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
            }
        };
    </script>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="header-content">
                <h1 class="site-title">Personal Website</h1>
                <div class="header-controls">
                    <div class="search-container">
                        <input type="text" id="search-input" class="search-input" placeholder="Search...">
                        <button id="search-btn" class="search-btn">Go</button>
                    </div>
                    <label class="font-toggle">
                        <input type="checkbox" id="bios-font-toggle">
                        IBM BIOS Font
                    </label>
                    <label class="font-toggle">
                        <input type="checkbox" id="dark-mode-toggle">
                        Dark Mode
                    </label>
                </div>
            </div>
        </header>

        <div class="main-layout">
            <aside class="sidebar">
                <nav class="nav-menu">
                    <ul>
                        <li><a href="index.html" class="nav-link">Home</a></li>
                        <li><a href="about.html" class="nav-link">About</a></li>
                        <li><a href="notes.html" class="nav-link">Notes</a></li>
                        <li><a href="writing.html" class="nav-link">Writing</a></li>
                        <li><a href="poetry.html" class="nav-link">Poetry</a></li>
                        <li><a href="reading-list.html" class="nav-link">Reading List</a></li>
                        <li><a href="resume.html" class="nav-link">Resume</a></li>
                        <li><a href="pdfs.html" class="nav-link">PDFs</a></li>
                        <li><a href="game.html" class="nav-link">Game</a></li>
                        <li><a href="edit.html" class="nav-link">Edit</a></li>
                    </ul>
                </nav>
            </aside>

            <main class="content">
                <div class="page-header">
                    <h2>${sectionName}</h2>
                </div>

                <div class="content-section">
                    <div class="section-content" id="section-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="script.js"></script>
    <script>
        // Load section content
        async function loadSectionContent() {
            const container = document.getElementById('section-content');
            if (!container) return;

            try {
                const response = await fetch('section-content.json');
                if (response.ok) {
                    const sections = await response.json();
                    const content = sections['${sectionName}'] || '';
                    container.innerHTML = formatContent(content);
                } else {
                    // Try localStorage
                    const sections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
                    const content = sections['${sectionName}'] || '';
                    container.innerHTML = formatContent(content);
                }
            } catch (error) {
                // Fallback to localStorage
                const sections = JSON.parse(localStorage.getItem('sectionContent') || '{}');
                const content = sections['${sectionName}'] || '';
                container.innerHTML = formatContent(content);
            }
        }

        function formatContent(text) {
            if (!text) return '';
            let formatted = text
                .split('\\n')
                .map(line => {
                    if (line.startsWith('===') && line.endsWith('===')) {
                        return '<h3>' + line.replace(/===/g, '') + '</h3>';
                    }
                    if (line.startsWith('###') && line.endsWith('###')) {
                        return '<h4>' + line.replace(/###/g, '') + '</h4>';
                    }
                    if (line.startsWith('- ')) {
                        return '<li>' + line.substring(2) + '</li>';
                    }
                    if (line.trim() === '') {
                        return '';
                    }
                    return '<p>' + escapeHtml(line) + '</p>';
                })
                .join('\\n');
            
            // Wrap consecutive <li> in <ul>
            formatted = formatted.replace(/(<li>.*?<\\/li>(?:\\n<li>.*?<\\/li>)*)/g, '<ul>$1</ul>');
            
            return formatted;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        document.addEventListener('DOMContentLoaded', loadSectionContent);
    </script>
</body>
</html>`;
}

