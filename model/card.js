const { default: ObjectID } = require('bson-objectid');
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    card_type: {
        required: true,
        type: String
    },
    card_number: {
        required: false,
        type: Number
    },
    worker_id: {
        required: false,
        default: null,
        type: ObjectID
    },
    status: {
        required: true,
        type: String
    },
    updated_at: {
        required: true,
        type: Date
    },
    created_at: {
        required: true,
        type: Date
    },
    start_use_date: {
        required: true,
        type: String
    },
    expired_date: {
        required: true,
        type: String
    },

})

module.exports = mongoose.model('cards', dataSchema)