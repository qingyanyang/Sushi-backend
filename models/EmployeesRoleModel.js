const mongoose = require('mongoose');

let EmployeesRoleSchema = new mongoose.Schema({
    menus: {
        type: Array,
    },
    name: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        default:22
    },
    create_time: {
        type: String,
    },
    auth_time: {
        type: String,
    },
    auth_name: {
        type: String,
        default:'admin'
    }
});

let EmployeesRoleModel = mongoose.model('employees_roles', EmployeesRoleSchema);

module.exports = EmployeesRoleModel;
