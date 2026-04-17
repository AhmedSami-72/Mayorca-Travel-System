document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const utmid = document.getElementById('utmid').value;
            const password = document.getElementById('password').value;

            // Save user to localStorage
            const userData = {
                utmid: utmid,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Redirect to home.html
            window.location.href = 'home.html';
        });
    }
});
