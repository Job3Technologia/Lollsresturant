document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    checkAuth();
    initMobileNav();
    initNewsletter();
    initScrollNavbar();
    window.reveal(); // Initial call
});

function initScrollNavbar() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const messageDiv = document.getElementById('newsletter-message');
            const email = emailInput.value;

            try {
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (response.ok) {
                    messageDiv.style.color = 'var(--success)';
                    messageDiv.textContent = 'Subscribed successfully!';
                    emailInput.value = '';
                } else {
                    messageDiv.style.color = 'var(--error)';
                    messageDiv.textContent = data.message || 'Error subscribing';
                }
            } catch (err) {
                messageDiv.style.color = 'var(--error)';
                messageDiv.textContent = 'Network error';
            }
        });
    }
}

// Expose reveal function globally
window.reveal = function() {
    const reveals = document.querySelectorAll('[data-reveal]');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 50; // Trigger slightly earlier
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        } else {
            // Optional: Remove active class if you want elements to hide again when scrolling up
            // reveals[i].classList.remove('active');
        }
    }
}

window.addEventListener('scroll', window.reveal);

function initMobileNav() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            // Toggle Nav
            nav.classList.toggle('nav-active');

            // Animate Links
            navLinksItems.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Burger Animation (optional class for X icon)
            burger.classList.toggle('toggle');
        });
    }
}

function updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    const authBtn = document.getElementById('auth-btn');
    const token = localStorage.getItem('lollys_token');
    const user = JSON.parse(localStorage.getItem('lollys_user'));

    if (token && user) {
        // Logged in
        if (authBtn) authBtn.remove();

        // Check if logout button already exists
        if (document.getElementById('logout-item')) return;

        const logoutItem = document.createElement('li');
        logoutItem.id = 'logout-item';
        logoutItem.innerHTML = `<a href="#" onclick="logout()" class="btn btn-secondary" style="margin-left: 10px;">Logout <i class="fas fa-sign-out-alt"></i></a>`;
        
        const profileItem = document.createElement('li');
        profileItem.id = 'profile-item';
        profileItem.innerHTML = `<a href="dashboard.html" class="font-heading" style="color: var(--accent-orange); font-weight: 700;"><i class="fas fa-user-circle"></i> ${user.name.split(' ')[0]}</a>`;
        
        navLinks.appendChild(profileItem);
        navLinks.appendChild(logoutItem);
    }
}

function checkAuth() {
    const protectedPages = ['cart.html', 'checkout.html', 'dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const token = localStorage.getItem('lollys_token');

    if (protectedPages.includes(currentPage) && !token) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('lollys_token');
    localStorage.removeItem('lollys_user');
    window.location.href = 'index.html';
}

// Global function to add authorization header to fetch requests
async function secureFetch(url, options = {}) {
    let token = localStorage.getItem('lollys_token');
    
    // Check if we are on admin pages and need admin token
    if (window.location.pathname.includes('admin.html')) {
        token = localStorage.getItem('lollys_admin_token');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'admin-login.html';
        } else {
            logout();
        }
    }
    return response;
}
