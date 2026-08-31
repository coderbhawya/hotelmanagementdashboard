/* ==========================================================================
   TACO BELL GOURMET & KDS - MASTER APPLICATION LOGIC (GSAP 3 POWERED)
   ========================================================================== */

// Global Application State
const state = {
    orders: [],
    lastOrdersJson: '',
    menu: null,
    cart: [],
    currentView: 'kds',
    currentFilter: 'all',
    currentCategory: 'all',
    appliedCoupon: null,
    soundEnabled: true,
    audioCtx: null,
    activeUpiOrder: null,
    theme: localStorage.getItem('tacobell_theme') || 'dark',
    statCounters: {
        revenue: 0,
        total: 0,
        pending: 0,
        preparing: 0,
        ready: 0,
        kpiRevenue: 0,
        kpiOrders: 0,
        kpiAov: 0
    }
};

// Menu Fallback Data
const DEFAULT_MENU = {
    juices: [
        { id: 'j1', name: 'Pineapple Lime', category: 'Juice', price: 159, calories: '120 kcal', veg: true, spice: 0, img: 'assets/juices.jpg', desc: 'Fresh tropical pineapple juice infused with tangy key lime and crushed mint.' },
        { id: 'j2', name: 'Cranberry Crush', category: 'Juice', price: 189, calories: '145 kcal', veg: true, spice: 0, img: 'assets/juices.jpg', desc: 'Wild antioxidant-rich tart cranberries cold-pressed with pomegranate ruby pearls.' },
        { id: 'j3', name: 'Mango Peach', category: 'Juice', price: 179, calories: '160 kcal', veg: true, spice: 0, img: 'assets/juices.jpg', desc: 'Sun-ripened Alphonso mango pulp blended with sweet Georgia peach nectar.' },
        { id: 'j4', name: 'Dragonfruit Berry', category: 'Juice', price: 199, calories: '135 kcal', veg: true, spice: 0, img: 'assets/juices.jpg', desc: 'Vibrant pink pitaya dragonfruit combined with fresh hand-picked organic blueberries.' }
    ],
    shakes: [
        { id: 's1', name: 'Sweet Vanilla', category: 'Shake', price: 149, calories: '290 kcal', veg: true, spice: 0, img: 'assets/shakes.jpg', desc: 'Madagascar bourbon vanilla beans whipped into creamy artisanal ice cream.' },
        { id: 's2', name: 'Mexican Chocolate', category: 'Shake', price: 169, calories: '340 kcal', veg: true, spice: 1, img: 'assets/shakes.jpg', desc: 'Decadent dark cacao chocolate infused with a hint of warm cinnamon spice.' },
        { id: 's3', name: 'Dulce De Leche', category: 'Shake', price: 199, calories: '380 kcal', veg: true, spice: 0, img: 'assets/shakes.jpg', desc: 'Silky smooth golden caramelized milk toffee swirled with rich dulce de leche cream.' },
        { id: 's4', name: 'Wild Strawberry', category: 'Shake', price: 159, calories: '270 kcal', veg: true, spice: 0, img: 'assets/shakes.jpg', desc: 'Juicy alpine farm strawberries blended into frosty milk with sweet berry drizzle.' }
    ],
    wraps: [
        { id: 'w1', name: 'Spicy Paneer', category: 'Wrap', price: 199, calories: '420 kcal', veg: true, spice: 2, img: 'assets/wraps.jpg', desc: 'Char-grilled cottage cheese cubes glazed in peri-peri sauce with crisp iceberg lettuce.' },
        { id: 'w2', name: 'Crispy Chicken', category: 'Wrap', price: 249, calories: '510 kcal', veg: false, spice: 2, img: 'assets/wraps.jpg', desc: 'Golden crunchy buttermilk chicken tenders wrapped with smoky chipotle mayo & cheddar.' },
        { id: 'w3', name: 'Crispy Potato', category: 'Wrap', price: 179, calories: '380 kcal', veg: true, spice: 1, img: 'assets/wraps.jpg', desc: 'Spiced herb potato hash crispies rolled with house salsa and zesty sour cream.' },
        { id: 'w4', name: 'Hot Bean Relish', category: 'Wrap', price: 159, calories: '350 kcal', veg: true, spice: 3, img: 'assets/wraps.jpg', desc: 'Slow-simmered spicy pinto beans rolled in toasted tortilla with jalapeno relish.' }
    ],
    tacos: [
        { id: 't1', name: 'Soft Shell Taco', category: 'Taco', price: 129, calories: '210 kcal', veg: true, spice: 1, img: 'assets/tacos.jpg', desc: 'Fluffy warm flour tortilla filled with savory seasoned veggies, salsa fresco & cheese.' },
        { id: 't2', name: 'Crunchy Corn Taco', category: 'Taco', price: 149, calories: '240 kcal', veg: true, spice: 2, img: 'assets/tacos.jpg', desc: 'Classic golden crispy corn shell packed with Mexican beans, guacamole & sour cream.' },
        { id: 't3', name: 'Naked Chicken Taco', category: 'Taco', price: 159, calories: '310 kcal', veg: false, spice: 2, img: 'assets/tacos.jpg', desc: 'Juicy marinated crispy chicken shell stuffed with crunchy slaw & creamy dressing.' },
        { id: 't4', name: 'Cheesy Lava Taco', category: 'Taco', price: 179, calories: '350 kcal', veg: true, spice: 2, img: 'assets/tacos.jpg', desc: 'Double shell locked with molten jalapeno cheese sauce and smothered in nachos.' }
    ]
};

// Available Coupons
const COUPONS = {
    'TACO10': 0.10,
    'GOURMET20': 0.20,
    'VIP50': 0.50
};

/* ==========================================================================
   INITIALIZATION & BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme, false);
    initClock();
    initThemeSwitcher();
    initSoundSystem();
    initNavigation();
    initMenu();
    initCart();
    initKDSFilters();
    initModals();
    initRealtimeSync();
    initUrgencyTicker();

    // GSAP Initial Page Entrance Timeline
    animatePageEntrance();
});

/* ==========================================================================
   GSAP ENTRANCE & VIEW ANIMATIONS
   ========================================================================== */
