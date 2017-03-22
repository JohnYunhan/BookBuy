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
  }, //订单id
  BookId: {
    type: String,
    required: true,
  }, //图书Id
  UserId: {
    type: String,
    required: true,
  }, //会员Id
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

//修改购物车
Car.statics.editCar = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
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
Car.statics.delCar = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
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
