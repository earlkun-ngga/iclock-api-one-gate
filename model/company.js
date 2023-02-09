const { default: ObjectID } = require('bson-objectid');
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    address: {
        required: false,
        type: String,
    },
    is_own: {
        required: false,
        type: Number
    },
    phone: {
        required: false,
        type: Number
    },
    updated_at: {
        required: false,
        type: Date
    },
    work_time_start: {
        required: false,
        type: String
    },
    work_time_finish: {
        required: false,
        type: String
    },
    short_name: {
        required: false,
        type: String
    },
    code_name: {
        required: false,
        type: String
    }
})

module.exports = mongoose.model('companies', dataSchema)