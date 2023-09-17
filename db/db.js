// require('dotenv').config({ debug: true });

/**
 * 
 * @param {*} success
 * @param {*} error
 */

module.exports = function (success, error) {

  if(typeof error !== 'function'){
    error = () => {
      console.log('connection failed~~~');
    }
  }

  // import mongoose
  const mongoose = require('mongoose');

  //set strictQuery as true
  mongoose.set('strictQuery', true);
  console.log("checking::", process.env.MONGODB_URI);

  mongoose.connect(process.env.MONGODB_URI);

  mongoose.connection.once('open', () => {
    success();
    console.log('connection success~~');
  });

  mongoose.connection.on('error', () => {
    error();
    console.log('connection error~~');
  });

  mongoose.connection.on('close', () => {
    console.log('connection closed~~');
  });
}