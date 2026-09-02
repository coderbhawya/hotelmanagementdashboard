const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const ORDERS_FILE = path.join(__dirname, 'orders.json');
const LOG_FILE = path.join(__dirname, 'food_order.txt');

// Helper to safely read JSON
function readOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading orders.json:', err);
        return [];
    }
}

// Helper to safely write JSON
function writeOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing orders.json:', err);
        return false;
    }
}

// Helper to append order to food_order.txt
function appendOrderToLog(order) {
    try {
        let logEntry = `===========================================\n`;
        logEntry += `Order ID: ${order.id}\n`;
        logEntry += `Timestamp: ${order.timestamp || new Date().toISOString()}\n`;
        logEntry += `Customer Name: ${order.customer || 'Guest'}\n`;
        
        if (order.drink && order.drink !== 'None') {
            logEntry += `Drink: ${order.drink}\n`;
            logEntry += `Drink Price: ${order.drinkPrice || 0}\n`;
        }
        if (order.mainCourse && order.mainCourse !== 'None') {
            logEntry += `Main Course: ${order.mainCourse}\n`;
            logEntry += `Main Course Price: ${order.mainCoursePrice || 0}\n`;
        }
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                logEntry += `Item: ${item.name} (${item.category}) x${item.qty} - Rs.${item.price}\n`;
            });
        }
        logEntry += `Total Bill: ${order.totalBill}\n`;
        logEntry += `Payment Method: ${order.paymentMethod || 'Cash'}\n`;
        if (order.paymentMethod === 'UPI') {
            logEntry += `UPI ID: 9311515712@upi\nAmount Paid: ${order.totalBill}\n`;
        } else {
            logEntry += `Amount to Pay: ${order.totalBill}\n`;
        }
        logEntry += `Status: ${order.status || 'Pending'}\n`;
        logEntry += `===========================================\n\n`;

        fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    } catch (err) {
        console.error('Error writing to food_order.txt:', err);
    }
}

// SSE Connected Clients Set
const sseClients = new Set();

function broadcastSSE(type, data) {
    const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of sseClients) {
        client.write(payload);
    }
}

// Watch orders.json and food_order.txt for external changes (like from C++ food_menu.exe)
let watchDebounce = null;
if (fs.existsSync(ORDERS_FILE)) {
    fs.watch(ORDERS_FILE, (eventType) => {
        if (eventType === 'change') {
            if (watchDebounce) clearTimeout(watchDebounce);
            watchDebounce = setTimeout(() => {
                console.log('🔄 orders.json modified by external process (e.g. food_menu.exe). Broadcasting update...');
                const orders = readOrders();
                broadcastSSE('ORDERS_UPDATED', orders);
            }, 200);
        }
    });
}

