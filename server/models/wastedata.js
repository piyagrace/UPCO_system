const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    year: Number,
    month: String,
    residual: Number,
    biodegradable: Number,
    recyclable: Number
})

const modelName = 'waste_data';
const UserModel3 = mongoose.models[modelName] || mongoose.model(modelName, UserSchema);
module.exports = UserModel3