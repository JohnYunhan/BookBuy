/**
 * 图书类别
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Category = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
  }, //类别id
  Name: {
    type: String,
    required: true
  }, //类别名称
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

//获取类别列表
Category.statics.getCategoryList = function(index, size, json) {
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

//获取类别枚举
Category.statics.getCategory = function() {
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

//根据Id获取类别
Category.statics.getCategoryById = function(categoryId) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: categoryId });
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//新增类别
Category.statics.addCategory = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("category");
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

//修改类别
Category.statics.editCategory = function(json) {
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

//删除类别
Category.statics.delCategory = function(Id) {
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


let Categorys = mongoose.model('Categorys', Category);
module.exports = Categorys;
