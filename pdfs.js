// PDF Management JavaScript

const PDF_AUTHOR_PASSWORD = '1313';
const PDF_AUTH_STORAGE_KEY = 'pdfAuthorAccess';

document.addEventListener('DOMContentLoaded', function() {
    // PDF upload moved to edit section
    loadPDFs();
    initializeModal();
});

// PDF Author Authentication
function initializePDFAuth() {
    const pdfAuth = document.getElementById('pdf-auth');
    const pdfFormContainer = document.getElementById('pdf-form-container');
    
    if (!pdfAuth || !pdfFormContainer) return;

    // Check if already authenticated
    const hasAccess = sessionStorage.getItem(PDF_AUTH_STORAGE_KEY) === 'true';
    
    if (hasAccess) {
        pdfAuth.style.display = 'none';
        pdfFormContainer.style.display = 'block';
    } else {
        pdfAuth.style.display = 'block';
        pdfFormContainer.style.display = 'none';
        
        const passwordInput = document.getElementById('pdf-password-input');
        const passwordSubmit = document.getElementById('pdf-password-submit');
        const passwordError = document.getElementById('pdf-password-error');
        const pdfLogout = document.getElementById('pdf-logout');
        
        if (passwordSubmit && passwordInput) {
            function checkPassword() {
                const enteredPassword = passwordInput.value.trim();
                
                if (enteredPassword === PDF_AUTHOR_PASSWORD) {
                    sessionStorage.setItem(PDF_AUTH_STORAGE_KEY, 'true');
                    pdfAuth.style.display = 'none';
                    pdfFormContainer.style.display = 'block';
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
        if (pdfLogout) {
            pdfLogout.addEventListener('click', function() {
                sessionStorage.removeItem(PDF_AUTH_STORAGE_KEY);
                pdfAuth.style.display = 'block';
                pdfFormContainer.style.display = 'none';
            });
        }
    }
    
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

// Initialize PDF form
function initializePDFForm() {
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

    // Show file info when file is selected
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
                
                if (file.size > 10 * 1024 * 1024) {
                    fileInfo.textContent += ' - Large file, processing may take a moment...';
                }
            } else {
                fileInfo.textContent = '';
            }
        });
    }

    // Handle form submission
    pdfForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('pdf-title').value;
        const section = document.getElementById('pdf-section').value;
        const description = document.getElementById('pdf-description').value;
        const source = document.querySelector('input[name="pdf-source"]:checked').value;

        if (!title) {
            alert('Please enter a title.');
            return;
        }

        if (!section) {
            alert('Please select a section.');
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
}

// Add PDF by URL
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
    displayPDF(pdf);
    document.getElementById('pdf-form').reset();
    document.getElementById('file-info').textContent = '';
    alert('PDF saved locally! Export to make it visible to everyone.');
}

// Add PDF by file upload (convert to base64)
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
        displayPDF(pdf);
        document.getElementById('pdf-form').reset();
        document.getElementById('file-info').textContent = '';
        alert('PDF saved locally! Export to make it visible to everyone.');
    };

    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
}

// Save PDF to localStorage
function savePDF(pdf) {
    let pdfs = JSON.parse(localStorage.getItem('pdfs') || '[]');
    pdfs.unshift(pdf); // Add to beginning
    localStorage.setItem('pdfs', JSON.stringify(pdfs));
}

