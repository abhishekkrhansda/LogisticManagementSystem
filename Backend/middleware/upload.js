const multer = require("multer");
const path = require("path");

// Storage Configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        let folder = "uploads/";

        if (file.fieldname === "pickup_photo") {
            folder = "uploads/pickup";
        }

        else if (file.fieldname === "delivery_photo") {
            folder = "uploads/delivery";
        }

        else if (file.fieldname === "signature") {
            folder = "uploads/delivery";
        }

        else if (file.fieldname === "warehouse_photo") {
            folder = "uploads/warehouse";
        }

        else if (file.fieldname === "damage_photo") {
            folder = "uploads/damage";
        }

        cb(null, folder);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

// File Filter

const fileFilter = (req, file, cb) => {

    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/jpg"

    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Only JPG, JPEG and PNG files are allowed"));

    }

};

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});

module.exports = upload;