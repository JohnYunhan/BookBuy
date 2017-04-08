new Vue({
  el: "#cart",
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
    cartItem: [],
    searchKey: "",
    selectNum: [], //购物车中每一件商品的数量
    checkedItem: [],
    allCheck: false,
    isChecked: [],
    sumPrice: [],
    Valid: true,
  },
  created() {
    this.checkLogin();
  },
  methods: {
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
          var sum = 0; //购物车中没件商品的合计价格
          this.selectNum = [];
          this.checkedItem = [];
          this.isChecked = [];
          this.sumPrice = [];
          if (this.cartItem.length !== 0) {
            for (var item of this.cartItem) {
              count += item.Count;
              sum = (item.SellPrice * item.Count).toFixed(1);
              this.selectNum.push(item.Count);
              this.checkedItem.push(false);
              this.isChecked.push(false);
              this.sumPrice.push(sum);
            }
          }
          this.carNum = count;
          // console.log(this.cartItem)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
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
    toCart() {
      location.href = "/shoppingcart";
    },
    //搜索图书
    search() {
      sessionStorage.setItem("searchKey", this.searchKey);
      location.href = "/book-list";
    },
    //选中某一件商品
    checkedBook(index) {
      if (this.checkedItem.indexOf(false) === -1) {
        this.allCheck = true;
      } else {
        this.allCheck = false;
      }
      //选中时加上背景色
      if (this.isChecked[index]) {
        Vue.set(this.isChecked, index, false);
        Vue.set(this.checkedItem, index, false);
      } else {
        Vue.set(this.isChecked, index, true);
        Vue.set(this.checkedItem, index, true);
      }
    },
    //全选
    checkedAll() {
      if (this.allCheck) {
        for (var i = 0; i < this.checkedItem.length; i++) {
          if (!this.checkedItem[i]) {
            Vue.set(this.checkedItem, i, true);
            Vue.set(this.isChecked, i, true);
          }
        }
      } else {
        for (var j = 0; j < this.checkedItem.length; j++) {
          if (this.checkedItem[j]) {
            Vue.set(this.checkedItem, j, false);
            Vue.set(this.isChecked, j, false);
          }
        }
      }
    },
    //确保选购数量为数字并且不超过库存
    ensureNum(index) {
      //选购数量
      var num = this.selectNum[index];
      //图书库存量
      var storage = this.cartItem[index].Storage;
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
      var sum = (this.cartItem[index].SellPrice * this.selectNum[index]).toFixed(1);
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
      var sum = (this.cartItem[index].SellPrice * this.selectNum[index]).toFixed(1);
      Vue.set(this.sumPrice, index, sum);
    },
    addNum(index) {
      //选购数量
      var num = this.selectNum[index];
      //图书库存量
      var storage = parseInt(this.cartItem[index].Storage);
      if (num < storage) {
        Vue.set(this.selectNum, index, num + 1);
      } else {
        Vue.set(this.selectNum, index, storage);
        layer.msg("已超库存", { icon: 0, time: 2500 })
      }
      //合计
      var sum = (this.cartItem[index].SellPrice * this.selectNum[index]).toFixed(1);
      Vue.set(this.sumPrice, index, sum);
    },
    del(index) {
      var _this = this;
      var data = { Id: this.cartItem[index].Id };
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
          layer.msg('删除成功', { icon: 1, time: 3000 });
          Vue.set(_this.sumPrice, index, 0);
          _this.getCart();
        } else {
          layer.msg('删除失败，请稍后再试', { icon: 0, time: 2500 });
          console.log(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      });
    },
    //删除购物车中的某一件商品
    delCart(index) {
      var _this = this;
      var confirm = layer.confirm('确定要删除吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        _this.del(index);
        layer.close(confirm)
      }, function() {
        layer.close(confirm)
      });
    },
    //批量删除
    batchDel() {
      if (this.totalPrice !== 0) {
        var _this = this;
        var id = "";
        var confirm = layer.confirm('确定要删除吗？', {
          btn: ['确定', '取消'] //按钮
        }, function() {
          for (var i = 0; i < _this.checkedItem.length; i++) {
            if (_this.checkedItem[i]) {
              _this.del(i);
            }
          }
        }, function() {
          layer.close(confirm)
        });
      } else {
        layer.msg('请选择要删除的图书', { icon: 0, time: 2500 });
      }
    },
    //批量删除之前判断是否选中了要删除的项
    //或者是结算之前是否选中了要结算的项
    judgeChecked() {
      var count = 0; //选中的删除项的数目
      for (var item of this.checkedItem) {
        if (item) {
          count++;
        }
      }
      if (count === 0) {
        this.Valid = false;
      }
    },
    //跳到结算页结算
    settleCart() {
      if (this.totalPrice !== 0) {
        var buyInfor = [];
        for (var i = 0; i < this.checkedItem.length; i++) {
          if (this.checkedItem[i]) {
            buyInfor.push({
              "cartId": this.cartItem[i].Id,
              "BookId": this.cartItem[i].BookId,
              "BookName": this.cartItem[i].BookName,
              "Category": this.cartItem[i].Category,
              "Image": this.cartItem[i].Image,
              "Author": this.cartItem[i].Author,
              "SellPrice": this.cartItem[i].SellPrice,
              "count": this.selectNum[i],
              "sumPrice": parseFloat(this.sumPrice[i]),
              "Storage": this.cartItem[i].Storage
            });
          }
        };
        //保存购书信息
        sessionStorage.setItem("buyInfor", JSON.stringify(buyInfor));
        sessionStorage.setItem("source", "shoppingcart");
        //跳转到结算页
        location.href = "/settlement";
      } else {
        layer.msg('请选择要结算的图书', { icon: 0, time: 2500 });
      }
    },
    //跳到首页
    toHome() {
      location.href = "/index";
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

  },
  computed: {
    //选购的图书总数
    selectedNum() {
      var count = 0;
      for (var j = 0; j < this.selectNum.length; j++) {
        if (this.checkedItem[j]) {
          count += this.selectNum[j];
        }
      }
      return count;
    },
    //选购的图书总额
    totalPrice() {
      var total = 0;
      for (var i = 0; i < this.sumPrice.length; i++) {
        if (this.checkedItem[i]) {
          total += parseFloat(this.sumPrice[i]);
        }
      }
      return total;
    },
  },
})