// Load PDFs from JSON file and localStorage
async function loadPDFs() {
    const pdfsContainer = document.getElementById('pdfs-container');
    if (!pdfsContainer) return;

    let allPDFs = [];
    
    // First, try to load from JSON file (shared PDFs everyone can see)
    try {
        const response = await fetch('pdfs.json');
        if (response.ok) {
            const jsonPDFs = await response.json();
            if (Array.isArray(jsonPDFs)) {
                allPDFs = jsonPDFs;
            }
        }
    } catch (error) {
        console.log('Could not load pdfs.json, using localStorage only');
    }
    
    // Also load from localStorage (local PDFs)
    const localPDFs = JSON.parse(localStorage.getItem('pdfs') || '[]');
    
    // Combine both sources (JSON first, then localStorage)
    allPDFs = [...allPDFs, ...localPDFs];
    
    // Remove duplicates based on ID (prefer JSON file version over localStorage)
    const uniquePDFs = [];
    const seenIds = new Set();
    // Process in reverse to prioritize JSON PDFs (they come first)
    for (let i = allPDFs.length - 1; i >= 0; i--) {
        if (!seenIds.has(allPDFs[i].id)) {
            seenIds.add(allPDFs[i].id);
            uniquePDFs.unshift(allPDFs[i]);
        }
    }
    
    // Sort by ID (newest first)
    uniquePDFs.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    if (uniquePDFs.length === 0) {
        pdfsContainer.innerHTML = '<p>No PDFs yet. Add your first PDF above!</p>';
        return;
    }

    pdfsContainer.innerHTML = '';
    uniquePDFs.forEach(pdf => {
        displayPDF(pdf, pdfsContainer);
    });
}

// Display a single PDF
function displayPDF(pdf, container) {
    if (!container) {
        container = document.getElementById('pdfs-container');
    }
    if (!container) return;

    const pdfElement = document.createElement('div');
    pdfElement.className = 'pdf-item';
    pdfElement.setAttribute('data-pdf-id', pdf.id);
    
    const sectionBadge = pdf.section ? `<span style="background-color: #e0e0e0; padding: 2px 8px; font-size: 11px; border-radius: 3px; margin-left: 10px;">${escapeHtml(pdf.section)}</span>` : '';
    
    pdfElement.innerHTML = `
        <div class="pdf-item-header">
            <h3 class="pdf-item-title">${escapeHtml(pdf.title)}${sectionBadge}</h3>
            <div class="pdf-item-date">${pdf.date}</div>
        </div>
        ${pdf.description ? `<div class="pdf-item-description">${escapeHtml(pdf.description)}</div>` : ''}
        <div class="pdf-item-actions">
            <a href="view-pdf.html?id=${pdf.id}" class="pdf-action-btn" target="_blank">View</a>
            <button class="pdf-action-btn download-pdf-btn" data-pdf-id="${pdf.id}">Download</button>
        </div>
    `;

    container.appendChild(pdfElement);

    // Attach download listener
    const downloadBtn = pdfElement.querySelector('.download-pdf-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadPDF(pdf));
    }
}

// Current PDF being viewed (for modal download)
let currentPDF = null;

// View PDF in modal (kept for backward compatibility)
function viewPDF(pdf) {
    window.location.href = `view-pdf.html?id=${pdf.id}`;
}

// Download PDF
function downloadPDF(pdf) {
    let pdfUrl;
    let fileName = pdf.fileName || pdf.title + '.pdf';

    if (pdf.type === 'url') {
        window.open(pdf.url, '_blank');
        return;
    } else if (pdf.type === 'base64') {
        pdfUrl = pdf.data;
    } else {
        return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize modal controls (kept for backward compatibility)
function initializeModal() {
    // Modal functionality kept but viewPDF now redirects to view-pdf.html
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to get PDFs by section (for use in other pages)
async function getPDFsBySection(sectionName) {
    let allPDFs = [];
    
    // Load from JSON file
    try {
        const response = await fetch('pdfs.json');
        if (response.ok) {
            const jsonPDFs = await response.json();
            if (Array.isArray(jsonPDFs)) {
                allPDFs = jsonPDFs;
            }
        }
    } catch (error) {
        console.log('Could not load pdfs.json');
    }
    
    // Load from localStorage
    const localPDFs = JSON.parse(localStorage.getItem('pdfs') || '[]');
    allPDFs = [...allPDFs, ...localPDFs];
    
    // Remove duplicates based on ID (prefer JSON file version over localStorage)
    const uniquePDFs = [];
    const seenIds = new Set();
    // Process in reverse to prioritize JSON PDFs (they come first)
    for (let i = allPDFs.length - 1; i >= 0; i--) {
        if (!seenIds.has(allPDFs[i].id)) {
            seenIds.add(allPDFs[i].id);
            uniquePDFs.unshift(allPDFs[i]);
        }
    }
    
    // Filter by section
    return uniquePDFs.filter(pdf => pdf.section === sectionName);
}
