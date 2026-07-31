const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async(req,res) => {

    const {email, password} = req.body;

    try {

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND password = $2",
            [email, password]
        )

        if(result.rows.length === 0){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const user = result.rows[0];

        //Generate JWT TOKEN
        const token = jwt.sign(
            {user_id: user.user_id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        )
        res.status(200).json({token,role: user.role});
    }

    catch(error){
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    login
}