/* =====================================================================
   PAGES
   Each function renders into the #app root. Kept framework-free —
   plain DOM strings + event delegation — so the whole app is a
   dependency-light static bundle.
   ===================================================================== */

const Pages = {};

/* =====================================================================
   Generic entity CRUD page factory
   Used for Customers / Drivers / Vehicles / Routes
   ===================================================================== */
function entityPage(cfg){
  return async function(root){
    let rows = [];
    let query = '';

    root.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-eyebrow">${cfg.eyebrow}</div>
          <h1 class="page-title">${cfg.title}</h1>
          <p class="page-desc">${cfg.desc}</p>
        </div>
        <div class="toolbar">
          <div class="search-box">${iconSVG('search',14)}<input id="ent-search" placeholder="Search ${cfg.title.toLowerCase()}…" /></div>
          <button class="btn btn-outline btn-sm" id="ent-refresh">${iconSVG('refresh',14)} Refresh</button>
          ${cfg.canCreate !== false ? `<button class="btn btn-accent btn-sm" id="ent-add">${iconSVG('plus',14)} Add ${cfg.singular}</button>` : ''}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">${cfg.title} <span class="count" id="ent-count"></span></span>
        </div>
        <div id="ent-table-wrap"><div class="spinner"></div></div>
      </div>
    `;
    mountIcons(root);

    async function load(){
      root.querySelector('#ent-table-wrap').innerHTML = '<div class="spinner"></div>';
      try{
        rows = await cfg.api.list() || [];
      }catch(e){
        rows = [];
        root.querySelector('#ent-table-wrap').innerHTML = errorState(e.message);
        root.querySelector('#ent-count').textContent = '';
        return;
      }
      renderTable();
    }

    function renderTable(){
      const wrap = root.querySelector('#ent-table-wrap');
      root.querySelector('#ent-count').textContent = rows.length ? `(${rows.length})` : '';
      const filtered = query
        ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()))
        : rows;

      if(!filtered.length){
        wrap.innerHTML = emptyState(cfg.title, cfg.desc);
        return;
      }

      const role = Store.getRole();
      const canUpdate = cfg.canUpdate ? cfg.canUpdate(role) : true;
      const canDelete = cfg.canDelete ? cfg.canDelete(role) : true;

      wrap.innerHTML = `
        <div class="table-scroll">
          <table class="data">
            <thead><tr>
              ${cfg.columns.map(c=>`<th>${c.label}</th>`).join('')}
              <th style="text-align:right">Actions</th>
            </tr></thead>
            <tbody>
              ${filtered.map(row => `
                <tr data-id="${row[cfg.idField]}">
                  ${cfg.columns.map(c=>`<td class="${c.mono?'cell-mono':''}">${c.render ? c.render(row) : escapeHtml(row[c.key] ?? '—')}</td>`).join('')}
                  <td class="cell-actions">
                    <button class="btn btn-ghost btn-icon act-edit" title="${canUpdate?'Edit':'Requires admin sign-in'}" ${canUpdate?'':'disabled'}>${iconSVG('edit',15)}</button>
                    <button class="btn btn-ghost btn-icon act-del" title="${canDelete?'Delete':'Requires admin sign-in'}" ${canDelete?'':'disabled'}>${iconSVG('trash',15)}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      mountIcons(wrap);

      wrap.querySelectorAll('tr[data-id]').forEach(tr=>{
        const id = tr.getAttribute('data-id');
        const row = rows.find(r => String(r[cfg.idField]) === String(id));
        tr.querySelector('.act-edit').onclick = () => openForm(row);
        tr.querySelector('.act-del').onclick = () => doDelete(row);
      });
    }

    function openForm(row){
      const isEdit = !!row;
      const fields = isEdit ? cfg.editFields(cfg.fields) : cfg.fields;
      const box = openModal(`
        <div class="modal-head">
          <h3 class="modal-title">${isEdit ? `Edit ${cfg.singular}` : `Add ${cfg.singular}`}</h3>
          <button class="modal-close" id="ef-close">${iconSVG('close',18)}</button>
        </div>
        <form id="ef-form">
          ${renderFields(fields, row || {})}
          <div class="modal-foot">
            <button type="button" class="btn btn-outline" id="ef-cancel">Cancel</button>
            <button type="submit" class="btn btn-accent" id="ef-submit">${isEdit ? 'Save changes' : `Add ${cfg.singular}`}</button>
          </div>
        </form>
      `);
      box.querySelector('#ef-close').onclick = closeModal;
      box.querySelector('#ef-cancel').onclick = closeModal;
      box.querySelector('#ef-form').onsubmit = async (e)=>{
        e.preventDefault();
        const btn = box.querySelector('#ef-submit');
        const data = readForm(e.target, fields);
        setButtonLoading(btn, true, isEdit ? 'Saving…' : 'Adding…');
        try{
          if(isEdit){
            await cfg.api.update(row[cfg.idField], data);
            toastOk(`${cfg.singular} updated`);
          } else {
            await cfg.api.create(data);
            toastOk(`${cfg.singular} added`);
          }
          closeModal();
          load();
        }catch(err){
          toastErr(err.message);
          setButtonLoading(btn, false);
        }
      };
    }

    async function doDelete(row){
      const ok = await confirmModal({
        title: `Delete this ${cfg.singular.toLowerCase()}?`,
        body: `This removes <strong>${escapeHtml(row[cfg.columns[0].key] ?? row[cfg.idField])}</strong> permanently. This can't be undone.`,
        confirmLabel: 'Delete',
      });
      if(!ok) return;
      try{
        await cfg.api.remove(row[cfg.idField]);
        toastOk(`${cfg.singular} deleted`);
        load();
      }catch(err){ toastErr(err.message); }
    }

    root.querySelector('#ent-search').oninput = (e)=>{ query = e.target.value; renderTable(); };
    root.querySelector('#ent-refresh').onclick = load;
    if(cfg.canCreate !== false) root.querySelector('#ent-add').onclick = () => openForm(null);

    load();
  };
}

