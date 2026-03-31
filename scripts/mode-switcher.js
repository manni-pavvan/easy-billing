// Mode Switcher JavaScript
let currentMode = 'admin'; // Default mode

function toggleModeMenu(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('modeDropdown');
    dropdown.classList.toggle('show');
}

function switchMode(mode, event) {
    event.stopPropagation();
    
    // Store mode in localStorage
    localStorage.setItem('userMode', mode);
    
    // Redirect to appropriate page based on mode
    if (mode === 'admin') {
        // Redirect to admin dashboard
        window.location.href = 'dashboard.html';
    } else {
        // Redirect to worker dashboard (restricted page for other admin pages)
        // Check if we're on a worker-specific page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage.startsWith('worker-')) {
            // Already on worker page, just update UI
            updateModeUI(mode);
        } else {
            // Redirect to worker create invoice page
            window.location.href = 'worker-create-invoice.html';
        }
    }
}

function updateModeUI(mode) {            }

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('modeDropdown');
    const modeBadge = document.querySelector('.mode-badge');
    
    if (dropdown && modeBadge && !modeBadge.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Check current mode on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedMode = localStorage.getItem('userMode') || 'admin';
    const currentPage = window.location.pathname.split('/').pop();
    
    // Determine if we're on an admin or worker page
    const isWorkerPage = currentPage.startsWith('worker-');
    const isAdminPage = !isWorkerPage && currentPage !== 'index.html';
    
    // If saved mode doesn't match current page type, redirect
    if (savedMode === 'worker' && isAdminPage && currentPage !== '') {
        // Admin page but worker mode - redirect to worker page
        if (currentPage === 'dashboard.html' || currentPage === 'clients.html' || 
            currentPage === 'reports.html' || currentPage === 'settings.html') {
            window.location.href = 'worker-dashboard.html';
        } else if (currentPage === 'create-invoice.html') {
            window.location.href = 'worker-create-invoice.html';
        } else if (currentPage === 'invoice-history.html') {
            window.location.href = 'worker-my-invoices.html';
        }
    } else if (savedMode === 'admin' && isWorkerPage) {
        // Worker page but admin mode - redirect to admin page
        if (currentPage === 'worker-create-invoice.html') {
            window.location.href = 'create-invoice.html';
        } else if (currentPage === 'worker-my-invoices.html') {
            window.location.href = 'invoice-history.html';
        } else if (currentPage === 'worker-dashboard.html') {
            window.location.href = 'dashboard.html';
        }
    }
    
    // Update currentMode variable
    currentMode = savedMode;
});