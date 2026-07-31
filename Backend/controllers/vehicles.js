const pool = require("../config/db");

//get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicles order by vehicle_id ASC");

    res.status(200).json(result.rows);
  }
  catch(error){
    res.status(500).json({message: error.message})
    console.log(error.message)
  }
}

//get vehicle by vehicle_id
const getVehicleByvehicle_id = async(req, res) => {
    const {vehicle_id} = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM vehicles WHERE vehicle_id = $1", [vehicle_id]
        )
        res.status(200).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

//add new vehicle
const addVehicle = async (req, res) => {

    const {
        vehicle_id,
        vehicle_type,
        capacity_kg,
        plate_no,
        status } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO vehicles (vehicle_id, vehicle_type, capacity_kg, plate_no, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [vehicle_id, vehicle_type, capacity_kg, plate_no, status]
        )
        res.status(201).json(result.rows[0]);
    }           

    catch(error){
        res.status(500).json({message: error.message})
    }
        
    }

    //update vehicle by vehicle_id
    const updateVehicle = async(req, res) =>{

        const {vehicle_id} = req.params;
        const {
            vehicle_type,
            capacity_kg,
            plate_no,
            status } = req.body;

        try {
            const result = await pool.query(
                "UPDATE vehicles SET vehicle_type = $1, capacity_kg = $2, plate_no = $3, status = $4 WHERE vehicle_id = $5 RETURNING *",
                [vehicle_type, capacity_kg, plate_no, status, vehicle_id]
            )
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }       

    //delete vehicle by vehicle_id
    const deleteVehicle = async(req, res) =>{

        const {vehicle_id} = req.params;

        try {
            const result = await pool.query(
                "DELETE FROM vehicles WHERE vehicle_id = $1 RETURNING *", [vehicle_id]
            )
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }   


    module.exports = {
    getAllVehicles,
    getVehicleByvehicle_id,
    addVehicle,
    updateVehicle,
    deleteVehicle
    }