// Simple order management page functionality

// Sample order data - replace with real data from database
let orders = [
    {
        id: 'ORD123456',
        customer: 'John Doe',
        amount: 49.67,
        status: 'authorized',
        date: '2025-09-29'
    },
    {
        id: 'ORD123457',
        customer: 'Jane Smith',
        amount: 125.99,
        status: 'pending',
        date: '2025-09-28'
    }
];

// Load orders when page loads
window.addEventListener('load', function() {
    loadOrders();
});

// Function to load and display orders
function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) {
        console.log('Orders table not found');
        return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Add each order as a row
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>$${order.amount}</td>
            <td>${order.status}</td>
            <td>${order.date}</td>
            <td>
                <button onclick="viewOrder('${order.id}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to view order details
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\nID: ${order.id}\nCustomer: ${order.customer}\nAmount: $${order.amount}\nStatus: ${order.status}`);
    }
    
    // TODO: Replace alert with proper order details display
    // TODO: Add order editing functionality
    // TODO: Add order status updates
}

// Function to search orders
function searchOrders() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.customer.toLowerCase().includes(searchTerm)
    );
    
    // Display filtered results
    displayFilteredOrders(filteredOrders);
}

// Function to display filtered orders
function displayFilteredOrders(filteredOrders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>$${order.amount}</td>
            <td>${order.status}</td>
            <td>${order.date}</td>
            <td>
                <button onclick="viewOrder('${order.id}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// TODO: Add real database connection
// TODO: Add order filtering by status
// TODO: Add order sorting functionality