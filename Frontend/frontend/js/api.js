/* =====================================================================
   API CLIENT
   Talks to the Express/Postgres logistics backend from the uploaded repo.
   Base URL + JWT token are persisted in localStorage so the frontend can
   point at any deployment (localhost during dev, a real host in prod).
   ===================================================================== */

const STORAGE_KEYS = {
  base: 'wb_api_base',
  token: 'wb_token',
  role: 'wb_role',
  email: 'wb_email',
  name: 'wb_name',
  userId: 'wb_user_id',
};

const Store = {
  getBase(){ return localStorage.getItem(STORAGE_KEYS.base) || 'http://localhost:5000/api'; },
  setBase(v){ localStorage.setItem(STORAGE_KEYS.base, v.replace(/\/+$/,'')); },
  getToken(){ return localStorage.getItem(STORAGE_KEYS.token) || ''; },
  getRole(){ return localStorage.getItem(STORAGE_KEYS.role) || ''; },
  getEmail(){ return localStorage.getItem(STORAGE_KEYS.email) || ''; },
  getName(){ return localStorage.getItem(STORAGE_KEYS.name) || ''; },
  getUserId(){ return localStorage.getItem(STORAGE_KEYS.userId) || ''; },
  setSession({token, role, email, name, user_id}){
    if(token !== undefined) localStorage.setItem(STORAGE_KEYS.token, token || '');
    if(role !== undefined) localStorage.setItem(STORAGE_KEYS.role, role || '');
    if(email !== undefined) localStorage.setItem(STORAGE_KEYS.email, email || '');
    if(name !== undefined) localStorage.setItem(STORAGE_KEYS.name, name || '');
    if(user_id !== undefined) localStorage.setItem(STORAGE_KEYS.userId, user_id || '');
  },
  clearSession(){
    [STORAGE_KEYS.token, STORAGE_KEYS.role, STORAGE_KEYS.email, STORAGE_KEYS.name, STORAGE_KEYS.userId]
      .forEach(k=>localStorage.removeItem(k));
  },
  isAuthed(){ return !!this.getToken(); }
};

function decodeJwt(token){
  try{
    const payload = token.split('.')[1];
    const json = decodeURIComponent(atob(payload.replace(/-/g,'+').replace(/_/g,'/'))
      .split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  }catch(e){ return null; }
}

class ApiError extends Error{
  constructor(message, status){ super(message); this.status = status; }
}

async function apiFetch(path, {method='GET', body, auth=false, isForm=false} = {}){
  const url = `${Store.getBase()}${path}`;
  const headers = {};
  if(!isForm) headers['Content-Type'] = 'application/json';
  if(auth && Store.getToken()) headers['Authorization'] = `Bearer ${Store.getToken()}`;

  let res;
  try{
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : (isForm ? body : JSON.stringify(body)),
    });
  }catch(err){
    throw new ApiError(`Could not reach ${url}. Check the API endpoint in Settings and confirm the backend is running.`, 0);
  }

  let data = null;
  const text = await res.text();
  if(text){
    try{ data = JSON.parse(text); }catch(e){ data = { message: text }; }
  }

  if(!res.ok){
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data;
}

/* ---------------------------------------------------------------------
   Endpoint groups — mirror the router files 1:1
   ------------------------------------------------------------------ */
const Api = {
  // auth
  login(email, password){ return apiFetch('/auth/login', {method:'POST', body:{email, password}}); },
  register(payload){ return apiFetch('/auth/register', {method:'POST', body:payload}); },

  // customers
  customers: {
    list: () => apiFetch('/customers'),
    get: (id) => apiFetch(`/customers/${id}`),
    create: (body) => apiFetch('/customers', {method:'POST', body}),
    update: (id, body) => apiFetch(`/customers/${id}`, {method:'PUT', body, auth:true}),
    remove: (id) => apiFetch(`/customers/${id}`, {method:'DELETE', auth:true}),
  },

  // drivers
  drivers: {
    list: () => apiFetch('/drivers'),
    get: (id) => apiFetch(`/drivers/${id}`),
    create: (body) => apiFetch('/drivers', {method:'POST', body}),
    update: (id, body) => apiFetch(`/drivers/${id}`, {method:'PUT', body, auth:true}),
    remove: (id) => apiFetch(`/drivers/${id}`, {method:'DELETE', auth:true}),
  },

  // vehicles
  vehicles: {
    list: () => apiFetch('/vehicles'),
    get: (id) => apiFetch(`/vehicles/${id}`),
    create: (body) => apiFetch('/vehicles', {method:'POST', body}),
    update: (id, body) => apiFetch(`/vehicles/${id}`, {method:'PUT', body}),
    remove: (id) => apiFetch(`/vehicles/${id}`, {method:'DELETE'}),
  },

  // routes
  routes: {
    list: () => apiFetch('/routes'),
    get: (id) => apiFetch(`/routes/${id}`),
    create: (body) => apiFetch('/routes', {method:'POST', body}),
    update: (id, body) => apiFetch(`/routes/${id}`, {method:'PUT', body, auth:true}),
    remove: (id) => apiFetch(`/routes/${id}`, {method:'DELETE', auth:true}),
  },

  // shipments
  shipments: {
    list: () => apiFetch('/shipments'),
    get: (id) => apiFetch(`/shipments/${id}`),
    create: (body) => apiFetch('/shipments', {method:'POST', body}),
    update: (id, body) => apiFetch(`/shipments/${id}`, {method:'PUT', body}),
    remove: (id) => apiFetch(`/shipments/${id}`, {method:'DELETE'}),
  },

  // shipment tracking
  tracking: {
    list: () => apiFetch('/shipmenttracking'),
    byShipment: (id) => apiFetch(`/shipmenttracking/${id}`),
    latest: (id) => apiFetch(`/shipmenttracking/${id}/latest-status`),
    history: (id) => apiFetch(`/shipmenttracking/${id}/status-history`),
    create: (body) => apiFetch('/shipmenttracking', {method:'POST', body}),
  },

  // workflow (multipart)
  workflow: {
    pickup: (shipmentId, formData) => apiFetch(`/workflow/${shipmentId}/pickup`, {method:'POST', body:formData, isForm:true}),
    deliver: (shipmentId, formData) => apiFetch(`/workflow/${shipmentId}/deliver`, {method:'POST', body:formData, isForm:true}),
  },

  // reports
  reports: {
    summary: () => apiFetch('/reports/summary'),
    driverPerformance: () => apiFetch('/reports/driver-performance'),
    driverDelay: () => apiFetch('/reports/driver-delay-report'),
    vehicleUtilization: () => apiFetch('/reports/vehicle-utilization'),
    routePerformance: () => apiFetch('/reports/route-performance'),
    routeDelay: () => apiFetch('/reports/route-delay-report'),
    shipmentStatus: () => apiFetch('/reports/shipment-status'),
    topCustomers: () => apiFetch('/reports/top-customers'),
    shipmentPerCity: () => apiFetch('/reports/shipment-per-city'),
    mostUsedRoute: () => apiFetch('/reports/most-used-route'),
    trackingHistory: (id) => apiFetch(`/reports/tracking-history/${id}`),
    latestTrackingStatus: (id) => apiFetch(`/reports/latest-tracking-status/${id}`),
  },
};
