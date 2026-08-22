/* =====================================================================
   UI HELPERS — toasts, modals, formatting, small DOM utilities
   ===================================================================== */

function toast(message, type='default', timeout=3800){
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .25s'; setTimeout(()=>el.remove(), 250); }, timeout);
}
const toastOk = (m)=>toast(m,'success');
const toastErr = (m)=>toast(m,'error');

function openModal(html, {wide=false}={}){
  const root = document.getElementById('modal-root');
  const box = document.getElementById('modal-box');
  box.className = 'modal-box' + (wide ? ' wide' : '');
  box.innerHTML = html;
  root.classList.remove('hidden');
  mountIcons(box);
  document.getElementById('modal-backdrop').onclick = closeModal;
  return box;
}
function closeModal(){
  document.getElementById('modal-root').classList.add('hidden');
  document.getElementById('modal-box').innerHTML = '';
}

function confirmModal({title='Are you sure?', body='', confirmLabel='Delete', danger=true} = {}){
  return new Promise((resolve)=>{
    const box = openModal(`
      <div class="modal-head">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="cm-close">${iconSVG('close',18)}</button>
      </div>
      <p style="color:var(--text-muted); font-size:13.5px; line-height:1.5;">${body}</p>
      <div class="modal-foot">
        <button class="btn btn-outline" id="cm-cancel">Cancel</button>
        <button class="btn ${danger?'btn-danger':'btn-accent'}" id="cm-ok">${confirmLabel}</button>
      </div>
    `);
    const finish = (val)=>{ closeModal(); resolve(val); };
    box.querySelector('#cm-close').onclick = ()=>finish(false);
    box.querySelector('#cm-cancel').onclick = ()=>finish(false);
    box.querySelector('#cm-ok').onclick = ()=>finish(true);
  });
}

document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeModal();
});

/* ---------------------------------------------------------------------
   Formatting
   ------------------------------------------------------------------ */
function fmtDate(v){
  if(!v) return '—';
  const d = new Date(v);
  if(isNaN(d)) return String(v);
  return d.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
}
function fmtDateTime(v){
  if(!v) return '—';
  const d = new Date(v);
  if(isNaN(d)) return String(v);
  return d.toLocaleString(undefined, {year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'});
}
function fmtNum(v){
  if(v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  return isNaN(n) ? String(v) : n.toLocaleString();
}
function titleCase(s){
  return String(s||'').replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase());
}

const STATUS_MAP = {
  'delivered':   {cls:'badge-delivered'},
  'in transit':  {cls:'badge-transit'},
  'out for delivery': {cls:'badge-amber'},
  'picked up':   {cls:'badge-amber'},
  'delayed':     {cls:'badge-delayed'},
  'pending':     {cls:'badge-pending'},
  'cancelled':   {cls:'badge-delayed'},
};
function statusBadge(status){
  if(!status) return `<span class="badge badge-pending">Unknown</span>`;
  const key = String(status).toLowerCase().trim();
  const cls = (STATUS_MAP[key] || {cls:'badge-pending'}).cls;
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------------------------------------------------------------------
   Form builder — renders <label class="field"> blocks from a schema
   ------------------------------------------------------------------ */
function renderFields(fields, values={}){
  return fields.map(f=>{
    const val = values[f.key] ?? f.default ?? '';
    const required = f.required ? 'required' : '';
    const disabled = f.disabled ? 'disabled' : '';
    if(f.type === 'select'){
      const opts = f.options.map(o=>`<option value="${o}" ${String(val)===String(o)?'selected':''}>${titleCase(o)}</option>`).join('');
      return `<label class="field"><span>${f.label}${f.required?' *':''}</span>
        <select name="${f.key}" ${required} ${disabled}>${opts}</select></label>`;
    }
    if(f.type === 'textarea'){
      return `<label class="field"><span>${f.label}${f.required?' *':''}</span>
        <textarea name="${f.key}" placeholder="${f.placeholder||''}" ${required} ${disabled}>${escapeHtml(val)}</textarea></label>`;
    }
    return `<label class="field"><span>${f.label}${f.required?' *':''}</span>
      <input type="${f.type||'text'}" name="${f.key}" value="${escapeHtml(val)}" placeholder="${f.placeholder||''}" ${required} ${disabled} ${f.step?`step="${f.step}"`:''}/></label>`;
  }).join('');
}

function readForm(form, fields){
  const out = {};
  fields.forEach(f=>{
    const el = form.elements[f.key];
    if(!el) return;
    let v = el.value;
    if(f.type === 'number') v = v === '' ? null : Number(v);
    out[f.key] = v;
  });
  return out;
}

function setButtonLoading(btn, loading, labelWhenLoading='Working…'){
  if(loading){
    btn.dataset.label = btn.dataset.label || btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;margin:0;"></span> ${labelWhenLoading}`;
  } else {
    btn.disabled = false;
    if(btn.dataset.label) btn.innerHTML = btn.dataset.label;
  }
}
