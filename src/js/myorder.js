new Vue({
  el: "#myorder",
  data: {
    Account: "",
    Nick: "",
    Password: "",
    isValid: true,
    carNum: 0, //用户购物车中图书的数量
    UsrName: "",
    errorInfor: "",
    totalCount: 0,
    cartItem: [],
    orderItem: [],
    orderDetailItem: {},
    upBtn: true,
    downBtn: false,
    page: 0,
    BookId: [],
    OrderId: "",
    EvaluateMsg: "",
    QualityRate: 0,
    ServiceRate: 0,
    DeliveryRate: 0,
  },
  created() {
    this.checkLogin();
  },
  methods: {
    getOrder(index, size) {
      var data = {
        Index: index,
        Size: size,
      };
      data = JSON.stringify(data);
      fetch("/api/getOrderList", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.orderItem = res.Data;
          for (var i = 0; i < this.orderItem.length; i++) {
            this.orderItem[i].BuyInfor = JSON.parse(this.orderItem[i].BuyInfor);
          }
          // console.log(this.orderItem)
          this.totalCount = res.TotalCount;
          if (this.totalCount == this.orderItem.length) {
            this.downBtn = true;
            // console.log(this.downBtn)
          } else {
            this.downBtn = false;
          }
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    //上一页
    upPage() {
      if (this.page > 0) {
        this.page = this.page - 1;
        this.downBtn = false;
        this.getOrder(this.page, 5);
      }
      if (this.page === 0) {
        this.upBtn = true;
      }
    },
    //下一页
    downPage() {
      var total = Math.ceil(this.totalCount / 1);
      if (this.page < total) {
        this.page = this.page + 1;
        this.upBtn = false;
        this.getOrder(this.page, 5);
      }
      if (this.page === total - 1) {
        this.downBtn = true;
      }
    },
    delOrder(id) {
      var _this = this;
      var confirm = layer.confirm('确定要删除吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        var data = {
          Id: id,
          Status: -1,
        };
        data = JSON.stringify(data);
        fetch("/api/setOrderStatus", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            layer.msg("删除成功", { icon: 1, time: 2500 });
            _this.getOrder(_this.page, 5);
          } else {
            console.log(res.Message)
            layer.msg("删除失败，请稍后再试", { icon: 0, time: 2500 });
          }
        }).catch(function(error) {
          console.log(error);
        })
        layer.close(confirm);
      }, function() {
        layer.close(confirm);
      });
    },
    //确认收货
    confirmReceived(id) {
      var _this = this;
      var confirm = layer.confirm('确定要确认收货吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        var data = {
          Id: id,
          Status: 3,
        };
        data = JSON.stringify(data);
        fetch("/api/setOrderStatus", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            layer.msg("确认成功", { icon: 1, time: 2500 });
            _this.getOrder(_this.page, 5);
          } else {
            console.log(res.Message)
            layer.msg("确认失败，请稍后再试", { icon: 0, time: 2500 });
          }
        }).catch(function(error) {
          console.log(error);
        })
        layer.close(confirm);
      }, function() {
        layer.close(confirm);
      });
    },
    lookDetail(bookid) {
      this.addClickCount(bookid);
      sessionStorage.setItem("lookBookId", bookid);
      location.href = "/book-detail";
    },
    //增加图书的点击次数
    addClickCount(bookid) {
      fetch("/api/addClickCount?Id=" + bookid, {
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
    orderDetail(index) {
      this.orderDetailItem = this.orderItem[index];
      // console.log(this.orderDetailItem)
      // this.orderDetailItem.BuyInfor = JSON.parse(this.orderItem[index].BuyInfor);
      // console.log(this.orderDetailItem.BuyInfor)
      layer.open({
        type: 1,
        title: "订单详情",
        content: $("#orderDetail"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {}
      });
    },
    //打开评价对话框
    openEvaluate(index) {
      this.layer = layer.open({
        type: 1,
        title: "评价订单",
        area: "540px",
        content: $("#evaluateOrder"),
        shadeClose: false,
        closeBtn: 1,
      });
      this.OrderId = this.orderItem[index].Id;
      var buyinfor = this.orderItem[index].BuyInfor;
      this.BookId = [];
      for (var i = 0; i < buyinfor.length; i++) {
        this.BookId.push(buyinfor[i].BookId);
      }
    },
    //提交评价
    submitEvaluate() {
      var valid = false;
      for (var id of this.BookId) {
        var data = {
          OrderId: this.OrderId,
          BookId: id,
          EvaluateMsg: this.EvaluateMsg,
          QualityRate: this.QualityRate,
          ServiceRate: this.ServiceRate,
          DeliveryRate: this.DeliveryRate
        };
        data = JSON.stringify(data);
        fetch("/api/addEvaluate", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            valid = true;
          }
          // console.log(res);
        }).catch(function(error) {
          console.log(error)
        })
      }
      if (valid) {
        layer.msg("评价成功", { icon: 1, time: 2500 });
      }
    },
    closeEvaluate() {
      this.EvaluateMsg = "";
      this.QualityRate = 0;
      this.DeliveryRate = 0;
      this.ServiceRate = 0;
      layer.close(this.layer);
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
          _this.getOrder(0, 5);
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
    toReg() {
      location.href = "/register";
    },
    toHome() {
      location.href = "/index";
    },
    toCart() {
      location.href = "/shoppingcart";
    },
    toMyorder() {
      location.href = "/myorder";
    },
    toMycount() {
      location.href = "/account";
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
  computed: {
    noteWordCount() {
      var len = this.noteMsg.length;
      var count = 140;
      count = count - len;
      if (count < 0) {
        count = 0;
        this.noteMsg = this.noteMsg.slice(0, 140);
        layer.msg("最多只能输入140个字", { icon: 0, time: 2500 });
      }
      return count;
    },
    evaluateCount() {
      var length = this.EvaluateMsg.length;
      var counts = 140;
      counts = counts - length;
      if (counts < 0) {
        counts = 0;
        this.EvaluateMsg = this.EvaluateMsg.slice(0, 140);
        layer.msg("最多只能输入140个字", { icon: 0, time: 2500 });
      }
      return counts;
    },
  },
  filters: {
    subDate: function(val) {
      if (!val) {
        return "";
      } else {
        return val.slice(0, 4) + "-" + val.slice(4, 6) + "-" + val.slice(6, 8);
      }
    },
    coverDate: function(val) {
      if (!val) {
        return "";
      } else {
        return val.slice(0, 4) + "-" + val.slice(4, 6) + "-" + val.slice(6, 8) + " " + val.slice(8, 10) + ":" + val.slice(10, 12) + ":" + val.slice(12, 14);
      }
    },
  },
})
