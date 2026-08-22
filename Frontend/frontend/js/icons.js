/* Minimal inline icon set — no external icon font dependency. */
const ICONS = {
  grid:   '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  box:    '<path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>',
  pin:    '<path d="M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22z"/><circle cx="12" cy="9.5" r="2.4"/>',
  route:  '<circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M6 16.6V13a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4"/>',
  truck:  '<path d="M2 7h11v9H2z"/><path d="M13 10h4l4 3v3h-8z"/><circle cx="6.5" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/>',
  user:   '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-4 4-6 7.5-6s6.1 2 7.5 6"/>',
  users:  '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 19c1.2-3.5 3.4-5.2 6.5-5.2s5.3 1.7 6.5 5.2"/><circle cx="17" cy="8.5" r="2.6"/><path d="M15.3 13.8c2.5.2 4 1.9 5 5.2"/>',
  chart:  '<path d="M4 19V10M10 19V5M16 19v-7M22 19H2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.9 7.9 0 0 0 .1-3l2.1-1.6-2-3.5-2.5 1a7.7 7.7 0 0 0-2.6-1.5L14 2h-4l-.5 2.9a7.7 7.7 0 0 0-2.6 1.5l-2.5-1-2 3.5 2.1 1.6a7.9 7.9 0 0 0 0 3l-2.1 1.6 2 3.5 2.5-1a7.7 7.7 0 0 0 2.6 1.5L10 22h4l.5-2.9a7.7 7.7 0 0 0 2.6-1.5l2.5 1 2-3.5-2.2-1.6z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  edit:   '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  trash:  '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
  close:  '<path d="M18 6 6 18M6 6l12 12"/>',
  camera: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13.5" r="3.4"/>',
  upload: '<path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/>',
  check:  '<path d="M20 6 9 17l-5-5"/>',
  arrowR: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
};

function iconSVG(name, size=16){
  const body = ICONS[name] || ICONS.grid;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function mountIcons(root=document){
  root.querySelectorAll('[data-icon]').forEach(el=>{
    const name = el.getAttribute('data-icon');
    el.innerHTML = iconSVG(name);
  });
}
