const pool = require("../config/db");

//get all drivers 
const getAllShipments = async(req,res) => {

    try{
        result = await pool.query(
            "SELECT * FROM shipments order by shipment_id ASC"
        )
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching shipments");
    }
}

//get shipment by shipment_id
const getShipmentByshipment_id = async(req, res) => {
    const {shipment_id} = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM shipments WHERE shipment_id = $1", [shipment_id]
        )
        res.status(200).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

//add new shipment
const addShipment = async (req, res) => {

    const {
        shipment_id,
        customer_id,
        vechicle_id,
        driver_id,
        route_id,
        weight_kg,
        shipment_date,
        status
    } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO shipments (shipment_id, customer_id, vechicle_id, driver_id, route_id, weight_kg, shipment_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [shipment_id, customer_id, vechicle_id, driver_id, route_id, weight_kg, shipment_date, status]
        )
        res.status(201).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
        
    }

    //update shipment by shipment_id
    const updateShipment = async(req, res) =>{

        const {shipment_id} = req.params;
        const {
            customer_id,
            vechicle_id,
            driver_id,
            route_id,
            weight_kg,
            shipment_date,
            status
        } = req.body;

        try {
            const result = await pool.query(
                "UPDATE shipments SET customer_id = $1, vechicle_id = $2, driver_id = $3, route_id = $4, weight_kg = $5, shipment_date = $6, status = $7 where shipment_id = $8 RETURNING *",
                [customer_id, vechicle_id, driver_id, route_id, weight_kg, shipment_date, status, shipment_id]
            )
            res.status(200).json(result.rows[0]);   
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }

    //delete shipment by shipment_id
    const deleteShipment = async(req, res) =>{

        const {shipment_id} = req.params;

        try {
            const result = await pool.query(
                "DELETE FROM shipments WHERE shipment_id = $1 RETURNING *", [shipment_id]
            )
            if(result.rows.length === 0){
                res.status(404).json({message: "Shipment not found"});
            }
            res.status(200).json({message: "Shipment deleted successfully"});
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }

module.exports = {
    getAllShipments,
    getShipmentByshipment_id,
    addShipment,
    updateShipment,
    deleteShipment
}