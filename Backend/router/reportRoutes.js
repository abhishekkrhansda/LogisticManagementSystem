const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/reportController');

router.get('/summary', getSummary);

router.get('/driver-performance', driverPerformance);

router.get('/driver-delay-report', driverDelayReport);

router.get('/vehicle-utilization', vehicleUtilization);

router.get('/route-performance', routePerformance);

router.get('/route-delay-report', routeDelayReport);

router.get('/shipment-status', shipmentStatus);

router.get('/top-customers', topCustomers);

router.get('/shipment-per-city', shipmentPerCity);

router.get('/most-used-route', mostUsedRoute);

router.get('/tracking-history/:shipment_id', trackingHistory);

router.get('/latest-tracking-status/:shipment_id', latestTrackingStatus);

module.exports = router;    