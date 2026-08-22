/* =====================================================================
   APP — bootstrap, routing, auth screens, settings
   ===================================================================== */

const ROUTE_TITLES = {
  dashboard: ['Dashboard', 'control-tower'],
  shipments: ['Shipments', 'freight / manifest'],
  tracking: ['Tracking', 'scans / status'],
  routes: ['Routes', 'network / lanes'],
  vehicles: ['Vehicles', 'fleet'],
  drivers: ['Drivers', 'crew'],
  customers: ['Customers', 'directory'],
  reports: ['Reports', 'analytics'],
};

function currentRoute(){
  const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
  return Pages[hash] ? hash : 'dashboard';
}

function renderNav(route){
  document.querySelectorAll('.sidebar-nav a').forEach(a=>{
    a.classList.toggle('active', a.dataset.route === route);
  });
  const [title, crumb] = ROUTE_TITLES[route] || ['Dashboard',''];
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-crumb').textContent = crumb;
}

async function router(){
  if(!Store.isAuthed() && !window.__allowGuest){
    showAuthScreen('login');
    return;
  }
  const route = currentRoute();
  renderNav(route);
  const root = document.getElementById('app');
  root.innerHTML = '';
  try{
    await Pages[route](root);
  }catch(e){
    root.innerHTML = `<div class="empty-state">${iconSVG('pin',34)}<h3>Something broke rendering this page</h3><p>${escapeHtml(e.message||String(e))}</p></div>`;
    mountIcons(root);
    console.error(e);
  }
}

/* ---------------------------------------------------------------------
   Auth screen wiring
   ------------------------------------------------------------------ */
function showAuthScreen(which='login'){
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('auth-login').classList.toggle('hidden', which!=='login');
  document.getElementById('auth-register').classList.toggle('hidden', which!=='register');
}

function showAppShell(){
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  const role = Store.getRole() || 'guest';
  document.getElementById('user-role-badge').textContent = role;
  document.getElementById('user-email-label').textContent = Store.getEmail() || Store.getName() || 'Browsing';
  router();
}

function wireAuthScreen(){
  document.getElementById('show-register').onclick = (e)=>{ e.preventDefault(); showAuthScreen('register'); };
  document.getElementById('show-login').onclick = (e)=>{ e.preventDefault(); showAuthScreen('login'); };
  document.getElementById('show-settings-from-login').onclick = (e)=>{ e.preventDefault(); openSettingsModal(); };

  document.getElementById('login-submit').onclick = async ()=>{
    const btn = document.getElementById('login-submit');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if(!email || !password){ toastErr('Enter email and password'); return; }
    setButtonLoading(btn, true, 'Signing in…');
    try{
      const res = await Api.login(email, password);
      const payload = decodeJwt(res.token) || {};
      Store.setSession({ token: res.token, role: res.role, email: payload.email || email, user_id: payload.user_id, name:'' });
      toastOk('Signed in');
      showAppShell();
    }catch(err){
      toastErr(err.message);
    }finally{
      setButtonLoading(btn, false);
    }
  };

  document.getElementById('register-submit').onclick = async ()=>{
    const btn = document.getElementById('register-submit');
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    if(!name || !email || !password){ toastErr('Fill in all fields'); return; }
    setButtonLoading(btn, true, 'Creating…');
    try{
      await Api.register({ name, email, password, role });
      toastOk('Account created — sign in to continue');
      showAuthScreen('login');
      document.getElementById('login-email').value = email;
    }catch(err){
      toastErr(err.message);
    }finally{
      setButtonLoading(btn, false);
    }
  };

  // enter-to-submit
  ['login-email','login-password'].forEach(id=>{
    document.getElementById(id).addEventListener('keydown', (e)=>{
      if(e.key === 'Enter') document.getElementById('login-submit').click();
    });
  });
  ['reg-name','reg-email','reg-password'].forEach(id=>{
    document.getElementById(id).addEventListener('keydown', (e)=>{
      if(e.key === 'Enter') document.getElementById('register-submit').click();
    });
  });
}

/* ---------------------------------------------------------------------
   Settings modal — API base URL
   ------------------------------------------------------------------ */
function openSettingsModal(){
  const box = openModal(`
    <div class="modal-head">
      <h3 class="modal-title">API endpoint</h3>
      <button class="modal-close" id="set-close">${iconSVG('close',18)}</button>
    </div>
    <p style="color:var(--text-muted); font-size:13px; margin-bottom:16px;">
      Point this frontend at your running backend, e.g. <code style="font-family:var(--font-mono)">http://localhost:5000/api</code>.
    </p>
    <label class="field"><span>Base URL</span><input id="set-base" value="${escapeHtml(Store.getBase())}" placeholder="http://localhost:5000/api" /></label>
    <div class="modal-foot">
      <button type="button" class="btn btn-outline" id="set-cancel">Cancel</button>
      <button type="button" class="btn btn-accent" id="set-save">Save &amp; test</button>
    </div>
  `);
  box.querySelector('#set-close').onclick = closeModal;
  box.querySelector('#set-cancel').onclick = closeModal;
  box.querySelector('#set-save').onclick = async ()=>{
    const val = box.querySelector('#set-base').value.trim();
    if(!val){ toastErr('Enter a base URL'); return; }
    Store.setBase(val);
    toastOk('Endpoint saved');
    closeModal();
    checkConnection();
    if(!document.getElementById('app-shell').classList.contains('hidden')) router();
  };
}

/* ---------------------------------------------------------------------
   Connection indicator
   ------------------------------------------------------------------ */
async function checkConnection(){
  const dot = document.getElementById('conn-dot');
  if(!dot) return;
  dot.className = 'conn-dot';
  try{
    await Api.customers.list();
    dot.classList.add('ok');
    dot.title = `Connected to ${Store.getBase()}`;
  }catch(e){
    dot.classList.add('bad');
    dot.title = `Can't reach ${Store.getBase()} — ${e.message}`;
  }
}

/* ---------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', ()=>{
  mountIcons();
  wireAuthScreen();

  document.getElementById('open-settings').onclick = openSettingsModal;
  document.getElementById('logout-btn').onclick = ()=>{
    Store.clearSession();
    toastOk('Signed out');
    showAuthScreen('login');
  };

  window.addEventListener('hashchange', router);

  if(Store.isAuthed()){
    showAppShell();
  } else {
    showAuthScreen('login');
  }
  checkConnection();
  setInterval(checkConnection, 30000);
});
