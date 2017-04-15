let express = require('express');
let router = express.Router();
let Pictures = require("../models/picture");
let Books = require("../models/book");
let Users = require("../models/user");
let Orders = require("../models/order");
let Presses = require("../models/press");
let Categorys = require("../models/category");
let Cars = require("../models/shoppingcar");
let Notes = require("../models/note");
let Evaluates = require("../models/evaluate");
let Refunds = require("../models/refund");
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

//验证是否登录
router.get('/checkLogin', function(req, res, next) {
  if (!req.UserInfo.Nick) {
    res.send({ Nick: "", Code: 400 });
  } else {
    res.send({ Nick: req.UserInfo.Nick, Code: 200 });
  }
});

//注销登录
router.get('/loginOut', function(req, res, next) {
  res.clearCookie('token');
  req.UserInfo = {
    Id: "",
    Nick: ""
  };
  res.send({ Nick: req.UserInfo.Nick });
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

//增加图书的点击次数
router.get('/addClickCount', function(req, res, next) {
  let Id = req.query.Id;
  Books.addClickCount(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//下单之后减少图书的库存数量
router.post('/minusBookCount', function(req, res, next) {
  let id = req.body.Id;
  let count = req.body.Count;
  Books.minusBookCount(id, count).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据分类获取图书
router.get('/getBookByCategory', function(req, res, next) {
  let category = req.query.Category;
  Books.getBookByCategory(category).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据Id获取会员信息
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
    // Email: req.body.Email
  });
  Users.addUser(json).then(result => {
    res.cookie("token", setCookie({
      Id: result.Id,
      Nick: result.Nick,
      LoginDate: Date.now()
    }));
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//验证昵称、手机号是否已被注册
router.post('/checkRegister', function(req, res, next) {
  let nick = req.body.Nick;
  let mobile = req.body.Mobile;
  Users.checkRegister(nick, mobile).then(result => {
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
    UpdateDate: Date.now()
  });
  Users.editUser(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//修改会员密码
router.post('/updatePassword', function(req, res, next) {
  let json = new Users({
    Id: req.UserInfo.Id,
    Password: req.body.NewPassword,
    UpdateDate: Date.now()
  });
  let oldpwd = req.body.OldPassword;
  Users.updatePassword(json, oldpwd).then(result => {
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
    UserId: req.UserInfo.Id,
    BookId: req.body.BookId,
    BookName: req.body.BookName,
    Category: req.body.Category,
    Author: req.body.Author,
    Image: req.body.Image,
    Storage: req.body.Storage,
    SellPrice: req.body.SellPrice,
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
  Orders.getOrderList(req.body.Index, req.body.Size, req.UserInfo.Id).then(result => {
    res.send({ Data: result.Data, TotalCount: result.TotalCount, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//根据Id获取订单详情
router.get('/getOrderById', function(req, res, next) {
  let Id = req.query.Id;
  Orders.getOrderById(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//新增订单
router.post('/addOrder', function(req, res, next) {
  let json = new Orders({
    Id: req.body.Id,
    UserId: req.UserInfo.Id,
    Nick: req.body.Nick,
    BuyInfor: req.body.BuyInfor,
    Freight: req.body.Freight,
    Total: req.body.Total,
    Name: req.body.Name,
    Mobile: req.body.Mobile,
    Address: req.body.Address,
    Note: req.body.Note,
    DeliveryTime: req.body.DeliveryTime,
    InvoiceInfor: req.body.InvoiceInfor
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
    BuyInfor: req.body.BuyInfor,
    Freight: req.body.Freight,
    Total: req.body.Total,
    Name: req.body.Name,
    Mobile: req.body.Mobile,
    Address: req.body.Address,
    Note: req.body.Note,
    DeliveryTime: req.body.DeliveryTime,
    InvoiceInfor: req.body.InvoiceInfor,
    Status: req.body.Status
  });
  Orders.editOrder(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//删除订单
router.post('/setOrderStatus', function(req, res, next) {
  let json = new Orders({
    Id: req.body.Id,
    Status: req.body.Status
  });
  Orders.setOrderStatus(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//获取留言列表
router.get('/getNoteList', function(req, res, next) {
  Notes.getNoteList(req.UserInfo.Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: Code });
  })
});

//新增留言
router.post('/addNote', function(req, res, next) {
  let json = new Notes({
    UserId: req.UserInfo.Id,
    NoteMsg: req.body.NoteMsg
  });
  Notes.addNote(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//用户修改留言
router.post('/editNote', function(req, res, next) {
  let json = new Notes({
    Id: req.body.Id,
    NoteMsg: req.body.NoteMsg
  });
  Notes.editNote(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//删除购物车
router.post('/delNote', function(req, res, next) {
  let Id = req.body.Id;
  Notes.delNote(Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//获取图书评价列表
router.post('/getEvaluateList', function(req, res, next) {
  let index = req.body.Index,
    size = req.body.Size,
    userid = "",
    bookid = "";
  if (!req.body.BookId) {
    userid = req.UserInfo.Id;
  } else {
    bookid = req.body.BookId;
  }
  Evaluates.getEvaluateList(index, size, userid, bookid).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: Code });
  })
});

//新增图书评价
router.post('/addEvaluate', function(req, res, next) {
  let json = new Evaluates({
    UserId: req.UserInfo.Id,
    OrderId: req.body.OrderId,
    BookId: req.body.BookId,
    EvaluateMsg: req.body.EvaluateMsg,
    QualityRate: req.body.QualityRate,
    ServiceRate: req.body.ServiceRate,
    DeliveryRate: req.body.DeliveryRate
  });
  Evaluates.addEvaluate(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//用户修改图书评价
router.post('/editEvaluate', function(req, res, next) {
  let json = new Evaluates({
    Id: req.body.Id,
    EvaluateMsg: req.body.EvaluateMsg,
    QualityRate: req.body.QualityRate,
    ServiceRate: req.body.ServiceRate,
    DeliveryRate: req.body.DeliveryRate
  });
  Evaluates.editEvaluate(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//申请退换
router.post('/addRefund', function(req, res, next) {
  let json = new Refunds({
    UserId: req.UserInfo.Id,
    OrderId: req.body.OrderId,
    RefundMsg: req.body.RefundMsg,
    RefundType: req.body.RefundType,
  });
  Refunds.addRefund(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//修改申请
router.post('/editRefund', function(req, res, next) {
  let json = new Refunds({
    Id: req.body.Id,
    RefundMsg: req.body.RefundMsg,
    RefundType: req.body.RefundType
  });
  Refunds.editRefund(json).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: 400 });
  })
});

//取消申请
router.get('/cancelRefund', function(req, res, next) {
  Refunds.cancelRefund(req.query.Id).then(result => {
    res.send({ Data: result, Message: "执行成功", Code: 200 });
  }).catch(error => {
    res.send({ Message: error, Code: Code });
  })
});

module.exports = router;
