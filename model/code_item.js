const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    item_id: {
        required: true,
        type: String
    },
    code_id: {
        required: false,
        type: Number
    },
    token: {
        required: false,
        default: null,
        type: String,
    },
})

module.exports = mongoose.model('code_items', dataSchema)