function animatePageEntrance() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('#top-nav', 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6 }
    )
    .fromTo('.metric-card', 
        { y: 20, opacity: 0, scale: 0.96 }, 
        { y: 0, opacity: 1, scale: 1, stagger: 0.06, duration: 0.5 }, 
        '-=0.3'
    )
    .fromTo('#kds-toolbar', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4 }, 
        '-=0.2'
    );
}

/* ==========================================================================
   THEME SWITCHER (Dark Luxury / Light Pearl)
   ========================================================================== */
function initThemeSwitcher() {
    const btn = document.getElementById('btn-theme-toggle');
    const icon = document.getElementById('theme-icon');

    btn?.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(state.theme, true);
        playChime(600, 0.12);
    });
}

function applyTheme(theme, animate = true) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tacobell_theme', theme);

    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-moon theme-icon' : 'fa-solid fa-sun theme-icon';
        if (animate && typeof gsap !== 'undefined') {
            gsap.fromTo(icon, { rotate: -90, scale: 0.6 }, { rotate: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' });
        }
    }
}

/* ==========================================================================
   LIVE CLOCK
   ========================================================================== */
function initClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: true });
    }
    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   WEB AUDIO SYNTHESIZER (Luxury Chimes & Audio Waveforms)
   ========================================================================== */
function initSoundSystem() {
    const toggleBtn = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const waveBars = document.querySelector('.sound-wave-bars');

    toggleBtn?.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
            if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high';
            if (waveBars) waveBars.style.display = 'flex';
            showToast('Audio alerts enabled', 'info');
            playChime(587.33, 0.2);
        } else {
            if (soundIcon) soundIcon.className = 'fa-solid fa-volume-xmark';
            if (waveBars) waveBars.style.display = 'none';
            showToast('Audio alerts muted', 'info');
        }
    });
}

function playChime(freq = 523.25, duration = 0.25) {
    if (!state.soundEnabled) return;
    try {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }

        const now = state.audioCtx.currentTime;
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(state.audioCtx.destination);

        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {
        console.warn('Audio note:', e);
    }
}

function playNewOrderChime() {
    if (!state.soundEnabled) return;
    playChime(523.25, 0.18);
    setTimeout(() => playChime(659.25, 0.22), 140);
    setTimeout(() => playChime(783.99, 0.35), 300);
}

function playSuccessChime() {
    if (!state.soundEnabled) return;
    playChime(659.25, 0.15);
    setTimeout(() => playChime(880.00, 0.3), 150);
}

/* ==========================================================================
   NAVIGATION & SLIDING PILL (GSAP)
   ========================================================================== */
function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const pill = document.getElementById('nav-sliding-pill');

    function updatePillPosition(activeTab) {
        if (!pill || !activeTab) return;
        const left = activeTab.offsetLeft;
        const width = activeTab.offsetWidth;

        if (typeof gsap !== 'undefined') {
            gsap.to(pill, {
                x: left - 5,
                width: width,
                duration: 0.35,
                ease: 'power3.out'
            });
        } else {
            pill.style.transform = `translateX(${left - 5}px)`;
            pill.style.width = `${width}px`;
        }
    }

    // Set initial pill position
    const activeTab = document.querySelector('.nav-tab.active');
    if (activeTab) {
        setTimeout(() => updatePillPosition(activeTab), 50);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetView = tab.dataset.view;
            if (targetView === state.currentView) return;

            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            updatePillPosition(tab);

            // Switch view panels with GSAP
            const currentPanel = document.querySelector('.view-panel.active');
            const targetPanel = document.getElementById(`view-${targetView}`);

            if (currentPanel && targetPanel) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(currentPanel, {
                        opacity: 0,
                        y: -10,
                        duration: 0.18,
                        onComplete: () => {
                            currentPanel.classList.remove('active');
                            targetPanel.classList.add('active');
                            gsap.fromTo(targetPanel, 
                                { opacity: 0, y: 15 }, 
                                { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
                            );
                            if (targetView === 'analytics') renderAnalytics();
                            if (targetView === 'kds') renderKDSCards(true);
                        }
                    });
                } else {
                    currentPanel.classList.remove('active');
                    targetPanel.classList.add('active');
                    if (targetView === 'analytics') renderAnalytics();
                }
            }

            state.currentView = targetView;
            playChime(650, 0.1);
        });
    });

    // Cart and Kiosk Triggers
    document.getElementById('btn-open-cart')?.addEventListener('click', () => {
        document.getElementById('tab-kiosk')?.click();
    });

    document.getElementById('btn-empty-order-now')?.addEventListener('click', () => {
        document.getElementById('tab-kiosk')?.click();
    });

    // Copy coupon code click
    document.getElementById('hero-coupon-copy')?.addEventListener('click', () => {
        const input = document.getElementById('coupon-input');
        if (input) {
            input.value = 'TACO10';
            applyCouponCode();
        }
    });
}

/* ==========================================================================
   REAL-TIME SYNCHRONIZATION (SSE + Zero-Flicker Polling Fallback)
   ========================================================================== */
function initRealtimeSync() {
    try {
        const evtSource = new EventSource('/api/events');

        evtSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.type === 'NEW_ORDER') {
                    handleIncomingOrder(payload.data);
                } else if (payload.type === 'ORDERS_UPDATED') {
                    handleOrdersRefreshed(payload.data);
                } else if (payload.type === 'ORDER_STATUS_CHANGED') {
                    updateLocalOrderStatus(payload.data.id, payload.data.status);
                }
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        };

        evtSource.onerror = () => {
            startPollingFallback();
        };
    } catch (e) {
        startPollingFallback();
    }

    // Initial fetch of orders
    fetchOrders(true);

    document.getElementById('btn-refresh-orders')?.addEventListener('click', () => {
        fetchOrders(true);
        showToast('Kitchen display refreshed', 'info');
        playChime(700, 0.1);
    });

    // Simulate C++ terminal order button
    document.getElementById('btn-simulate-cpp-order')?.addEventListener('click', simulateCppOrder);
}

