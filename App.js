import { useState } from 'react';

function Checkout() {
  const [form, setForm] = useState({
    name: '', address: '', zip: '', card: '', exp: '', cvv: '', amount: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form); // will later call backend
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Checkout</h2>
      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <input name="address" placeholder="Address" onChange={handleChange} />
      <input name="zip" placeholder="Zip Code" onChange={handleChange} />
      <input name="card" placeholder="Card Number" onChange={handleChange} />
      <input name="exp" placeholder="MM/YY" onChange={handleChange} />
      <input name="cvv" placeholder="CVV" onChange={handleChange} />
      <input name="amount" placeholder="Amount" onChange={handleChange} />
      <button type="submit">Place Order</button>
    </form>
  );
}

export default Checkout;

