import React, {useState, useMemo} from 'react';
import './styles.css';

export default function Settlement({initialItems = [], onSubmit}){
  const [warehouse, setWarehouse] = useState('W1');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [items, setItems] = useState(initialItems.length ? initialItems : [{sku:'',description:'',qty:1,unitPrice:0}]);

  const TAX_RATE = 0.10;

  const subtotal = useMemo(()=> items.reduce((s,it)=> s + (Number(it.qty||0)*Number(it.unitPrice||0)), 0), [items]);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const change = Math.max(0, Number(amountPaid||0) - total);

  function updateItem(idx, patch){
    setItems(prev => { const copy = prev.slice(); copy[idx] = {...copy[idx], ...patch}; return copy; });
  }
  function removeItem(idx){ setItems(prev => prev.filter((_,i)=>i!==idx)); }
  function addItem(){ setItems(prev => prev.concat({sku:'',description:'',qty:1,unitPrice:0})); }

  function handleSubmit(e){
    e && e.preventDefault && e.preventDefault();
    if(items.length === 0){ alert('Add at least one item'); return; }
    const payload = { warehouse, date, reference, notes, paymentMethod, amountPaid: Number(amountPaid||0), subtotal, tax, total, items };
    if(onSubmit) onSubmit(payload);
  }

  function exportCSV(){
    const rows = ['SKU,Description,Qty,UnitPrice,LineTotal'];
    items.forEach(it=> rows.push([it.sku, it.description, it.qty, it.unitPrice, (Number(it.qty||0)*Number(it.unitPrice||0)).toFixed(2)].join(',')));
    const blob = new Blob([rows.join('\n')], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'settlement.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  return (
    <div className="settlement-root">
      <form className="settlement-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <h3>Settlement</h3>
          <label>Warehouse</label>
          <select value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
            <option value="W1">Warehouse 1</option>
            <option value="W2">Warehouse 2</option>
          </select>

          <label>Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />

          <label>Reference</label>
          <input value={reference} onChange={e=>setReference(e.target.value)} placeholder="INV-2025-..." />

          <label>Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} />

          <div className="items-card">
            <h4>Items</h4>
            <table className="items-table">
              <thead><tr><th>SKU</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Line</th><th></th></tr></thead>
              <tbody>
                {items.map((it,idx)=> (
                  <tr key={idx}>
                    <td><input value={it.sku} onChange={e=>updateItem(idx,{sku:e.target.value})} /></td>
                    <td><input value={it.description} onChange={e=>updateItem(idx,{description:e.target.value})} /></td>
                    <td><input type="number" min="0" value={it.qty} onChange={e=>updateItem(idx,{qty:Number(e.target.value)})} /></td>
                    <td><input type="number" min="0" step="0.01" value={it.unitPrice} onChange={e=>updateItem(idx,{unitPrice:Number(e.target.value)})} /></td>
                    <td>{(Number(it.qty||0)*Number(it.unitPrice||0)).toFixed(2)}</td>
                    <td><button type="button" className="danger" onClick={()=>removeItem(idx)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="items-actions"><button type="button" onClick={addItem}>Add Item</button></div>
          </div>

        </div>

        <aside className="form-right">
          <div className="summary-row"><span>Subtotal</span><strong>{subtotal.toFixed(2)}</strong></div>
          <div className="summary-row"><span>Tax (10%)</span><strong>{tax.toFixed(2)}</strong></div>
          <div className="summary-row total"><span>Total</span><strong>{total.toFixed(2)}</strong></div>

          <label>Payment Method</label>
          <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
          </select>

          <label>Amount Paid</label>
          <input type="number" min="0" step="0.01" value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} />
          <div className="summary-row"><span>Change</span><strong>{change.toFixed(2)}</strong></div>

          <div className="actions">
            <button type="button" onClick={()=>{ window.dispatchEvent(new CustomEvent('settlementPreview',{detail:{subtotal,tax,total,items}})); }}>Preview</button>
            <button type="button" onClick={exportCSV}>Export CSV</button>
            <button type="submit">Settle</button>
          </div>
        </aside>
      </form>
    </div>
  );
}
