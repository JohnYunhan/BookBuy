new Vue({
  el: "#settle",
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
    searchKey: "",
    settleItem: [],
    sumPrice: [],
    settleList: sessionStorage.buyInfor, //结算信息
    settleSource: sessionStorage.source, //结算信息来源
    invoiceName: "", //发票抬头
    note: "", //留言
    isUpdate: false, //是否修改发票抬头
    invoice: false, //是否开具发票
    deliveryTime: "尽快配送", //配送时间
    deliveryDay: "今天", //配送日期
    selectNum: [], //选购数量
    freight: 0.5, //运费
    invoiceInfor: "图书", //发票信息
    Address: "", //收货地址
    Name: "", //收货人
    invoiceName: "",
    Mobile: "", //收货人手机
    // noteCount: 30,
    updateText: "设置",
    valid: true,
    nameError: "",
    mobileError: "",
    addressError: "",
    imageS: [],
  },
  created() {
    this.checkLogin();
    this.judgeSource();
  },
  methods: {
    //判断结算来源
    judgeSource() {
      //来源于购物车
      if (this.settleSource == "shoppingcart") {
        this.settleItem = JSON.parse(this.settleList);
      } else { //来源于图书详情
        this.settleItem.push(JSON.parse(this.settleList));
      }
      for (var i = 0; i < this.settleItem.length; i++) {
        this.selectNum.push(this.settleItem[i].count);
        this.sumPrice.push(this.settleItem[i].sumPrice);
        this.imageS.push(this.settleItem[i].Image);
      }
    },
    //跳转到图书详情页，查看详情
    lookDetail(id) {
      this.addClickCount();
      sessionStorage.setItem("lookBookId", id);
      location.href = "/book-detail";
    },
    //增加图书的点击次数
    addClickCount() {
      fetch("/api/addClickCount", {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code !== 200) {
          console.log(res.Message);
        }
      }).catch(function(error) {
        console.log(error)
      })
    },
    //确保选购数量为数字并且不超过库存
    ensureNum(index) {
      //选购数量
      var num = this.selectNum[index];
      //图书库存量
      var storage = this.settleItem[index].Storage;
      if (isNaN(num)) {
        Vue.set(this.selectNum, index, 1);
      } else {
        if (num > storage) {
          Vue.set(this.selectNum, index, storage);
        }
        if (num < 1) {
          Vue.set(this.selectNum, index, 1);
        }
      }
      //合计
      var sum = (this.settleItem[index].SellPrice * this.selectNum[index]).toFixed(1);
      Vue.set(this.sumPrice, index, sum);
    },
    minusNum(index) {
      //选购数量
      var num = this.selectNum[index];
      if (num > 1) {
        Vue.set(this.selectNum, index, num - 1);
      } else {
        Vue.set(this.selectNum, index, 1);
      }
      //合计
      var sum = (this.settleItem[index].SellPrice * this.selectNum[index]).toFixed(1);
      Vue.set(this.sumPrice, index, sum);
    },
    addNum(index) {
      //选购数量
      var num = this.selectNum[index];
      //图书库存量
      var storage = parseInt(this.settleItem[index].Storage);
      if (num < storage) {
        Vue.set(this.selectNum, index, num + 1);
      } else {
        Vue.set(this.selectNum, index, storage);
        layer.msg("已超库存", { icon: 0, time: 2500 })
      }
      //合计
      var sum = (this.settleItem[index].SellPrice * this.selectNum[index]).toFixed(1);
      Vue.set(this.sumPrice, index, sum);
    },
    updateInvoice() {
      this.isUpdate = !this.isUpdate;
      if (this.isUpdate) {
        this.updateText = "保存";
      } else {
        this.updateText = "设置";
      }
    },
    checkName() {
      if (this.Name === "") {
        this.valid = false;
        this.nameError = "请输入收货人";
      } else {
        this.nameError = "";
      }
    },
    checkMobile() {
      var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
      if (!reg.test(this.Mobile)) {
        this.valid = false;
        this.mobileError = "请输入正确的手机号"
      } else {
        this.mobileError = "";
      }
    },
    checkAddress() {
      if (this.Address === "") {
        this.valid = false;
        this.addressError = "请输入收货地址";
      } else {
        this.addressError = "";
      }
    },
    //提交订单
    submitOrder() {
      this.valid = true;
      this.checkName();
      this.checkMobile();
      this.checkAddress();
      if (this.valid) {
        var _this = this;
        var bookid = [];
        var bookname = [];
        var image = [];
        var count = [];
        var price = [];
        var invoiceInfor = "";
        for (var i = 0; i < this.settleItem.length; i++) {
          bookid.push(this.settleItem[i].BookId);
          bookname.push(this.settleItem[i].BookName);
          image.push(this.settleItem[i].Image);
          count.push(this.selectNum[i]);
          price.push(this.settleItem[i].SellPrice);
        };
        //选择了开具发票
        if (invoice) {
          invoiceInfor = this.invoiceName + "," + this.invoiceInfor;
        }
        var data = {
          "Nick": this.UsrName,
          "BookId": bookid,
          "BookName": bookname,
          "Image": image,
          "Price": price,
          "Count": count,
          "Freight": this.freight,
          "Total": this.totalPrice,
          "Name": this.Name,
          "Mobile": this.Mobile,
          "Address": this.Address,
          "Note": this.note,
          "DeliveryTime": this.deliveryDay + " " + this.deliveryTime,
          "InvoiceInfor": invoiceInfor
        };
        data = JSON.stringify(data);
        fetch("/api/addOrder", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data,
        }).then((result) => result.json()).then(function(res) {
          if (res.Code === 200) {
            _this.saveDelivery();
            if (_this.settleSource == "shoppingcart") {
              for (var j = 0; j < _this.settleItem.length; j++) {
                _this.delCart(j);
              }
            }
            sessionStorage.setItem("buyInfor", "");
            sessionStorage.setItem("totalPrice", "");
            sessionStorage.setItem("source", "");
            // location.href = "/finish-order";
            layer.msg(66666)
          } else {
            layer.msg("服务器错误，请稍后再试");
            console.log(res.Message);
          }
        }).catch(function(error) {
          layer.msg("服务器错误，请稍后再试")
          console.log(error)
        })
      } else {
        layer.msg("请完善收货信息", { icon: 0, time: 2500 });
      }
    },
    //如果结算来源于购物车
    delCart(index) {
      var _this = this;
      var data = { Id: this.settleItem[index].cartId };
      data = JSON.stringify(data);
      fetch("/api/delCar", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data,
      }).then((result) => result.json()).then(function(res) {
        if (res.Code === 200) {
          _this.getCart();
        } else {
          console.log(res.Message)
        }
      }).catch(error => {
        console.log(error)
      });
    },
    //提交订单时保存收货信息
    saveDelivery() {
      var data = {
        "Nick": this.UsrName,
        "Name": this.Name,
        "Mobile": this.Mobile,
        "Email": "",
        "Address": this.Address,
      };
      data = JSON.stringify(data);
      fetch("/api/editUser", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data,
      }).then((result) => result.json()).then(function(res) {
        if (res.Code === 200) {
          console.log(2333)
        }
      }).catch(function(error) {
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
    //获取用户信息
    getUserInfor() {
      fetch("/api/getUserById", {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          var usrItem = res.Data;
          this.Name = usrItem.Name;
          this.Mobile = usrItem.Mobile;
          this.Address = usrItem.Address;
          this.invoiceName = this.Name;
        } else {
          layer.msg("服务器错误，请稍后再试")
          console.log(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    //跳到首页
    toHome() {
      location.href = "/index";
    },
    toCart() {
      location.href = "/shoppingcart";
    },
    search() {},
    //验证是否登录
    checkLogin() {
      if (!localStorage.nick) {
        this.UsrName = "";
      } else {
        this.UsrName = localStorage.nick;
        this.getCart();
        this.getUserInfor();
      }
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
  watch: {

  },
  computed: {
    //订单总额
    totalPrice() {
      var total = 0;
      for (var i = 0; i < this.sumPrice.length; i++) {
        total += parseFloat(this.sumPrice[i]);
      }
      total = total + this.freight;
      return total.toFixed(1);
    },
    noteCount() {
      var len = this.note.length;
      var count = 40;
      count = count - len;
      if (count < 0) {
        count = 0;
        this.note = this.note.slice(0, 40);
        layer.msg("最多只能输入40个字", { icon: 0, time: 2500 });
      }
      return count;
    },
  },
})
