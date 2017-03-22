/**
 * 图书出版社
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Press = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
  }, //出版社id
  Name: {
    type: String,
    required: true
  }, //出版社名称
  CreateDate: {
    type: Number,
    required: true
  },
  UpdateDate: {
    type: Number,
    required: true
  },
  Status: {
    type: Boolean,
    default: true
  } //是否启用
})

//获取出版社列表
Press.statics.getPressList = function(index, size, json) {
  return new Promise((resolve, reject) => {
    let query = "";
    let total = 0;
    if (json.Name !== "") {
      //根据名称搜索
      let name = new RegExp(json.Name); //创建正则表达式
      query = this.find({ Name: { $regex: name } });
      total = this.find({ Name: { $regex: name } }).count();
    } else {
      query = this.find();
      total = this.count();
      query.skip(index * size); //跳过多少个数据
      query.limit(size); //限制Size条数据
      query.sort({ UpdateDate: -1 }); //根据添加日期倒序      
    }
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

//获取出版社枚举
Press.statics.getPress = function() {
  return new Promise((resolve, reject) => {
    let query = this.find();
    query.select("Id Name");
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//根据Id获取出版社
Press.statics.getPressById = function(pressId) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: pressId });
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//新增出版社
Press.statics.addPress = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("press");
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

//修改出版社
Press.statics.editPress = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Name = json.Name;
        result.Status = json.Status;
        result.UpdateDate = json.UpdateDate;
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

//删除出版社
Press.statics.delPress = function(Id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
    query.exec((error, result) => {
      if (result) {
        result.remove((err, res) => {
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

let Presses = mongoose.model('Presses', Press);
module.exports = Presses;
