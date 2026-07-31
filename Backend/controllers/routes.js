const pool = require("../config/db");

//get all routes
const getAllRoutes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM routes order by route_id ASC");

    res.status(200).json(result.rows);
  }
  catch(error){
    res.status(500).json({message: error.message})
    console.log(error.message)
  }
}

//get route by route_id
const getRouteByroute_id = async(req, res) => {
    const {route_id} = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM routes WHERE route_id = $1", [route_id]
        )
        res.status(200).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

//add new route
const addRoute = async (req, res) => {

    const {
        route_id,
        source,
        destination,
        distance_km,
        estimated_hours
    } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO routes (route_id, source, destination, distance_km, estimated_hours) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [route_id, source, destination, distance_km, estimated_hours]
        )
        res.status(201).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
        
    }

    //update route by route_id
    const updateRoute = async(req, res) =>{

        const {route_id} = req.params;
        const {
            source,
            destination,
            distance_km,
            estimated_hours
        } = req.body;               

        try {
            const result = await pool.query(
                "UPDATE routes SET source = $1, destination = $2, distance_km = $3, estimated_hours = $4 WHERE route_id = $5 RETURNING *",
                [source, destination, distance_km, estimated_hours, route_id]
            )
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }

    //delete route by route_id
    const deleteRoute = async(req, res) => {
        const {route_id} = req.params;

        try {
            const result = await pool.query(
                "DELETE FROM routes WHERE route_id = $1 RETURNING *", [route_id]
            )
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    }

module.exports = {
    getAllRoutes,
    getRouteByroute_id,
    addRoute,
    updateRoute,
    deleteRoute
}