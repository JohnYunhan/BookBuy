/**
 * 轮播图
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Picture = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
  }, //轮播图id
  Name: {
    type: String,
    required: true
  }, //轮播图名称
  Url: {
    type: String,
    required: true
  }, //轮播图链接
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

//获取轮播图列表
Picture.statics.getPictureList = function(index, size, json) {
  return new Promise((resolve, reject) => {
    let query = "";
    let total = 0;
    if (json.Name !== "") {
      //根据名称搜索
      let name = new RegExp(json.Name);
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

Picture.statics.getPicture = function(index, size) {
  return new Promise((resolve, reject) => {
    let query = "";
    let total = 0;
    query = this.find({ Status: true });
    total = this.count();
    query.skip(index * size); //跳过多少个数据
    query.limit(size); //限制Size条数据
    query.sort({ UpdateDate: -1 }); //根据添加日期倒序
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

//根据Id获取轮播图
Picture.statics.getPictureById = function(Id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//新增轮播图
Picture.statics.addPicture = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("picture");
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

//修改轮播图
Picture.statics.editPicture = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Name = json.Name;
        result.Url = json.Url;
        result.Status = json.Status;
        result.UpdateDate = json.UpdateDate;
        result.save((err, res) => {
          if (!err) {
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

//删除轮播图
Picture.statics.delPicture = function(Id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
    query.exec((error, result) => {
      if (result) {
        result.remove((err, res) => {
          if (!err) {
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

let Pictures = mongoose.model('Pictures', Picture);
module.exports = Pictures;
