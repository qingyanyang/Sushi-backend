const mongoose = require('mongoose');
  
let MenuDetailSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true
  },
  imgs:{
    type: Array,
    required: true
  },
  desc:{
    type: String,
    required: true
  },
  price: {
    type: Number,
    default:999
  },
  status: {
    type: Number,
    required: true
  },
  pCategoryId:{
    type: String,
    required: true
  },
  categoryId:{
    type: String,
  },
  detail: {
    type: String,
    required: true
  },
});

let MenuDetailModel = mongoose.model('menu_items', MenuDetailSchema);

module.exports = MenuDetailModel;
