// PDF Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializePDFForm();
    loadPDFs();
    initializeModal();
});

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
                
                // Warn if file is very large (base64 will be ~33% larger)
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
        const description = document.getElementById('pdf-description').value;
        const source = document.querySelector('input[name="pdf-source"]:checked').value;

        if (!title) {
            alert('Please enter a title.');
            return;
        }

        if (source === 'url') {
            const url = document.getElementById('pdf-url').value;
            if (!url) {
                alert('Please enter a PDF URL.');
                return;
            }
            addPDFByURL(title, description, url);
        } else {
            const file = document.getElementById('pdf-file').files[0];
            if (!file) {
                alert('Please select a PDF file.');
                return;
            }
            addPDFByFile(title, description, file);
        }
    });
}

// Add PDF by URL
function addPDFByURL(title, description, url) {
    const pdf = {
        id: Date.now(),
        title: title,
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
}

// Add PDF by file upload (convert to base64)
function addPDFByFile(title, description, file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        const pdf = {
            id: Date.now(),
            title: title,
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

// Load PDFs from localStorage
function loadPDFs() {
    const pdfsContainer = document.getElementById('pdfs-container');
    if (!pdfsContainer) return;

    const pdfs = JSON.parse(localStorage.getItem('pdfs') || '[]');
    
    if (!Array.isArray(pdfs) || pdfs.length === 0) {
        pdfsContainer.innerHTML = '<p>No PDFs yet. Add your first PDF above!</p>';
        return;
    }

    pdfsContainer.innerHTML = '';
    pdfs.forEach(pdf => {
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
    
    pdfElement.innerHTML = `
        <div class="pdf-item-header">
            <h3 class="pdf-item-title">${escapeHtml(pdf.title)}</h3>
            <div class="pdf-item-date">${pdf.date}</div>
        </div>
        ${pdf.description ? `<div class="pdf-item-description">${escapeHtml(pdf.description)}</div>` : ''}
        <div class="pdf-item-actions">
            <button class="pdf-action-btn view-pdf-btn" data-pdf-id="${pdf.id}">View</button>
            <button class="pdf-action-btn download-pdf-btn" data-pdf-id="${pdf.id}">Download</button>
        </div>
    `;

    container.appendChild(pdfElement);

    // Attach event listeners
    const viewBtn = pdfElement.querySelector('.view-pdf-btn');
    const downloadBtn = pdfElement.querySelector('.download-pdf-btn');

    if (viewBtn) {
        viewBtn.addEventListener('click', () => viewPDF(pdf));
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadPDF(pdf));
    }
}

// Current PDF being viewed (for modal download)
let currentPDF = null;

// View PDF in modal
function viewPDF(pdf) {
    const modal = document.getElementById('pdf-modal');
    const modalTitle = document.getElementById('modal-title');
    const pdfViewer = document.getElementById('pdf-viewer');

    if (!modal || !modalTitle || !pdfViewer) return;

    currentPDF = pdf; // Store current PDF for download
    modalTitle.textContent = pdf.title;
    
    // Set PDF source
    if (pdf.type === 'url') {
        pdfViewer.src = pdf.url;
    } else if (pdf.type === 'base64') {
        pdfViewer.src = pdf.data;
    }

    modal.style.display = 'flex';
}

// Download PDF
function downloadPDF(pdf) {
    let pdfUrl;
    let fileName = pdf.fileName || pdf.title + '.pdf';

    if (pdf.type === 'url') {
        // For URLs, we'll open in new tab and let browser handle download
        window.open(pdf.url, '_blank');
        return;
    } else if (pdf.type === 'base64') {
        pdfUrl = pdf.data;
    } else {
        return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize modal controls
function initializeModal() {
    const modal = document.getElementById('pdf-modal');
    const modalClose = document.getElementById('modal-close');
    const pdfDownloadBtn = document.getElementById('pdf-download-btn');

    if (!modal) return;

    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            const pdfViewer = document.getElementById('pdf-viewer');
            if (pdfViewer) pdfViewer.src = '';
            currentPDF = null;
            modal.style.display = 'none';
        });
    }

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            const pdfViewer = document.getElementById('pdf-viewer');
            if (pdfViewer) pdfViewer.src = '';
            currentPDF = null;
            modal.style.display = 'none';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            const pdfViewer = document.getElementById('pdf-viewer');
            if (pdfViewer) pdfViewer.src = '';
            currentPDF = null;
            modal.style.display = 'none';
        }
    });

    // Download button in modal
    if (pdfDownloadBtn) {
        pdfDownloadBtn.addEventListener('click', function() {
            if (currentPDF) {
                downloadPDF(currentPDF);
            } else {
                // Fallback to using iframe src
                const pdfViewer = document.getElementById('pdf-viewer');
                if (!pdfViewer || !pdfViewer.src) return;

                const link = document.createElement('a');
                link.href = pdfViewer.src;
                link.download = 'document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