function emptyState(title, desc){
  return `<div class="empty-state">${iconSVG('box',34)}<h3>No ${title.toLowerCase()} yet</h3><p>${desc}</p></div>`;
}
function errorState(msg){
  return `<div class="empty-state">${iconSVG('pin',34)}<h3>Couldn't load data</h3><p>${escapeHtml(msg)}</p></div>`;
}

/* ---------------------------------------------------------------------
   Customers
   ------------------------------------------------------------------ */
Pages.customers = entityPage({
  eyebrow:'Directory', title:'Customers', singular:'Customer',
  desc:'Everyone shipping through the network — contact details and location.',
  api: Api.customers, idField:'customer_id',
  columns:[
    {key:'customer_id', label:'ID', mono:true},
    {key:'customer_name', label:'Name'},
    {key:'email', label:'Email'},
    {key:'phone', label:'Phone'},
    {key:'city', label:'City', render:r=>`${escapeHtml(r.city||'—')}${r.state?`, ${escapeHtml(r.state)}`:''}`},
    {key:'country', label:'Country'},
  ],
  fields:[
    {key:'customer_name', label:'Customer name', required:true},
    {key:'email', label:'Email', type:'email', required:true},
    {key:'phone', label:'Phone', required:true},
    {key:'city', label:'City'},
    {key:'state', label:'State'},
    {key:'country', label:'Country'},
  ],
  editFields:(f)=>f,
  canUpdate: (role)=> role==='admin',
  canDelete: (role)=> role==='admin',
});

/* ---------------------------------------------------------------------
   Drivers
   ------------------------------------------------------------------ */
Pages.drivers = entityPage({
  eyebrow:'Fleet crew', title:'Drivers', singular:'Driver',
  desc:'Licensed drivers available for pickup and delivery runs.',
  api: Api.drivers, idField:'driver_id',
  columns:[
    {key:'driver_id', label:'ID', mono:true},
    {key:'driver_name', label:'Name'},
    {key:'license_number', label:'License #', mono:true},
    {key:'phone', label:'Phone'},
    {key:'status', label:'Status', render:r=>statusBadge(r.status)},
  ],
  fields:[
    {key:'driver_id', label:'Driver ID', type:'number', required:true},
    {key:'driver_name', label:'Full name', required:true},
    {key:'license_number', label:'License number', required:true},
    {key:'phone', label:'Phone', required:true},
    {key:'status', label:'Status', type:'select', options:['Available','On Duty','Off Duty'], default:'Available'},
  ],
  editFields:(f)=>f.filter(x=>x.key!=='driver_id').map(x=>x),
  canUpdate: (role)=> role==='admin',
  canDelete: (role)=> role==='admin',
});

/* ---------------------------------------------------------------------
   Vehicles
   ------------------------------------------------------------------ */
Pages.vehicles = entityPage({
  eyebrow:'Fleet', title:'Vehicles', singular:'Vehicle',
  desc:'Trucks and vans available to carry freight along active routes.',
  api: Api.vehicles, idField:'vehicle_id',
  columns:[
    {key:'vehicle_id', label:'ID', mono:true},
    {key:'vehicle_type', label:'Type'},
    {key:'plate_no', label:'Plate no.', mono:true},
    {key:'capacity_kg', label:'Capacity', render:r=>`${fmtNum(r.capacity_kg)} kg`},
    {key:'status', label:'Status', render:r=>statusBadge(r.status)},
  ],
  fields:[
    {key:'vehicle_id', label:'Vehicle ID', type:'number', required:true},
    {key:'vehicle_type', label:'Vehicle type', placeholder:'e.g. Box Truck'},
    {key:'capacity_kg', label:'Capacity (kg)', type:'number'},
    {key:'plate_no', label:'Plate number'},
    {key:'status', label:'Status', type:'select', options:['Available','In Transit','Maintenance'], default:'Available'},
  ],
  editFields:(f)=>f.filter(x=>x.key!=='vehicle_id'),
  canUpdate: ()=> true,
  canDelete: ()=> true,
});

