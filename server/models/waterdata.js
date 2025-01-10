const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    year: Number,
    month: String,
    source_tank: String,
    pH: Number,
    Color: Number,
    FecalColiform: Number,
    TSS: Number,
    Chloride: Number,
    Nitrate: Number,
    Phosphate: Number
})

const modelName = 'water_datas';
const UserModel4 = mongoose.models[modelName] || mongoose.model(modelName, UserSchema);
module.exports = UserModel4