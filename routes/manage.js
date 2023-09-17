// require('dotenv').config({ debug: true });
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const fs = require('fs');
const { Buffer } = require('buffer');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'), false);
    }
  }
})
const path = require('path');

// import db models
const MenuListModel = require('../models/MenuListModel');
const MenuDetailModel = require('../models/MenuDetailModel');
const EmployeesRoleModel = require('../models/EmployeesRoleModel');
const EmployeeListModel = require('../models/EmployeeListModel');
const OrderListModel = require('../models/OrderListModel');
const StorageCategoryListModel = require('../models/StorageCategoryListModel');
const StorageItemListModel = require('../models/StorageItemListModel');
const EmployeesRecordModel = require('../models/EmployeesRecordModel');
const StorageOperationRecordModel = require('../models/StorageOperationRecordModel');


/* GET manage. */
router.get('/category/list', function (req, res, next) {

  const { parentId } = req.query;

  MenuListModel.find({ parentId: parentId })
    .then(data => {
      const response = {
        status: 0,
        data: data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('read failed~~')
    })
});

router.get('/item/list', function (req, res, next) {

  const { pageNumber, pageSize } = req.query;

  MenuDetailModel.countDocuments({})
    .then(count => {
      MenuDetailModel.find({})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec()
        .then(list => {
          const response = {
            status: 0,
            data: {
              pageNum: pageNumber,
              total: count,
              pages: 3,
              pageSize: pageSize,
              list: list
            }
          }
          res.send(JSON.stringify(response))
        })
        .catch(err => {
          res.status(500).send('read failed~~')
        })
    })
    .catch(err => {
      res.status(500).send('request failed~~')
    })
});

router.get('/role/list', function (req, res, next) {

  EmployeesRoleModel.find()
    .then(data => {
      const response = {
        status: 0,
        data: data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('request failed~~')
    })
});

router.get('/employee/list', function (req, res, next) {

  EmployeeListModel.find()
    .then(employees => {
      EmployeesRoleModel.find()
        .then(roles => {
          const response = {
            status: 0,
            data: {
              employees,
              roles
            }
          }
          res.send(JSON.stringify(response))
        }).catch(err => {
          res.status(500).send('request failed~~')
        })
    })
    .catch(err => {
      res.status(500).send('request failed~~')
    })
});

router.get('/employee/record_list', function (req, res, next) {
  const { start, end, ...searchQuery } = req.query;
  const [searchType, searchName] = Object.entries(searchQuery)[0];

  let find = {}
  if (searchName !== '*') {
    const reg = new RegExp(searchName, 'i')
    find = {
      [searchType]: reg
    }
  } else if (start && end) {
    find = {
      date: {
        $gte: start,
        $lte: end
      }
    }
  }

  EmployeesRecordModel.find(find)
    .then(async (list) => {

      let salary = 0;

      await Promise.all(
        list.map(async (record) => {
          const offTime = new Date(record.off_time);
          const onTime = new Date(record.on_time);
          const workingHours = Math.round((offTime - onTime) / 1000 / 60 / 60);
          const role = await EmployeesRoleModel.findOne({ _id: record.role_id });
          const roleRate = role.rate;
          salary += workingHours * roleRate;
        })
      );

      const response = {
        status: 0,
        salary,
        data: list,
      };

      res.send(JSON.stringify(response));
    })
    .catch((err) => {
      res.status(500).send('request failed~~');
    });

});

router.get('/order/list', function (req, res, next) {

  const { pageNumber, pageSize } = req.query;
  OrderListModel.countDocuments({})
    .then(count => {
      OrderListModel.find({})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec()
        .then(list => {
          const response = {
            status: 0,
            data: {
              pageNum: pageNumber,
              total: count,
              pages: 3,
              pageSize: pageSize,
              list: list
            }
          }
          res.send(JSON.stringify(response))
        })
        .catch(err => {
          res.status(500).send('request failed~~')
        })
    })
    .catch(err => {
      res.status(500).send('request list failed~~')
    })
});

router.get('/storage/category_list', function (req, res, next) {
  StorageCategoryListModel.find({})
    .then(data => {
      const response = {
        status: 0,
        data: data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('request failed~~')
    })
});

router.get('/storage/item_list', function (req, res, next) {
  const { pageNumber, pageSize } = req.query;
  if (pageNumber == 0 && pageSize == 0) {
    StorageItemListModel.find({})
      .then(list => {
        const response = {
          status: 0,
          data: {
            list
          }
        }
        res.send(JSON.stringify(response))
      })
      .catch(err => {
        res.status(500).send('request failed~~')
      })
  } else {
    StorageItemListModel.countDocuments({})
      .then(count => {
        StorageItemListModel.find({})
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .exec()
          .then(list => {
            const response = {
              status: 0,
              data: {
                pageNum: pageNumber,
                total: count,
                pages: 3,
                pageSize: pageSize,
                list
              }
            }
            res.send(JSON.stringify(response))
          })
          .catch(err => {
            res.status(500).send('request failed~~')
          })
      })
      .catch(err => {
        res.status(500).send('request list failed~~')
      })
  }
});

router.get('/storage/item_list_sort', function (req, res, next) {
  const { pageNumber, pageSize, isAsend } = req.query;

  let isAsending = isAsend === 'true' ? true : false;

  StorageItemListModel.countDocuments({})
    .then(count => {
      StorageItemListModel.find({})
        .sort({ storage: isAsending ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec()
        .then(list => {
          const response = {
            status: 0,
            data: {
              pageNum: pageNumber,
              total: count,
              pages: 3,
              pageSize: pageSize,
              list: list
            }
          }
          res.send(JSON.stringify(response))
        })
        .catch(err => {
          res.status(500).send('request failed~~')
        })
    })
    .catch(err => {
      res.status(500).send('request list failed~~')
    })
});

router.get('/storage/operation_record', function (req, res, next) {
  let query = {};
  if (req.query.start && req.query.end) {
    operation = 'add storage';
    query = {
      date: {
        $gte: new Date(req.query.start),
        $lte: new Date(req.query.end)
      },
      operation
    }
  }
  StorageOperationRecordModel.find(query)
    .then(async (data) => {
      let expenditure = 0;
      await Promise.all(
        data.map(async (record) => {
          let id = record.item_id;
          let storageItem = await StorageItemListModel.findOne({ _id: id });
          let price = storageItem.price;
          expenditure += record.amount * price;
        })
      );

      const response = {
        status: 0,
        expenditure,
        data,
      };

      res.send(JSON.stringify(response));
    })
    .catch((err) => {
      res.status(500).send('request failed~~');
    });
});

router.get('/category/name', function (req, res, next) {
  const { categoryId } = req.query;

  MenuListModel.find({ _id: categoryId })
    .then(data => {
      const response = {
        status: 0,
        data: { name: data[0].name }
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('request failed~~')
    })
});

router.get('/item/search', function (req, res, next) {
  const { ...searchQuery } = req.query;
  const [searchType, searchName] = Object.entries(searchQuery)[0] || [];
  const reg = new RegExp(searchName, 'i');

  const findQuery = searchType ? { [searchType]: reg } : {};

  MenuDetailModel.find(findQuery)
    .then(list => {
      if (list.length === 0) {
        return MenuDetailModel.find({});
      }
      return list;
    })
    .then(list => {
      const response = {
        status: 0,
        data: {
          total: list.length,
          list: list
        }
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('request failed~~');
    });
});


router.get('/order/search', function (req, res, next) {
  const { ...searchQuery } = req.query;
  const [searchType, searchName] = Object.entries(searchQuery)[0] || [];

  let query;

  if (searchType && searchName) {
    if (searchType === '_id') {
      query = { [searchType]: new mongoose.Types.ObjectId(searchName) };
    } else {
      const reg = new RegExp(searchName, 'i');
      query = { [searchType]: reg };
    }
  } else {
    query = {}; 
  }

  OrderListModel.find(query)
    .then(list => {
      if (list.length === 0) {
        return OrderListModel.find({});
      }
      return list;
    })
    .then(list => {
      const response = {
        status: 0,
        data: {
          total: list.length,
          list
        }
      }
      res.send(JSON.stringify(response));
    })
    .catch(err => {
      res.status(500).json({ error: 'request failed~~' });
    });
});

router.get('/employee/list_search', function (req, res, next) {
  const { ...searchQuery } = req.query;
  const [searchType, searchName] = Object.entries(searchQuery)[0] || [];

  let find = {};

  if (searchName && searchName !== '*') {
    const reg = new RegExp(searchName, 'i');
    find = {
      [searchType]: reg
    };
  }

  EmployeeListModel.find(find)
    .then(list => {
      const response = {
        status: 0,
        data: list
      }
      res.send(JSON.stringify(response));
    })
    .catch(err => {
      res.status(500).send('request failed~~');
    });
});


router.get('/order/list_rank', async function (req, res, next) {
  try {
    let start, end;
    let find = {}
    if (req.query.start && req.query.end) {
      start = req.query.start
      end = req.query.end
      find = { create_time: { $gte: new Date(start), $lte: new Date(end) } }
    }

    const list = await OrderListModel.getSalesStatsByItem(start, end);
    let total_amount = 0;
    list.map((item) => {
      total_amount = total_amount + item.total_sales;
    });

    OrderListModel.aggregate([
      { $match: find },
      { $group: { _id: null, total: { $sum: '$bill_amount' } } }
    ])
      .exec()
      .then(async (result) => {
        // Sort the list by create_time
        const sortedList = await OrderListModel.find().sort({ create_time: 1 }).exec()

        // Get the first and last element's create_time
        const firstCreateTime = sortedList[0].create_time;
        const lastCreateTime = sortedList[sortedList.length - 1].create_time;

        const response = {
          status: 0,
          total: total_amount,
          total_sale: result.length === 0 ? 0 : result[0].total,
          start: firstCreateTime,
          end: lastCreateTime,
          data: list,
        };
        res.send(JSON.stringify(response));
      })
      .catch((err) => {
        res.status(500).send('request list failed~~');
      });
  } catch (err) {
    res.status(500).send('request list failed~~');
  }
});




/* POST manage. */
router.post('/category/update', function (req, res, next) {

  const { categoryId, categoryName } = req.body;

  MenuListModel.updateOne({ _id: categoryId }, { name: categoryName })
    .then(data => {
      const response = {
        status: 0,
        data: categoryName
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update failed~~')
    })
});

router.post('/category/add', function (req, res, next) {

  const { categoryName, parentId } = req.body;

  MenuListModel.create({
    parentId: parentId,
    name: categoryName
  })
    .then(data => {
      const response = {
        status: 0,
        data: categoryName
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('插入failed~~')
    })
});

router.post('/category/delete', function (req, res, next) {

  const { categoryId } = req.body;

  MenuListModel.deleteOne({ _id: categoryId })
    .then(data => {
      const response = {
        status: 0,
        data: categoryId
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

router.post('/item/update_status', function (req, res, next) {

  const { itemId, itemStatus } = req.body;

  MenuDetailModel.updateOne({ _id: itemId }, { status: itemStatus })
    .then(data => {
      const response = {
        status: 0,
        data: {}
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update status failed~~')
    })
});

router.post('/item/update', function (req, res, next) {
  const { item } = req.body;
  const { _id } = item
  delete item._id
  MenuDetailModel.updateOne({ _id }, item)
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update item failed~~')
    })
});

router.post('/item/add', function (req, res, next) {
  const { item } = req.body;
  item.status = 1
  MenuDetailModel.create(item)
    .then(data => {
      const response = {
        status: 0,
        data: item
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('add item failed~~')
    })
});

router.post('/img/upload', upload.single('image'), async function (req, res, next) {
  try {
    // Access the uploaded file
    const image = req.file;
    console.log('image',image)
    // Create a buffer from the binary image data
    const imageBuffer = Buffer.from(image.buffer, 'binary');

    // Save the image file to the public images folder
    let fileExtension;
    switch (image.mimetype) {
      case 'image/jpeg':
        fileExtension = 'jpg';
        break;
      case 'image/png':
        fileExtension = 'png';
        break;
      case 'image/heic':
        fileExtension = 'heic';
        break;
      default:
        fileExtension = 'jpg';
    }
    const newName = `${uuidv4()}.${fileExtension}`;

    const imagePath = path.join(__dirname, '../public/images/', newName);

    await fs.promises.writeFile(imagePath, imageBuffer);

    const response = {
      status: 0,
      data: {
        name: newName,
        url: `${process.env.SERVER_HOST}/images/${newName}`,
      },
    };
    res.send(JSON.stringify(response));
  } catch (error) {
    res.status(500).send({ error: "An error occurred while processing the image." });
  }
});

router.post('/img/delete', function (req, res, next) {
  const { name } = req.body
  fs.unlink(`../public/images/${name}`, err => {
    if (err) {
      return
    }
    const response = {
      status: 0,
    };
    res.send(JSON.stringify(response));
  })

});

router.post('/role/add', function (req, res, next) {
  const { name, rate, time } = req.body;
  EmployeesRoleModel.create({
    name,
    rate,
    create_time: time
  })
    .then(data => {
      const response = {
        status: 0,
        data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('add failed~~')
    })
});

router.post('/role/update', function (req, res, next) {
  const { roleId, rate, name } = req.body;
  EmployeesRoleModel.updateOne({ _id: roleId }, { name, rate })
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update 名称failed~~')
    })
});

router.post('/role/delete', function (req, res, next) {
  const { roleId } = req.body;

  EmployeesRoleModel.deleteOne({ _id: roleId })
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

router.post('/role/update_auth', function (req, res, next) {
  const { roleId, menus, time } = req.body;

  if (!roleId || !menus) {
    return res.status(400).send('Bad request: roleId or menus missing');
  }

  // Update create_time, auth_name, and auth_time
  EmployeesRoleModel.updateOne({ _id: roleId }, { $set: { menus: menus, auth_time: time } })
    .then(data => {
      const response = {
        status: 0,
        data
      }
      res.send(JSON.stringify(response));
    })
    .catch(err => {
      res.status(500).send('Update failed~~');
    });
});


router.post('/employee/add', function (req, res, next) {
  const { employee } = req.body;
  EmployeeListModel.create({
    ...employee
  })
    .then(data => {
      const response = {
        status: 0,
        data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('add failed~~')
    })
});

router.post('/employee/delete', function (req, res, next) {
  const { employeeId } = req.body;
  EmployeeListModel.deleteOne({ _id: employeeId })
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

router.post('/employee/update', function (req, res, next) {
  const { employeeId, employee } = req.body;
  EmployeeListModel.updateOne({ _id: employeeId }, employee)
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update failed~~')
    })
});

router.post('/order/delete', function (req, res, next) {
  const { orderId } = req.body;
  OrderListModel.deleteOne({ _id: orderId })
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

router.post('/storage/category_add', function (req, res, next) {
  const { storageCategory } = req.body;
  StorageCategoryListModel.create({
    ...storageCategory
  })
    .then(data => {
      const response = {
        status: 0,
        data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('add failed~~')
    })
});

router.post('/storage/category_update', function (req, res, next) {
  const { storageCategoryId, storageCategory } = req.body;
  StorageCategoryListModel.updateOne({ _id: storageCategoryId }, storageCategory)
    .then(data => {
      const response = {
        status: 0,
        data: storageCategory
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update failed~~')
    })
});

router.post('/storage/category_delete', function (req, res, next) {
  const { storageCategoryId } = req.body;
  StorageCategoryListModel.deleteOne({ _id: storageCategoryId })
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

router.post('/storage/item_update', function (req, res, next) {
  const { storageItem } = req.body;
  const { _id } = storageItem
  delete storageItem._id
  StorageItemListModel.updateOne({ _id }, storageItem)
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update item failed~~')
    })
});

router.post('/storage/item_add', function (req, res, next) {
  const { storageItem } = req.body;
  StorageItemListModel.create(storageItem)
    .then(data => {
      const response = {
        status: 0,
        data: storageItem
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('add item failed~~')
    })
});

router.get('/storage/item_search', function (req, res, next) {
  const { pageNumber, pageSize, ...searchQuery } = req.query;
  const [searchType, searchName] = Object.entries(searchQuery)[0];
  const reg = new RegExp(searchName, 'i')
  StorageItemListModel.countDocuments({})
    .then(count => {
      StorageItemListModel.find(
        {
          [searchType]: reg
        }
      )
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec()
        .then(list => {
          const response = {
            status: 0,
            data: {
              pageNum: pageNumber,
              total: count,
              pages: 3,
              pageSize: pageSize,
              list: list
            }
          }
          res.send(JSON.stringify(response))
        })
        .catch(err => {
          res.status(500).send('request failed~~')
        })
    })
    .catch(err => {
      res.status(500).send('request list failed~~')
    })
});

router.post('/storage/item_storage_update', function (req, res, next) {

  const { storageItemId, amount } = req.body;

  StorageItemListModel.updateOne({ _id: storageItemId }, { storage: amount })
    .then(data => {
      const response = {
        status: 0,
        data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update failed~~')
    })
});

router.post('/employee/record_delete', function (req, res, next) {

  const { recordId } = req.body;

  EmployeesRecordModel.deleteOne({ _id: recordId })
    .then(data => {
      const response = {
        status: 0,
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('update failed~~')
    })
});

router.post('/storage/operation_add', function (req, res, next) {

  const { operation, username, time, amount, item_id } = req.body;

  StorageOperationRecordModel.create({
    name: username,
    operation,
    amount,
    date: time,
    item_id
  })
    .then(data => {
      const response = {
        status: 0,
        data
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

router.post('/storage/operation_record_delete', function (req, res, next) {

  const { recordId } = req.body;

  StorageOperationRecordModel.deleteOne({ _id: recordId })
    .then(data => {
      const response = {
        status: 0
      }
      res.send(JSON.stringify(response))
    })
    .catch(err => {
      res.status(500).send('delete failed~~')
    })
});

module.exports = router;
