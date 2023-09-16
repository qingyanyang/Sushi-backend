var express = require('express');
var router = express.Router();
const EmployeeListModel = require('../models/EmployeeListModel')
const EmployeesRoleModel = require('../models/EmployeesRoleModel')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password)
  EmployeeListModel.find({ username })
  .then(data=>{
    let status = 0
    if (data[0].password !== password){
      status = 1
      let response = {
        status
      }
      res.send(JSON.stringify(response))
    }else{
      EmployeesRoleModel.find({ _id: data[0].role_id })
        .then(role => {
          console.log('data[0]', data[0])
          let userWithRole = { ...data[0]._doc, role: role[0].menus };
          delete userWithRole.role_id
          let response = {
            status,
            data: userWithRole
          }
          res.send(JSON.stringify(response))
        })
        .catch(err => {
          res.status(500).send('login failed~~')
        })
    }
  })
  .catch(err=>{
    res.status(500).send('login failed~~')
  })

});
module.exports = router;
