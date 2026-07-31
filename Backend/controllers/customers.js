const pool = require("../config/db");

//get all customers
const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers order by customer_customer_id ASC");

    res.status(200).json(result.rows);
  }
  catch(error){
    res.status(500).json({message: error.message})
    console.log(error.message)
  }
}

//get customer by customer_id
const getCustomerBycustomer_id = async(req, res) => {
    const {customer_id} = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM customers WHERE customer_id = $1", [customer_id]
        )
        res.status(200).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

//add new customer
const addCustomer = async (req, res) => {

    const {
        customer_name,
        email,
        phone,
        city,
        state,
        country
    } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO customers (customer_name, email, phone, city, state, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [customer_name, email, phone, city, state, country]
        )
        res.status(201).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
        
    }


    //update customer by customer_id
    const updateCostumer = async(req, res) =>{

        const {customer_id} = req.params;
        const {
            customer_name,
            email,
            phone,
            city,
            state,
            country
        } = req.body;

        try {
            const result = await pool.query(
                "UPDATE customers SET customer_name = $1, email = $2, phone = $3, city = $4, state = $5, country = $6 where customer_id = $7 RETURNING *",
                [customer_name, email, phone, city, state, country, customer_id]
            )

            if(result.rows.length === 0){
                res.status(404).json({message: "Customer not found"});
            }
            res.status(200).json(result.rows[0]);
        }
        catch(error){
            res.status(500).json({message: error.message})
        }

    }

    //delete customer by customer_id
    const deleteCustomers = async(req,res) => {

        const {customer_id} = req.params;

        try {
            const result = await pool.query(
                "DELETE FROM customers WHERE customer_id = $1 RETURNING *",[customer_id]
            )

            if(result.rows.length === 0){
                res.status(404).json({message : "Customer not found"});
            }
            res.status(200).json({message: "Customer deleted successfully"});
        }
        catch(error){
            res.status(500).json({message: error.message})
        }

    }

    module.exports = {
        getAllCustomers,
        getCustomerBycustomer_id,
        addCustomer,
        updateCostumer,
        deleteCustomers
    };
    


