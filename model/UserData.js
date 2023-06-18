const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
    }, 
    Collection:[{
        Address: String,
        Unit_No: String,
        City: String,
        Zip_Code: String,
        State: String,
        property_Description: String,
        Builder_Type: {type:String, default:"Detached"},
        Age_of_Builder: Number,
        Property_Type: {type:String, default:"Multifamily home"},
        Square_Footage: String,
        Parking_Type: String,
        Title: {type:String, default:"Condos"},
        Date: [Date],
        Status: [{type:String, default:"Sold"}],
        EndDate:[Date] ,
        status: [{type:String, default:"Occupied"}],
        Bedroom: String,
        Bedrooms: Number,
        AddedFields: [String],
        Appliance_Include: [String],
        Utilies: [String],
        Utilies_Include: [String],
        ExtraAppliance_Include:[String],
        School: String,
        SchoolDistance:String,
        Market: String,
        MarketDistance:String,
        Community: String,
        CommunityDistance:String,
        Pets_alloed: String,
        Rentals: String,
        Latitude:Number,
        Longitude:Number,
        Image_url:[Object],
        Message:String,
        History:[{type:Object}]
    }],

},{timestamps: true})

module.exports = mongoose.model('AssigR2', userSchema);