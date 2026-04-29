const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            require: true
        },
        description:{
            type: String,
            require: true
        },
        categoty:{
            type: String,
            require: true
        },
        contact:{
            phone: String,
            email: String,
            require: true
        }
    }
);
module.exports = mongoose.model("Service", serviceSchema);
