const mongoose = require('mongoose');
const { default: ObjectID } = require('bson-objectid');

const dataSchema = new mongoose.Schema({
    uid: {
        required: true,
        type: Number
    },
    name: {
        required: false,
        type: String
    },
    status: {
        required: false,
        default: '01',
        type: String
    },
    id_number: {
        required: false,
        type: String
    },
    nat_id: {
        required: false,
        type: String
    },
    comp_id: {
        required: false,
        type: ObjectID
    },
    pos_id: {
        required: false,
        type: String
    },
    type: {
        required: false,
        type: Number
    },
    permission_loc_Ids: {
        required: false,
        type: Array
    },
    photo_base64: {
        required: false,
        type: String
    },
    created_at: {
        required: true,
        type: Date
    },
    created_by: {
        required: false,
        default: "system",
        type: String
    },
    deleted_at: {
        required: false,
        type: Date
    },
})

module.exports = mongoose.model('workers', dataSchema)