// Menu Definition
const MENU = {
    juices: [
        { id: 'j1', name: 'Pineapple lime', category: 'Juice', price: 159, calories: '120 kcal', veg: true, spice: 0, desc: 'Fresh tropical pineapple juice infused with tangy key lime and crushed mint leaves.' },
        { id: 'j2', name: 'Cranberry crush', category: 'Juice', price: 189, calories: '145 kcal', veg: true, spice: 0, desc: 'Wild antioxidant-rich tart cranberries cold-pressed with sweet pomegranate ruby pearls.' },
        { id: 'j3', name: 'Mango peach', category: 'Juice', price: 179, calories: '160 kcal', veg: true, spice: 0, desc: 'Sun-ripened Alphonso mango pulp blended with sweet Georgia peach nectar.' },
        { id: 'j4', name: 'Dragonfruit berry', category: 'Juice', price: 199, calories: '135 kcal', veg: true, spice: 0, desc: 'Vibrant pink pitaya dragonfruit combined with fresh hand-picked organic blueberries.' }
    ],
    shakes: [
        { id: 's1', name: 'Sweet vanilla', category: 'Shake', price: 149, calories: '290 kcal', veg: true, spice: 0, desc: 'Madagascar bourbon vanilla beans whipped into creamy artisanal ice cream and whole milk.' },
        { id: 's2', name: 'Mexican chocolate', category: 'Shake', price: 169, calories: '340 kcal', veg: true, spice: 1, desc: 'Decadent dark cacao chocolate infused with a hint of warm cinnamon and chili spice.' },
        { id: 's3', name: 'Dulce de leche', category: 'Shake', price: 199, calories: '380 kcal', veg: true, spice: 0, desc: 'Silky smooth golden caramelized milk toffee swirled with rich dulce de leche cream.' },
        { id: 's4', name: 'Wild strawberry', category: 'Shake', price: 159, calories: '270 kcal', veg: true, spice: 0, desc: 'Juicy alpine farm strawberries blended into frosty milk topped with sweet berry drizzle.' }
    ],
    wraps: [
        { id: 'w1', name: 'Spicy paneer', category: 'Wrap', price: 199, calories: '420 kcal', veg: true, spice: 2, desc: 'Char-grilled cottage cheese cubes glazed in peri-peri sauce with crisp iceberg lettuce.' },
        { id: 'w2', name: 'Crispy chicken', category: 'Wrap', price: 249, calories: '510 kcal', veg: false, spice: 2, desc: 'Golden crunchy buttermilk chicken tenders wrapped with smoky chipotle mayo & cheese.' },
        { id: 'w3', name: 'Crispy potato', category: 'Wrap', price: 179, calories: '380 kcal', veg: true, spice: 1, desc: 'Spiced herb potato hash crispies rolled with house salsa and zesty sour cream.' },
        { id: 'w4', name: 'Hot bean', category: 'Wrap', price: 159, calories: '350 kcal', veg: true, spice: 3, desc: 'Slow-simmered spicy pinto & black beans rolled in toasted tortilla with jalapeno relish.' }
    ],
    tacos: [
        { id: 't1', name: 'Soft shell taco', category: 'Taco', price: 129, calories: '210 kcal', veg: true, spice: 1, desc: 'Fluffy warm flour tortilla filled with savory seasoned veggies, salsa fresco & cheddar.' },
        { id: 't2', name: 'Crunchy taco', category: 'Taco', price: 149, calories: '240 kcal', veg: true, spice: 2, desc: 'Classic golden crispy corn shell packed with Mexican beans, guacamole & sour cream.' },
        { id: 't3', name: 'Naked taco', category: 'Taco', price: 159, calories: '310 kcal', veg: false, spice: 2, desc: 'Juicy marinated crispy chicken shell stuffed with crunchy slaw, pico and creamy dressing.' },
        { id: 't4', name: 'Cheesy lava taco', category: 'Taco', price: 179, calories: '350 kcal', veg: true, spice: 2, desc: 'Double shell locked with molten jalapeno cheese sauce and smothered in nachos crumble.' }
    ]
};

// API Endpoints
app.get('/api/menu', (req, res) => {
    res.json(MENU);
});

