let express = require('express');
let router = express.Router();
let Pictures = require("../models/picture");
let Books = require("../models/book");
let Users = require("../models/user");
let Orders = require("../models/order");
let Presses = require("../models/press");
let Categorys = require("../models/category");
let Cars = require("../models/shoppingcar");
let jwt = require('jsonwebtoken');
const jwtSecret = "zcvaetmbnhgpwegdfvcmghsdpdj"; //jwt密钥

// 生成一个cookie
function setCookie(json) {
  return jwt.sign(json, jwtSecret, { expiresIn: 60 * 60 * 24 * 7 }); //七天过期
}

//会员登录
router.post('/login', function(req, res, next) {
  let json = new Users({
    Nick: req.body.Nick,
    Mobile: req.body.Mobile,
    Password: req.body.Password
  });
  Users.userLogin(json).then(result => {
    // console.log(result);
    res.cookie("token", setCookie({
      Id: result.Id,
      Nick: result.Nick,
      LoginDate: Date.now()
    }));
    res.send({ Data: result.Nick, Message: "登录成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error.Message, Code: error.Code });
  })
});

//获取轮播图
router.post('/getPicture', function(req, res, next) {
  Pictures.getPicture(req.body.Index, req.body.Size).then(result => {
    res.send({ Data: result.Data, TotalCount: result.TotalCount, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//获取最新图书(新到图书)
router.post('/getNewBook', function(req, res, next) {
  Books.getNewBook(req.body.Index, req.body.Size).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 500 });
  })
});

//获取最热图书(畅销榜)
router.post('/getHotBook', function(req, res, next) {
  Books.getHotBook(req.body.Index, req.body.Size).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 500 });
  })
});

router.post('/getRecommendBook', function(req, res, next) {
  Books.getRecommendBook(req.body.Index, req.body.Size).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 500 });
  })
});
//获取图书类别
router.get('/getCategory', function(req, res, next) {
  Categorys.getCategory().then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});
//获取图书列表
router.post('/getBookList', function(req, res, next) {
  // console.log(req.UserInfo.Id)
  let json = new Books({
    Name: req.body.Name,
    Author: req.body.Author,
    Press: req.body.Press,
    Category: req.body.Category
  });
  Books.getBookList(req.body.Index, req.body.Size, json).then(result => {
    res.send({ Data: result.Data, TotalCount: result.TotalCount, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据Id获取图书
router.get('/getBookById', function(req, res, next) {
  let Id = req.query.Id;
  Books.getBookById(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据Id获取会员
router.get('/getUserById', function(req, res, next) {
  let Id = req.UserInfo.Id;
  Users.getUserById(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//会员注册
router.post('/addUser', function(req, res, next) {
  let json = new Users({
    Nick: req.body.Nick,
    Name: req.body.Name,
    Password: req.body.Password,
    Mobile: req.body.Mobile,
    Email: req.body.Email
  });
  Users.addUser(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//修改会员
router.post('/editUser', function(req, res, next) {
  let json = new Users({
    Id: req.UserInfo.Id,
    Nick: req.body.Nick,
    Name: req.body.Name,
    Mobile: req.body.Mobile,
    Email: req.body.Email,
    Address: req.body.Address,
    UpdateDate: Date.now(),
    Valid: req.body.Valid
  });
  Users.editUser(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//修改会员密码
router.post('/setUserPassword', function(req, res, next) {
  let json = new Users({
    Id: req.UserInfo.Id,
    Password: req.body.NewPassword,
    UpdateDate: Date.now()
  });
  let oldpwd = req.body.OldPassword;
  Users.setUserPassword(json, oldpwd).then(result => {
    res.send({ Data: result, Message: "修改成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error.Message, Code: 400 });
  })
});

//获取购物车列表
router.get('/getCarList', function(req, res, next) {
  Cars.getCarList(req.UserInfo.Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: Code });
  })
});

//新增购物车
router.post('/addCar', function(req, res, next) {
  // console.log(req.UserInfo.Id)
  let json = new Cars({
    BookId: req.body.BookId,
    UserId: req.UserInfo.Id,
    Count: req.body.Count,
  });
  Cars.addCar(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据BookId查询用户购物车中是否已经存在此图书
router.get('/getCarByBookId', function(req, res, next) {
  Users.getCarByBookId(req.body.BookId).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//删除购物车
router.post('/delCar', function(req, res, next) {
  let Id = req.body.Id;
  Cars.delCar(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//修改购物车
router.post('/editCar', function(req, res, next) {
  let json = new Cars({
    BookId: req.body.BookId,
    UserId: req.UserInfo.Id,
    Count: req.body.Count,
  });
  Cars.editCar(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//获取订单列表
router.post('/getOrderList', function(req, res, next) {
  let json = new Orders({
    Id: req.body.Id,
    Nick: req.body.Nick,
    Status: req.body.Status
  });
  if (req.body.Status) {
    json.Status = parseInt(req.body.Status);
  }
  Orders.getOrderList(req.body.Index, req.body.Size, json).then(result => {
    res.send({ Data: result.Data, TotalCount: result.TotalCount, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据Id获取订单详情
router.post('/getOrderById', function(req, res, next) {
  let Id = req.body.Id;
  Orders.getOrderById(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//新增订单
router.post('/addOrder', function(req, res, next) {
  let json = new Orders({
    BookId: req.body.BookId,
    UserId: req.UserInfo.Id,
    Count: req.body.Count,
    Total: req.body.Total,
    Name: req.body.Name,
    Mobile: req.body.Mobile,
    Address: req.body.Address
  });
  Orders.addOrder(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//修改订单
router.post('/editOrder', function(req, res, next) {
  let json = new Orders({
    Id: req.body.Id,
    BookId: req.body.BookId,
    Count: req.body.Count,
    Total: req.body.Total,
    Name: req.body.Name,
    Mobile: req.body.Mobile,
    Address: req.body.Address,
    Status: req.body.Status
  });
  Orders.editOrder(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

module.exports = router;
