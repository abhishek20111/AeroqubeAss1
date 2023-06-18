const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types


const sample = new mongoose.Schema({
    docID: {
        type: Number,
    },
    dropdown: {
        type: [String],
    },
    ut: {
        type: [String],
    },
    builder: {
        type: [String],
    },
    title: {
        type: [String],
    },
    unit: {
        type: [String],
    },
    property: {
        type: [String],
    },
    status1: {
        type: [String],
    },
    status2: {
        type: [String],

    },
});
module.exports = mongoose.model("UnitChanger", sample);

