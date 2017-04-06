/**
 * 图书
 */
let uniqid = require('uniqid'); //生成唯一id
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use native promises

let Book = mongoose.Schema({
  Id: {
    type: String,
    unique: true,
    index: true,
    // default: uniqid("book")
  },
  Name: {
    type: String,
    required: true,
    unique: true,
  },
  Author: {
    type: String,
    required: true
  },
  Category: {
    type: String,
    required: true,
  }, //图书类别
  Press: {
    type: String,
    required: true,
  }, //出版社
  PublishDate: {
    type: String,
    required: true,
  }, //出版社日期
  Edition: {
    type: Number,
    default: 1,
  }, //版次
  ISBN: {
    type: String,
    required: true,
  },
  WordsCount: {
    type: Number,
    required: true,
  }, //字数
  Abstract: {
    type: String,
    required: true,
  }, //简介
  Directory: {
    type: String,
    default: ""
  }, //目录  
  Image: {
    type: Array,
    default: [],
  },
  ListPrice: {
    type: Number,
    required: true,
  }, //定价
  SellPrice: {
    type: Number,
    required: true,
  }, //售价
  Count: {
    type: Number,
    required: true,
  }, //库存数量  
  ClickCount: {
    type: Number,
    default: 0
  }, //点击次数
  IsRecommend: {
    type: Boolean,
    default: false
  }, //是否推荐
  IsSoldOut: {
    type: Boolean,
    default: false
  }, //是否下架
  CreateDate: {
    type: Number,
    required: true,
  },
  UpdateDate: {
    type: Number,
    required: true,
  },
});

//获取最新图书(新到图书)
Book.statics.getNewBook = function(index, size) {
  return new Promise((resolve, reject) => {
    let query = this.find({ IsSoldOut: false });
    query.select("Name Id CreateDate");
    query.sort({ CreateDate: -1 }); //根据添加时间倒序
    query.skip(index * size); //跳过多少个数据
    query.limit(size); //限制Size条数据
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//获取最热图书(畅销榜)
Book.statics.getHotBook = function(index, size) {
  return new Promise((resolve, reject) => {
    let query = this.find({ ClickCount: { $gt: 0 } });
    query.select("Name Id ClickCount");
    query.sort({ ClickCount: -1 }); //根据添加时间倒序
    query.skip(index * size); //跳过多少个数据
    query.limit(size); //限制Size条数据
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//获取推荐图书
Book.statics.getRecommendBook = function(index, size) {
  return new Promise((resolve, reject) => {
    let query = this.find({ IsRecommend: true });
    query.select("Name Id Image ListPrice SellPrice");
    query.skip(index * size); //跳过多少个数据
    query.limit(size); //限制Size条数据
    query.exec((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    })
  })
}

//获取图书列表
Book.statics.getBookList = function(index, size, json) {
  return new Promise((resolve, reject) => {
    let query = "";
    let total = 0;
    if (json.Name !== "") {
      //根据图书名称搜索
      let name = new RegExp(json.Name); //创建正则表达式,i代表不区分大小写匹配
      query = this.find({ Name: { $regex: name } });
      total = this.find({ Name: { $regex: name } }).count();
    } else if (json.Author !== "") {
      //根据图书作者搜索
      let author = new RegExp(json.Author);
      query = this.find({ Author: { $regex: author } });
      total = this.find({ Author: { $regex: author } }).count();
    } else if (json.Press !== "") {
      //根据出版社搜索
      let press = new RegExp(json.Press);
      query = this.find({ Press: { $regex: press } });
      total = this.find({ Press: { $regex: press } }).count();
    } else if (json.Category !== "") {
      //根据分类搜索
      let category = new RegExp(json.Category);
      query = this.find({ Category: { $regex: category } });
      total = this.find({ Category: { $regex: category } }).count();
    } else {
      query = this.find();
      total = this.count();
      query.sort({ UpdateDate: -1 }); //根据添加日期倒序
      query.skip(index * size); //跳过多少个数据
      query.limit(size); //限制Size条数据
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

//根据Id获取图书
Book.statics.getBookById = function(Id) {
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

//增加图书
Book.statics.addBook = function(json) {
  return new Promise((resolve, reject) => {
    json.Id = uniqid("book");
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

//删除图书
Book.statics.delBook = function(Id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
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

//修改图书
Book.statics.editBook = function(json) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: json.Id });
    query.exec((error, result) => {
      if (result) {
        result.Name = json.Name;
        result.Author = json.Author;
        result.Press = json.Press;
        result.Category = json.Category;
        result.PublishDate = json.PublishDate;
        result.Edition = json.Edition;
        result.ISBN = json.ISBN;
        result.WordsCount = json.WordsCount;
        result.Abstract = json.Abstract;
        // result.Directory = json.Directory;
        result.Image = json.Image;
        result.ListPrice = json.ListPrice;
        result.SellPrice = json.SellPrice;
        result.Count = json.Count;
        result.IsRecommend = json.IsRecommend;
        result.IsSoldOut = json.IsSoldOut;
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

//增加图书的点击次数
Book.statics.addClickCount = function(Id) {
  return new Promise((resolve, reject) => {
    let query = this.findOne({ Id: Id });
    query.exec((error, result) => {
      if (result) {
        let count = result.ClickCount;
        result.ClickCount = count + 1;
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

let Books = mongoose.model('Books', Book);
module.exports = Books;
