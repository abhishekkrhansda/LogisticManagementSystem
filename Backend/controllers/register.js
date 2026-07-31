const pool = require("../config/db");

const register = async(req,res) => {

    const {name, email, password, role} = req.body;

    try {

        const result = await pool.query(

            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, password, role]
        )
        res.status(201).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
        console.log(error.message)
    }
}

module.exports = {
    register
}