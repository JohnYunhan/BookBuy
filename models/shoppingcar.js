/**
 * 购物车
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Car = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
    required: true,
  }, //购物车id
  UserId: {
    type: String,
    required: true,
  }, //会员Id
  BookId: {
    type: String,
    required: true,
  }, //图书Id
  BookName: {
    type: String,
    required: true,
  }, //图书名称
  Category: {
    type: String,
    required: true,
  }, //图书类别
  Author: {
    type: String,
    required: true
  },
  Image: {
    type: Array,
    default: [],
  },
  Storage: {
    type: Number,
    required: true,
  }, //库存
  SellPrice: {
    type: Number,
    required: true,
  }, //售价
  Count: {
    type: Number,
    required: true,
  }, //数量
  CreateDate: {
    type: Number,
    required: true,
  },
  UpdateDate: {
    type: Number,
    required: true,
  }
});

//获取购物车列表
Car.statics.getCarList = function(userid) {
  return new Promise((resolve, reject) => {
    let query = this.find({ UserId: userid });
    query.sort({ UpdateDate: -1 }); //根据日期倒序
    query.select("Id BookId BookName Category Author Storage SellPrice Image Count");
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//新增购物车
Car.statics.addCar = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("car");
    json.CreateDate = Date.now();
    json.UpdateDate = Date.now();
    json.save((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//根据BookId查询用户购物车中是否已经存在此图书
Car.statics.getCarByBookId = function(bookid) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ BookId: bookid });
    // let count = this.count();
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//修改购物车
Car.statics.editCar = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ UserId: json.UserId, BookId: json.BookId });
    query.exec((error, result) => {
      if (result) {
        result.Count = json.Count;
        result.UpdateDate = Date.now();
        result.save((err, res) => {
          if (res) {
            resolve(res);
          } else {
            reject(err);
          }
        })
      } else {
        reject(error);
      }
    })
  })
}

//删除购物车
Car.statics.delCar = function(id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: id });
    query.exec((error, result) => {
      if (result) {
        result.remove((err, res) => {
          if (res) {
            resolve(res);
          } else {
            reject(err)
          }
        })
      } else {
        reject(error);
      }
    })
  })
}

let Cars = mongoose.model('Cars', Car);
module.exports = Cars;
