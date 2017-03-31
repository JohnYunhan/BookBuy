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
    carNum: 0, //用户购物车中图书的数量
    categoryItem: [],
    bookItem: [],
    cartItem: [],
    searchKey: sessionStorage.searchKey,
  },
  created() {
    this.getCategory();
    this.checkLogin();
    this.getBook();
  },
  methods: {
    //获取图书列表
    getBook() {
      var data = {
        Index: 0,
        Size: 10,
        Name: this.searchKey,
        Author: "",
        Press: "",
        Category: "",
      };
      data = JSON.stringify(data);
      fetch("/api/getBookList", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.bookItem = res.Data;
        } else {
          layer.msg("服务器错误，请稍后再试")
          console.log(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    //跳转到图书详情页，查看详情
    lookDetail(id) {
      sessionStorage.setItem("lookBookId", id);
      location.href = "/book-detail";
    },
    //搜索图书
    search() {
      sessionStorage.setItem("searchKey", this.searchKey);
      this.getBook();
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
    // 立即购买
    purchase() {
      if (this.UsrName !== "") {
        //保存购书信息
        sessionStorage.setItem("buyBookId", this.bookItem.Id);
        sessionStorage.setItem("buyCount", this.selectNum);
        //跳转到结算页
        // location.href = "/settlement";
      } else {
        this.showLoginBox();
      }
    },
    // 加入购物车
    addToCart(bookid) {
      if (this.UsrName !== "") {
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
    //验证是否登录
    checkLogin() {
      if (!localStorage.nick) {
        this.UsrName = "";
      } else {
        this.UsrName = localStorage.nick;
        this.getCart();
      }
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
            localStorage.nick = this.UsrName;
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
      localStorage.nick = "";
      location.href = "/index";
    },
  },
})
