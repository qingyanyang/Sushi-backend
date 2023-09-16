const mongoose = require('mongoose');

let StorageItemListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category_id: {
        type: String,
        required: true
    },
    imgs: {
        type: Array,
    },
    create_time: {
        type: Date,
        required: true
    },
    storage: {
        type: Number,
        default:0
    },
    buyer: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    supplier: {
        type: String,
        required: true
    },
    supplier_phone: {
        type: Number,
        required: true
    }
});

let StorageItemListModel = mongoose.model('storage_item_lists', StorageItemListSchema);

module.exports = StorageItemListModel;
