/* ==========================================================================
   Cozy Cafe - Client Side Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Sticky Navigation & Header Transitions ---
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // --- 2. Mobile Responsive Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const toggleIcon = navToggle.querySelector('i');

    const toggleNavigation = () => {
        navMenu.classList.toggle('open');
        const isOpen = navMenu.classList.contains('open');
        toggleIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    };

    const closeNavigation = () => {
        navMenu.classList.remove('open');
        toggleIcon.className = 'fa-solid fa-bars';
    };

    navToggle.addEventListener('click', toggleNavigation);

    navLinks.forEach(link => {
        link.addEventListener('click', closeNavigation);
    });

    // Close mobile menu if clicked outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            closeNavigation();
        }
    });


    // --- 3. Scroll Synchronization (IntersectionObserver) ---
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the central-top viewport area
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));


    // --- 4. Interactive Menu Filtering ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const selectedCategory = button.getAttribute('data-category');

            menuCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Add fade effect out
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                        card.classList.remove('hidden');
                        // Fade in
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.classList.add('hidden');
                    }
                }, 200);
            });
        });
    });


    // --- 5. Gallery Lightbox Carousel ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentGalleryIndex = 0;

    const updateLightboxContent = () => {
        const item = galleryItems[currentGalleryIndex];
        const img = item.querySelector('.gallery-img');
        const caption = item.querySelector('.gallery-title').textContent;

        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = caption;
    };

    const openLightbox = (index) => {
        currentGalleryIndex = index;
        updateLightboxContent();
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };

    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = ''; // Release background scroll
    };

    const showPrevImage = (e) => {
        e.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    };

    const showNextImage = (e) => {
        e.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
        updateLightboxContent();
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    // Close lightbox when clicking the dark backdrop
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard support for Lightbox (Esc, Left, Right)
    document.addEventListener('keydown', (e) => {
        if (lightboxModal.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrevImage(e);
            if (e.key === 'ArrowRight') showNextImage(e);
        }
    });


    // --- 6. Reservation Form Mock Server Handling ---
    const reservationForm = document.getElementById('reservationForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinnerIcon = submitBtn.querySelector('.spinner-icon');
    
    // Modal Selectors
    const confirmModalOverlay = document.getElementById('confirmModalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalDismissBtn = document.getElementById('modalDismissBtn');
    
    // Summary Fields
    const summaryName = document.getElementById('summaryName');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryGuests = document.getElementById('summaryGuests');

    // Default min date to today
    const dateInput = document.getElementById('reserveDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    const formatReadableDate = (dateStr) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    const formatReadableTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hr = parseInt(hours, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const formattedHr = hr % 12 || 12;
        return `${formattedHr}:${minutes} ${ampm}`;
    };

    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Retrieve form values
        const nameVal = document.getElementById('guestName').value;
        const dateVal = document.getElementById('reserveDate').value;
        const timeVal = document.getElementById('reserveTime').value;
        const guestsVal = document.getElementById('guestsCount').value;

        // Enter loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Processing reservation...';
        spinnerIcon.classList.remove('hidden');

        // Simulate API delay (2.5 seconds)
        setTimeout(() => {
            // Exit loading state
            submitBtn.disabled = false;
            btnText.textContent = 'Confirm Booking';
            spinnerIcon.classList.add('hidden');

            // Populate summary modal details
            summaryName.textContent = nameVal;
            summaryDate.textContent = formatReadableDate(dateVal);
            summaryTime.textContent = formatReadableTime(timeVal);
            summaryGuests.textContent = guestsVal === '1' ? '1 Guest' : `${guestsVal} People`;

            // Open confirmation modal
            confirmModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scroll
        }, 2500);
    });

    const closeConfirmationModal = () => {
        confirmModalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Release scroll
        reservationForm.reset(); // Clear inputs
    };

    modalClose.addEventListener('click', closeConfirmationModal);
    modalDismissBtn.addEventListener('click', closeConfirmationModal);

    // Close confirmation modal when clicking backdrop
    confirmModalOverlay.addEventListener('click', (e) => {
        if (e.target === confirmModalOverlay) {
            closeConfirmationModal();
        }
    });

});
