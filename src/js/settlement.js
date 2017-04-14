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
    noteMsg: "",
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
        console.log(res);
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
        var buyInfor = this.settleItem;
        var category = [];
        var bookid = [];
        var invoiceInfor = "";
        var count = 0; //减去购买量之后的库存量
        for (var i = 0; i < buyInfor.length; i++) {
          buyInfor[i].count = this.selectNum[i];
          category.push(buyInfor[i].Category);
          bookid.push(buyInfor[i].BookId);
        };
        //选择了开具发票
        if (invoice) {
          invoiceInfor = this.invoiceName + "," + this.invoiceInfor;
        }
        var data = {
          "Id": this.createId(),
          "Nick": this.UsrName,
          "BuyInfor": JSON.stringify(buyInfor),
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
            for (var k = 0; k < bookid.length; k++) {
              count = parseInt(_this.settleItem[k].Storage) - parseInt(_this.selectNum[k]);
              _this.minusBookNum(bookid[k], count);
            }
            sessionStorage.setItem("buyInfor", "");
            sessionStorage.setItem("totalPrice", "");
            sessionStorage.setItem("source", "");
            //购买成功后用于推荐图书
            sessionStorage.setItem("category", category.toString());
            sessionStorage.setItem("bookid", bookid.toString());
            location.href = "/finish-order";
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
    //下单之后减少图书的库存数量
    minusBookNum(id, count) {
      var _this = this;
      var data = { Id: id, Count: count };
      data = JSON.stringify(data);
      fetch("/api/minusBookCount", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data,
      }).then((result) => result.json()).then(function(res) {
        if (res.Code !== 200) {
          console.log(res.Message)
        }
      }).catch(error => {
        console.log(error)
      });
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
    //根据当前时间生成订单id
    createId() {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      month = month > 9 ? month : "0" + month;
      var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
      var hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
      var minute = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
      var second = date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();
      var id = year + month + day + hours + minute + second;
      return id;
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
    toMycount() {
      location.href = "/account";
    },
    search() {},
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
          _this.getUserInfor();
        } else {
          _this.UsrName = "";
        }
      }).catch(error => {
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
    toReg() {
      location.href = "/register";
    },
    toMyorder() {
      location.href = "/myorder";
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
    // 留言
    openNote() {
      if (this.UsrName !== "") {
        this.layer = layer.open({
          type: 1,
          title: "留言",
          area: "400px",
          content: $("#note"),
          shadeClose: false,
          closeBtn: 1,
        });
      } else {
        this.showLoginBox();
      }
    },
    submitNote() {
      var _this = this;
      if (this.noteMsg !== "") {
        var confirm = layer.confirm('确定要提交吗？', {
          btn: ['确定', '取消'] //按钮
        }, function() {
          var data = {
            NoteMsg: _this.noteMsg
          };
          data = JSON.stringify(data);
          fetch("/api/addNote", {
            method: "POST",
            credentials: "include",
            headers: {
              'Content-Type': "application/json"
            },
            body: data
          }).then(result => result.json()).then(res => {
            if (res.Code === 200) {
              layer.msg("提交成功", { icon: 1, time: 2500 });
              _this.closeNote();
            } else {
              console.log(res.Message)
            }
          }).catch(error => {
            console.log(error)
          });
          layer.close(confirm)
        }, function() {
          layer.close(confirm)
        });
      } else {
        layer.msg("请输入留言信息");
      }
    },
    closeNote() {
      layer.close(this.layer);
      this.noteMsg = "";
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
      var count = 140;
      count = count - len;
      if (count < 0) {
        count = 0;
        this.note = this.note.slice(0, 140);
        layer.msg("最多只能输入140个字", { icon: 0, time: 2500 });
      }
      return count;
    },
    noteWordCount() {
      var length = this.noteMsg.length;
      var counts = 140;
      counts = counts - length;
      if (counts < 0) {
        counts = 0;
        this.noteMsg = this.noteMsg.slice(0, 140);
        layer.msg("最多只能输入140个字", { icon: 0, time: 2500 });
      }
      return counts;
    },
  },
})
