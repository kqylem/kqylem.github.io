// Reading List JavaScript

const READING_AUTHOR_PASSWORD = '1313';
const READING_AUTH_STORAGE_KEY = 'readingAuthorAccess';

// Tag colors mapping
const TAG_COLORS = {
    'cozy': '#FFB6C1',      // Light pink
    'good': '#90EE90',      // Light green
    'bad': '#FFB6C6',       // Light red
    'quick': '#87CEEB',     // Sky blue
    'beautiful': '#DDA0DD', // Plum
    'boring': '#D3D3D3',    // Light gray
    'sad': '#B0C4DE',       // Light steel blue
    'humorous': '#FFD700',  // Gold
    'whimsical': '#FFA07A', // Light salmon
    'dense': '#708090',     // Slate gray
    'loaded': '#4169E1',    // Royal blue (changed from purple)
    'arcane': '#8B4513',    // Saddle brown
    'esoteric': '#4B0082'   // Indigo
};

document.addEventListener('DOMContentLoaded', function() {
    initializeReadingAuth();
    initializeReadingForm();
    loadReadingList();
});

// Reading Author Authentication
function initializeReadingAuth() {
    const readingAuth = document.getElementById('reading-auth');
    const readingFormContainer = document.getElementById('reading-form-container');
    
    if (!readingAuth || !readingFormContainer) return;

    const hasAccess = sessionStorage.getItem(READING_AUTH_STORAGE_KEY) === 'true';
    
    if (hasAccess) {
        readingAuth.style.display = 'none';
        readingFormContainer.style.display = 'block';
    } else {
        readingAuth.style.display = 'block';
        readingFormContainer.style.display = 'none';
        
        const passwordInput = document.getElementById('reading-password-input');
        const passwordSubmit = document.getElementById('reading-password-submit');
        const passwordError = document.getElementById('reading-password-error');
        const readingLogout = document.getElementById('reading-logout');
        
        if (passwordSubmit && passwordInput) {
            function checkPassword() {
                const enteredPassword = passwordInput.value.trim();
                
                if (enteredPassword === READING_AUTHOR_PASSWORD) {
                    sessionStorage.setItem(READING_AUTH_STORAGE_KEY, 'true');
                    readingAuth.style.display = 'none';
                    readingFormContainer.style.display = 'block';
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
        
        if (readingLogout) {
            readingLogout.addEventListener('click', function() {
                sessionStorage.removeItem(READING_AUTH_STORAGE_KEY);
                readingAuth.style.display = 'block';
                readingFormContainer.style.display = 'none';
            });
        }
    }
    
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

// Initialize Reading Form
function initializeReadingForm() {
    const readingForm = document.getElementById('reading-entry-form');
    if (!readingForm) return;

    // Set today's date as default
    const dateInput = document.getElementById('entry-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    readingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('entry-name').value.trim();
        const author = document.getElementById('entry-author').value.trim();
        const tagsInput = document.getElementById('entry-tags').value.trim();
        const complete = document.getElementById('entry-complete').value;
        const date = document.getElementById('entry-date').value;

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
            }),
            dateValue: date // Store for sorting
        };

        saveReadingEntry(entry);
        displayReadingList();
        readingForm.reset();
        
        // Reset date to today
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        alert('Entry saved locally! Export to make it visible to everyone.');
    });
}

// Save reading entry to localStorage
function saveReadingEntry(entry) {
    let entries = JSON.parse(localStorage.getItem('readingList') || '[]');
    entries.unshift(entry); // Add to beginning
    localStorage.setItem('readingList', JSON.stringify(entries));
}

// Load reading list from JSON file and localStorage
async function loadReadingList() {
    const container = document.getElementById('reading-table-container');
    if (!container) return;

    let allEntries = [];
    
    // Load from JSON file (shared entries everyone can see)
    try {
        const response = await fetch('reading-list.json');
        if (response.ok) {
            const jsonEntries = await response.json();
            if (Array.isArray(jsonEntries)) {
                allEntries = jsonEntries;
            }
        }
    } catch (error) {
        console.log('Could not load reading-list.json, using localStorage only');
    }
    
    // Load from localStorage (local entries)
    const localEntries = JSON.parse(localStorage.getItem('readingList') || '[]');
    
    // Combine both sources
    allEntries = [...localEntries, ...allEntries];
    
    // Remove duplicates based on ID
    const uniqueEntries = [];
    const seenIds = new Set();
    allEntries.forEach(entry => {
        if (!seenIds.has(entry.id)) {
            seenIds.add(entry.id);
            uniqueEntries.push(entry);
        }
    });
    
    // Sort by ID (newest first)
    uniqueEntries.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    displayReadingList(uniqueEntries);
}

// Display reading list in table
function displayReadingList(entries) {
    const container = document.getElementById('reading-table-container');
    if (!container) return;

    if (!entries) {
        loadReadingList();
        return;
    }

    if (entries.length === 0) {
        container.innerHTML = '<p>No entries yet. Add your first entry above!</p>';
        return;
    }

    // Create table
    let tableHTML = `
        <table class="reading-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Author</th>
                    <th>Tags</th>
                    <th>Complete</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    entries.forEach(entry => {
        // Format tags with colors
        const tagsHTML = entry.tags.map(tag => {
            const color = TAG_COLORS[tag] || '#888888';
            return `<span class="reading-tag" style="background-color: ${color};">#${escapeHtml(tag)}</span>`;
        }).join(' ');

        tableHTML += `
            <tr>
                <td>${escapeHtml(entry.name)}</td>
                <td>${escapeHtml(entry.author)}</td>
                <td>${tagsHTML || '<span style="color: #888;">—</span>'}</td>
                <td>${escapeHtml(entry.complete)}</td>
                <td>${escapeHtml(entry.date)}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

