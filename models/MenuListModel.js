const mongoose = require('mongoose');

let MenuListSchema = new mongoose.Schema({
  parentId: {
    type: String,
    default: '0'
  },
  name: {
    type: String,
    required: true
  }
});

let MenuListModel = mongoose.model('menu_list', MenuListSchema);

module.exports = MenuListModel;
