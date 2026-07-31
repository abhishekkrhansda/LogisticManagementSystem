const pool = require("../config/db");


//const get all shipment tracking

const getAllShipment = async(req,res) => {

    try{

        result = await pool.query(
            "select * from shipment_tracking order by shipment_id asc"
        )
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });   
    }
}


//get  shipment tracking by shipment_id
const getShipmentByshipment_id = async(req, res) => {
    const {shipment_id} = req.params;

    try {
        const result = await pool.query(
            "select * from shipment_tracking where shipment_id = $1", [shipment_id]
        )
        res.status(200).json(result.rows);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}


//get latest status by shipment_id 
const getLatestStatusByShipmentId = async (req, res) => {
    const { shipment_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT status FROM shipment_tracking WHERE shipment_id = $1 ORDER BY updated_at DESC LIMIT 1",
            [shipment_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No tracking information found for this shipment." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//get history of shipment tracking by shipment_id
const getStatusHistoryByShipmentId = async (req, res) => {
    const { shipment_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT status FROM shipment_tracking WHERE shipment_id = $1 ORDER BY updated_at DESC",
            [shipment_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No tracking history found for this shipment." });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//add new shipment tracking
const addShipmentTracking = async (req, res) => {

    const {
        shipment_id,
        status,
        location,
        remarks
    } = req.body;

    

    try {
        const result = await pool.query(
            "INSERT INTO shipment_tracking (shipment_id, status, location, remarks) VALUES ($1, $2, $3, $4) RETURNING *",
            [shipment_id, status, location, remarks]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllShipment,
    getShipmentByshipment_id,
    getLatestStatusByShipmentId,
    getStatusHistoryByShipmentId,
    addShipmentTracking
};

