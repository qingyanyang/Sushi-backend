// import mongoose
const mongoose = require('mongoose');

let EmployeeListSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    role_id:{
        type: String,
        required: true
    },
    create_time: {
        type: String,
        required: true
    }
});

// create model
let EmployeeListModel = mongoose.model('employee_lists', EmployeeListSchema);

module.exports = EmployeeListModel;
