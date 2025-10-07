// E-commerce Payment System Backend Server
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from your HTML files
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',      // Change if your MySQL is hosted elsewhere
    port: 3306,             // Default MySQL port
    user: 'root',  // Replace with your MySQL username
    password: 'sqltime25', // Replace with your MySQL password
    database: 'ecommerce_system'
});

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database: ecommerce_system');
});

// API Endpoints

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('✅ Test endpoint hit!');
    res.json({ success: true, message: 'Server is working!' });
});

// 1. Save Customer and Order Data (from Vanilla Checkout)
app.post('/api/save-order', async (req, res) => {
    console.log('📥 Received save-order request');
    console.log('📋 Request body:', req.body);
    
    const {
        // Customer data
        firstName, lastName, address, city, state, zip, email,
        // Order data  
        orderId, subtotal, tax, total,
        // Authorization data (from API response)
        authorizationToken, authorizedAmount, authorizationDate,
        // Payment data
        cardType, maskedCard, expirationMonth, expirationYear
    } = req.body;

    console.log('🔍 Extracted data:', {
        firstName, lastName, address, city, state, zip, email,
        orderId, subtotal, tax, total,
        authorizationToken, authorizedAmount, authorizationDate
    });

    try {
        // Start transaction
        await db.promise().beginTransaction();

        // 1. Insert Customer
        const customerResult = await db.promise().query(
            `INSERT INTO Customer (FirstName, LastName, Street, City, State, ZipCode, Email) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, address, city, state, zip, email]
        );
        const customerId = customerResult[0].insertId;

        // 2. Insert Order  
        await db.promise().query(
            `INSERT INTO \`Order\` (OrderID, CustomerID, Subtotal, Tax, Total, OrderStatus, CreatedAt) 
             VALUES (?, ?, ?, ?, ?, 'Authorized', NOW())`,
            [orderId, customerId, subtotal, tax, total]
        );

        // 3. Insert Payment record
        await db.promise().query(
            `INSERT INTO Payment (CardType, MaskedCard, ExpirationMonth, ExpirationYear, PaymentStatus, OrderID) 
             VALUES (?, ?, ?, ?, 'Authorized', ?)`,
            [cardType, maskedCard, expirationMonth, expirationYear, orderId]
        );

        // 4. Insert Authorization with unique token handling
        const uniqueAuthToken = authorizationToken + '_' + Date.now(); // Make token unique
        await db.promise().query(
            `INSERT INTO Authorization (AuthorizationToken, OrderID, AuthorizedAmount, AuthorizationCode, AuthorizationDate, ExpirationDate) 
             VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
            [uniqueAuthToken, orderId, authorizedAmount, authorizationToken.substring(0, 20)]
        );

        // Commit transaction
        await db.promise().commit();

        res.json({ 
            success: true, 
            message: 'Order saved successfully',
            orderId: orderId,
            customerId: customerId
        });

    } catch (error) {
        // Rollback on error
        await db.promise().rollback();
        console.error('❌ Error saving order:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ SQL Error Code:', error.code);
        console.error('❌ Request body:', req.body);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save order data',
            details: error.message
        });
    }
});

// 2. Get Orders for Order Management Page
app.get('/api/orders', async (req, res) => {
    console.log('📋 Orders endpoint requested');
    try {
        const [orders] = await db.promise().query(`
            SELECT 
                o.OrderID as id,
                CONCAT(c.FirstName, ' ', c.LastName) as customer,
                o.Total as amount,
                COALESCE(p.PaymentStatus, o.OrderStatus) as status,
                COALESCE(p.CardType, 'N/A') as cardType,
                COALESCE(p.MaskedCard, 'N/A') as last4,
                DATE_FORMAT(o.CreatedAt, '%Y-%m-%d') as date
            FROM \`Order\` o
            JOIN Customer c ON o.CustomerID = c.CustomerID
            LEFT JOIN Payment p ON o.OrderID = p.OrderID
            ORDER BY o.CreatedAt DESC
        `);

        console.log('✅ Found', orders.length, 'orders');
        res.json({ success: true, orders: orders });
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// 3. Get Order for Settlement Validation
app.get('/api/order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    console.log('🔍 Order lookup request for:', orderId);
    
    try {
        const [result] = await db.promise().query(`
            SELECT 
                o.OrderID,
                o.Total,
                a.AuthorizedAmount,
                CASE WHEN s.SettlementID IS NOT NULL THEN true ELSE false END as settled
            FROM \`Order\` o
            JOIN Authorization a ON o.OrderID = a.OrderID
            LEFT JOIN Settlement s ON o.OrderID = s.OrderID
            WHERE o.OrderID = ?
        `, [orderId]);

        console.log('📋 Query result:', result);

        if (result.length === 0) {
            console.log('❌ Order not found:', orderId);
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        console.log('✅ Order found:', result[0]);
        res.json({ success: true, order: result[0] });
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
});

// 4. Process Settlement
app.post('/api/settle-order', async (req, res) => {
    const { orderId, finalAmount, settledBy } = req.body;
    console.log('💰 Settlement request:', { orderId, finalAmount, settledBy });

    try {
        // Generate a random warehouse user for settlement
        const warehouseUsers = ['WUSER001', 'WUSER002', 'WUSER003', 'WUSER004', 'WUSER005'];
        const warehouseNames = [
            'John Smith',
            'Sarah Johnson',
            'Mike Brown',
            'Lisa Davis',
            'Tom Wilson'
        ];
        
        const randomIndex = Math.floor(Math.random() * warehouseUsers.length);
        const randomUser = warehouseUsers[randomIndex];
        const randomName = warehouseNames[randomIndex];
        
        console.log('👤 Generated warehouse user:', randomUser, '(' + randomName + ')');
        
        // Ensure the warehouse user exists (just UserName)
        await db.promise().query(`
            INSERT IGNORE INTO Warehouse (UserName) 
            VALUES (?)
        `, [randomUser]);
        
        // Insert settlement record with random warehouse user
        console.log('📝 Inserting settlement record...');
        const settlementResult = await db.promise().query(`
            INSERT INTO Settlement (AuthorizationToken, OrderID, SettledAmount, SettledDate, SettledBy, SettlementStatus)
            SELECT a.AuthorizationToken, ?, ?, NOW(), ?, 'completed'
            FROM Authorization a 
            WHERE a.OrderID = ?
        `, [orderId, finalAmount, randomUser, orderId]);
        
        console.log('✅ Settlement record inserted:', settlementResult[0]);

        // Update payment status
        console.log('📝 Updating payment status...');
        const paymentResult = await db.promise().query(`
            UPDATE Payment SET PaymentStatus = 'Settled' WHERE OrderID = ?
        `, [orderId]);
        
        console.log('✅ Payment status updated:', paymentResult[0]);

        res.json({ 
            success: true, 
            message: `Order settled successfully by ${randomName} (${randomUser})` 
        });
    } catch (error) {
        console.error('❌ Error settling order:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ SQL Error Code:', error.code);
        console.error('❌ Settlement request data:', { orderId, finalAmount, settledBy });
        res.status(500).json({ success: false, error: 'Failed to settle order', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🌐 Access your app at: http://localhost:${PORT}/Vanilla%20Checkout.html`);
});