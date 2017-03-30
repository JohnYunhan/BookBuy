let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let fs = require("fs");
let mongoose = require("mongoose");

let Api = require('./routes/api');
let { AuthCookie, Page } = require("./routes/authority");

let app = express();
app.locals.pages = {}; //设置一个缓存
app.set("env", "development"); //设置开发环境

const opts = {
  server: {
    //防止长期运行的程序出现数据库连接错误
    socketOptions: { keepAlive: 1 }
  }
};
mongoose.connect("mongodb://admin:123456@127.0.0.1:27017/BookBuyDB", opts); //连接测试库

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'src', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src')));

app.use(AuthCookie); //解密cookie，获取到登录信息

app.get('/', (req, res, next) => {
  // console.log(req.UserInfo.Id)
  res.redirect('/book-detail');
})

app.use('/api', Api); //会员api
// app.use(CheckLogin);
app.use('/:pagename', Page); //获取这个页面的名字设置成req.pagename

// 获取网页
app.get('/:pagename', (req, res, next) => {
  let pagename = req.pagename;
  // console.log(pagename)
  let realPath = "src/html/" + pagename + ".html";

  if (app.locals.pages[pagename]) {
    // 如果缓存有这个页面,就直接返回
    res.set('Content-Type', 'text/html');
    res.send(app.locals.pages[pagename]);
    return;
  } else {
    fs.readFile(realPath, "utf-8", (error, file) => {
      if (error) {
        res.redirect('/404');
      } else {
        res.set('Content-Type', 'text/html');
        // app.locals.pages[pagename] = file;//缓存这个文件
        res.send(file);
      }
    })
  }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.redirect(303, '/404');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ Message: err.Message, Code: err.Code });
    console.log(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.send({ Message: err.Message, Code: err.Code });
});


module.exports = app;
