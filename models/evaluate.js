/**
 * 图书评价
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Evaluate = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
  },
  UserId: {
    type: String,
    required: true,
  },
  BookId: {
    type: String,
    required: true,
  },
  OrderId: {
    type: String,
    required: true,
  },
  EvaluateMsg: {
    type: String,
    required: true,
  }, //评价信息
  QualityRate: {
    type: Number,
    default: 5,
  }, //图书质量
  DeliveryRate: {
    type: Number,
    default: 5,
  }, //配送速度  
  ServiceRate: {
    type: Number,
    default: 5,
  }, //服务态度
  CreateDate: {
    type: Number,
    required: true,
  },
  UpdateDate: {
    type: Number,
    required: true,
  }
});

//获取评价列表
Evaluate.statics.getEvaluateList = function(index, size, userid, bookid) {
  return new Promise((resolve, reject) => {
    let query = "";
    let total = "";
    if (usrid !== "") {
      query = this.find({ UserId: userid });
      total = this.find({ UserId: userid }).count();
    } else {
      query = this.find({ BookId: bookid });
      total = this.find({ BookId: bookid }).count();
    }
    query.sort({ UpdateDate: -1 }); //根据添加日期倒序
    query.skip(index * size); //跳过多少个数据
    query.limit(size); //限制Size条数据
    query.exec((error, result) => {
      if (result) {
        total.exec((err, res) => {
          if (res) {
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

//增加图书评价
Evaluate.statics.addEvaluate = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("evaluate");
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

//修改图书评价
Evaluate.statics.editEvaluate = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.EvaluateMsg = json.EvaluateMsg;
        result.QualityRate = json.QualityRate;
        result.ServiceRate = json.ServiceRate;
        result.DeliveryRate = json.DeliveryRate;
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

let Evaluates = mongoose.model('Evaluates', Evaluate);
module.exports = Evaluates;
