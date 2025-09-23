import React from 'react';
import OrderCard from './OrderCard';

const OrderList = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <h3>No orders found</h3>
        <p>Try adjusting your search criteria or check back later.</p>
      </div>
    );
  }

  return (
    <div className="order-list">
      <div className="order-grid">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrderList;
