/**
 * 会员
 */
const { createID, encryptJSON, decryptJSON } = require("../utils/utils");
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let User = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
  }, //会员id
  Nick: {
    type: String,
    required: true,
  }, //昵称
  Password: {
    type: String,
    required: true,
  },
  Name: {
    type: String,
    default: "",
  }, //姓名（收货人）
  Mobile: {
    type: String,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    default: "",
  }, //邮箱
  Avatar: {
    type: String,
    default: "http://yunhan723.top/image/avatar.jpg",
  }, //头像
  Address: {
    type: String,
    default: "",
  }, //收货地址
  Level: {
    type: Number,
    default: 1,
  }, //会员等级,1:注册会员、2:铜牌会员、3:银牌会员、4:金牌会员、5:钻石会员,//确认订单次数达至(5、15、35、65、105)可升级    
  CreateDate: {
    type: Number,
    required: true,
  },
  UpdateDate: {
    type: Number,
    required: true,
  },
  Valid: {
    type: Boolean,
    default: true
  }, //账号是否可以使用
});

//会员登录(可根据昵称或手机登录)
User.statics.userLogin = function(json) {
  return new Promise((resolve, reject) => {
    let data = { Nick: json.Nick };
    if (json.Mobile !== "") {
      data = { Mobile: json.Mobile };
    }
    let query = this.findOne(data);
    query.exec((error, result) => {
      if (result) {
        if (result.Valid) {
          decryptJSON(json.Password, result.Password).then(pass => {
            if (pass) {
              //密码正确
              resolve(result);
            } else {
              reject({ Code: 400, Message: "密码错误" });
            }
          })
        } else {
          reject({ Code: 400, Message: "账号已被拉黑" });
        }
      } else {
        reject({ Code: 400, Message: "账号不存在" });
      }
    })
  })
}

//获取会员列表
User.statics.getUserList = function(json, index, size) {
  return new Promise((resolve, reject) => {
    let query = "";
    let total = 0;
    if (json.Nick !== "") {
      //根据昵称搜索
      let nick = new RegExp(json.Nick); //创建正则表达式
      query = this.find({ Nick: { $regex: nick } });
      total = this.find({ Nick: { $regex: nick } }).count();
    } else if (json.Mobile !== "") {
      //根据手机搜索
      let mobile = new RegExp(json.Mobile);
      query = this.find({ Mobile: { $regex: mobile } });
      total = this.find({ Mobile: { $regex: mobile } }).count();
    } else {
      query = this.find();
      total = this.count();
      query.sort({ UpdateDate: -1 }); //根据添加日期倒序
      query.skip(index * size); //跳过多少条数据
      query.limit(size); //获取多少条数据
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

//验证昵称、手机号是否已被注册
User.statics.checkRegister = function(nick, mobile) {
  return new Promise((resolve, reject) => {
    let query = "";
    if (nick !== "") {
      query = this.findOne({ Nick: nick });
    } else {
      query = this.findOne({ Mobile: mobile });
    }
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//根据Id获取会员
User.statics.getUserById = function(Id) {
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

// 新增会员
User.statics.addUser = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("user");
    json.CreateDate = Date.now();
    json.UpdateDate = Date.now();
    encryptJSON(json.Password).then(result => {
      json.Password = result;
      json.save((err, res) => {
        if (res) {
          resolve(res); //新增的数据
        } else {
          reject(err);
        }
      })
    })
  })
}

//修改会员
User.statics.editUser = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Nick = json.Nick;
        result.Name = json.Name;
        result.Mobile = json.Mobile;
        result.Email = json.Email;
        result.Avatar = json.Avatar;
        result.Address = json.Address;
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

//上传用户头像
User.statics.uploadAvatar = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Avatar = json.Avatar;
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

//修改会员密码
User.statics.updatePassword = function(json, oldpwd) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        decryptJSON(oldpwd, result.Password).then(pass => {
          if (pass) {
            encryptJSON(json.Password).then(newpwd => {
              result.Password = newpwd;
              result.UpdateDate = json.UpdateDate;
              result.save((err, res) => {
                if (res) {
                  resolve(res);
                } else {
                  reject({ Message: err });
                }
              })
            })
          } else {
            reject({ Message: "旧密码不正确", Code: 400 });
          }
        })
      } else {
        reject({ Message: error });
      }
    })
  })
}

//删除会员
User.statics.delMember = function(Id) {
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

//会员升级
User.statics.userUpgrade = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Level = json.Level;
        result.UpdateDate = json.UpdateDate;
        result.save((error, res) => {
          resolve(res); //更新后的数据
        })
      } else {
        reject(error);
      }
    })
  })
}

let Users = mongoose.model('Users', User);
module.exports = Users;
