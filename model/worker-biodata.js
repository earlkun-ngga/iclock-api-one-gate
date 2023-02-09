const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    uid: {
        required: true,
        type: Number
    },
    filename: {
        required: true,
        type: String
    },
    type: {
        required: false,
        type: Number
    },
    size: {
        required: false,
        default: '01',
        type: Number
    },
    content: {
        required: false,
        type: Buffer
    },
    status: {
        required: false,
        default: '01',
        type: String
    },
})

module.exports = mongoose.model('worker-biodata', dataSchema)