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
  console.log("checking::",process.env.DBHOST, process.env.DBPORT, process.env.DBNAME);

  mongoose.connect(`mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`);

  mongoose.connection.once('open', () => {
    success();
  });

  mongoose.connection.on('error', () => {
    error();
  });

  mongoose.connection.on('close', () => {
    console.log('connection closed~~');
  });
}