let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
const jwtSecret = "zcvaetmbnhgpwegdfvcmghsdpdj"; //jwt密钥

//验证cookie头部信息,并取出来提供后续路由使用
function AuthCookie(req, res, next) {
  //如果有cookie就解密
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, jwtSecret, (error, decoded) => {
      if (!error) {
        // 解密成功
        let Id = decoded.Id;
        let Nick = decoded.Nick;
        let LoginDate = decoded.LoginDate;
        if (Id.indexOf("user") > -1) {
          //会员
          req.UserInfo = {
            Id: Id,
            Nick: Nick
          }
          next();
        }
      } else {
        // 解密失败说明过期了或者是假的
        res.clearCookie('token');
        req.UserInfo = {
          Id: "",
          Nick: ""
        };
      }
    })
  } else {
    req.UserInfo = {
      Id: "",
      Nick: ""
    };
    next();
  }
}

// 配置页面
function Page(req, res, next) {
  let pagename = req.params.pagename; //获取网页的名字
  req.pagename = pagename.replace(".html", "");
  next();
}

// 检查账号是否过期
function CheckLogin(req, res, next) {
  let userId = req.UserInfo.Id;
  if (userId === "") {
    res.redirect('/login');
  } else {
    next();
  }
}

module.exports = {
  AuthCookie,
  Page,
  CheckLogin
};
