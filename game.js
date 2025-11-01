// Password Protection for Game Page

const GAME_PASSWORD = '1313';
const PASSWORD_STORAGE_KEY = 'gameAccessGranted';

document.addEventListener('DOMContentLoaded', function() {
    // Check if access was previously granted in this session
    const hasAccess = sessionStorage.getItem(PASSWORD_STORAGE_KEY) === 'true';
    
    const passwordProtection = document.getElementById('password-protection');
    const gameContent = document.getElementById('game-content');
    
    if (!passwordProtection || !gameContent) return;

    if (hasAccess) {
        // Already authenticated
        passwordProtection.style.display = 'none';
        gameContent.style.display = 'block';
        // Load section content
        setTimeout(() => {
            if (window.reloadSectionContent) {
                window.reloadSectionContent();
            }
        }, 100);
    } else {
        // Show password form
        passwordProtection.style.display = 'block';
        gameContent.style.display = 'none';
        
        initializePasswordForm();
    }
});

function initializePasswordForm() {
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    
    if (!passwordInput || !passwordSubmit) return;

    function checkPassword() {
        const enteredPassword = passwordInput.value.trim();
        
        if (enteredPassword === GAME_PASSWORD) {
            // Correct password
            sessionStorage.setItem(PASSWORD_STORAGE_KEY, 'true');
            
            const passwordProtection = document.getElementById('password-protection');
            const gameContent = document.getElementById('game-content');
            
            if (passwordProtection) passwordProtection.style.display = 'none';
            if (gameContent) gameContent.style.display = 'block';
            if (passwordError) passwordError.textContent = '';
            
            passwordInput.value = '';
            
            // Load section content after authentication
            if (window.reloadSectionContent) {
                window.reloadSectionContent();
            }
        } else {
            // Incorrect password
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
    
    // Focus on input
    passwordInput.focus();
}