/* ---------------------------------------------------------------------
   Routes
   ------------------------------------------------------------------ */
Pages.routes = entityPage({
  eyebrow:'Network', title:'Routes', singular:'Route',
  desc:'Origin-destination lanes with distance and time estimates.',
  api: Api.routes, idField:'route_id',
  columns:[
    {key:'route_id', label:'ID', mono:true},
    {key:'lane', label:'Lane', render:r=>`${escapeHtml(r.source||'—')} ${iconSVG('arrowR',12)} ${escapeHtml(r.destination||'—')}`},
    {key:'distance_km', label:'Distance', render:r=>`${fmtNum(r.distance_km)} km`},
    {key:'estimated_hours', label:'Est. time', render:r=>`${fmtNum(r.estimated_hours)} h`},
  ],
  fields:[
    {key:'route_id', label:'Route ID', type:'number', required:true},
    {key:'source', label:'Source', required:true},
    {key:'destination', label:'Destination', required:true},
    {key:'distance_km', label:'Distance (km)', type:'number'},
    {key:'estimated_hours', label:'Estimated hours', type:'number', step:'0.1'},
  ],
  editFields:(f)=>f.filter(x=>x.key!=='route_id'),
  canUpdate: (role)=> role==='admin' || role==='driver',
  canDelete: (role)=> role==='admin',
});

/* =====================================================================
   DASHBOARD
   ===================================================================== */
Pages.dashboard = async function(root){
  root.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-eyebrow">Overview</div>
        <h1 class="page-title">Control tower</h1>
        <p class="page-desc">Live snapshot of everything moving through the network right now.</p>
      </div>
      <button class="btn btn-outline btn-sm" id="dash-refresh">${iconSVG('refresh',14)} Refresh</button>
    </div>
    <div class="kpi-grid" id="kpi-grid"><div class="spinner"></div></div>
    <div class="grid-2">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Shipment status breakdown</span></div>
        <div class="chart-wrap"><canvas id="chart-status"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Most used routes</span></div>
        <div id="dash-routes"><div class="spinner"></div></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">Recent shipments</span>
        <a href="#/shipments" class="btn btn-ghost btn-sm">View all ${iconSVG('arrowR',13)}</a>
      </div>
      <div id="dash-recent"><div class="spinner"></div></div>
    </div>
  `;
  mountIcons(root);

  async function load(){
    try{
      const summary = await Api.reports.summary();
      root.querySelector('#kpi-grid').innerHTML = `
        ${kpiCard('Total shipments', summary.total_shipments, null, 'var(--accent-soft)')}
        ${kpiCard('Delivered', summary.delivered, null, 'var(--route-soft)')}
        ${kpiCard('In transit', summary.in_transit, null, 'var(--info-soft)')}
        ${kpiCard('Out for delivery', summary.out_for_delivery, null, 'var(--accent-soft)')}
        ${kpiCard('Delayed', summary.delayed, null, 'var(--danger-soft)')}
      `;
    }catch(e){
      root.querySelector('#kpi-grid').innerHTML = errorState(e.message);
    }

    try{
      const statusRows = await Api.reports.shipmentStatus();
      drawStatusChart(statusRows || []);
    }catch(e){
      root.querySelector('#chart-status').closest('.chart-wrap').innerHTML = errorState(e.message);
    }

    try{
      const routes = await Api.reports.mostUsedRoute();
      const wrap = root.querySelector('#dash-routes');
      if(!routes || !routes.length){ wrap.innerHTML = emptyState('routes','Route usage will appear once shipments are logged.'); }
      else{
        wrap.innerHTML = routes.slice(0,6).map(r=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border-soft)">
            <span style="font-size:13px">${escapeHtml(r.source)} ${iconSVG('arrowR',12)} ${escapeHtml(r.destination)}</span>
            <span class="cell-mono">${fmtNum(r.trips)} trips</span>
          </div>`).join('');
      }
    }catch(e){
      root.querySelector('#dash-routes').innerHTML = errorState(e.message);
    }

    try{
      const shipments = await Api.shipments.list();
      const wrap = root.querySelector('#dash-recent');
      const recent = (shipments||[]).slice(-6).reverse();
      if(!recent.length){ wrap.innerHTML = emptyState('shipments','New shipments will show up here as soon as they are created.'); }
      else{
        wrap.innerHTML = `
          <div class="table-scroll"><table class="data">
            <thead><tr><th>Shipment</th><th>Customer</th><th>Route</th><th>Weight</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>${recent.map(s=>`
              <tr>
                <td class="cell-mono">#${escapeHtml(s.shipment_id)}</td>
                <td class="cell-mono">${escapeHtml(s.customer_id)}</td>
                <td class="cell-mono">${escapeHtml(s.route_id)}</td>
                <td>${fmtNum(s.weight_kg)} kg</td>
                <td>${fmtDate(s.shipment_date)}</td>
                <td>${statusBadge(s.status)}</td>
              </tr>`).join('')}</tbody>
          </table></div>`;
      }
    }catch(e){
      root.querySelector('#dash-recent').innerHTML = errorState(e.message);
    }
  }

  function kpiCard(label, value, sub, glow){
    return `<div class="kpi-card" style="--kpi-glow:${glow}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${fmtNum(value)}</div>
      ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
    </div>`;
  }

  let chartInst = null;
  function drawStatusChart(rows){
    const ctx = root.querySelector('#chart-status');
    if(!ctx) return;
    const labels = rows.map(r=>titleCase(r.status));
    const data = rows.map(r=>Number(r.total));
    const palette = ['#3ED8A0','#4FA3FF','#F5A623','#FF6262','#8CA3B8','#C97BFF'];
    if(chartInst) chartInst.destroy();
    chartInst = new Chart(ctx, {
      type:'doughnut',
      data:{ labels, datasets:[{ data, backgroundColor:labels.map((_,i)=>palette[i%palette.length]), borderColor:'#101C2C', borderWidth:3 }] },
      options:{
        plugins:{ legend:{ position:'bottom', labels:{ color:'#8CA3B8', font:{family:'Inter', size:11.5}, boxWidth:9, usePointStyle:true, pointStyle:'circle' } } },
        cutout:'62%',
      }
    });
  }

  root.querySelector('#dash-refresh').onclick = load;
  load();
};

