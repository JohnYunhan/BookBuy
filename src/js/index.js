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
    picItem: [],
    newBook: [],
    hotBook: [],
    recommendBook: [],
    categoryItem: [],
    searchKey: "",
    cartItem: [],
    hotSearch: "",
  },
  created() {
    this.getCarousel();
    //轮播图初始化
    myFocus.set({
      id: 'carousel', //焦点图盒子ID
      pattern: 'mF_fancy', //风格应用的名称
      time: 4, //切换时间间隔(秒)
      trigger: 'click', //触发切换模式:'click'(点击)/'mouseover'(悬停)
      width: 1000, //设置图片区域宽度(像素)
      height: 300, //设置图片区域高度(像素)
      txtHeight: 'default' //文字层高度设置(像素),'default'为默认高度，0为隐藏
    });
    this.getNewBook();
    this.getHotBook();
    this.getRecommendBook();
    this.getCategory();
    this.checkLogin();
  },
  methods: {
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
      }).then(result => result.json()).then(res => {
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
    // 获取轮播图
    getCarousel() {
      var data = {
        Index: 0,
        Size: 5,
      };
      data = JSON.stringify(data);
      fetch("/api/getPicture", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.picItem = res.Data;
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
    toHome() {
      location.href = "/index";
    },
    toReg() {
      location.href = "/register";
    },
    toMyorder() {
      if (this.UsrName === "") {
        this.showLoginBox();
      } else {
        location.href = "/myorder";
      }
    },
    //跳到购物车页
    toCart() {
      if (this.UsrName === "") {
        this.showLoginBox();
      } else {
        location.href = "/shoppingcart";
      }
    },
    toMycount() {
      if (this.UsrName === "") {
        this.showLoginBox();
      } else {
        location.href = "/account";
      }
    },
    //跳转到图书详情页，查看详情
    lookDetail(id) {
      this.addClickCount(id);
      sessionStorage.setItem("lookBookId", id);
      location.href = "/book-detail";
    },
    //增加图书的点击次数
    addClickCount(id) {
      fetch("/api/addClickCount?Id=" + id, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code !== 200) {
          console.log(res.Message);
        }
        // console.log(res);
      }).catch(function(error) {
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
    //获取新到图书
    getNewBook() {
      var data = {
        Index: 0,
        Size: 10
      };
      data = JSON.stringify(data);
      fetch("/api/getNewBook", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.newBook = res.Data;
          // console.log(this.newBook)
        } else {
          layer.msg(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    //获取推荐图书
    getRecommendBook() {
      var data = {
        Index: 0,
        Size: 6
      };
      data = JSON.stringify(data);
      fetch("/api/getRecommendBook", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.recommendBook = res.Data;
        } else {
          layer.msg(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    //畅销榜
    getHotBook() {
      var data = {
        Index: 0,
        Size: 10
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
  }
})
