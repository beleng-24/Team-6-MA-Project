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

// 1. Save Customer and Order Data (from Vanilla Checkout)
app.post('/api/save-order', async (req, res) => {
    const {
        // Customer data
        firstName, lastName, address, city, state, zip, email,
        // Order data  
        orderId, subtotal, tax, total,
        // Authorization data (from API response)
        authorizationToken, authorizedAmount, authorizationDate
    } = req.body;

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

        // 3. Insert Authorization
        await db.promise().query(
            `INSERT INTO Authorization (AuthorizationToken, OrderID, AuthorizedAmount, AuthorizationStatus, AuthorizationDate, ExpirationDate) 
             VALUES (?, ?, ?, 'authorized', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
            [authorizationToken, orderId, authorizedAmount]
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
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save order data' 
        });
    }
});

// 2. Get Orders for Order Management Page
app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await db.promise().query(`
            SELECT 
                o.OrderID as id,
                CONCAT(c.FirstName, ' ', c.LastName) as customer,
                o.Total as amount,
                o.OrderStatus as status,
                DATE_FORMAT(o.CreatedAt, '%Y-%m-%d') as date
            FROM \`Order\` o
            JOIN Customer c ON o.CustomerID = c.CustomerID
            ORDER BY o.CreatedAt DESC
        `);

        res.json({ success: true, orders: orders });
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// 3. Get Order for Settlement Validation
app.get('/api/order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    
    try {
        const [result] = await db.promise().query(`
            SELECT 
                o.OrderID,
                o.Total,
                a.AuthorizedAmount,
                a.AuthorizationStatus,
                CASE WHEN s.SettlementID IS NOT NULL THEN true ELSE false END as settled
            FROM \`Order\` o
            JOIN Authorization a ON o.OrderID = a.OrderID
            LEFT JOIN Settlement s ON o.OrderID = s.OrderID
            WHERE o.OrderID = ?
        `, [orderId]);

        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.json({ success: true, order: result[0] });
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
});

// 4. Process Settlement
app.post('/api/settle-order', async (req, res) => {
    const { orderId, finalAmount, settledBy } = req.body;

    try {
        // Insert settlement record
        await db.promise().query(`
            INSERT INTO Settlement (AuthorizationToken, OrderID, SettledAmount, SettledDate, SettledBy, SettlementStatus)
            SELECT a.AuthorizationToken, ?, ?, NOW(), ?, 'completed'
            FROM Authorization a 
            WHERE a.OrderID = ?
        `, [orderId, finalAmount, settledBy || 'warehouse', orderId]);

        // Update order status
        await db.promise().query(`
            UPDATE \`Order\` SET OrderStatus = 'Settled' WHERE OrderID = ?
        `, [orderId]);

        res.json({ success: true, message: 'Order settled successfully' });
    } catch (error) {
        console.error('❌ Error settling order:', error);
        res.status(500).json({ success: false, error: 'Failed to settle order' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🌐 Access your app at: http://localhost:${PORT}/Vanilla%20Checkout.html`);
});