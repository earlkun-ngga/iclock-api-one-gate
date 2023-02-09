const { default: ObjectID } = require('bson-objectid');
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    worker_id: {
        required: true,
        type: ObjectID
    },
    worker_name: {
        required: false,
        type: String
    },
    device_sn_id: {
        required: false,
        type: ObjectID
    },
    device_sn: {
        required: false,
        type: String
    },
    location_id: {
        required: false,
        type: ObjectID
    },
    location_name: {
        required: false,
        type: String
    },
    inout_type: {
        required: false,
        type: String
    },
    verify_type: {
        required: false,
        type: String
    },
    status: {
        required: true,
        type: String
    },
    detail: {
        required: true,
        type: String
    },
    time: {
        required: true,
        type: Date
    }
})

module.exports = mongoose.model('log_departures', dataSchema)