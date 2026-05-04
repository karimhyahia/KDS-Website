/**
 * KDS - Keller & Dach Spezialisten
 * Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // Navigation
    // ==========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navbar
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Only handle anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();

                // Close menu first
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';

                // Then scroll after menu closes
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target) {
                        const headerOffset = 100;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            } else {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ==========================================
    // Smooth Scrolling for anchor links
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Intersection Observer for animations
    // ==========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service-card, .feature, .contact-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Add animation class
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);

    // ==========================================
    // Contact Form Handling (Netlify Forms)
    // ==========================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Basic validation
            if (!data.name || !data.phone || !data.message || !data.privacy) {
                showFormMessage('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
                return;
            }

            // Submit to Netlify
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Wird gesendet...';
            submitBtn.disabled = true;

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    showFormMessage(
                        'Vielen Dank für Ihre Nachricht! Wir melden uns schnellstmöglich bei Ihnen.',
                        'success'
                    );
                    contactForm.reset();
                } else {
                    throw new Error('Fehler beim Senden');
                }
            })
            .catch(error => {
                showFormMessage(
                    'Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut oder rufen Sie uns an.',
                    'error'
                );
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    function showFormMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.form-success, .form-error');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = type === 'success' ? 'form-success' : 'form-error';
        messageEl.textContent = message;

        // Insert before form
        contactForm.insertAdjacentElement('beforebegin', messageEl);

        // Scroll to message
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    // ==========================================
    // Stagger animation for service cards
    // ==========================================
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // ==========================================
    // Phone number click tracking (optional)
    // ==========================================
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            // You can add analytics tracking here
            console.log('Phone number clicked:', this.href);
        });
    });

    // ==========================================
    // Active navigation highlighting
    // ==========================================
    const sections = document.querySelectorAll('section[id]');

    function highlightNavigation() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // ==========================================
    // Preload critical resources
    // ==========================================
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Preload any additional resources here
        });
    }

    console.log('KDS Website initialized successfully');
});
