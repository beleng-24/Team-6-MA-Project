import React, { useState, useEffect } from 'react';
import OrderList from './components/OrderList';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample order data - in a real app, this would come from an API
  useEffect(() => {
    const sampleOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2025-001',
        customerName: 'John Doe',
        date: '2025-09-20',
        status: 'delivered',
        total: 299.99,
        items: 3
      },
      {
        id: 2,
        orderNumber: 'ORD-2025-002',
        customerName: 'Jane Smith',
        date: '2025-09-21',
        status: 'shipped',
        total: 149.50,
        items: 2
      },
      {
        id: 3,
        orderNumber: 'ORD-2025-003',
        customerName: 'Bob Johnson',
        date: '2025-09-22',
        status: 'processing',
        total: 89.99,
        items: 1
      },
      {
        id: 4,
        orderNumber: 'ORD-2025-004',
        customerName: 'Alice Brown',
        date: '2025-09-23',
        status: 'pending',
        total: 459.99,
        items: 5
      },
      {
        id: 5,
        orderNumber: 'ORD-2025-005',
        customerName: 'Charlie Wilson',
        date: '2025-09-23',
        status: 'cancelled',
        total: 199.99,
        items: 2
      }
    ];
    setOrders(sampleOrders);
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="App">
      <header className="app-header">
        <h1>E-commerce Order Management</h1>
        <p>Track and manage your orders</p>
      </header>

      <div className="container">
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="status-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="orders-summary">
          <p>Showing {filteredOrders.length} of {orders.length} orders</p>
        </div>

        <OrderList orders={filteredOrders} />
      </div>
    </div>
  );
}

export default App;
