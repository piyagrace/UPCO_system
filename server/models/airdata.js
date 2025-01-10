const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    year: Number,
    month: String,
    CO: Number,
    NO2: Number,
    SO2: Number
})

const modelName = 'air_datas';
const UserModel5 = mongoose.models[modelName] || mongoose.model(modelName, UserSchema);
module.exports = UserModel5