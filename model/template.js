const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types


const sample = new mongoose.Schema({
    name: String,
    forms:[{type: String}],
    user:[{type: String}],
    create_by:String
    
},{timestamps: true});
module.exports = mongoose.model("template", sample); 