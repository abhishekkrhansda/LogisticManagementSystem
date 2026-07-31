const pool = require("../config/db");

// ===========================================
// PICKUP SHIPMENT
// ===========================================

const pickupShipment = async (req, res) => {

    const { shipment_id } = req.params;
    const { remarks, user_id } = req.body;

    const pickupPhoto = req.file;

    try {

        await pool.query("BEGIN");

        //-------------------------------------------------
        // Update Shipment Status
        //-------------------------------------------------

        await pool.query(
            `UPDATE shipments
             SET status='Picked Up'
             WHERE shipment_id=$1`,
            [shipment_id]
        );

        //-------------------------------------------------
        // Shipment Tracking
        //-------------------------------------------------

        await pool.query(

            `INSERT INTO shipment_tracking
            (
                shipment_id,
                status,
                location,
                remarks
            )

            VALUES($1,$2,$3,$4)`,

            [
                shipment_id,
                "Picked Up",
                "Pickup Location",
                remarks
            ]

        );

        //-------------------------------------------------
        // Upload Photo
        //-------------------------------------------------

        if (pickupPhoto) {

            await pool.query(

                `INSERT INTO shipment_files(

                    shipment_id,
                    uploaded_by,
                    event_type,
                    file_type,
                    file_name,
                    file_path,
                    file_size,
                    mime_type

                )

                VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,

                [

                    shipment_id,

                    user_id,

                    "pickup",

                    "photo",

                    pickupPhoto.originalname,

                    pickupPhoto.path,

                    pickupPhoto.size,

                    pickupPhoto.mimetype

                ]

            );

        }

        //-------------------------------------------------
        // Notification
        //-------------------------------------------------

        await pool.query(

            `INSERT INTO notifications

            (
                user_id,
                shipment_id,
                title,
                message
            )

            VALUES($1,$2,$3,$4)`,

            [

                user_id,

                shipment_id,

                "Shipment Picked Up",

                `Shipment #${shipment_id} has been picked up.`

            ]

        );

        await pool.query("COMMIT");

        res.json({

            message: "Shipment picked up successfully"

        });

    }

    catch (error) {

        await pool.query("ROLLBACK");

        res.status(500).json({

            message: error.message

        });

    }

};



// ===========================================
// DELIVER SHIPMENT
// ===========================================

const deliverShipment = async (req, res) => {

    const { shipment_id } = req.params;

    const {

        remarks,

        user_id

    } = req.body;

    const deliveryPhoto = req.files.delivery_photo?.[0];

    const signature = req.files.signature?.[0];

    try {

        await pool.query("BEGIN");

        //------------------------------------
        // Shipment Status
        //------------------------------------

        await pool.query(

            `UPDATE shipments

            SET status='Delivered'

            WHERE shipment_id=$1`,

            [shipment_id]

        );

        //------------------------------------
        // Tracking
        //------------------------------------

        await pool.query(

            `INSERT INTO shipment_tracking

            (
                shipment_id,
                status,
                location,
                remarks
            )

            VALUES($1,$2,$3,$4)`,

            [

                shipment_id,

                "Delivered",

                "Customer Address",

                remarks

            ]

        );

        //------------------------------------
        // Delivery Photo
        //------------------------------------

        if (deliveryPhoto) {

            await pool.query(

                `INSERT INTO shipment_files

                (

                shipment_id,

                uploaded_by,

                event_type,

                file_type,

                file_name,

                file_path,

                file_size,

                mime_type

                )

                VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,

                [

                    shipment_id,

                    user_id,

                    "delivery",

                    "photo",

                    deliveryPhoto.originalname,

                    deliveryPhoto.path,

                    deliveryPhoto.size,

                    deliveryPhoto.mimetype

                ]

            );

        }

        //------------------------------------
        // Signature
        //------------------------------------

        if (signature) {

            await pool.query(

                `INSERT INTO shipment_files

                (

                shipment_id,

                uploaded_by,

                event_type,

                file_type,

                file_name,

                file_path,

                file_size,

                mime_type

                )

                VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,

                [

                    shipment_id,

                    user_id,

                    "delivery",

                    "signature",

                    signature.originalname,

                    signature.path,

                    signature.size,

                    signature.mimetype

                ]

            );

        }

        //------------------------------------
        // Notification
        //------------------------------------

        await pool.query(

            `INSERT INTO notifications

            (

            user_id,

            shipment_id,

            title,

            message

            )

            VALUES($1,$2,$3,$4)`,

            [

                user_id,

                shipment_id,

                "Shipment Delivered",

                `Shipment #${shipment_id} delivered successfully.`

            ]

        );

        await pool.query("COMMIT");

        res.json({

            message: "Shipment Delivered Successfully"

        });

    }

    catch (error) {

        await pool.query("ROLLBACK");

        res.status(500).json({

            message: error.message

        });

    }

};

module.exports = {

    pickupShipment,

    deliverShipment

};