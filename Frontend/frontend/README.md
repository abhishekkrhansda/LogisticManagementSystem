# Waybill — Logistics Control Tower (Frontend)

A dependency-light, static frontend for the Node/Express + PostgreSQL logistics
backend in `logistic/Backend`. No build step — plain HTML, CSS and JS.

## What's included

- **Auth** — sign in / register against `/api/auth/login` and `/api/auth/register`, JWT stored client-side, role shown in the top bar.
- **Dashboard** — live KPIs from `/api/reports/summary`, a shipment-status donut chart, most-used routes, and recent shipments.
- **Shipments** — full CRUD, plus a manifest view with a tracking timeline and pickup/delivery logging (photo + signature upload) wired to `/api/workflow/:id/pickup` and `/deliver`.
- **Tracking** — every tracking scan across the fleet, a log-scan form, and a shipment-ID lookup (latest status + history).
- **Routes / Vehicles / Drivers / Customers** — CRUD tables with role-aware edit/delete (routes and customers/drivers require an admin — or, for routes, a driver — session; vehicles and shipments are open per the backend's own route guards).
- **Reports** — tabbed viewer over all ten `/api/reports/*` endpoints with a bar-chart visual per report.

## Running it

1. Start the backend:
   ```bash
   cd logistic/Backend
   npm install
   npm start
   ```
   It listens on `http://localhost:5000` by default (see `.env`), with all
   routes mounted under `/api`.

2. Open `frontend/index.html` in a browser (or serve the folder, e.g.
   `npx serve frontend`). On first load, click **Configure API endpoint** on
   the sign-in screen (or the **API endpoint** button in the sidebar once
   signed in) and confirm it points at `http://localhost:5000/api`. This is
   saved in `localStorage`, so it only needs setting once per browser.

3. Register an account (pick **Admin** to unlock every action) and sign in.

## Notes

- The backend's `vehicles`, `shipments` and `shipment tracking` routes have
  no auth middleware, so those stay fully editable for any signed-in user —
  matching the backend exactly rather than adding restrictions it doesn't
  enforce.
- The connection dot in the top bar pings `GET /customers` to confirm the
  API endpoint is reachable.
- Uploaded pickup/delivery photos and signatures are sent as
  `multipart/form-data` with the exact field names the backend's `multer`
  config expects (`pickup_photo`, `delivery_photo`, `signature`).
