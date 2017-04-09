new Vue({
  el: "#book",
  data: {
    layer: null,
    Nick: "",
    Password: "",
    Mobile: "",
    Account: "",
    UsrName: "",
    errorInfor: "",
    isValid: true,
    searchKey: "",
    carNum: 0, //用户购物车中图书的数量
    categoryItem: [],
    // bookId: "book1sh5kqf7gaizjld9he",
    bookId: sessionStorage.lookBookId,
    bookItem: {},
    cartItem: [],
    areaItem: ["1栋", "2栋", "3栋", "4栋", "5栋", "6栋", "7栋", "8栋", "9栋", "10栋", "11栋", "12栋", "13栋", "14栋", "15栋", "16栋"],
    selectNum: 1, //用户选购数量
    addFalse: false,
    minusFalse: true,
    storage: 1,
    selestIndex: 1,
    hotBook: [],
    hotSearch: "",
    imageL: "",
    imageM: "",
    imageS: "",
  },
  created() {
    this.getCategory();
    this.checkLogin();
    this.getBookDetail();
    this.getHotBook();
  },
  methods: {
    getBookDetail() {
      fetch("/api/getBookById?Id=" + this.bookId, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.bookItem = res.Data;
          this.searchKey = this.bookItem.Name;
          this.storage = this.bookItem.Count;
          this.imageS = this.bookItem.Image[0];
          this.imageM = this.bookItem.Image[1];
          this.imageL = this.bookItem.Image[2];
        } else {
          this.bookItem = {};
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    // 增加选购数量
    addNum() {
      if (this.selectNum <= this.storage) {
        this.selectNum++;
        this.minusFalse = false;
      } else {
        this.addFalse = true;
      }
    },
    // 减少选购数量
    minusNum() {
      if (this.selectNum > 1) {
        this.selectNum--;
        this.addFalse = false;
      } else {
        this.minusFalse = true;
      }
    },
    // 立即购买
    purchase() {
      if (this.UsrName !== "") {
        //保存购书信息
        var totalPrice = (parseFloat(this.bookItem.SellPrice) * parseInt(this.selectNum)).toFixed(1);
        var buyInfor = {
          "BookId": this.bookItem.Id,
          "BookName": this.bookItem.Name,
          "Category": this.bookItem.Category,
          "Image": this.imageS,
          "SellPrice": this.bookItem.SellPrice,
          "count": this.selectNum,
          "sumPrice": totalPrice,
          "Author": this.bookItem.Author,
          "Storage": this.storage
        };
        sessionStorage.setItem("buyInfor", JSON.stringify(buyInfor));
        sessionStorage.setItem("source", "book-detail");
        //跳转到结算页
        location.href = "/settlement";
      } else {
        this.showLoginBox();
      }
    },
    // 加入购物车
    addToCart() {
      if (this.UsrName !== "") {
        var bookid = this.bookItem.Id;
        var type = "addCar"; //提交类型
        var count = parseInt(this.selectNum);
        var _this = this;
        //用户购物车中不存在当前图书时就添加，否则增加数量
        for (var item of this.cartItem) {
          if (item.BookId === bookid) {
            type = "editCar";
            count += item.Count;
          }
        }
        var data = {
          BookId: bookid,
          BookName: this.bookItem.Name,
          Category: this.bookItem.Category,
          Author: this.bookItem.Author,
          Image: this.imageS,
          Storage: this.bookItem.Count,
          SellPrice: this.bookItem.SellPrice,
          Count: count
        };
        data = JSON.stringify(data);
        fetch("/api/" + type, {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data,
        }).then((result) => result.json()).then(function(res) {
          if (res.Code === 200) {
            layer.msg('成功加入购物车', { icon: 1, time: 3000 });
            _this.getCart();
          } else {
            layer.msg('加入失败，请稍后再试', { icon: 0, time: 2500 });
            console.log(res.Message)
          }
        }).catch(function(error) {
          layer.msg("服务器错误，请稍后再试")
          console.log(error)
        })
      } else {
        this.showLoginBox();
      }
    },
    //跳到首页
    toHome() {
      location.href = "/index";
    },
    toReg() {
      location.href = "/register";
    },
    //跳到购物车页
    toCart() {
      if (!localStorage.nick) {
        this.UsrName = "";
        this.showLoginBox();
      } else {
        location.href = "/shoppingcart";
      }
    },
    //跳到指定图书类别
    toCategory() {},
    //搜索图书
    search() {
      sessionStorage.setItem("searchKey", this.searchKey);
      location.href = "/book-list";
    },
    //验证是否登录
    checkLogin() {
      var _this = this;
      fetch("/api/checkLogin", {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        }
      }).then(res => {
        if (res.Code === 200) {
          _this.UsrName = res.Nick;
          _this.getCart();
        } else {
          _this.UsrName = "";
        }
      }).catch(error => {
        console.log(error)
      })
    },
    // 获取用户的购物车
    getCart() {
      fetch("/api/getCarList", {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.cartItem = res.Data;
          //获取购物车图书总数
          var count = 0;
          if (this.cartItem.length !== 0) {
            for (var item of this.cartItem) {
              count += item.Count;
            }
          }
          this.carNum = count;
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    // 获取图书分类
    getCategory() {
      fetch("/api/getCategory", {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.categoryItem = res.Data;
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    getHotBook() {
      var data = {
        Index: 0,
        Size: 3
      };
      data = JSON.stringify(data);
      fetch("/api/getHotBook", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.hotBook = res.Data;
          this.hotSearch = this.hotBook[0].Name;
        } else {
          layer.msg(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    // 显示登录框
    showLoginBox() {
      this.layer = layer.open({
        type: 1,
        title: false,
        area: "360px",
        content: $("#loginbox"),
        shadeClose: false,
        closeBtn: 1,
      });
      // console.log(2333)
    },
    // 验证账号
    checkAccount() {
      if (this.Account === "" && this.Password !== "") {
        this.errorInfor = "请输入账号";
        this.isValid = false;
      } else if (this.Account === "" && this.Password === "") {
        this.errorInfor = "请输入账号和密码";
        this.isValid = false;
      } else {
        this.errorInfor = "";
      }
    },
    // 验证密码
    checkPassword() {
      if (this.Account !== "" && this.Password === "") {
        this.errorInfor = "请输入密码";
        this.isValid = false;
      } else if (this.Account === "" && this.Password === "") {
        this.errorInfor = "请输入账号和密码";
        this.isValid = false;
      } else {
        this.errorInfor = "";
      }
    },
    // 登录
    login() {
      var _this = this;
      this.isValid = true;
      this.checkAccount();
      this.checkPassword();
      if (this.isValid) {
        var data = { Password: this.Password };
        if (this.Account.length === 11) {
          data.Nick = "";
          data.Mobile = this.Account;
        } else {
          data.Nick = this.Account;
          data.Mobile = "";
        }
        data = JSON.stringify(data);
        fetch("/api/login", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(res => res.json()).then(result => {
          if (result.Code === 200) {
            this.UsrName = result.Data;
            layer.close(_this.layer)
          } else {
            this.errorInfor = result.Message;
          }
        }).catch(error => {
          layer.msg("服务器错误，请稍后再试")
          console.log(error)
        })
      }
    },
    // 登出
    loginOut() {
      var confirm = layer.confirm('确定要退出吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        fetch("/api/loginOut", {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          }
        }).then(res => {
          location.href = "/index";
        }).catch(error => {
          console.log(error)
        });
        layer.close(confirm)
      }, function() {
        layer.close(confirm)
      });
    },
  },
  watch: {
    //用户选购数量
    selectNum: function(val) {
      if (isNaN(val) || val < 1) {
        this.selectNum = 1;
      }
      if (val > this.storage) {
        this.selectNum = this.storage;
      }
    }
  },
  computed: {

  },
})
$(function() {
  $(".jqzoom").imagezoom();
  $("#thumblist li").hover(function() {
    //增加点击的li的class:tb-selected，去掉其他的tb-selecte
    $(this).parents("li").addClass("tb-selected").siblings().removeClass("tb-selected");
    //赋值属性
    $(".jqzoom").attr('src', $(this).find("img").attr("mid"));
    $(".jqzoom").attr('rel', $(this).find("img").attr("big"));
  });
});
