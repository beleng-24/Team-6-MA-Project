(function(){
  // Simple client-side logic for settlement UI
  const tpl = document.getElementById('item-row-tpl');
  const itemsTableBody = document.querySelector('#itemsTable tbody');
  const addItemBtn = document.getElementById('addItemBtn');
  const settlementForm = document.getElementById('settlement-form');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const amountPaidEl = document.getElementById('amountPaid');
  const changeEl = document.getElementById('change');
  const previewBtn = document.getElementById('previewBtn');
  const previewModal = document.getElementById('previewModal');
  const previewBody = document.getElementById('previewBody');
  const closePreview = document.getElementById('closePreview');
  const exportBtn = document.getElementById('exportBtn');

  const TAX_RATE = 0.10;

  function money(n){
    return '$' + Number(n || 0).toFixed(2);
  }

  function recalc(){
    let subtotal = 0;
    Array.from(itemsTableBody.querySelectorAll('tr')).forEach(tr => {
      const qty = Number(tr.querySelector('.qty').value || 0);
      const price = Number(tr.querySelector('.price').value || 0);
      const line = qty * price;
      subtotal += line;
      tr.querySelector('.line').textContent = money(line);
    });
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    subtotalEl.textContent = money(subtotal);
    taxEl.textContent = money(tax);
    totalEl.textContent = money(total);
    const paid = Number(amountPaidEl.value || 0);
    changeEl.textContent = money(Math.max(0, paid - total));
  }

  function addItem(initial){
    const clone = tpl.content.cloneNode(true);
    const tr = clone.querySelector('tr');
    if(initial){
      tr.querySelector('.sku').value = initial.sku || '';
      tr.querySelector('.desc').value = initial.desc || '';
      tr.querySelector('.qty').value = initial.qty || 1;
      tr.querySelector('.price').value = initial.price || 0;
    }
    itemsTableBody.appendChild(tr);
    tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', recalc));
    tr.querySelector('.remove').addEventListener('click', ()=>{ tr.remove(); recalc(); });
    recalc();
  }

  addItemBtn.addEventListener('click', ()=> addItem());
  amountPaidEl.addEventListener('input', recalc);

  settlementForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    // Simple validation
    if(itemsTableBody.querySelectorAll('tr').length === 0){
      alert('Add at least one item');
      return;
    }
    const payload = {
      warehouse: document.getElementById('warehouse').value,
      date: document.getElementById('settlementDate').value,
      reference: document.getElementById('reference').value,
      notes: document.getElementById('notes').value,
      paymentMethod: document.getElementById('paymentMethod').value,
      amountPaid: Number(amountPaidEl.value || 0),
      items: Array.from(itemsTableBody.querySelectorAll('tr')).map(tr => ({
        sku: tr.querySelector('.sku').value,
        description: tr.querySelector('.desc').value,
        qty: Number(tr.querySelector('.qty').value || 0),
        unitPrice: Number(tr.querySelector('.price').value || 0),
        lineTotal: Number((tr.querySelector('.qty').value || 0) * (tr.querySelector('.price').value || 0))
      }))
    };

    // For now, show success preview
    previewBody.innerHTML = '<pre>' + JSON.stringify(payload, null, 2) + '</pre>';
    previewModal.classList.remove('hidden');
  });

  previewBtn.addEventListener('click', ()=>{
    recalc();
    const data = {
      subtotal: subtotalEl.textContent,
      tax: taxEl.textContent,
      total: totalEl.textContent,
      items: Array.from(itemsTableBody.querySelectorAll('tr')).map(tr=>({
        sku: tr.querySelector('.sku').value,
        description: tr.querySelector('.desc').value,
        qty: tr.querySelector('.qty').value,
        price: tr.querySelector('.price').value,
        line: tr.querySelector('.line').textContent
      }))
    });
    previewBody.innerHTML = renderPreviewHtml(data);
    previewModal.classList.remove('hidden');
  });

  closePreview.addEventListener('click', ()=> previewModal.classList.add('hidden'));

  function renderPreviewHtml(data){
    let html = '<div class="small-muted">Preview of settlement</div>';
    html += '<table style="width:100%;border-collapse:collapse;margin-top:8px">';
    html += '<thead><tr><th>SKU</th><th>Desc</th><th>Qty</th><th>Price</th><th>Line</th></tr></thead><tbody>';
    data.items.forEach(it=>{
      html += `<tr><td>${escapeHtml(it.sku)}</td><td>${escapeHtml(it.description)}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${it.line}</td></tr>`;
    });
    html += '</tbody></table>';
    html += `<div style="margin-top:10px">`;
    html += `<div class="summary-row"><span>Subtotal</span><span>${data.subtotal}</span></div>`;
    html += `<div class="summary-row"><span>Tax</span><span>${data.tax}</span></div>`;
    html += `<div class="summary-row total"><span>Total</span><span>${data.total}</span></div>`;
    html += `</div>`;
    return html;
  }

  function escapeHtml(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  exportBtn.addEventListener('click', ()=>{
    const rows = [];
    Array.from(itemsTableBody.querySelectorAll('tr')).forEach(tr=>{
      rows.push([
        tr.querySelector('.sku').value,
        tr.querySelector('.desc').value,
        tr.querySelector('.qty').value,
        tr.querySelector('.price').value,
        tr.querySelector('.line').textContent.replace('$','')
      ].join(','));
    });
    const csv = ['SKU,Description,Qty,UnitPrice,LineTotal'].concat(rows).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'settlement.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  // Init with one row
  addItem({sku:'ABC-100', desc:'Sample Item', qty:2, price:12.5});

})();