/**
 * 留言
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Note = mongoose.Schema({
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
  NoteMsg: {
    type: String,
    required: true,
  }, //留言
  Reply: {
    type: String,
    default: ""
  }, //回复
  NoteDate: {
    type: Number,
    required: true,
  }, //留言时间
  ReplyDate: {
    type: Number,
    required: true,
  }, //回复时间
  Status: {
    type: Number,
    default: 0
  }, //留言状态,0:待回复,1:已回复
});

//获取留言列表
Note.statics.getNoteList = function(usrid) {
  return new Promise((resolve, reject) => {
    let query = this.find({ UserId: usrid });
    query.sort({ NoteDate: -1 }); //根据日期倒序
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//新增留言
Note.statics.addNote = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("note");
    json.ReplyDate = Date.now();
    json.NoteDate = Date.now();
    json.save((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//回复留言
Note.statics.replyNote = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Reply = json.Reply;
        result.ReplyDate = Date.now();
        result.Status = 1;
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

//用户修改留言
Note.statics.editNote = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.NoteMsg = json.NoteMsg;
        result.NoteDate = Date.now();
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

//删除留言
Note.statics.delNote = function(id) {
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

let Notes = mongoose.model('Notes', Note);
module.exports = Notes;
