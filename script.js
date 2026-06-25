/* ==========================================================================
   Cozy Cafe - Client Side Interactions (WhatsApp Integration / Static Hosting)
   ========================================================================== */

// --- WhatsApp Integration Settings ---
const WHATSAPP_PHONE_NUMBER = "1234567890"; // Replace with your cafe's phone number (with country code, no + or spaces)

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


    // --- 6. Live Reservation Form API Handling ---
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

        // Enter loading state (simulating quick network request for smooth UI animation)
        submitBtn.disabled = true;
        btnText.textContent = 'Processing reservation...';
        spinnerIcon.classList.remove('hidden');

        // Simulate network processing delay for interactive feel
        setTimeout(() => {
            // Format readable elements for WhatsApp
            const readableDate = formatReadableDate(dateVal);
            const readableTime = formatReadableTime(timeVal);
            const guestsLabel = guestsVal === '1' ? '1 Guest' : `${guestsVal} People`;

            // Construct WhatsApp message
            const message = `Hello Cozy Cafe! I would like to reserve a table:%0A` +
                            `• *Name:* ${encodeURIComponent(nameVal)}%0A` +
                            `• *Date:* ${encodeURIComponent(readableDate)}%0A` +
                            `• *Time:* ${encodeURIComponent(readableTime)}%0A` +
                            `• *Guests:* ${encodeURIComponent(guestsLabel)}`;

            // Create WhatsApp Link
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_NUMBER}&text=${message}`;

            // Populate summary modal details
            summaryName.textContent = nameVal;
            summaryDate.textContent = readableDate;
            summaryTime.textContent = readableTime;
            summaryGuests.textContent = guestsLabel;

            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');

            // Open confirmation modal
            confirmModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scroll

            // Reset loading state
            submitBtn.disabled = false;
            btnText.textContent = 'Confirm Booking';
            spinnerIcon.classList.add('hidden');
        }, 800);
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


    // --- 7. Interactive Shopping Cart System ---
    let cart = [];

    // Load Cart from localStorage on load
    const loadCart = () => {
        const savedCart = localStorage.getItem('cozy_cart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch (e) {
                cart = [];
            }
        }
        updateCartUI();
    };

    const saveCart = () => {
        localStorage.setItem('cozy_cart', JSON.stringify(cart));
    };

    // UI Selectors
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const cartBadgeCount = document.getElementById('cartBadgeCount');
    const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
    const cartDrawerClose = document.getElementById('cartDrawerClose');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSummarySection = document.getElementById('cartSummarySection');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const orderConfirmModalOverlay = document.getElementById('orderConfirmModalOverlay');
    const orderModalClose = document.getElementById('orderModalClose');
    const orderDismissBtn = document.getElementById('orderDismissBtn');
    
    // Order success summary fields
    const orderSummaryId = document.getElementById('orderSummaryId');
    const orderSummaryName = document.getElementById('orderSummaryName');
    const orderSummaryType = document.getElementById('orderSummaryType');
    const orderSummaryTotal = document.getElementById('orderSummaryTotal');

    // Cart Drawer toggle triggers
    floatingCartBtn.addEventListener('click', () => {
        cartDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeCartDrawer = () => {
        cartDrawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    cartDrawerClose.addEventListener('click', closeCartDrawer);
    cartDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === cartDrawerOverlay) {
            closeCartDrawer();
        }
    });

    // Toggle Table Number field depending on order type
    const deliveryTypeSelect = document.getElementById('deliveryType');
    const tableNumberGroup = document.getElementById('tableNumberGroup');
    const tableNumberInput = document.getElementById('tableNumber');

    deliveryTypeSelect.addEventListener('change', () => {
        if (deliveryTypeSelect.value === 'takeaway') {
            tableNumberGroup.classList.add('hidden');
            tableNumberInput.removeAttribute('required');
        } else {
            tableNumberGroup.classList.remove('hidden');
            tableNumberInput.setAttribute('required', 'true');
        }
    });

    // Add to Cart Logic
    const addToCart = (name, price) => {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: parseFloat(price),
                quantity: 1
            });
        }
        saveCart();
        updateCartUI();
        
        // Brief animation on floating cart button to notify user
        floatingCartBtn.style.transform = 'scale(1.15)';
        setTimeout(() => {
            floatingCartBtn.style.transform = '';
        }, 150);
    };

    // Connect menu cards "Add to Cart" buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = button.getAttribute('data-name');
            const price = button.getAttribute('data-price');
            addToCart(name, price);
        });
    });

    // Modify quantity
    const changeQuantity = (name, change) => {
        const item = cart.find(i => i.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.name !== name);
            }
            saveCart();
            updateCartUI();
        }
    };

    // Remove Item
    const removeCartItem = (name) => {
        cart = cart.filter(i => i.name !== name);
        saveCart();
        updateCartUI();
    };

    // Update Cart UI Components
    const updateCartUI = () => {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadgeCount.textContent = totalItemsCount;

        // Hide floating cart button if cart is empty
        if (totalItemsCount === 0) {
            floatingCartBtn.style.opacity = '0';
            floatingCartBtn.style.pointerEvents = 'none';
        } else {
            floatingCartBtn.style.opacity = '1';
            floatingCartBtn.style.pointerEvents = 'auto';
        }

        if (cart.length === 0) {
            // Render empty state
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-mug-saucer"></i>
                    <p>Your cart is empty.</p>
                    <p class="subtitle">Add handcrafted treats from our menu!</p>
                </div>
            `;
            cartSummarySection.classList.add('hidden');
        } else {
            cartSummarySection.classList.remove('hidden');
            let subtotal = 0;
            
            // Build items list
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="btn-qty btn-minus" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="btn-qty btn-plus" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button class="cart-item-remove" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
                `;

                // Wire item triggers
                itemEl.querySelector('.btn-minus').addEventListener('click', () => changeQuantity(item.name, -1));
                itemEl.querySelector('.btn-plus').addEventListener('click', () => changeQuantity(item.name, 1));
                itemEl.querySelector('.cart-item-remove').addEventListener('click', () => removeCartItem(item.name));

                cartItemsContainer.appendChild(itemEl);
            });

            cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        }
    };

    // Checkout Form Submit Handler
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (cart.length === 0) return;

        const customerName = document.getElementById('customerName').value;
        const deliveryType = document.getElementById('deliveryType').value;
        const tableNumber = document.getElementById('tableNumber').value;
        const orderNotes = document.getElementById('orderNotes').value;
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Enter loading state
        placeOrderBtn.disabled = true;
        const orderBtnText = placeOrderBtn.querySelector('.btn-text');
        const orderSpinner = placeOrderBtn.querySelector('.spinner-icon');
        orderBtnText.textContent = 'Submitting order...';
        orderSpinner.classList.remove('hidden');

        // Simulate network processing delay for interactive feel
        setTimeout(() => {
            // Generate a random order ID locally
            const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
            const orderTypeLabel = deliveryType === 'dine-in' ? `Dine-In (Table ${tableNumber})` : 'Takeaway';

            // Format items list for WhatsApp
            let itemsMessage = '';
            cart.forEach(item => {
                itemsMessage += `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})%0A`;
            });

            // Construct WhatsApp message
            let message = `Hello Cozy Cafe! I would like to place an order:%0A` +
                            `• *Order ID:* ${orderId}%0A` +
                            `• *Name:* ${encodeURIComponent(customerName)}%0A` +
                            `• *Type:* ${encodeURIComponent(orderTypeLabel)}%0A` +
                            `• *Items:*%0A${itemsMessage}` +
                            `• *Total:* $${totalAmount.toFixed(2)}`;

            if (orderNotes) {
                message += `%0A• *Note:* ${encodeURIComponent(orderNotes)}`;
            }

            // Create WhatsApp Link
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_NUMBER}&text=${message}`;

            // Close cart drawer
            closeCartDrawer();

            // Populate success modal
            orderSummaryId.textContent = orderId;
            orderSummaryName.textContent = customerName;
            orderSummaryType.textContent = orderTypeLabel;
            orderSummaryTotal.textContent = `$${totalAmount.toFixed(2)}`;

            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');

            // Show order confirmation modal
            orderConfirmModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Reset cart
            cart = [];
            saveCart();
            updateCartUI();
            checkoutForm.reset();
            // Reset table number group display
            tableNumberGroup.classList.remove('hidden');
            tableNumberInput.setAttribute('required', 'true');

            // Reset button loading state
            placeOrderBtn.disabled = false;
            orderBtnText.textContent = 'Place Order';
            orderSpinner.classList.add('hidden');
        }, 800);
    });

    const closeOrderConfirmationModal = () => {
        orderConfirmModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    orderModalClose.addEventListener('click', closeOrderConfirmationModal);
    orderDismissBtn.addEventListener('click', closeOrderConfirmationModal);
    orderConfirmModalOverlay.addEventListener('click', (e) => {
        if (e.target === orderConfirmModalOverlay) {
            closeOrderConfirmationModal();
        }
    });

    // Initialize cart state
    loadCart();

});

