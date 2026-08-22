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




  # Waybill — Logistics Control Tower (Backend)

A full-stack logistics management system designed to manage customers, drivers, vehicles, routes, shipments, shipment tracking, delivery workflows, and logistics analytics from a centralized platform.

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT authentication, bcrypt password hashing, protected routes, and role-based access control for Admin and Driver roles.
- 👥 **Customer Management** — Create, view, update, and delete customers and track their shipments.
- 🚚 **Driver Management** — Manage drivers, assign shipments, and analyze driver delivery performance and delays.
- 🚛 **Vehicle Management** — Manage vehicles, associate vehicles with shipments, and monitor vehicle utilization.
- 🛣️ **Route Management** — Create and manage routes, assign routes to shipments, analyze route performance, and identify delayed or frequently used routes.
- 📦 **Shipment Management** — Create and manage shipments, assign customers, drivers, vehicles, and routes, and update shipment statuses.
- 📍 **Shipment Tracking** — Maintain complete shipment history with status, location, remarks, and timestamps.
- 🔄 **Shipment Workflow** — Support shipment stages such as Created, Picked Up, In Transit, Out for Delivery, Delayed, and Delivered.
- 📸 **File Uploads** — Allow drivers to upload event-specific evidence such as pickup and delivery photos when the actual event occurs.
- 📊 **Analytics APIs** — APIs for shipment status, driver performance, driver delays, vehicle utilization, route performance, route delays, top customers, shipments by city, and most-used routes.
- ⚡ **Redis Caching** — Cache frequently requested analytics data to reduce database load and improve API response time.
- 📈 **Dashboard Integration** — Analytics APIs can be consumed by a React dashboard, Power BI, or Tableau.

## 🏗️ Architecture

```text
React Frontend
      │
      │ REST API
      ▼
Node.js + Express
      │
      ├── Authentication / Authorization
      ├── CRUD APIs
      ├── Shipment Workflow
      ├── File Upload
      └── Analytics APIs
      │
      ├───────────────┐
      ▼               ▼
   Redis          PostgreSQL
   Cache           Database
                      │
                      ▼
            Shipment & Tracking Data
                      │
                      

ANALYTICS API


GET /api/reports/summary
GET /api/reports/driver-performance
GET /api/reports/driver-delay-report
GET /api/reports/vehicle-utilization
GET /api/reports/route-performance
GET /api/reports/route-delay-report
GET /api/reports/shipment-status
GET /api/reports/top-customers
GET /api/reports/shipment-per-city
GET /api/reports/most-used-route
GET /api/reports/tracking-history/:shipment_id
GET /api/reports/latest-tracking-status/:shipment_id