let pollingInterval = null;
function startPollingFallback() {
    if (pollingInterval) return;
    pollingInterval = setInterval(() => {
        fetchOrders(false);
    }, 2500);
}

async function fetchOrders(manual = false) {
    try {
        const res = await fetch('/api/orders');
        if (res.ok) {
            const data = await res.json();
            handleOrdersRefreshed(data, manual);
        } else {
            const fileRes = await fetch('orders.json');
            if (fileRes.ok) {
                const data = await fileRes.json();
                handleOrdersRefreshed(data, manual);
            }
        }
    } catch (e) {
        console.warn('Could not fetch orders:', e);
    }
}

function handleOrdersRefreshed(newOrders, manual = false) {
    const serialized = JSON.stringify(newOrders);
    
    // Skip re-rendering if data hasn't changed (prevents flicker)
    if (!manual && state.lastOrdersJson === serialized) {
        return;
    }

    const prevCount = state.orders.length;
    const isFirstLoad = state.lastOrdersJson === '';
    state.lastOrdersJson = serialized;

    if (!isFirstLoad && newOrders.length > prevCount) {
        const addedOrder = newOrders[newOrders.length - 1];
        playNewOrderChime();
        showToast(`🔔 New order #${addedOrder.id} from ${addedOrder.source || 'C++'}!`, 'order');
    }

    state.orders = newOrders;
    renderKDSCards(isFirstLoad || manual);
    updateRibbonStats();
    if (state.currentView === 'analytics') renderAnalytics();
}

function handleIncomingOrder(order) {
    const exists = state.orders.some(o => o.id === order.id);
    if (!exists) {
        state.orders.unshift(order);
        state.lastOrdersJson = JSON.stringify(state.orders);
        playNewOrderChime();
        showToast(`🚀 New Order #${order.id} received (${order.source})!`, 'order');
        renderKDSCards(true);
        updateRibbonStats();
    }
}

function updateLocalOrderStatus(id, newStatus) {
    const order = state.orders.find(o => o.id === id);
    if (order && order.status !== newStatus) {
        order.status = newStatus;
        state.lastOrdersJson = JSON.stringify(state.orders);
        renderKDSCards(false);
        updateRibbonStats();
        showToast(`Order #${id} status updated to ${newStatus}`, 'info');
    }
}

/* ==========================================================================
   SIMULATE C++ TERMINAL ORDER (Instant Demo Generator)
   ========================================================================== */
async function simulateCppOrder() {
    const sampleDishes = [
        { name: 'Crispy Chicken', category: 'Wrap', price: 249 },
        { name: 'Cheesy Lava Taco', category: 'Taco', price: 179 },
        { name: 'Spicy Paneer', category: 'Wrap', price: 199 },
        { name: 'Naked Chicken Taco', category: 'Taco', price: 159 }
    ];
    const sampleDrinks = [
        { name: 'Mexican Chocolate', category: 'Shake', price: 169 },
        { name: 'Dragonfruit Berry', category: 'Juice', price: 199 },
        { name: 'Pineapple Lime', category: 'Juice', price: 159 },
        { name: 'Dulce De Leche', category: 'Shake', price: 199 }
    ];
    const guests = ['Sophia Chen', 'Alexander Wright', 'Elena Rostova', 'Liam Vance', 'Aarav Sharma', 'Olivia Wilde', 'Zoe Saldana', 'Marcus Reed', 'Lucas Scott'];
    const tables = ['Suite-204', 'Table-08', 'Table-12', 'Suite-101', 'Table-05', 'VIP-02', 'Table-14'];

    const dish = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    const drink = sampleDrinks[Math.floor(Math.random() * sampleDrinks.length)];
    const guest = guests[Math.floor(Math.random() * guests.length)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const total = dish.price + drink.price;

    const payload = {
        id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: guest,
        tableNo: table,
        drink: `${drink.name} (${drink.category})`,
        drinkPrice: drink.price,
        mainCourse: `${dish.name} (${dish.category})`,
        mainCoursePrice: dish.price,
        items: [
            { name: drink.name, category: drink.category, price: drink.price, qty: 1 },
            { name: dish.name, category: dish.category, price: dish.price, qty: 1 }
        ],
        totalBill: total,
        paymentMethod: Math.random() > 0.4 ? 'UPI' : 'Cash',
        source: 'C++ Terminal',
        status: 'Pending',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await res.json();
            handleIncomingOrder(data.order);
        } else {
            handleIncomingOrder(payload);
        }
    } catch (e) {
        handleIncomingOrder(payload);
    }
}

/* ==========================================================================
   KDS FILTERS & SEARCH
   ========================================================================== */
function initKDSFilters() {
    const pills = document.querySelectorAll('#kds-filters .filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.currentFilter = pill.dataset.filter;
            renderKDSCards(true);
            playChime(600, 0.08);
        });
    });

    const searchInput = document.getElementById('kds-search-input');
    const clearBtn = document.getElementById('btn-search-clear');

    searchInput?.addEventListener('input', (e) => {
        if (clearBtn) {
            clearBtn.classList.toggle('hidden', !e.target.value);
        }
        renderKDSCards(false);
    });

    clearBtn?.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
            clearBtn.classList.add('hidden');
            renderKDSCards(true);
        }
    });
}

/* ==========================================================================
   KDS ORDER TICKETS RENDERING & 3D TILT
   ========================================================================== */
