const mongoose = require('mongoose');

let StorageCategoryListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    create_time: {
        type: String,
    },
    auth_name: {
        type: String,
        default: 'admin'
    }
});

let StorageCategoryListModel = mongoose.model('storage_category_lists', StorageCategoryListSchema);

module.exports = StorageCategoryListModel;
