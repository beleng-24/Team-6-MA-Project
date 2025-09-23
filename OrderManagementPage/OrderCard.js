import React from 'react';

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#28a745';
      case 'shipped':
        return '#007bff';
      case 'processing':
        return '#ffc107';
      case 'pending':
        return '#6c757d';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <h3 className="order-number">{order.orderNumber}</h3>
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      
      <div className="order-details">
        <div className="detail-row">
          <span className="label">Customer:</span>
          <span className="value">{order.customerName}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Date:</span>
          <span className="value">{formatDate(order.date)}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Items:</span>
          <span className="value">{order.items} item{order.items !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Total:</span>
          <span className="value total-amount">{formatCurrency(order.total)}</span>
        </div>
      </div>
      
      <div className="order-actions">
        <button className="btn btn-primary">View Details</button>
        <button className="btn btn-secondary">Track Order</button>
      </div>
    </div>
  );
};

export default OrderCard;
