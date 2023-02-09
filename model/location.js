const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    comp_id: {
        required: false,
        default: null,
        type: String,
    },
    address: {
        required: false,
        default: null,
        type: String
    },
    status: {
        required: false,
        default: null,
        type: String
    },
    created_by: {
        required: false,
        default: 1,
        type: Number
    },
    updated_by: {
        required: false,
        default: null,
        type: String
    },
    updated_at: {
        required: false,
        default: null,
        type: String
    },
    created_at: {
        required: false,
        type: String
    }
})

module.exports = mongoose.model('locations', dataSchema)