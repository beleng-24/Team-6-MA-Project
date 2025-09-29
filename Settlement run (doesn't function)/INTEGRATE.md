Integration notes - Settlement component

Files created in this folder:
- Settlement.jsx  - React component
- styles.css      - component styles

1) Add files to your React project

Copy `Settlement.jsx` and `styles.css` into a folder (for example `src/components/Settlement`).

2) Install peer deps (if needed)
- The component uses plain React (hooks). Ensure React 16.8+ is available.

3) Import into `Checkout.jsx`

Example (in `Checkout.jsx`):

import Settlement from '../components/Settlement/Settlement';

function Checkout(){
  function handleSettle(payload){
    // POST payload to your server, then show success
    console.log('Settle payload', payload);
    fetch('/api/settlements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(r=>r.json()).then(res=>alert('Settled: '+res.id)).catch(err=>alert('Error: '+err.message));
  }

  return <div><h2>Checkout</h2><Settlement onSubmit={handleSettle} /></div>;
}

4) Use initial data from SQL dump

- The attached MySQL dump contains `orders`, `order_items`, and `payment_authorizations`.
- You can expose an endpoint `/api/orders/:orderId` that returns an order with items by joining the two tables.

Example server SQL (pseudo):
SELECT o.order_id, o.customer_first_name, o.customer_last_name, o.total_amount, oi.product_name, oi.quantity, oi.unit_price
FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.order_id = 'ORD-002';

Map the returned rows to the component's `initialItems` prop:

const items = rows.map(r=> ({ sku: '', description: r.product_name, qty: r.quantity, unitPrice: Number(r.unit_price) }));

5) Order management integration

- If you want to preview or settle directly from an `OrderCard`/`OrderList`, open a modal and render `<Settlement initialItems={orderItems} onSubmit={...} />`.

6) Next improvements
- Add SKU autocomplete, server-side validation, and optimistic UI for captures.
- Add test coverage for totals/taxes.

