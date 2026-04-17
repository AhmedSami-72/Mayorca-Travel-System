document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Collapsible Logic
    const menuHeaders = document.querySelectorAll('.menu-header');

    menuHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const menuItem = header.parentElement;
            const content = menuItem.querySelector('.menu-content');
            
            // Toggle active state for arrow rotation
            menuItem.classList.toggle('active');
            
            // Toggle content visibility with animation
            content.classList.toggle('show');
            
            // Close other menus if needed (optional - keeping it simple for now)
            // if (content.classList.contains('show')) {
            //     document.querySelectorAll('.menu-content').forEach(other => {
            //         if (other !== content) {
            //             other.classList.remove('show');
            //             other.parentElement.classList.remove('active');
            //         }
            //     });
            // }
        });
    });

    // 2. Feedback Popup Logic
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const emojiBtns = document.querySelectorAll('.emoji-btn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const profileThumb = document.getElementById('profileThumb');
    const profileDropdown = document.getElementById('profileDropdown');
    const gridIcon = document.getElementById('gridIcon');
    const dashboardPopup = document.getElementById('dashboardPopup');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.getElementById('profileLink');

    // Load User Data from localStorage
    const loadUserData = () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            document.getElementById('userName').textContent = user.utmid || 'User';
            document.getElementById('userEmail').textContent = user.email || `${user.utmid}@utm.my`;
        }
    };
    loadUserData();

    // Toggle Profile Dropdown
    if (profileThumb) {
        profileThumb.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dashboardPopup.classList.contains('show')) {
                dashboardPopup.classList.remove('show');
                setTimeout(() => { dashboardPopup.style.display = 'none'; }, 300);
            }
            
            if (profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
                setTimeout(() => { profileDropdown.style.display = 'none'; }, 300);
            } else {
                profileDropdown.style.display = 'block';
                setTimeout(() => { profileDropdown.classList.add('show'); }, 10);
            }
        });
    }

    // Toggle Dashboard Popup
    if (gridIcon) {
        gridIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
                setTimeout(() => { profileDropdown.style.display = 'none'; }, 300);
            }

            if (dashboardPopup.classList.contains('show')) {
                dashboardPopup.classList.remove('show');
                setTimeout(() => { dashboardPopup.style.display = 'none'; }, 300);
            } else {
                dashboardPopup.style.display = 'block';
                setTimeout(() => { dashboardPopup.classList.add('show'); }, 10);
            }
        });
    }

    // Close popups on outside click
    window.addEventListener('click', () => {
        if (profileDropdown.classList.contains('show')) {
            profileDropdown.classList.remove('show');
            setTimeout(() => { profileDropdown.style.display = 'none'; }, 300);
        }
        if (dashboardPopup.classList.contains('show')) {
            dashboardPopup.classList.remove('show');
            setTimeout(() => { dashboardPopup.style.display = 'none'; }, 300);
        }
    });

    // Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // Profile Link Action
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'profile.html';
        });
    }

    // 3. Slider Logic
    const initSlider = (trackId, nextId, prevId, dotsId, interval = 3000) => {
        const track = document.getElementById(trackId);
        if (!track) return;
        
        const nextBtn = document.getElementById(nextId);
        const prevBtn = document.getElementById(prevId);
        const dotsContainer = document.getElementById(dotsId);
        
        // Clone first and last slides for infinite loop effect
        const originalSlides = Array.from(track.children);
        if (originalSlides.length === 0) return;

        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
        
        track.appendChild(firstClone);
        track.insertBefore(lastClone, originalSlides[0]);
        
        const allSlides = Array.from(track.children);
        let currentIndex = 1; // Start at the first original slide
        let isTransitioning = false;
        let slideInterval;

        // Initial position
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Create Dots based on original slides
        if (dotsContainer) {
            dotsContainer.innerHTML = ''; // Clear existing
            originalSlides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    if (isTransitioning) return;
                    goToSlide(index + 1);
                });
                dotsContainer.appendChild(dot);
            });
        }

        const updateDots = () => {
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.dot');
                let dotIndex = currentIndex - 1;
                if (currentIndex === 0) dotIndex = originalSlides.length - 1;
                if (currentIndex === allSlides.length - 1) dotIndex = 0;
                
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === dotIndex);
                });
            }
        };

        const goToSlide = (index) => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex = index;
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
            resetInterval();
        };

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            // Seamless jump for infinite loop
            if (currentIndex === 0) {
                track.style.transition = 'none';
                currentIndex = allSlides.length - 2;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
            if (currentIndex === allSlides.length - 1) {
                track.style.transition = 'none';
                currentIndex = 1;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
        });

        const nextSlide = () => {
            if (isTransitioning) return;
            goToSlide(currentIndex + 1);
        };

        const prevSlide = () => {
            if (isTransitioning) return;
            goToSlide(currentIndex - 1);
        };

        const resetInterval = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, interval);
        };

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        resetInterval();
    };

    // Initialize Sliders
    initSlider('charitySlider', 'charityNext', 'charityPrev', null, 3000);
    initSlider('bottomSlider', 'bottomNext', 'bottomPrev', null, 4000);

    // 4. Scroll & Sticky Header Logic
    const header = document.querySelector('.home-header');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            header.classList.add('fixed');
            scrollTopBtn.classList.add('visible');
        } else {
            header.classList.remove('fixed');
            scrollTopBtn.classList.remove('visible');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Open Modal
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.style.display = 'flex';
            // Trigger animation after setting display: flex
            setTimeout(() => {
                feedbackModal.classList.add('show');
            }, 10);
        });
    }

    // Handle Emoji Clicks
    emojiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rating = btn.getAttribute('data-value');
            
            // Save to localStorage
            localStorage.setItem('feedback', rating);
            console.log('Feedback saved:', rating);
            
            // Close Modal with animation
            feedbackModal.classList.remove('show');
            setTimeout(() => {
                feedbackModal.style.display = 'none';
            }, 300);
        });
    });

    // Close Modal on outside click
    if (feedbackModal) {
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.classList.remove('show');
                setTimeout(() => {
                    feedbackModal.style.display = 'none';
                }, 300);
            }
        });
    }

    // 5. Search Bar Interaction (Visual only)
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.boxShadow = '0 0 10px rgba(255,255,255,0.3)';
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.boxShadow = 'none';
        });
    }
});
