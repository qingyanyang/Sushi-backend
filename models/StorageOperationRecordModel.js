const mongoose = require('mongoose');

let StorageOperationRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required:true
    },
    name: {
        type: String,
        required: true
    },
    operation: {
        type: String,
        required: true
    },
    amount:{
        type:Number,
        default:-1
    },
    item_id:{
        type:String,
        required:true
    }
});

let StorageOperationRecordModel = mongoose.model('storage_operation_records', StorageOperationRecordSchema);

module.exports = StorageOperationRecordModel;
