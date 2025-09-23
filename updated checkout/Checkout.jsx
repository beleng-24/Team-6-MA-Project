import React, { useMemo, useState, useEffect } from "react";

// ---- Demo data (replace with your real cart / prices) ----
const DEMO_CART = [
  { id: "sku-tee", name: "Team Tee", price: 24.99, qty: 2 },
  { id: "sku-hat", name: "Logo Hat", price: 19.99, qty: 1 },
];

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard (5–7 days)", cost: 5.0 },
  { id: "express", label: "Express (2–3 days)", cost: 14.0 },
  { id: "overnight", label: "Overnight (1 day)", cost: 29.0 },
];

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV"
];


export default function Checkout() {
  // ---- Cart & totals ----
  const [cart, setCart] = useState(DEMO_CART);
  const [shippingId, setShippingId] = useState("standard");

  const shipping = SHIPPING_METHODS.find((m) => m.id === shippingId) ?? SHIPPING_METHODS[0];

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const taxRate = 0.07; // demo only
  const taxes = useMemo(() => round2(subtotal * taxRate), [subtotal]);
  const shippingCost = useMemo(() => shipping.cost, [shipping]);
  const total = useMemo(() => round2(subtotal + taxes + shippingCost), [subtotal, taxes, shippingCost]);

  // ---- Forms ----
  const [ship, setShip] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "GA",
    zip: "",
    email: "",
    phone: "",
  });

  const [card, setCard] = useState({
    number: "",
    nameOnCard: "",
    exp: "", // MM/YY
    cvc: "",
    saveCard: false,
  });

  const [agree, setAgree] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [status, setStatus] = useState(null); // {type:'ok'|'err', msg}

  useEffect(() => {
    // Inject minimal input styles (fallback if Tailwind isn't set up)
    const id = "checkout-page-inp-styles";
    if (typeof document === "undefined") return;
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      .inp { width:100%; border-radius:12px; border:1px solid #2b2b2b; background:#07121a; padding:8px 12px; color:inherit; }
      .inp:focus { outline:2px solid rgba(59,130,246,0.5); }
      .rounded-2xl { border-radius:16px; }
      .rounded-xl { border-radius:12px; }
      .shadow-xl { box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
      .text-xs { font-size:12px; }
      .text-sm { font-size:14px; }
      .text-xl { font-size:20px; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // ---- Handlers ----
  const updateShip = (e) => {
    const { name, value } = e.target;
    setShip((s) => ({ ...s, [name]: value }));
  };

  const updateCard = (e) => {
    const { name, type, checked, value } = e.target;
    if (name === 'number') {
      const digits = (value || '').replace(/\D/g, '');
      setCard((c) => ({ ...c, number: digits }));
      return;
    }
    setCard((c) => ({ ...c, [name]: type === "checkbox" ? checked : value }));
  };

  const updateQty = (id, qty) => {
    setCart((items) =>
      items.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(qty) || 0) } : it))
    );
  };

  const removeItem = (id) => setCart((items) => items.filter((it) => it.id !== id));

  const validate = () => {
    if (!ship.firstName.trim() || !ship.lastName.trim()) return "Enter your name.";
    if (!ship.address1.trim() || !ship.city.trim() || !ship.state || !ship.zip.trim()) return "Enter your full shipping address.";
    if (!/^[0-9]{5}(?:-[0-9]{4})?$/.test(ship.zip)) return "Enter a valid ZIP code.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ship.email)) return "Enter a valid email.";
    if (ship.phone && !/^[0-9\-+()\s]{7,}$/.test(ship.phone)) return "Enter a valid phone or leave blank.";
    if (cart.length === 0 || subtotal <= 0) return "Your cart is empty.";

    // Payment (very light client validation; use real gateway on backend)
  const digits = (card.number || "").replace(/\s|-/g, "");
  if (!/^\d{13,19}$/.test(digits)) return "Enter a valid card number (no spaces).";
    if (!card.nameOnCard.trim()) return "Enter the name on card.";
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return "Expiry must be MM/YY.";
    if (!/^\d{3,4}$/.test(card.cvc)) return "Enter a valid CVC.";
    if (!agree) return "Please agree to terms & refund policy.";
    return null;
  };

  const placeOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStatus(null);
    const err = validate();
    if (err) return setStatus({ type: "err", msg: err });

    setPlacing(true);
    const payload = {
      cart: cart.filter((i) => i.qty > 0),
      shippingMethod: shipping.id,
      costs: { subtotal: round2(subtotal), taxes, shipping: shippingCost, total },
      shipping: ship,
      payment: {
  masked: maskCardNumber(card.number),
  last4: (card.number || "").slice(-4),
  brand: guessBrand(card.number),
      },
      createdAt: new Date().toISOString(),
      source: "checkout-frontend",
    };

    const res = await safePost("/api/checkout", payload);

    if (res.ok) {
      setStatus({ type: "ok", msg: "Order placed! A confirmation email is on the way." });
      // Reset cart for demo
  setCart([]);
  // Clear raw card number from state
  setCard((c) => ({ ...c, number: "", rawNumber: "" }));
    } else {
      setStatus({ type: "ok", msg: "Saved locally (offline/mock). You can sync when backend is ready." });
  setCart([]);
  // Clear raw card number from state even when saved offline
  setCard((c) => ({ ...c, number: "", rawNumber: "" }));
    }
    setPlacing(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8" style={{background:'#071017', color:'#eef2ff', padding:20}}>
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6" style={{maxWidth:1100, display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
        {/* Left: Forms */}
        <section style={{gridColumn: '1 / span 1'}}>
          <div style={{display:'grid', gap:16}}>
            <Card>
              <h2 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Shipping Address</h2>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <Field label="First name">
                  <input name="firstName" value={ship.firstName} onChange={updateShip} className="inp" />
                </Field>
                <Field label="Last name">
                  <input name="lastName" value={ship.lastName} onChange={updateShip} className="inp" />
                </Field>
                <Field label="Address line 1">
                  <input name="address1" value={ship.address1} onChange={updateShip} className="inp" />
                </Field>
                <Field label="Address line 2">
                  <input name="address2" value={ship.address2} onChange={updateShip} className="inp" placeholder="Apt, suite, etc. (optional)" />
                </Field>
                <Field label="City">
                  <input name="city" value={ship.city} onChange={updateShip} className="inp" />
                </Field>
                <Field label="State">
                  <select name="state" value={ship.state} onChange={updateShip} className="inp">
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="ZIP">
                  <input name="zip" value={ship.zip} onChange={updateShip} className="inp" inputMode="numeric" placeholder="12345" />
                </Field>
                <div />
                <Field label="Email">
                  <input name="email" value={ship.email} onChange={updateShip} className="inp" type="email" />
                </Field>
                <Field label="Phone (optional)">
                  <input name="phone" value={ship.phone} onChange={updateShip} className="inp" placeholder="(555) 123-4567" />
                </Field>
              </div>
            </Card>

            <Card>
              <h2 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Delivery</h2>
              <div style={{display:'grid', gap:8}}>
                {SHIPPING_METHODS.map((m) => (
                  <label key={m.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:12, borderRadius:12, border:'1px solid #333', cursor:'pointer', background: shippingId===m.id? 'rgba(59,130,246,0.06)':'transparent'}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <input type="radio" name="shipMethod" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
                      <span>{m.label}</span>
                    </div>
                    <span style={{fontWeight:600}}>{fmt(m.cost)}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card>
              <h2 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Payment</h2>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <Field label="Card number">
                  <input name="number" value={formatCardNumber(card.number)} onChange={updateCard} className="inp" inputMode="numeric" placeholder="4242 4242 4242 4242" />
                </Field>
                <Field label="Name on card">
                  <input name="nameOnCard" value={card.nameOnCard} onChange={updateCard} className="inp" />
                </Field>
                <Field label="Expiry (MM/YY)">
                  <input name="exp" value={card.exp} onChange={updateCard} className="inp" placeholder="12/28" />
                </Field>
                <Field label="CVC">
                  <input name="cvc" value={card.cvc} onChange={updateCard} className="inp" inputMode="numeric" placeholder="123" />
                </Field>
              </div>
              <div style={{marginTop:8, color:'#cbd5e1', fontSize:13}}>
                {card.number ? (
                  <span>Card number preview: <strong>{maskCardNumber(card.number)}</strong></span>
                ) : (
                  <span>Card number preview: <em>no card entered</em></span>
                )}
              </div>
              <label style={{display:'flex', alignItems:'center', gap:8, marginTop:12}}>
                <input type="checkbox" name="saveCard" checked={card.saveCard} onChange={updateCard} />
                <span>Save card for faster checkout</span>
              </label>
              
            </Card>

            <Card>
              <h2 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Agreements</h2>
              <label style={{display:'flex', alignItems:'flex-start', gap:8}}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span style={{fontSize:14}}>I agree to the <a href="#" style={{color:'#60a5fa'}}>Terms of Service</a> and acknowledge the <a href="#" style={{color:'#60a5fa'}}>Refund Policy</a>.</span>
              </label>
            </Card>

            {status && (
              <div style={{borderRadius:12, border:'1px solid', padding:12, marginTop:8, borderColor: status.type==='ok'? '#16a34a':'#fb7185', background: status.type==='ok'? 'rgba(16,185,129,0.06)':'rgba(251,113,133,0.06)'}}>
                {status.msg}
              </div>
            )}

            <div style={{display:'flex', gap:12, marginTop:12}}>
              <button onClick={placeOrder} disabled={placing} style={{padding:'10px 18px', borderRadius:12, background:'#2563eb', color:'#fff', border:'none'}}>
                {placing ? "Placing order…" : `Pay ${fmt(total)}`}
              </button>
              <button onClick={(e) => { e.preventDefault(); window.history.back(); }} style={{padding:'10px 18px', borderRadius:12, background:'transparent', color:'#e6eef8', border:'1px solid #333'}}>
                Continue shopping
              </button>
            </div>
          </div>
        </section>

        {/* Right: Order summary */}
        <aside style={{gridColumn: '2 / span 1'}}>
          <Card>
            <h2 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Order Summary</h2>
            <ul style={{listStyle:'none', padding:0, margin:0}}>
              {cart.map((item) => (
                <li key={item.id} style={{padding:'12px 0', display:'flex', justifyContent:'space-between', gap:12}}>
                  <div>
                    <div style={{fontWeight:600}}>{item.name}</div>
                    <div style={{fontSize:13, color:'#94a3b8'}}>{fmt(item.price)} each</div>
                    <div style={{display:'flex', gap:8, marginTop:8}}>
                      <label style={{color:'#94a3b8'}}>Qty</label>
                      <input value={item.qty} inputMode="numeric" onChange={(e) => updateQty(item.id, e.target.value)} className="inp" style={{width:64}} />
                      <button onClick={() => removeItem(item.id)} style={{color:'#fb7185', background:'transparent', border:'none'}}>Remove</button>
                    </div>
                  </div>
                  <div style={{textAlign:'right', fontWeight:600}}>{fmt(item.price * item.qty)}</div>
                </li>
              ))}
            </ul>
            <div style={{marginTop:12}}>
              <Row label="Subtotal" value={fmt(subtotal)} />
              <Row label={`Taxes (${(taxRate * 100).toFixed(0)}%)`} value={fmt(taxes)} />
              <Row label="Shipping" value={fmt(shippingCost)} />
              <div style={{height:1, background:'#1f2937', margin:'8px 0'}} />
              <Row label={<span style={{fontWeight:600}}>Total</span>} value={<span style={{fontWeight:600}}>{fmt(total)}</span>} />
            </div>
            <p style={{marginTop:8, fontSize:12, color:'#94a3b8'}}>* Prices and taxes are for demo only. Replace with your backend-calculated totals for accuracy.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ---- UI helpers ----
function Card({ children }) {
  return (
    <div style={{border:'1px solid #272727', background:'#07121a', padding:16, borderRadius:16, boxShadow:'0 10px 25px rgba(0,0,0,0.6)'}}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{display:'block'}}>
      <span style={{display:'block', marginBottom:6, color:'#cbd5e1'}}>{label}</span>
      <div>{children}</div>
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between'}}>
      <span style={{color:'#94a3b8'}}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ---- Utils ----
function fmt(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(n || 0));
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function formatCardNumber(raw) {
  const n = (raw || "").replace(/\D/g, "");
  return n.replace(/(.{4})/g, "$1 ").trim();
}
function maskCardNumber(cardNumber) {
  const n = (cardNumber || "").replace(/\D/g, "");
  if (n.length <= 4) return n;
  const masked = n.slice(0, -4).replace(/./g, "•");
  return `${masked}${n.slice(-4)}`;
}

function guessBrand(num) {
  const n = (num || "").replace(/\s|-/g, "");
  if (/^4\d{12,18}$/.test(n)) return "Visa";
  if (/^5[1-5]\d{14}$/.test(n)) return "Mastercard";
  if (/^3[47]\d{13}$/.test(n)) return "AmEx";
  if (/^6(?:011|5)\d{12,15}$/.test(n)) return "Discover";
  return "Card";
}

/**
 * Try to POST to your backend. If it fails or backend is not running yet,
 * we queue the order in localStorage (key: checkout_offline_orders).
 */
async function safePost(url, payload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Bad status");
    return { ok: true };
  } catch (err) {
    const key = "checkout_offline_orders";
    try {
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(payload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      // ignore localStorage errors
    }
    return { ok: false };
  }
}
