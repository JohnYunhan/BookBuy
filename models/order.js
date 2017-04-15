/**
 * 订单
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Order = mongoose.Schema({
  Id: {
    type: String,
    required: true,
    index: true
  }, //订单id
  BuyInfor: {
    type: String,
    required: true,
  }, //购买的图书信息
  UserId: {
    type: String,
    required: true,
  }, //会员Id
  Nick: {
    type: String,
    required: true,
  }, //昵称
  Freight: {
    type: Number,
    required: true,
  },
  Total: {
    type: Number,
    required: true,
  }, //订单总额
  Name: {
    type: String,
    default: "",
  }, //收货人
  Mobile: {
    type: String,
    default: "",
  }, //收货人手机
  Address: {
    type: String,
    default: "",
  }, //收货地址
  Note: {
    type: String,
    default: "",
  },
  DeliveryTime: {
    type: String,
    default: ""
  }, //配送时间
  InvoiceInfor: {
    type: String,
    default: ""
  }, //发票信息
  CreateDate: {
    type: Number,
    required: true,
  },
  UpdateDate: {
    type: Number,
    required: true,
  },
  IsApplyRefund: {
    type: Number,
    default: 0
  }, //是否申请售后  0:否、1:是
  Status: {
    type: Number,
    default: 1
  }, //订单状态,-1:已删除、0:已失效、1:待确认、2:配送中、3:已签收、4:审核中、5:已退款、6:已评价、7:退换中、8:已换货
});

//获取订单列表
Order.statics.getOrderList = function(index, size, usrid) {
  // console.log(index, size, usrid)
  return new Promise((resolve, reject) => {
    let query = this.find({ UserId: usrid, Status: { $gt: -1 } });
    let total = this.find({ UserId: usrid, Status: { $gt: -1 } }).count();
    query.sort({ UpdateDate: -1 }); //根据添加日期倒序
    query.skip(index * size); //跳过多少个数据
    query.limit(size); //限制Size条数据
    query.exec((error, result) => {
      if (!error) {
        total.exec((err, res) => {
          if (!err) {
            resolve({
              Data: result,
              TotalCount: res
            });
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

//根据Id获取订单详情
Order.statics.getOrderById = function(Id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
    query.exec((error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

// 新增订单(确认下单)
Order.statics.addOrder = function(json) {
  return new Promise((resolve, reject) => {
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

//修改订单
Order.statics.editOrder = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.BookId = json.BookId;
        result.BookName = json.BookName;
        result.Image = json.Image;
        result.Count = json.Count;
        result.Freight = json.Freight;
        result.Total = json.Total;
        result.Name = json.Name;
        result.Mobile = json.Mobile;
        result.Address = json.Address;
        result.Note = json.Note;
        result.DeliveryTime = json.DeliveryTime;
        result.InvoiceInfor = json.InvoiceInfor;
        result.Status = json.Status;
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

//修改订单状态
Order.statics.setOrderStatus = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (!error) {
        if (result) {
          result.Status = json.Status;
          result.UpdateDate = Date.now();
          result.save((error, res) => {
            resolve(res); //更新后的数据
          })
        }
      } else {
        reject(error);
      }
    })
  })
}

Order.statics.setApplyRefund = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (!error) {
        if (result) {
          result.IsApplyRefund = json.IsApplyRefund;
          result.UpdateDate = Date.now();
          result.save((error, res) => {
            resolve(res); //更新后的数据
          })
        }
      } else {
        reject(error);
      }
    })
  })
}

let Orders = mongoose.model('Orders', Order);
module.exports = Orders;