/* =====================================================================
   SHIPMENTS
   ===================================================================== */
const SHIPMENT_FIELDS = [
  {key:'shipment_id', label:'Shipment ID', type:'number', required:true},
  {key:'customer_id', label:'Customer ID', type:'number', required:true},
  {key:'vechicle_id', label:'Vehicle ID', type:'number'},
  {key:'driver_id', label:'Driver ID', type:'number'},
  {key:'route_id', label:'Route ID', type:'number'},
  {key:'weight_kg', label:'Weight (kg)', type:'number', step:'0.1'},
  {key:'shipment_date', label:'Shipment date', type:'date'},
  {key:'status', label:'Status', type:'select', options:['Pending','Picked Up','In Transit','Out for Delivery','Delivered','Delayed','Cancelled'], default:'Pending'},
];

Pages.shipments = async function(root){
  let rows = [];
  let query = '';

  root.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-eyebrow">Freight</div>
        <h1 class="page-title">Shipments</h1>
        <p class="page-desc">Every consignment moving through the network, from booking to delivery.</p>
      </div>
      <div class="toolbar">
        <div class="search-box">${iconSVG('search',14)}<input id="sh-search" placeholder="Search shipments…" /></div>
        <button class="btn btn-outline btn-sm" id="sh-refresh">${iconSVG('refresh',14)} Refresh</button>
        <button class="btn btn-accent btn-sm" id="sh-add">${iconSVG('plus',14)} New shipment</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">All shipments <span class="count" id="sh-count"></span></span></div>
      <div id="sh-table-wrap"><div class="spinner"></div></div>
    </div>
  `;
  mountIcons(root);

  async function load(){
    root.querySelector('#sh-table-wrap').innerHTML = '<div class="spinner"></div>';
    try{ rows = await Api.shipments.list() || []; }
    catch(e){ root.querySelector('#sh-table-wrap').innerHTML = errorState(e.message); return; }
    renderTable();
  }

  function renderTable(){
    const wrap = root.querySelector('#sh-table-wrap');
    root.querySelector('#sh-count').textContent = rows.length ? `(${rows.length})` : '';
    const filtered = query ? rows.filter(r=>JSON.stringify(r).toLowerCase().includes(query.toLowerCase())) : rows;
    if(!filtered.length){ wrap.innerHTML = emptyState('shipments', 'Create a shipment to start tracking it end to end.'); return; }

    wrap.innerHTML = `
      <div class="table-scroll"><table class="data">
        <thead><tr>
          <th>ID</th><th>Customer</th><th>Driver</th><th>Vehicle</th><th>Route</th><th>Weight</th><th>Date</th><th>Status</th><th style="text-align:right">Actions</th>
        </tr></thead>
        <tbody>${filtered.map(s=>`
          <tr data-id="${s.shipment_id}">
            <td class="cell-mono">#${escapeHtml(s.shipment_id)}</td>
            <td class="cell-mono">${escapeHtml(s.customer_id ?? '—')}</td>
            <td class="cell-mono">${escapeHtml(s.driver_id ?? '—')}</td>
            <td class="cell-mono">${escapeHtml(s.vechicle_id ?? '—')}</td>
            <td class="cell-mono">${escapeHtml(s.route_id ?? '—')}</td>
            <td>${fmtNum(s.weight_kg)} kg</td>
            <td>${fmtDate(s.shipment_date)}</td>
            <td>${statusBadge(s.status)}</td>
            <td class="cell-actions">
              <button class="btn btn-ghost btn-icon act-view" title="View manifest">${iconSVG('pin',15)}</button>
              <button class="btn btn-ghost btn-icon act-edit" title="Edit">${iconSVG('edit',15)}</button>
              <button class="btn btn-ghost btn-icon act-del" title="Delete">${iconSVG('trash',15)}</button>
            </td>
          </tr>`).join('')}</tbody>
      </table></div>`;
    mountIcons(wrap);

    wrap.querySelectorAll('tr[data-id]').forEach(tr=>{
      const id = tr.getAttribute('data-id');
      const row = rows.find(r=>String(r.shipment_id)===String(id));
      tr.querySelector('.act-view').onclick = ()=>openDetail(row);
      tr.querySelector('.act-edit').onclick = ()=>openForm(row);
      tr.querySelector('.act-del').onclick = ()=>doDelete(row);
      tr.addEventListener('dblclick', ()=>openDetail(row));
    });
  }

  function openForm(row){
    const isEdit = !!row;
    const fields = isEdit ? SHIPMENT_FIELDS.filter(f=>f.key!=='shipment_id') : SHIPMENT_FIELDS;
    const box = openModal(`
      <div class="modal-head">
        <h3 class="modal-title">${isEdit?'Edit shipment':'New shipment'}</h3>
        <button class="modal-close" id="sf-close">${iconSVG('close',18)}</button>
      </div>
      <form id="sf-form">
        <div class="field-row">${renderFields(fields, row||{})}</div>
        <div class="modal-foot">
          <button type="button" class="btn btn-outline" id="sf-cancel">Cancel</button>
          <button type="submit" class="btn btn-accent" id="sf-submit">${isEdit?'Save changes':'Create shipment'}</button>
        </div>
      </form>
    `, {wide:true});
    box.querySelector('#sf-close').onclick = closeModal;
    box.querySelector('#sf-cancel').onclick = closeModal;
    box.querySelector('#sf-form').onsubmit = async (e)=>{
      e.preventDefault();
      const btn = box.querySelector('#sf-submit');
      const data = readForm(e.target, fields);
      setButtonLoading(btn, true, isEdit?'Saving…':'Creating…');
      try{
        if(isEdit){ await Api.shipments.update(row.shipment_id, data); toastOk('Shipment updated'); }
        else{ await Api.shipments.create(data); toastOk('Shipment created'); }
        closeModal(); load();
      }catch(err){ toastErr(err.message); setButtonLoading(btn,false); }
    };
  }

  async function doDelete(row){
    const ok = await confirmModal({ title:'Delete this shipment?', body:`Shipment <strong>#${row.shipment_id}</strong> and its record will be removed permanently.` });
    if(!ok) return;
    try{ await Api.shipments.remove(row.shipment_id); toastOk('Shipment deleted'); load(); }
    catch(err){ toastErr(err.message); }
  }

  async function openDetail(row){
    const box = openModal(`
      <div class="modal-head">
        <div>
          <h3 class="modal-title">Shipment #${escapeHtml(row.shipment_id)}</h3>
          <div class="manifest-stamp" style="margin-top:4px">Customer ${escapeHtml(row.customer_id??'—')} &middot; Route ${escapeHtml(row.route_id??'—')} &middot; ${fmtNum(row.weight_kg)} kg</div>
        </div>
        <button class="modal-close" id="sd-close">${iconSVG('close',18)}</button>
      </div>
      <div style="margin-bottom:6px">${statusBadge(row.status)}</div>

      <div class="panel" style="padding:16px;margin:16px 0;">
        <div class="panel-head" style="margin-bottom:10px"><span class="panel-title" style="font-size:13px">Tracking manifest</span></div>
        <div id="sd-timeline"><div class="spinner"></div></div>
      </div>

      <div class="grid-2" style="gap:12px">
        <button class="btn btn-outline btn-block act-pickup">${iconSVG('camera',15)} Log pickup</button>
        <button class="btn btn-route btn-block act-deliver">${iconSVG('check',15)} Log delivery</button>
      </div>
    `, {wide:true});
    box.querySelector('#sd-close').onclick = closeModal;
    box.querySelector('.act-pickup').onclick = ()=>openWorkflowModal(row, 'pickup');
    box.querySelector('.act-deliver').onclick = ()=>openWorkflowModal(row, 'deliver');

    try{
      const history = await Api.tracking.byShipment(row.shipment_id);
      renderTimeline(box.querySelector('#sd-timeline'), history || []);
    }catch(e){
      box.querySelector('#sd-timeline').innerHTML = errorState(e.message);
    }
  }

  function renderTimeline(el, entries){
    if(!entries.length){ el.innerHTML = `<div class="manifest-empty">No tracking events logged yet — pickup and delivery scans will appear here.</div>`; return; }
    const sorted = [...entries].sort((a,b)=> new Date(a.updated_at||0) - new Date(b.updated_at||0));
    el.innerHTML = `<div class="manifest-timeline">${sorted.map((t,i)=>{
      const status = String(t.status||'').toLowerCase();
      const stateCls = status==='delayed' ? 'is-delayed' : (i===sorted.length-1 ? 'is-current' : 'is-done');
      return `<div class="manifest-stop ${stateCls}">
        <div>
          <div class="manifest-stamp">${fmtDateTime(t.updated_at)}</div>
          <div class="manifest-status">${escapeHtml(t.status)}</div>
          <div class="manifest-loc">${escapeHtml(t.location||'')}</div>
          ${t.remarks ? `<div class="manifest-remarks">"${escapeHtml(t.remarks)}"</div>` : ''}
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  function openWorkflowModal(row, kind){
    const isPickup = kind === 'pickup';
    const box = openModal(`
      <div class="modal-head">
        <h3 class="modal-title">${isPickup ? 'Log pickup' : 'Log delivery'}</h3>
        <button class="modal-close" id="wf-close">${iconSVG('close',18)}</button>
      </div>
      <form id="wf-form">
        <label class="field"><span>Remarks</span><textarea name="remarks" placeholder="Optional notes for this scan"></textarea></label>
        <label class="field"><span>Logged by (user ID)</span><input name="user_id" type="number" value="${escapeHtml(Store.getUserId())}" placeholder="Your user ID" /></label>

        ${isPickup ? `
          <label class="field"><span>Pickup photo</span>
            <label class="dropzone" id="dz-pickup">
              <input type="file" name="pickup_photo" accept="image/png,image/jpeg" />
              <div class="dz-label">${iconSVG('upload',20)}<div style="margin-top:6px">Click to attach a JPG or PNG</div></div>
            </label>
          </label>
        ` : `
          <label class="field"><span>Delivery photo</span>
            <label class="dropzone" id="dz-delivery">
              <input type="file" name="delivery_photo" accept="image/png,image/jpeg" />
              <div class="dz-label">${iconSVG('upload',20)}<div style="margin-top:6px">Click to attach proof of delivery</div></div>
            </label>
          </label>
          <label class="field"><span>Signature</span>
            <label class="dropzone" id="dz-signature">
              <input type="file" name="signature" accept="image/png,image/jpeg" />
              <div class="dz-label">${iconSVG('upload',20)}<div style="margin-top:6px">Click to attach a signature capture</div></div>
            </label>
          </label>
        `}

        <div class="modal-foot">
          <button type="button" class="btn btn-outline" id="wf-cancel">Cancel</button>
          <button type="submit" class="btn ${isPickup?'btn-accent':'btn-route'}" id="wf-submit">${isPickup?'Confirm pickup':'Confirm delivery'}</button>
        </div>
      </form>
    `);
    box.querySelectorAll('.dropzone').forEach(dz=>{
      const input = dz.querySelector('input');
      input.onchange = ()=>{
        dz.classList.toggle('has-file', !!input.files.length);
        if(input.files.length) dz.querySelector('.dz-label').textContent = `${iconSVG('check',14)} ${input.files[0].name}`;
      };
    });
    box.querySelector('#wf-close').onclick = closeModal;
    box.querySelector('#wf-cancel').onclick = closeModal;
    box.querySelector('#wf-form').onsubmit = async (e)=>{
      e.preventDefault();
      const btn = box.querySelector('#wf-submit');
      const fd = new FormData(e.target);
      setButtonLoading(btn, true, 'Uploading…');
      try{
        if(isPickup) await Api.workflow.pickup(row.shipment_id, fd);
        else await Api.workflow.deliver(row.shipment_id, fd);
        toastOk(isPickup ? 'Pickup logged' : 'Delivery logged');
        closeModal();
        load();
      }catch(err){ toastErr(err.message); setButtonLoading(btn,false); }
    };
  }

  root.querySelector('#sh-search').oninput = (e)=>{ query = e.target.value; renderTable(); };
  root.querySelector('#sh-refresh').onclick = load;
  root.querySelector('#sh-add').onclick = ()=>openForm(null);

  load();
};