function renderKDSCards(animateCards = false) {
    const grid = document.getElementById('orders-grid');
    const emptyState = document.getElementById('kds-empty-state');
    const searchVal = (document.getElementById('kds-search-input')?.value || '').toLowerCase().trim();

    if (!grid) return;

    let filtered = [...state.orders];

    if (state.currentFilter !== 'all') {
        filtered = filtered.filter(o => o.status === state.currentFilter);
    }

    if (searchVal) {
        filtered = filtered.filter(o => 
            (o.id && o.id.toLowerCase().includes(searchVal)) ||
            (o.customer && o.customer.toLowerCase().includes(searchVal)) ||
            (o.tableNo && o.tableNo.toLowerCase().includes(searchVal)) ||
            (o.drink && o.drink.toLowerCase().includes(searchVal)) ||
            (o.mainCourse && o.mainCourse.toLowerCase().includes(searchVal)) ||
            (o.items && o.items.some(i => i.name.toLowerCase().includes(searchVal)))
        );
    }

    // Priority sorting: Pending -> Preparing -> Ready -> Served
    filtered.sort((a, b) => {
        const orderPriority = { 'Pending': 1, 'Preparing': 2, 'Ready': 3, 'Served': 4 };
        return (orderPriority[a.status] || 99) - (orderPriority[b.status] || 99);
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState?.classList.remove('hidden');
        return;
    } else {
        emptyState?.classList.add('hidden');
    }

    grid.innerHTML = filtered.map(order => createOrderTicketHtml(order)).join('');

    // Attach Event Listeners to Ticket Elements
    grid.querySelectorAll('.ticket-status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            await changeOrderStatus(orderId, newStatus);
        });
    });

    grid.querySelectorAll('.btn-quick-next').forEach(btn => {
        btn.addEventListener('click', async () => {
            const orderId = btn.dataset.id;
            const order = state.orders.find(o => o.id === orderId);
            if (!order) return;
            const nextMap = { 'Pending': 'Preparing', 'Preparing': 'Ready', 'Ready': 'Served', 'Served': 'Pending' };
            const nextStatus = nextMap[order.status] || 'Preparing';
            await changeOrderStatus(orderId, nextStatus);
        });
    });

    grid.querySelectorAll('.btn-print-ticket').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            openReceiptModal(orderId);
        });
    });

    grid.querySelectorAll('.btn-qr-ticket').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            const order = state.orders.find(o => o.id === orderId);
            if (order) openUpiModal(order);
        });
    });

    // 3D Card Hover Perspective Setup
    setup3DCardHover();

    // GSAP Card Stagger Entrance
    if (animateCards && typeof gsap !== 'undefined') {
        gsap.fromTo('.order-ticket', 
            { opacity: 0, y: 15, scale: 0.97 }, 
            { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.35, ease: 'power2.out' }
        );
    }
}

function createOrderTicketHtml(order) {
    const isCpp = order.source === 'C++ Terminal';
    const statusClass = (order.status || 'Pending').toLowerCase();
    const timeAgo = formatTimeAgo(order.timestamp);
    const urgency = getUrgencyClass(order.timestamp, order.status);

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        itemsHtml = order.items.map(item => `
            <div class="ticket-item-row">
                <div class="item-left">
                    <span class="item-qty-badge">${item.qty || 1}x</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-cat">(${item.category || 'Special'})</span>
                </div>
                <span class="item-price">₹${(item.price || 0) * (item.qty || 1)}</span>
            </div>
        `).join('');
    } else {
        if (order.drink && order.drink !== 'None') {
            itemsHtml += `
                <div class="ticket-item-row">
                    <div class="item-left">
                        <span class="item-qty-badge">1x</span>
                        <span class="item-name">${order.drink}</span>
                    </div>
                    <span class="item-price">₹${order.drinkPrice || 0}</span>
                </div>
            `;
        }
        if (order.mainCourse && order.mainCourse !== 'None') {
            itemsHtml += `
                <div class="ticket-item-row">
                    <div class="item-left">
                        <span class="item-qty-badge">1x</span>
                        <span class="item-name">${order.mainCourse}</span>
                    </div>
                    <span class="item-price">₹${order.mainCoursePrice || 0}</span>
                </div>
            `;
        }
    }

    const nextActionLabels = {
        'Pending': '<i class="fa-solid fa-fire"></i> Start Cook',
        'Preparing': '<i class="fa-solid fa-check"></i> Mark Ready',
        'Ready': '<i class="fa-solid fa-bell-concierge"></i> Serve',
        'Served': '<i class="fa-solid fa-rotate-left"></i> Reset'
    };

    return `
        <article class="order-ticket" id="ticket-${order.id}" data-timestamp="${order.timestamp || ''}">
            <div class="ticket-top-row">
                <div class="ticket-id-badge">
                    <span class="ticket-id">#${order.id}</span>
                    ${order.source && !order.source.includes('C++') ? `
                        <span class="source-pill web">
                            <i class="fa-solid fa-bell-concierge"></i>
                            <span>${order.source}</span>
                        </span>
                    ` : ''}
                </div>
                <div class="ticket-timer-pill ${urgency}">
                    <i class="fa-regular fa-clock"></i>
                    <span class="time-ago-text">${timeAgo}</span>
                </div>
            </div>

            <div class="ticket-customer-box">
                <div class="customer-info">
                    <i class="fa-solid fa-user-circle text-accent"></i>
                    <span>${order.customer || 'Guest'}</span>
                </div>
                <span class="table-tag">${order.tableNo || 'Table-POS'}</span>
            </div>

            <div class="ticket-items-list">
                ${itemsHtml}
            </div>

            <div class="ticket-footer">
                <div class="ticket-totals-row">
                    <span class="pay-badge ${order.paymentMethod === 'UPI' ? 'upi' : 'cash'}">
                        <i class="fa-solid ${order.paymentMethod === 'UPI' ? 'fa-qrcode' : 'fa-money-bill'}"></i>
                        <span>${order.paymentMethod || 'Cash'}</span>
                    </span>
                    <span class="ticket-grand-total">₹${order.totalBill || 0}</span>
                </div>

                <div class="ticket-action-row">
                    <select class="ticket-status-select" data-id="${order.id}">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>🟡 Pending</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>🔵 In Kitchen</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>🟢 Ready for Pickup</option>
                        <option value="Served" ${order.status === 'Served' ? 'selected' : ''}>🟣 Served / Done</option>
                    </select>

                    <button class="btn-quick-next" data-id="${order.id}" title="Advance to next step">
                        ${nextActionLabels[order.status] || 'Next'}
                    </button>

                    <button class="btn-icon-ticket btn-print-ticket" data-id="${order.id}" title="Print Receipt">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    
                    ${order.paymentMethod === 'UPI' ? `
                        <button class="btn-icon-ticket btn-qr-ticket" data-id="${order.id}" title="View Payment QR">
                            <i class="fa-solid fa-qrcode"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

