const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    uid: {
        required: true,
        type: Number
    },
    biophoto_id: {
        required: false,
        type: String
    },
    card_id: {
        required: false,
        type: String
    },
    type: {
        required: false,
        type: String
    },
    status: {
        required: false,
        default: '01',
        type: String
    },
})

module.exports = mongoose.model('permission_workers', dataSchema)