const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    serial_number: {
        required: true,
        type: String
    },
    location_id: {
        required: false,
        type: String
    },
    registry_code: {
        required: false,
        default: null,
        type: String,
    },
    error_delay: {
        required: false,
        default: null,
        type: String
    },
    request_delay: {
        required: false,
        default: null,
        type: String
    },
    real_time: {
        required: false,
        default: 1,
        type: Number
    },
    trans_times: {
        required: false,
        default: null,
        type: String
    },
    trans_interval: {
        required: false,
        default: null,
        type: String
    },
    status: {
        required: false,
        default: '01',
        type: String
    },
    last_uptime: {
        required: false,
        type: String
    },
    deleted_at: {
        required: false,
        default: null,
        type: Date
    }
})

module.exports = mongoose.model('devices', dataSchema)