// 3D Card Hover Micro-Interactions
function setup3DCardHover() {
    const cards = document.querySelectorAll('.order-ticket, .menu-card, .kpi-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1000,
                    duration: 0.2,
                    ease: 'power1.out'
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
        });
    });
}

async function changeOrderStatus(orderId, newStatus) {
    try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            updateLocalOrderStatus(orderId, newStatus);
        } else {
            updateLocalOrderStatus(orderId, newStatus);
        }
    } catch (e) {
        updateLocalOrderStatus(orderId, newStatus);
    }
}

/* ==========================================================================
   GSAP NUMERIC COUNTERS & RIBBON METRICS
   ========================================================================== */
function updateRibbonStats() {
    let rev = 0;
    let pending = 0;
    let preparing = 0;
    let ready = 0;
    let served = 0;

    state.orders.forEach(o => {
        rev += (Number(o.totalBill) || 0);
        if (o.status === 'Pending') pending++;
        else if (o.status === 'Preparing') preparing++;
        else if (o.status === 'Ready') ready++;
        else if (o.status === 'Served') served++;
    });

    animateGsapCounter('stat-kds-revenue', state.statCounters, 'revenue', rev, '₹');
    animateGsapCounter('stat-kds-total', state.statCounters, 'total', state.orders.length);
    animateGsapCounter('stat-kds-pending', state.statCounters, 'pending', pending);
    animateGsapCounter('stat-kds-preparing', state.statCounters, 'preparing', preparing);
    animateGsapCounter('stat-kds-ready', state.statCounters, 'ready', ready);

    const fAll = document.getElementById('filter-count-all');
    const fPend = document.getElementById('filter-count-pending');
    const fPrep = document.getElementById('filter-count-prep');
    const fReady = document.getElementById('filter-count-ready');
    const fServed = document.getElementById('filter-count-served');
    const kdsBadge = document.getElementById('kds-pending-badge');

    if (fAll && fAll.textContent !== String(state.orders.length)) fAll.textContent = state.orders.length;
    if (fPend && fPend.textContent !== String(pending)) fPend.textContent = pending;
    if (fPrep && fPrep.textContent !== String(preparing)) fPrep.textContent = preparing;
    if (fReady && fReady.textContent !== String(ready)) fReady.textContent = ready;
    if (fServed && fServed.textContent !== String(served)) fServed.textContent = served;
    if (kdsBadge && kdsBadge.textContent !== String(pending)) kdsBadge.textContent = pending;
}

function animateGsapCounter(elementId, stateObj, prop, targetVal, prefix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (typeof gsap !== 'undefined') {
        gsap.to(stateObj, {
            [prop]: targetVal,
            duration: 0.7,
            ease: 'power2.out',
            roundProps: prop,
            onUpdate: () => {
                el.textContent = `${prefix}${Math.round(stateObj[prop])}`;
            }
        });
    } else {
        stateObj[prop] = targetVal;
        el.textContent = `${prefix}${targetVal}`;
    }
}

/* ==========================================================================
   URGENCY TIME TICKER (Green -> Amber -> Red Timer)
   ========================================================================== */
function initUrgencyTicker() {
    setInterval(() => {
        document.querySelectorAll('.order-ticket').forEach(card => {
            const timestamp = card.dataset.timestamp;
            const timerSpan = card.querySelector('.time-ago-text');
            const timerPill = card.querySelector('.ticket-timer-pill');
            if (timestamp && timerSpan) {
                timerSpan.textContent = formatTimeAgo(timestamp);
            }
            if (timestamp && timerPill) {
                const urgency = getUrgencyClass(timestamp, card.querySelector('.ticket-status-select')?.value);
                timerPill.className = `ticket-timer-pill ${urgency}`;
            }
        });
    }, 5000);
}

function getUrgencyClass(timestamp, status) {
    if (!timestamp || status === 'Served' || status === 'Ready') return '';
    const date = new Date(timestamp.replace(' ', 'T'));
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins >= 15) return 'urgent-red';
    if (mins >= 5) return 'urgent-amber';
    return '';
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp.replace(' ', 'T'));
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
}

/* ==========================================================================
   VIEW 2: FOOD ORDERING KIOSK & MENU
   ========================================================================== */
async function initMenu() {
    try {
        const res = await fetch('/api/menu');
        if (res.ok) {
            state.menu = await res.json();
        } else {
            state.menu = DEFAULT_MENU;
        }
    } catch (e) {
        state.menu = DEFAULT_MENU;
    }

    renderMenuGrid(true);

    const catPills = document.querySelectorAll('#menu-category-tabs .cat-pill');
    catPills.forEach(pill => {
        pill.addEventListener('click', () => {
            catPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.currentCategory = pill.dataset.cat;
            renderMenuGrid(true);
            playChime(650, 0.08);
        });
    });
}

