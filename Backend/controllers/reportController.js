const pool = require("../config/db");

// ==========================================================
// 1. Summary Report
// ==========================================================
const getSummary = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*) AS total_shipments,

                COUNT(*) FILTER
                (WHERE status='Delivered') AS delivered,

                COUNT(*) FILTER
                (WHERE status='Delayed') AS delayed,

                COUNT(*) FILTER
                (WHERE status='In Transit') AS in_transit,

                COUNT(*) FILTER
                (WHERE status='Out for Delivery') AS out_for_delivery

            FROM shipments
        `);

        res.status(200).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================================
// 2. Driver Performance
// ==========================================================
const driverPerformance = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                d.driver_id,
                d.name,
                COUNT(s.shipment_id) AS deliveries

            FROM drivers d

            JOIN shipments s
            ON d.driver_id=s.driver_id

            WHERE s.status='Delivered'

            GROUP BY d.driver_id,d.name

            ORDER BY deliveries DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================================
// 3. Driver Delay Report
// ==========================================================
const driverDelayReport = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                d.driver_id,
                d.name,
                COUNT(*) AS delayed_shipments

            FROM drivers d

            JOIN shipments s
            ON d.driver_id=s.driver_id

            WHERE s.status='Delayed'

            GROUP BY d.driver_id,d.name

            ORDER BY delayed_shipments DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 4. Vehicle Utilization
// ==========================================================
const vehicleUtilization = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                v.vehicle_id,
                v.vehicle_number,
                COUNT(s.shipment_id) AS trips

            FROM vehicles v

            JOIN shipments s
            ON v.vehicle_id=s.vehicle_id

            GROUP BY
            v.vehicle_id,
            v.vehicle_number

            ORDER BY trips DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 5. Route Performance
// ==========================================================
const routePerformance = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                r.route_id,
                r.source,
                r.destination,
                COUNT(*) AS deliveries

            FROM routes r

            JOIN shipments s
            ON r.route_id=s.route_id

            GROUP BY
            r.route_id,
            r.source,
            r.destination

            ORDER BY deliveries DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 6. Route Delay Report
// ==========================================================
const routeDelayReport = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                r.route_id,
                r.source,
                r.destination,
                COUNT(*) AS delayed_shipments

            FROM routes r

            JOIN shipments s
            ON r.route_id=s.route_id

            WHERE s.status='Delayed'

            GROUP BY
            r.route_id,
            r.source,
            r.destination

            ORDER BY delayed_shipments DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 7. Shipment Status Report
// ==========================================================
const shipmentStatus = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                status,
                COUNT(*) AS total

            FROM shipments

            GROUP BY status
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 8. Top Customers
// ==========================================================
const topCustomers = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                c.customer_id,
                c.name,
                COUNT(*) AS shipments

            FROM customers c

            JOIN shipments s
            ON c.customer_id=s.customer_id

            GROUP BY
            c.customer_id,
            c.name

            ORDER BY shipments DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 9. Shipment Per City
// ==========================================================
const shipmentPerCity = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                r.destination,
                COUNT(*) AS shipments

            FROM shipments s

            JOIN routes r
            ON s.route_id=r.route_id

            GROUP BY r.destination

            ORDER BY shipments DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 10. Most Used Route
// ==========================================================
const mostUsedRoute = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                r.source,
                r.destination,
                COUNT(*) AS trips

            FROM shipments s

            JOIN routes r
            ON s.route_id=r.route_id

            GROUP BY
            r.source,
            r.destination

            ORDER BY trips DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 11. Tracking History
// ==========================================================
const trackingHistory = async (req, res) => {

    const { shipment_id } = req.params;

    try {

        const result = await pool.query(`
            SELECT
                tracking_id,
                status,
                location,
                remarks,
                updated_at

            FROM shipment_tracking

            WHERE shipment_id=$1

            ORDER BY tracking_id
        `,[shipment_id]);

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================
// 12. Latest Tracking Status
// ==========================================================
const latestTrackingStatus = async (req, res) => {

    const { shipment_id } = req.params;

    try {

        const result = await pool.query(`
            SELECT
                status

            FROM shipment_tracking

            WHERE shipment_id=$1

            ORDER BY tracking_id DESC

            LIMIT 1
        `,[shipment_id]);

        res.status(200).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// ==========================================================

module.exports = {

    getSummary,

    driverPerformance,

    driverDelayReport,

    vehicleUtilization,

    routePerformance,

    routeDelayReport,

    shipmentStatus,

    topCustomers,

    shipmentPerCity,

    mostUsedRoute,

    trackingHistory,

    latestTrackingStatus

};