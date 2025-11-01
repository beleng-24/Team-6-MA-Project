// order-management.js

// Orders data will be loaded from database
let orders = [];

// DOM references
const orderList = document.getElementById("orderList");
const filterInput = document.getElementById("filterInput");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");

// Render orders to the list
function renderOrders(orderData) {
    orderList.innerHTML = "";
    if (orderData.length === 0) {
        orderList.innerHTML = "<li>No matching orders found.</li>";
        return;
    }
    orderData.forEach(order => {
        const li = document.createElement("li");
        // Create a div to hold the order information
        const orderInfo = document.createElement("div");
        const cardInfo = order.cardType && order.last4 ? ` (${order.cardType} •••• ${order.last4})` : '';
        orderInfo.textContent = `${order.id} - ${order.customer} - $${order.amount.toFixed(2)} - ${order.status} - ${order.date}${cardInfo}`;
        
        // Create the settlement button
        const settleButton = document.createElement("button");
        settleButton.textContent = "Settle";
        settleButton.className = "settle-button";
        settleButton.onclick = () => redirectToSettlement(order);
        
        // Add the elements to the list item
        li.appendChild(orderInfo);
        if (order.status !== "Settled") {
            li.appendChild(settleButton);
        }
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
            filtered.sort((a, b) => a.amount - b.amount);
            break;
        case "amountDesc":
            filtered.sort((a, b) => b.amount - a.amount);
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

// Fetch orders from database
async function loadOrdersFromDatabase() {
    try {
        console.log('🔄 Loading orders from database...');
        const response = await fetch('/api/orders');
        const data = await response.json();
        
        if (data.success) {
            console.log('📋 Raw order data from server:', data.orders);
            // Transform the database format to match our UI format
            orders = data.orders.map(order => ({
                id: order.id,
                customer: order.customer,
                amount: parseFloat(order.amount),
                status: order.status,
                date: order.date,
                cardType: order.cardType,
                last4: order.last4
            }));
            console.log('✅ Loaded', orders.length, 'orders from database');
            console.log('📋 Processed orders:', orders);
            applyFiltersAndSorting(); // Re-render with new data
        } else {
            console.error('❌ Failed to load orders:', data.error);
            orderList.innerHTML = "<li>Failed to load orders from database. Please check server connection.</li>";
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        orderList.innerHTML = "<li>An error occurred while loading orders.</li>";
    }
}

// Function to redirect to settlement page with pre-filled data
function redirectToSettlement(order) {
    const params = new URLSearchParams({
        orderId: order.id,
        customer: order.customer,
        amount: order.amount,
        cardType: order.cardType || '',
        last4: order.last4 || ''
    });
    window.location.href = `settlement.html?${params.toString()}`;
}
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        orderList.innerHTML = "<li>Error connecting to server. Please make sure the server is running.</li>";
    }
}

// Initial load from database
loadOrdersFromDatabase();