/* =====================================================================
   TRACKING
   ===================================================================== */
Pages.tracking = async function(root){
  let rows = [];
  root.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-eyebrow">Live scans</div>
        <h1 class="page-title">Shipment tracking</h1>
        <p class="page-desc">Every status scan logged across the fleet, plus a quick lookup by shipment ID.</p>
      </div>
      <div class="toolbar">
        <button class="btn btn-outline btn-sm" id="tr-refresh">${iconSVG('refresh',14)} Refresh</button>
        <button class="btn btn-accent btn-sm" id="tr-add">${iconSVG('plus',14)} Log scan</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-title">Look up a shipment</span></div>
      <div class="helper-strip">
        <input id="tr-lookup-id" type="number" placeholder="Shipment ID" />
        <button class="btn btn-outline btn-sm" id="tr-lookup-btn">${iconSVG('search',13)} Lookup</button>
      </div>
      <div id="tr-lookup-result"></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-title">All tracking scans <span class="count" id="tr-count"></span></span></div>
      <div id="tr-table-wrap"><div class="spinner"></div></div>
    </div>
  `;
  mountIcons(root);

  async function load(){
    root.querySelector('#tr-table-wrap').innerHTML = '<div class="spinner"></div>';
    try{ rows = await Api.tracking.list() || []; }
    catch(e){ root.querySelector('#tr-table-wrap').innerHTML = errorState(e.message); return; }
    renderTable();
  }

  function renderTable(){
    const wrap = root.querySelector('#tr-table-wrap');
    root.querySelector('#tr-count').textContent = rows.length ? `(${rows.length})` : '';
    if(!rows.length){ wrap.innerHTML = emptyState('tracking scans', 'Pickup and delivery scans logged from the Shipments page will appear here.'); return; }
    const sorted = [...rows].sort((a,b)=> new Date(b.updated_at||0) - new Date(a.updated_at||0));
    wrap.innerHTML = `
      <div class="table-scroll"><table class="data">
        <thead><tr><th>Shipment</th><th>Status</th><th>Location</th><th>Remarks</th><th>Logged at</th></tr></thead>
        <tbody>${sorted.map(t=>`
          <tr>
            <td class="cell-mono">#${escapeHtml(t.shipment_id)}</td>
            <td>${statusBadge(t.status)}</td>
            <td>${escapeHtml(t.location||'—')}</td>
            <td style="color:var(--text-faint)">${escapeHtml(t.remarks||'—')}</td>
            <td class="cell-mono">${fmtDateTime(t.updated_at)}</td>
          </tr>`).join('')}</tbody>
      </table></div>`;
  }

  function openForm(){
    const fields = [
      {key:'shipment_id', label:'Shipment ID', type:'number', required:true},
      {key:'status', label:'Status', type:'select', options:['Pending','Picked Up','In Transit','Out for Delivery','Delivered','Delayed','Cancelled'], default:'In Transit'},
      {key:'location', label:'Location', placeholder:'e.g. Patna Hub'},
      {key:'remarks', label:'Remarks', type:'textarea', placeholder:'Optional notes'},
    ];
    const box = openModal(`
      <div class="modal-head">
        <h3 class="modal-title">Log a tracking scan</h3>
        <button class="modal-close" id="tf-close">${iconSVG('close',18)}</button>
      </div>
      <form id="tf-form">
        ${renderFields(fields, {})}
        <div class="modal-foot">
          <button type="button" class="btn btn-outline" id="tf-cancel">Cancel</button>
          <button type="submit" class="btn btn-accent" id="tf-submit">Log scan</button>
        </div>
      </form>
    `);
    box.querySelector('#tf-close').onclick = closeModal;
    box.querySelector('#tf-cancel').onclick = closeModal;
    box.querySelector('#tf-form').onsubmit = async (e)=>{
      e.preventDefault();
      const btn = box.querySelector('#tf-submit');
      const data = readForm(e.target, fields);
      setButtonLoading(btn, true, 'Logging…');
      try{ await Api.tracking.create(data); toastOk('Scan logged'); closeModal(); load(); }
      catch(err){ toastErr(err.message); setButtonLoading(btn,false); }
    };
  }

  root.querySelector('#tr-refresh').onclick = load;
  root.querySelector('#tr-add').onclick = openForm;
  root.querySelector('#tr-lookup-btn').onclick = async ()=>{
    const id = root.querySelector('#tr-lookup-id').value;
    const resultEl = root.querySelector('#tr-lookup-result');
    if(!id){ toastErr('Enter a shipment ID first'); return; }
    resultEl.innerHTML = '<div class="spinner"></div>';
    try{
      const [latest, history] = await Promise.all([
        Api.tracking.latest(id).catch(()=>null),
        Api.tracking.history(id).catch(()=>[]),
      ]);
      resultEl.innerHTML = `
        <div style="margin:14px 0">
          <span style="font-size:12px;color:var(--text-faint)">Latest status &nbsp;</span>
          ${latest && latest.status ? statusBadge(latest.status) : '<span class="badge badge-pending">No data</span>'}
        </div>
        <div class="manifest-timeline">
          ${(history||[]).length ? history.map((h,i)=>`
            <div class="manifest-stop ${i===0?'is-current':'is-done'}">
              <div><div class="manifest-status">${escapeHtml(h.status)}</div></div>
            </div>`).join('') : '<div class="manifest-empty">No history found for this shipment ID.</div>'}
        </div>
      `;
    }catch(e){ resultEl.innerHTML = errorState(e.message); }
  };

  load();
};

/* =====================================================================
   REPORTS
   ===================================================================== */
const REPORT_TABS = [
  {key:'driver-performance', label:'Driver performance', fetch:()=>Api.reports.driverPerformance(),
    cols:[{k:'driver_id',l:'Driver ID'},{k:'name',l:'Name'},{k:'deliveries',l:'Deliveries'}]},
  {key:'driver-delay', label:'Driver delays', fetch:()=>Api.reports.driverDelay(),
    cols:[{k:'driver_id',l:'Driver ID'},{k:'name',l:'Name'},{k:'delayed_shipments',l:'Delayed shipments'}]},
  {key:'vehicle-utilization', label:'Vehicle utilization', fetch:()=>Api.reports.vehicleUtilization(),
    cols:[{k:'vehicle_id',l:'Vehicle ID'},{k:'vehicle_number',l:'Vehicle #'},{k:'trips',l:'Trips'}]},
  {key:'route-performance', label:'Route performance', fetch:()=>Api.reports.routePerformance(),
    cols:[{k:'route_id',l:'Route ID'},{k:'source',l:'Source'},{k:'destination',l:'Destination'},{k:'deliveries',l:'Deliveries'}]},
  {key:'route-delay', label:'Route delays', fetch:()=>Api.reports.routeDelay(),
    cols:[{k:'route_id',l:'Route ID'},{k:'source',l:'Source'},{k:'destination',l:'Destination'},{k:'delayed_shipments',l:'Delayed'}]},
  {key:'top-customers', label:'Top customers', fetch:()=>Api.reports.topCustomers(),
    cols:[{k:'customer_id',l:'Customer ID'},{k:'name',l:'Name'},{k:'shipments',l:'Shipments'}]},
  {key:'shipment-per-city', label:'Shipments per city', fetch:()=>Api.reports.shipmentPerCity(),
    cols:[{k:'destination',l:'City'},{k:'shipments',l:'Shipments'}]},
  {key:'most-used-route', label:'Most used routes', fetch:()=>Api.reports.mostUsedRoute(),
    cols:[{k:'source',l:'Source'},{k:'destination',l:'Destination'},{k:'trips',l:'Trips'}]},
];

Pages.reports = async function(root){
  let active = REPORT_TABS[0].key;

  root.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-eyebrow">Analytics</div>
        <h1 class="page-title">Reports</h1>
        <p class="page-desc">Operational reports straight from the reporting API — performance, delays and volume.</p>
      </div>
      <button class="btn btn-outline btn-sm" id="rp-refresh">${iconSVG('refresh',14)} Refresh</button>
    </div>
    <div class="tabbar" id="rp-tabs">
      ${REPORT_TABS.map(t=>`<button data-key="${t.key}" class="${t.key===active?'active':''}">${t.label}</button>`).join('')}
    </div>
    <div class="grid-2" style="align-items:start">
      <div class="panel">
        <div class="panel-head"><span class="panel-title" id="rp-title"></span></div>
        <div id="rp-table"><div class="spinner"></div></div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Visual</span></div>
        <div class="chart-wrap"><canvas id="rp-chart"></canvas></div>
      </div>
    </div>
  `;
  mountIcons(root);

  let chartInst = null;

  async function loadTab(key){
    active = key;
    root.querySelectorAll('#rp-tabs button').forEach(b=>b.classList.toggle('active', b.dataset.key===key));
    const cfg = REPORT_TABS.find(t=>t.key===key);
    root.querySelector('#rp-title').textContent = cfg.label;
    root.querySelector('#rp-table').innerHTML = '<div class="spinner"></div>';

    let rows;
    try{ rows = await cfg.fetch() || []; }
    catch(e){ root.querySelector('#rp-table').innerHTML = errorState(e.message); return; }

    const wrap = root.querySelector('#rp-table');
    if(!rows.length){ wrap.innerHTML = emptyState('results', 'This report has no data yet.'); }
    else{
      wrap.innerHTML = `<div class="table-scroll"><table class="data">
        <thead><tr>${cfg.cols.map(c=>`<th>${c.l}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${cfg.cols.map(c=>`<td class="${typeof r[c.k]==='number'?'cell-mono':''}">${escapeHtml(r[c.k] ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    }

    const labelCol = cfg.cols.find(c=>['name','source','destination','vehicle_number','driver_id'].includes(c.k)) || cfg.cols[0];
    const valueCol = cfg.cols[cfg.cols.length-1];
    const ctx = root.querySelector('#rp-chart');
    if(chartInst) chartInst.destroy();
    if(rows.length){
      chartInst = new Chart(ctx, {
        type:'bar',
        data:{
          labels: rows.slice(0,10).map(r=> labelCol.k==='destination'||labelCol.k==='source' ? `${r.source||''} ${r.destination? '→ '+r.destination : ''}`.trim() || r[labelCol.k] : r[labelCol.k]),
          datasets:[{ label: valueCol.l, data: rows.slice(0,10).map(r=>Number(r[valueCol.k])||0), backgroundColor:'#F5A623', borderRadius:4, maxBarThickness:26 }]
        },
        options:{
          indexAxis:'y',
          plugins:{ legend:{display:false} },
          scales:{
            x:{ grid:{color:'#1A2A3B'}, ticks:{color:'#8CA3B8', font:{size:11}} },
            y:{ grid:{display:false}, ticks:{color:'#8CA3B8', font:{size:11}} },
          }
        }
      });
    }
  }

  root.querySelector('#rp-tabs').addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-key]');
    if(btn) loadTab(btn.dataset.key);
  });
  root.querySelector('#rp-refresh').onclick = ()=>loadTab(active);

  loadTab(active);
};