function renderMenuGrid(animate = false) {
    const grid = document.getElementById('menu-grid');
    if (!grid || !state.menu) return;

    let items = [];
    if (state.currentCategory === 'all') {
        Object.values(state.menu).forEach(list => items.push(...list));
    } else {
        items = state.menu[state.currentCategory] || [];
    }

    grid.innerHTML = items.map(item => {
        const spiceIcons = '🌶️'.repeat(item.spice || 0);
        return `
            <div class="menu-card" id="item-${item.id}">
                <div class="menu-card-media">
                    <img src="${item.img || `assets/${item.category.toLowerCase()}s.jpg`}" alt="${item.name}" class="menu-card-img" onerror="this.src='assets/tacos.jpg'">
                    <div class="card-top-badges">
                        <span class="diet-pill ${item.veg ? 'veg' : 'non-veg'}">${item.veg ? '🌱 VEG' : '🍗 NON-VEG'}</span>
                        <span class="cal-pill">${item.calories || '250 kcal'}</span>
                    </div>
                </div>
                <div class="menu-card-content">
                    <div class="menu-dish-header">
                        <h4 class="menu-dish-name">${item.name}</h4>
                        ${spiceIcons ? `<span class="dish-spice" title="Spice Level">${spiceIcons}</span>` : ''}
                    </div>
                    <p class="menu-dish-desc">${item.desc}</p>
                    <div class="menu-card-bottom">
                        <span class="dish-price-tag">₹${item.price}</span>
                        <button class="btn-add-item" onclick="addToCart('${item.id}', '${escapeQuotes(item.name)}', '${item.category}', ${item.price})">
                            <i class="fa-solid fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    setup3DCardHover();

    if (animate && typeof gsap !== 'undefined') {
        gsap.fromTo('.menu-card', 
            { opacity: 0, y: 15, scale: 0.97 }, 
            { opacity: 1, y: 0, scale: 1, stagger: 0.03, duration: 0.35, ease: 'power2.out' }
        );
    }
}

function escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
}

/* ==========================================================================
   CART & POS SYSTEM
   ========================================================================== */
function initCart() {
    renderCart();

    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
        state.cart = [];
        state.appliedCoupon = null;
        renderCart();
        showToast('Cart cleared', 'info');
        playChime(500, 0.1);
    });

    document.getElementById('btn-apply-coupon')?.addEventListener('click', applyCouponCode);
    document.getElementById('btn-place-order')?.addEventListener('click', handlePlaceOrder);
}

function addToCart(id, name, category, price) {
    const existing = state.cart.find(i => i.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({ id, name, category, price, qty: 1 });
    }

    renderCart();
    playChime(784, 0.12);
    showToast(`Added ${name} to basket`, 'success');

    const badge = document.getElementById('cart-badge-count');
    if (badge && typeof gsap !== 'undefined') {
        gsap.fromTo(badge, { scale: 1.4 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    }
}

function updateCartQty(id, delta) {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        state.cart = state.cart.filter(i => i.id !== id);
    }
    renderCart();
    playChime(620, 0.08);
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const badge = document.getElementById('cart-badge-count');
    const btnPlace = document.getElementById('btn-place-order');

    const totalQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
    if (badge && badge.textContent !== String(totalQty)) badge.textContent = totalQty;

    if (!list) return;

    if (state.cart.length === 0) {
        list.innerHTML = `
            <div class="cart-empty-placeholder">
                <i class="fa-solid fa-utensils" style="font-size: 26px; margin-bottom: 6px; opacity: 0.4;"></i>
                <p>Your basket is empty.<br>Add signature tacos, wraps & shakes!</p>
            </div>
        `;
        if (btnPlace) {
            btnPlace.disabled = true;
            btnPlace.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Place Order & Pay (₹0)</span>`;
        }
        updateBillCalculations(0);
        return;
    }

    list.innerHTML = state.cart.map(item => `
        <div class="cart-item-row">
            <div class="cart-item-meta">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-sub">${item.category} • ₹${item.price}</span>
            </div>
            <div class="cart-stepper">
                <button class="btn-step" onclick="updateCartQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                <span class="step-count">${item.qty}</span>
                <button class="btn-step" onclick="updateCartQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <span class="cart-item-price">₹${item.price * item.qty}</span>
        </div>
    `).join('');

    const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    updateBillCalculations(subtotal);

    if (btnPlace) btnPlace.disabled = false;
}

