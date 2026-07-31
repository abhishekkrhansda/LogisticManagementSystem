const pool = require("../config/db");

//get all drivers
const getAllDrivers = async (req,res) =>{

    try {
        const result = await pool.query(
            "SELECT * FROM drivers order by driver_id ASC"

        )

        res.status(200).json(result.rows);
    }

    catch(error){
        res.status(500).json({message : error.message})
    }
}

//get driver by driver_id
const getDriverBydriver_id = async(req, res) => {
    const {driver_id} = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM drivers WHERE driver_id = $1", [driver_id]
        )
        res.status(200).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

//add new driver
const addDriver = async (req, res) => {

    const {
        driver_id,
        driver_name,
        license_number,
        phone,
        status
    }
    = req.body;
    
    try {
        result = await pool.query(
            "INSERT INTO drivers (driver_id, driver_name, license_number, phone, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [driver_id, driver_name, license_number, phone, status]
        )
        res.status(201).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
        
    }

    //update driver by driver_id
    const updateDriver = async(req, res) =>{

        const {driver_id} = req.params;
        const {
            driver_name,
            license_number,
            phone,
            status
        } = req.body;

        try {
            const result = await pool.query(
                "UPDATE drivers SET driver_name = $1, license_number = $2, phone = $3, status = $4 WHERE driver_id = $5 RETURNING *",
                [driver_name, license_number, phone, status, driver_id]
            )
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }       
        
    }

    //delete driver by driver_id
    const deleteDriver = async(req, res) =>{

        const {driver_id} = req.params;

        try {
            const result = await pool.query(
                "DELETE FROM drivers WHERE driver_id = $1 RETURNING *", [driver_id]
            )
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }

    module.exports = {
        getAllDrivers,
        getDriverBydriver_id,
        addDriver,
        updateDriver,
        deleteDriver
    }   
