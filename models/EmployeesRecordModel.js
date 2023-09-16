const mongoose = require('mongoose');

let EmployeesRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
    },
    name: {
        type: String,
        required: true
    },
    role_id:{
        type: String,
        required: true
    },
    on_time: {
        type: Date,
        required: true
    },
    off_time: {
        type: Date,
        required: true
    }
});

let EmployeesRecordModel = mongoose.model('employees_records', EmployeesRecordSchema);

module.exports = EmployeesRecordModel;