function updateBillCalculations(subtotal) {
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('bill-discount');
    const subtotalEl = document.getElementById('bill-subtotal');
    const taxEl = document.getElementById('bill-tax');
    const grandTotalEl = document.getElementById('bill-grand-total');
    const btnPlace = document.getElementById('btn-place-order');

    let discount = 0;
    if (state.appliedCoupon && COUPONS[state.appliedCoupon]) {
        discount = Math.round(subtotal * COUPONS[state.appliedCoupon]);
        if (discountRow) discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-₹${discount}`;
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.05);
    const grandTotal = taxableAmount + tax;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (taxEl) taxEl.textContent = `₹${tax}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

    if (btnPlace) {
        btnPlace.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Place Order & Pay (₹${grandTotal})</span>`;
    }
}

function applyCouponCode() {
    const input = document.getElementById('coupon-input');
    const statusMsg = document.getElementById('coupon-status-msg');
    const code = (input?.value || '').trim().toUpperCase();

    if (!code || !statusMsg) return;

    if (COUPONS[code]) {
        state.appliedCoupon = code;
        statusMsg.innerHTML = `<span class="text-success"><i class="fa-solid fa-check"></i> Applied ${COUPONS[code] * 100}% VIP discount!</span>`;
        showToast(`Promo code ${code} applied!`, 'success');
        playSuccessChime();
        renderCart();
    } else {
        statusMsg.innerHTML = `<span class="text-danger"><i class="fa-solid fa-xmark"></i> Invalid coupon code</span>`;
        playChime(300, 0.15);
    }
}

async function handlePlaceOrder() {
    if (state.cart.length === 0) return;

    const custName = document.getElementById('cart-customer-name')?.value.trim() || 'Guest';
    const tableNo = document.getElementById('cart-table-no')?.value.trim() || 'Table-01';
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'UPI';

    const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const discount = state.appliedCoupon ? Math.round(subtotal * (COUPONS[state.appliedCoupon] || 0)) : 0;
    const tax = Math.round((subtotal - discount) * 0.05);
    const grandTotal = subtotal - discount + tax;

    let primaryDrink = 'None';
    let primaryDrinkPrice = 0;
    let primaryMain = 'None';
    let primaryMainPrice = 0;

    const drinkItem = state.cart.find(i => i.category === 'Juice' || i.category === 'Shake');
    if (drinkItem) {
        primaryDrink = `${drinkItem.name} (${drinkItem.category})`;
        primaryDrinkPrice = drinkItem.price;
    }

    const mainItem = state.cart.find(i => i.category === 'Wrap' || i.category === 'Taco');
    if (mainItem) {
        primaryMain = `${mainItem.name} (${mainItem.category})`;
        primaryMainPrice = mainItem.price;
    }

    const orderPayload = {
        id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: custName,
        tableNo: tableNo,
        drink: primaryDrink,
        drinkPrice: primaryDrinkPrice,
        mainCourse: primaryMain,
        mainCoursePrice: primaryMainPrice,
        items: [...state.cart],
        totalBill: grandTotal,
        paymentMethod: paymentMethod,
        source: 'POS Kiosk',
        status: 'Pending',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    if (paymentMethod === 'UPI') {
        state.activeUpiOrder = orderPayload;
        openUpiModal(orderPayload);
    } else {
        await submitFinalOrder(orderPayload);
    }
}

async function submitFinalOrder(order) {
    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        if (res.ok) {
            const data = await res.json();
            handleIncomingOrder(data.order);
        } else {
            handleIncomingOrder(order);
        }
    } catch (e) {
        handleIncomingOrder(order);
    }

    triggerCelebration();
    playSuccessChime();

    state.cart = [];
    state.appliedCoupon = null;
    const nameInput = document.getElementById('cart-customer-name');
    const tableInput = document.getElementById('cart-table-no');
    if (nameInput) nameInput.value = '';
    if (tableInput) tableInput.value = '';
    renderCart();

    setTimeout(() => {
        document.getElementById('tab-kds')?.click();
    }, 600);
}

/* ==========================================================================
   MODAL: DYNAMIC UPI QR CODE (GSAP Spring Pop)
   ========================================================================== */
let upiCountdownTimer = null;

function openUpiModal(order) {
    const modal = document.getElementById('modal-upi');
    const modalCard = document.getElementById('modal-upi-card');
    const amountEl = document.getElementById('modal-upi-amount');
    const qrTarget = document.getElementById('modal-qrcode-target');

    if (amountEl) amountEl.textContent = `₹${order.totalBill}`;
    if (qrTarget) {
        qrTarget.innerHTML = '';
        const upiLink = `upi://pay?pa=9625065557@upi&pn=TacoBell&am=${Math.round(order.totalBill)}&cu=INR`;

        if (typeof QRCode !== 'undefined') {
            new QRCode(qrTarget, {
                text: upiLink,
                width: 190,
                height: 190,
                colorDark: '#0f172a',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }

    modal?.classList.add('active');

    if (typeof gsap !== 'undefined' && modalCard) {
        gsap.fromTo(modalCard, 
            { scale: 0.85, opacity: 0, y: 30 }, 
            { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
        );
    }

    startUpiCountdown(300);
}

function startUpiCountdown(seconds) {
    if (upiCountdownTimer) clearInterval(upiCountdownTimer);
    const display = document.getElementById('modal-upi-countdown');
    if (!display) return;

    let remaining = seconds;
    function tick() {
        const m = Math.floor(remaining / 60).toString().padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
        if (remaining <= 0) {
            clearInterval(upiCountdownTimer);
        }
        remaining--;
    }
    tick();
    upiCountdownTimer = setInterval(tick, 1000);
}

function closeUpiModal() {
    const modal = document.getElementById('modal-upi');
    const modalCard = document.getElementById('modal-upi-card');

    if (typeof gsap !== 'undefined' && modalCard) {
        gsap.to(modalCard, {
            scale: 0.9,
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                modal?.classList.remove('active');
                if (upiCountdownTimer) clearInterval(upiCountdownTimer);
            }
        });
    } else {
        modal?.classList.remove('active');
        if (upiCountdownTimer) clearInterval(upiCountdownTimer);
    }
}

function initModals() {
    document.getElementById('btn-close-upi-modal')?.addEventListener('click', closeUpiModal);
    document.getElementById('btn-close-receipt-modal')?.addEventListener('click', closeReceiptModal);
    document.getElementById('btn-done-receipt')?.addEventListener('click', closeReceiptModal);

    document.getElementById('btn-copy-vpa')?.addEventListener('click', () => {
        navigator.clipboard.writeText('9625065557@upi');
        showToast('UPI VPA copied to clipboard!', 'success');
        playChime(750, 0.1);
    });

    document.getElementById('btn-simulate-pay-success')?.addEventListener('click', async () => {
        closeUpiModal();
        if (state.activeUpiOrder) {
            await submitFinalOrder(state.activeUpiOrder);
            state.activeUpiOrder = null;
        }
    });

    document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
        window.print();
    });
}

/* ==========================================================================
   MODAL: THERMAL RECEIPT INVOICE
   ========================================================================== */
function openReceiptModal(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const paper = document.getElementById('receipt-paper-content');
    const modal = document.getElementById('modal-receipt');
    const modalCard = document.getElementById('modal-receipt-card');
    if (!paper || !modal) return;

    let itemsText = '';
    if (order.items && order.items.length > 0) {
        itemsText = order.items.map(i => 
            `${i.name.padEnd(20)} x${i.qty}   Rs.${i.price * i.qty}`
        ).join('\n');
    } else {
        if (order.drink && order.drink !== 'None') itemsText += `${order.drink.padEnd(20)} x1   Rs.${order.drinkPrice}\n`;
        if (order.mainCourse && order.mainCourse !== 'None') itemsText += `${order.mainCourse.padEnd(20)} x1   Rs.${order.mainCoursePrice}\n`;
    }

    paper.innerHTML = `
        <div style="text-align:center; margin-bottom:12px;">
            <h3 style="font-size:17px; font-weight:900; letter-spacing:0.5px;">TACO BELL GOURMET</h3>
            <p style="font-size:11px; color:#64748b;">Luxury Hotel Food Suite • Tax Invoice</p>
        </div>
        <hr style="border:none; border-top:1px dashed #94a3b8; margin:10px 0;">
        <div>
            <strong>Invoice No:</strong> #${order.id}<br>
            <strong>Date / Time:</strong> ${order.timestamp}<br>
            <strong>Guest Name:</strong> ${order.customer}<br>
            <strong>Service Table:</strong> ${order.tableNo || 'Table-POS'}<br>
            <strong>Channel:</strong> ${order.source || 'C++ Terminal'}
        </div>
        <hr style="border:none; border-top:1px dashed #94a3b8; margin:10px 0;">
        <pre style="font-family:inherit; font-size:12px; margin-bottom:10px; line-height:1.6;">${itemsText}</pre>
        <hr style="border:none; border-top:1px dashed #94a3b8; margin:10px 0;">
        <div style="display:flex; justify-content:space-between; font-size:14.5px; font-weight:900;">
            <span>TOTAL BILL:</span>
            <span>Rs.${order.totalBill}/-</span>
        </div>
        <div style="font-size:11px; color:#64748b; margin-top:4px;">
            Payment: ${order.paymentMethod} • Status: ${order.status}
        </div>
        <hr style="border:none; border-top:1px dashed #94a3b8; margin:10px 0;">
        <div style="text-align:center; font-size:11px; color:#64748b; margin-top:10px;">
            Thank you for dining with Taco Bell Gourmet!<br>Visit again soon.
        </div>
    `;

    modal.classList.add('active');

    if (typeof gsap !== 'undefined' && modalCard) {
        gsap.fromTo(modalCard, 
            { scale: 0.85, opacity: 0, y: 30 }, 
            { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
        );
    }
}

function closeReceiptModal() {
    const modal = document.getElementById('modal-receipt');
    const modalCard = document.getElementById('modal-receipt-card');

    if (typeof gsap !== 'undefined' && modalCard) {
        gsap.to(modalCard, {
            scale: 0.9,
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => modal?.classList.remove('active')
        });
    } else {
        modal?.classList.remove('active');
    }
}

/* ==========================================================================
   VIEW 3: ANALYTICS & REVENUE HUB
   ========================================================================== */
function renderAnalytics() {
    let totalRev = 0;
    let categorySales = { Juices: 0, Shakes: 0, Wraps: 0, Tacos: 0 };
    let dishFrequency = {};

    state.orders.forEach(o => {
        totalRev += (Number(o.totalBill) || 0);

        if (o.items && o.items.length > 0) {
            o.items.forEach(i => {
                const cat = i.category ? (i.category + 's') : 'Tacos';
                if (categorySales[cat] !== undefined) {
                    categorySales[cat] += (i.price * i.qty);
                }
                dishFrequency[i.name] = (dishFrequency[i.name] || 0) + (i.qty || 1);
            });
        } else {
            if (o.drink && o.drink !== 'None') {
                const isShake = o.drink.toLowerCase().includes('shake');
                categorySales[isShake ? 'Shakes' : 'Juices'] += (Number(o.drinkPrice) || 0);
                dishFrequency[o.drink] = (dishFrequency[o.drink] || 0) + 1;
            }
            if (o.mainCourse && o.mainCourse !== 'None') {
                const isWrap = o.mainCourse.toLowerCase().includes('wrap');
                categorySales[isWrap ? 'Wraps' : 'Tacos'] += (Number(o.mainCoursePrice) || 0);
                dishFrequency[o.mainCourse] = (dishFrequency[o.mainCourse] || 0) + 1;
            }
        }
    });

    const totalOrders = state.orders.length;
    const aov = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;

    animateGsapCounter('kpi-val-revenue', state.statCounters, 'kpiRevenue', totalRev, '₹');
    animateGsapCounter('kpi-val-orders', state.statCounters, 'kpiOrders', totalOrders);
    animateGsapCounter('kpi-val-aov', state.statCounters, 'kpiAov', aov, '₹');

    const catTotal = Object.values(categorySales).reduce((a, b) => a + b, 0) || 1;
    const catBarsContainer = document.getElementById('category-bars-list');
    if (catBarsContainer) {
        catBarsContainer.innerHTML = Object.entries(categorySales).map(([cat, amount]) => {
            const pct = Math.round((amount / catTotal) * 100);
            return `
                <div class="cat-bar-item">
                    <div class="cat-bar-header">
                        <span>${cat}</span>
                        <span>₹${amount} (${pct}%)</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill ${cat.toLowerCase()}" style="width: 0%;" data-pct="${pct}"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Animate bar widths with GSAP
        if (typeof gsap !== 'undefined') {
            document.querySelectorAll('.cat-bar-fill').forEach(bar => {
                const pct = bar.dataset.pct;
                gsap.to(bar, { width: `${pct}%`, duration: 0.9, ease: 'power2.out' });
            });
        }
    }

    const sortedDishes = Object.entries(dishFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDishesContainer = document.getElementById('top-dishes-list');
    if (topDishesContainer) {
        if (sortedDishes.length === 0) {
            topDishesContainer.innerHTML = `<p class="text-muted" style="padding:16px;">No sales telemetry yet.</p>`;
        } else {
            topDishesContainer.innerHTML = sortedDishes.map(([name, count], idx) => {
                const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
                return `
                    <div class="top-dish-row">
                        <div class="dish-rank-group">
                            <span class="rank-badge ${rankClass}">#${idx + 1}</span>
                            <strong>${name}</strong>
                        </div>
                        <span class="text-accent" style="font-weight:800;">${count} sold</span>
                    </div>
                `;
            }).join('');
        }
    }

    document.getElementById('btn-export-orders-json')?.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.orders, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", "orders.json");
        dlAnchor.click();
        showToast('Exported orders.json', 'success');
    });

    document.getElementById('btn-reset-demo-orders')?.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/reset-orders', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                handleOrdersRefreshed(data.orders, true);
                showToast('Sample telemetry orders reset', 'success');
                playSuccessChime();
            }
        } catch (e) {
            console.warn('Reset error:', e);
        }
    });
}

/* ==========================================================================
   CELEBRATION CONFETTI & GSAP TOASTS
   ========================================================================== */
function triggerCelebration() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
        });
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'order') icon = 'fa-bell-concierge';
    else if (type === 'success') icon = 'fa-circle-check';

    toast.innerHTML = `
        <i class="fa-solid ${icon} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast, 
            { opacity: 0, x: 40, scale: 0.9 }, 
            { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: 'back.out(1.7)' }
        );

        setTimeout(() => {
            gsap.to(toast, {
                opacity: 0,
                x: 40,
                scale: 0.9,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => toast.remove()
            });
        }, 3500);
    } else {
        setTimeout(() => toast.remove(), 3500);
    }
}
