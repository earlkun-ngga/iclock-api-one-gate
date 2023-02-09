 const mongoose = require('mongoose');


const dataSchema = new mongoose.Schema({
    command_id: {
        required: true,
        type: String
    },
    command_type : {
        required: true,
        type: String
    },
    command_target : {
        required: true,
        type: String
    },
    params : {
        required: true,
        type: String
    },
    serial_number : {
        required: true,
        type: String
    },
   
})
module.exports = mongoose.model('command', dataSchema)