// order-management.js

// Example initial data (replace with your own source or API calls)
let orders = [
  { id: "ORD201", customer: "Alice", amount: 75.25, status: "Authorized", date: "2025-10-03" },
  { id: "ORD202", customer: "Bob", amount: 120.00, status: "Settled", date: "2025-10-04" },
  { id: "ORD203", customer: "Charlie", amount: 88.50, status: "Authorized", date: "2025-10-05" }
];


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
        li.textContent = `${order.id} - ${order.customer} - $${order.amount.toFixed(2)} - ${order.status} - ${order.date}`;
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

// Initial render
applyFiltersAndSorting();