app.get('/api/orders', (req, res) => {
    const orders = readOrders();
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const orders = readOrders();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newOrder = {
        id: orderData.id || `TB-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: orderData.customer || 'Web Customer',
        tableNo: orderData.tableNo || 'Kiosk-01',
        drink: orderData.drink || 'None',
        drinkPrice: orderData.drinkPrice || 0,
        mainCourse: orderData.mainCourse || 'None',
        mainCoursePrice: orderData.mainCoursePrice || 0,
        items: orderData.items || [],
        totalBill: orderData.totalBill || 0,
        paymentMethod: orderData.paymentMethod || 'UPI',
        status: 'Pending',
        source: 'Web Kiosk',
        timestamp: timestamp
    };

    orders.push(newOrder);
    writeOrders(orders);
    appendOrderToLog(newOrder);

    broadcastSSE('NEW_ORDER', newOrder);
    res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const orders = readOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    writeOrders(orders);
    broadcastSSE('ORDER_STATUS_CHANGED', { id, status });
    res.json({ success: true, order });
});

app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    let orders = readOrders();
    orders = orders.filter(o => o.id !== id);
    writeOrders(orders);
    broadcastSSE('ORDERS_UPDATED', orders);
    res.json({ success: true });
});

app.post('/api/reset-orders', (req, res) => {
    const now = Date.now();
    const sampleOrders = [
        {
            id: 'TB-1001',
            customer: 'Sophia Chen',
            drink: 'Pineapple Lime (Juice)',
            drinkPrice: 159,
            mainCourse: 'Crispy Chicken (Wrap)',
            mainCoursePrice: 249,
            items: [
                { name: 'Pineapple Lime', category: 'Juice', price: 159, qty: 1 },
                { name: 'Crispy Chicken', category: 'Wrap', price: 249, qty: 1 }
            ],
            totalBill: 408,
            paymentMethod: 'UPI',
            status: 'Ready',
            source: 'Room Service',
            timestamp: new Date(now - 5 * 60000).toISOString().replace('T', ' ').substring(0, 19),
            tableNo: 'Suite-204'
        },
        {
            id: 'TB-1002',
            customer: 'Alexander Wright',
            drink: 'Dulce De Leche (Shake)',
            drinkPrice: 199,
            mainCourse: 'Cheesy Lava Taco (Taco)',
            mainCoursePrice: 179,
            items: [
                { name: 'Dulce De Leche', category: 'Shake', price: 199, qty: 1 },
                { name: 'Cheesy Lava Taco', category: 'Taco', price: 179, qty: 1 }
            ],
            totalBill: 378,
            paymentMethod: 'Cash',
            status: 'Preparing',
            source: 'Dine-In',
            timestamp: new Date(now - 12 * 60000).toISOString().replace('T', ' ').substring(0, 19),
            tableNo: 'Table-08'
        },
        {
            id: 'TB-1003',
            customer: 'Elena Rostova',
            drink: 'Dragonfruit Berry (Juice)',
            drinkPrice: 199,
            mainCourse: 'Spicy Paneer (Wrap)',
            mainCoursePrice: 199,
            items: [
                { name: 'Dragonfruit Berry', category: 'Juice', price: 199, qty: 1 },
                { name: 'Spicy Paneer', category: 'Wrap', price: 199, qty: 1 }
            ],
            totalBill: 398,
            paymentMethod: 'UPI',
            status: 'Pending',
            source: 'POS Kiosk',
            timestamp: new Date(now - 3 * 60000).toISOString().replace('T', ' ').substring(0, 19),
            tableNo: 'Table-12'
        },
        {
            id: 'TB-1004',
            customer: 'Liam Vance',
            drink: 'Mexican Chocolate (Shake)',
            drinkPrice: 169,
            mainCourse: 'Naked Chicken Taco (Taco)',
            mainCoursePrice: 159,
            items: [
                { name: 'Mexican Chocolate', category: 'Shake', price: 169, qty: 1 },
                { name: 'Naked Chicken Taco', category: 'Taco', price: 159, qty: 1 }
            ],
            totalBill: 328,
            paymentMethod: 'UPI',
            status: 'Pending',
            source: 'Room Service',
            timestamp: new Date(now - 1 * 60000).toISOString().replace('T', ' ').substring(0, 19),
            tableNo: 'Suite-101'
        },
        {
            id: 'TB-1005',
            customer: 'Aarav Sharma',
            drink: 'Cranberry Crush (Juice)',
            drinkPrice: 189,
            mainCourse: 'Crispy Potato (Wrap)',
            mainCoursePrice: 179,
            items: [
                { name: 'Cranberry Crush', category: 'Juice', price: 189, qty: 1 },
                { name: 'Crispy Potato', category: 'Wrap', price: 179, qty: 1 }
            ],
            totalBill: 368,
            paymentMethod: 'Cash',
            status: 'Preparing',
            source: 'Dine-In',
            timestamp: new Date(now - 18 * 60000).toISOString().replace('T', ' ').substring(0, 19),
            tableNo: 'Table-05'
        },
        {
            id: 'TB-1006',
            customer: 'Olivia Wilde',
            drink: 'Wild Strawberry (Shake)',
            drinkPrice: 159,
            mainCourse: 'Soft Shell Taco (Taco)',
            mainCoursePrice: 129,
            items: [
                { name: 'Wild Strawberry', category: 'Shake', price: 159, qty: 1 },
                { name: 'Soft Shell Taco', category: 'Taco', price: 129, qty: 1 }
            ],
            totalBill: 288,
            paymentMethod: 'UPI',
            status: 'Ready',
            source: 'POS Kiosk',
            timestamp: new Date(now - 22 * 60000).toISOString().replace('T', ' ').substring(0, 19),
            tableNo: 'VIP-02'
        }
    ];
    writeOrders(sampleOrders);
    broadcastSSE('ORDERS_UPDATED', sampleOrders);
    res.json({ success: true, orders: sampleOrders });
});

app.get('/api/raw-log', (req, res) => {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return res.send('No log entries yet in food_order.txt');
        }
        const text = fs.readFileSync(LOG_FILE, 'utf8');
        res.send(text);
    } catch (err) {
        res.status(500).send('Error reading log file: ' + err.message);
    }
});

// SSE Endpoint for sub-millisecond real-time event push
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time KDS bridge active' })}\n\n`);

    req.on('close', () => {
        sseClients.delete(res);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Taco Bell Hotel Management Server running at http://localhost:${PORT}`);
    console.log(`📡 Real-Time C++ KDS sync enabled via orders.json & food_order.txt`);
});
