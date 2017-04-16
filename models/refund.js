/**
 * 图书退换
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Refund = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
  },
  UserId: {
    type: String,
    required: true,
  },
  OrderId: {
    type: String,
    required: true,
  },
  RefundMsg: {
    type: String,
    required: true,
  }, //退换理由
  RefundType: {
    type: Number,
    default: 2, //1:只退款、2:换货、3:退款退货
  }, //退换类型
  IsValid: {
    type: Boolean,
    default: true,
  }, //是否符合要求
  ReplyMsg: {
    type: String,
    default: "",
  }, //回复信息
  CreateDate: {
    type: Number,
    required: true,
  },
  UpdateDate: {
    type: Number,
    required: true,
  },
  Status: {
    type: Number,
    default: 1
  }, //1、待审核、2:审核通过、3:审核不通过、0:已取消
});

//获取用户的退款申请
Refund.statics.getRefundById = function(usrid, orderid) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ UserId: usrid, OrderId: orderid });
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//申请退换
Refund.statics.addRefund = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("refund");
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

//修改申请
Refund.statics.editRefund = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ OrderId: json.OrderId });
    query.exec((error, result) => {
      if (result) {
        result.RefundMsg = json.RefundMsg;
        result.RefundType = json.RefundType;
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

//取消申请
Refund.statics.cancelRefund = function(id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ OrderId: id });
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

let Refunds = mongoose.model('Refunds', Refund);
module.exports = Refunds;
