document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    // Navigation logic (only relevant if we are on index.html)
    const handleHash = () => {
        const hash = window.location.hash;
        if (hash === '#contact') {
            const contactBtn = document.querySelector('.nav-link[href="#contact"]');
            if (contactBtn) contactBtn.click();
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // If it's an internal hash on the same page
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Update active section
                sections.forEach(sec => {
                    if (sec.id === targetId) {
                        sec.classList.remove('hidden');
                        sec.classList.add('active');
                        sec.style.animation = 'none';
                        sec.offsetHeight; /* trigger reflow */
                        sec.style.animation = null;
                    } else {
                        sec.classList.remove('active');
                        sec.classList.add('hidden');
                    }
                });

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Check hash on load
    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Form submission handling
    const form = document.getElementById('contactForm');
    const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes

    const checkCooldown = () => {
        const lastSubmit = localStorage.getItem('formLastSubmit');
        if (lastSubmit) {
            const timePassed = Date.now() - parseInt(lastSubmit);
            if (timePassed < COOLDOWN_TIME) {
                const btn = form.querySelector('button[type="submit"]');
                btn.textContent = `Wait a little before submitting another form`;
                btn.disabled = true;
                btn.style.opacity = '0.5';
                return true;
            }
        }
        return false;
    };

    if (form) {
        checkCooldown();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (checkCooldown()) return;

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            btn.textContent = 'Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
                .then(async (response) => {
                    if (response.status == 200) {
                        btn.textContent = 'Thank You for your submission!';
                        btn.style.background = '#10B981';
                        form.reset();
                        localStorage.setItem('formLastSubmit', Date.now().toString());

                        setTimeout(() => {
                            checkCooldown();
                        }, 4000);
                    } else {
                        btn.textContent = 'Error Occurred';
                        btn.style.background = '#EF4444';
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }
                })
                .catch(error => {
                    btn.textContent = 'Error Occurred';
                    btn.style.background = '#EF4444';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                })
                .finally(() => {
                    if (btn.textContent === 'Error Occurred') {
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = '';
                        }, 4000);
                    }
                });
        });
    }
});
