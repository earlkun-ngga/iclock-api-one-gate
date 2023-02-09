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
    worker_id_number: {
        required: false,
        type: String
    },
    worker_type: {
        required: false,
        type: Number
    },
    comp_id: {
        required: false,
        type: ObjectID
    },
    company_name: {
        required: false,
        type: String
    },
    device_sn_in: {
        required: true,
        type: String
    },
    device_sn_out: {
        required: false,
        type: String
    },
    device_id_sn_in: {
        required: true,
        type: ObjectID
    },
    device_id_sn_out: {
        required: false,
        type: ObjectID
    },
    verify_type: {
        required: true,
        type: String
    },
    location_id: {
      required: true,
      type: ObjectID
    },
    location_name: {
        required: false,
        type: String
    },
    in_time: {
        required: true,
        type: Date
    },
    out_time: {
        type: Date,
        default: null
    },
    status: {
        required: false,
        default: '01',
        type: String
    },
    company_short_name: {
        required: false,
        type: String
    },
    updated_at: {
        required: false,
        default: null,
        type: Date
    },
    created_at: {
        required: false,
        type: Date
    }
}, {collection: "departures_history"});

module.exports = mongoose.model('departures_history', dataSchema)