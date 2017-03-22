/**
 * 通用函数
 */

const uniqid = require('uniqid'); //生成唯一id
const iron = require('iron'); //加密json数据
const bcrypt = require('bcryptjs');

// 生成一个随机ID
let createID = (placeholder = "book") => {
  return uniqid(placeholder);
  // return Date.now() + placeholder + parseInt(Math.random() * 10000);
}

/** 加密json数据 */
function encryptJSON(json) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(json, salt, function(err, hash) {
        resolve(hash); // 保持这个hash
      });
    });
  })
}

/** 解密json数据 */
function decryptJSON(clienPassword, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(clienPassword, hash, function(err, res) {
      resolve(res); // true or false
    });
  })
}

module.exports = {
  createID: createID,
  encryptJSON: encryptJSON,
  decryptJSON: decryptJSON
}
