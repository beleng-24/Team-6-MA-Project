// order-management.js

// Real orders data from database (replaces mock data)
let orders = [];

// DOM references
const orderList = document.getElementById("orderList");
const filterInput = document.getElementById("filterInput");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");

// Fetch real orders from database
async function loadOrdersFromDatabase() {
    try {
        const response = await fetch('/api/orders');
        const result = await response.json();
        
        if (result.success) {
            orders = result.orders;
            console.log('✅ Loaded', orders.length, 'orders from database');
            applyFiltersAndSorting(); // Render the orders
        } else {
            console.error('❌ Failed to load orders:', result.error);
            showErrorMessage('Failed to load orders from database');
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        showErrorMessage('Error connecting to server');
    }
}

// Show error message in the order list
function showErrorMessage(message) {
    orderList.innerHTML = `<li style="color: #ff6b6b; text-align: center; padding: 20px;">${message}</li>`;
}

// Render orders to the list
function renderOrders(orderData) {
    orderList.innerHTML = "";
    if (orderData.length === 0) {
        orderList.innerHTML = "<li class='no-results'>No matching orders found.</li>";
        return;
    }
    orderData.forEach(order => {
        const li = document.createElement("li");
        // Convert amount to number to ensure .toFixed() works
        const amount = Number(order.amount);
        
        // Handle both old and new data formats
        let paymentInfo;
        if (order.cardType && order.last4 && order.cardType !== 'N/A' && order.last4 !== 'N/A') {
            paymentInfo = `${order.cardType} ****${order.last4}`;
        } else if (order.paymentMethod) {
            paymentInfo = order.paymentMethod;
        } else {
            paymentInfo = 'No payment info';
        }
        
        li.textContent = `${order.id} - ${order.customer} - $${amount.toFixed(2)} - ${paymentInfo} - ${order.status} - ${order.date}`;
        orderList.appendChild(li);
    });
}

// Apply filtering and sorting
function applyFiltersAndSorting() {
    let filtered = [...orders];

    // Text filter (Order ID or Customer)
    const text = filterInput.value.toLowerCase();
    if (text) {
        filtered = filtered.filter(o =>
            o.id.toLowerCase().includes(text) ||
            o.customer.toLowerCase().includes(text)
        );
    }

    // Status filter
    if (statusFilter.value !== "all") {
        filtered = filtered.filter(o => o.status === statusFilter.value);
    }

    // Sorting
    switch (sortSelect.value) {
        case "amountAsc":
            filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
            break;
        case "amountDesc":
            filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
            break;
        case "dateAsc":
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case "dateDesc":
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case "customerAsc":
            filtered.sort((a, b) => a.customer.localeCompare(b.customer));
            break;
        case "customerDesc":
            filtered.sort((a, b) => b.customer.localeCompare(a.customer));
            break;
    }

    renderOrders(filtered);
}

// Event listeners
if (filterInput) filterInput.addEventListener("input", applyFiltersAndSorting);
if (statusFilter) statusFilter.addEventListener("change", applyFiltersAndSorting);
if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndSorting);

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Loading orders from database...');
    loadOrdersFromDatabase();
});

// Add refresh button functionality (if you want to add a refresh button later)
function refreshOrders() {
    console.log('🔄 Refreshing orders...');
    loadOrdersFromDatabase();
}
