new Vue({
  el: "#account",
  data: {
    Account: "",
    Nick: "",
    Mobile: "",
    Password: "",
    isValid: true,
    carNum: 0, //用户购物车中图书的数量
    UsrName: "",
    errorInfor: "",
    noteMsg: "",
    newPwd: "",
    oldPwd: "",
    confirmPwd: "",
    orderItem: [],
    totalCount: 0,
    downBtn: true,
    usrItem: { Nick: "", Name: "", Mobile: "", Email: "", Address: "", },
    nickError: "",
    mobileError: "",
    emailError: "",
    nameError: "",
    addressError: "",
    completeValid: true,
    nickValid: false,
    mobileValid: false,
    emailValid: false,
    nameValid: false,
    addressValid: false,
    initUsrItem: {},
    pwdValid: true,
    oldPwd: "",
    newPwd: "",
    confirmPwd: "",
    oldPwdError: "",
    newPwdError: "",
    confirmPwdError: "",
    orderDetailItem: {},
    headers: { "Access-Control-Allow-Origin": "*" },
    QualityRate: 0,
    DeliveryRate: 0,
    ServiceRate: 0,
    errInfor: "",
    EvaluateMsg: "",
    loading: true,
  },
  created() {
    this.checkLogin();
  },
  methods: {
    openCompleteInfor() {
      var _this = this;
      this.layer = layer.open({
        type: 1,
        title: "完善个人信息",
        area: "350px",
        content: $("#completeInfor"),
        shadeClose: false,
        closeBtn: 1,
        cancel: function() {
          //取消修改后，将数据初始化
          _this.usrItem = _this.initUsrItem;
        }
      });
    },
    checkNick() {
      this.nickValid = false;
      this.nickError = "";
      var nick = this.usrItem.Nick;
      var length = nick.length;
      var test_nick = /^([\u4e00-\u9fa5]|[a-zA-Z0-9]){2,10}$/;
      if (nick === "") {
        this.nickError = "昵称不能为空";
        this.completeValid = false;
        return false;
      }
      if (length < 2 || length > 10) {
        this.nickError = "长度为2~10位";
        this.completeValid = false;
        return false;
      }
      if (!test_nick.test(nick)) {
        this.nickError = "不能含有特殊字符";
        this.completeValid = false;
        return false;
      }
      if (nick !== this.initUsrItem.Nick) {
        var _this = this;
        var data = {
          Nick: nick,
          Mobile: ""
        };
        data = JSON.stringify(data);
        fetch("/api/checkRegister", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            _this.nickError = "昵称已被注册";
            _this.completeValid = false;
          } else {
            _this.nickValid = true;
          }
        })
      } else {
        this.nickValid = true;
      }
    },
    checkMobile() {
      this.mobileValid = false;
      this.mobileError = "";
      var mobile = this.usrItem.Mobile;
      var test_mobile = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
      if (mobile === "") {
        this.mobileError = "手机号不能为空";
        this.completeValid = false;
        return false;
      }
      if (!test_mobile.test(mobile)) {
        this.mobileError = "手机号格式有误";
        this.completeValid = false;
        return false;
      }
      if (mobile !== this.initUsrItem.Mobile) {
        var _this = this;
        var data = {
          Nick: "",
          Mobile: mobile
        };
        data = JSON.stringify(data);
        fetch("/api/checkRegister", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            _this.mobileError = "手机号已被注册";
            _this.completeValid = false;
          } else {
            _this.mobileValid = true;
          }
        })
      } else {
        this.mobileValid = true;
      }
    },
    checkEmail() {
      this.emailValid = false;
      this.emailError = "";
      var email = this.usrItem.Email;
      var test_email = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
      if (!test_email.test(email) && email !== "") {
        this.emailError = "邮箱格式有误";
        this.completeValid = false;
        return false;
      }
      this.emailValid = true;
    },
    checkName() {
      this.nameValid = false;
      this.nameError = "";
      var name = this.usrItem.Name;
      var test_name = /[^\x00-\x80]/;
      if (!test_name.test(name) && name !== "") {
        this.nameError = "请输入正确的收货人姓名";
        this.completeValid = false;
        return false;
      }
      this.nameValid = true;
    },
    checkAddress() {
      this.addressValid = false;
      this.addressError = "";
      var address = this.usrItem.Address;
      var test_address = /^([\u4e00-\u9fa5]|[a-zA-Z0-9]){2,20}$/;
      if (!test_address.test(address) && address !== "") {
        this.addressError = "请输入正确的收货地址";
        this.completeValid = false;
        return false;
      }
      this.addressValid = true;
    },
    submitInfor() {
      var _this = this;
      this.completeValid = true;
      this.checkNick();
      this.checkMobile();
      this.checkEmail();
      this.checkName();
      this.checkAddress();
      if (this.completeValid) {
        var confirm = layer.confirm('确定要提交吗？', {
          btn: ['确定', '取消'] //按钮
        }, function() {
          var data = JSON.stringify(_this.usrItem);
          fetch("/api/editUser", {
            method: "POST",
            credentials: "include",
            headers: {
              'Content-Type': "application/json"
            },
            body: data
          }).then(result => result.json()).then(res => {
            if (res.Code === 200) {
              layer.msg("提交成功", { icon: 1, time: 2500 });
              layer.close(_this.layer);
            } else {
              layer.msg("提交失败，请稍后再试", { icon: 0, time: 2500 });
              console.log(res.Message);
            }
          }).catch(error => {
            console.log(error)
          })
          layer.close(confirm);
        }, function() {
          layer.close(confirm);
        });
      }
    },
    closeInfor() {
      layer.close(this.layer);
      this.usrItem = this.initUsrItem;
    },
    openUpdatePwd() {
      var _this = this;
      this.layer = layer.open({
        type: 1,
        title: "修改密码",
        area: "350px",
        content: $("#updatePwd"),
        shadeClose: false,
        closeBtn: 1,
        cancel: function() {
          //取消修改后，将数据初始化
          _this.closePwd();
        }
      });
    },
    checkOldPwd() {
      this.oldPwdError = "";
      if (this.oldPwd === "") {
        this.oldPwdError = "请输入旧密码";
        this.pwdValid = false;
      }
    },
    checkNewPwd() {
      this.newPwdError = "";
      var upd_password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
      if (this.newPwd === "") {
        this.newPwdError = "请输入新密码";
        this.pwdValid = false;
        return false;
      }
      var length = this.newPwd.length;
      if (length < 6 || length > 16) {
        this.newPwdError = "长度为6~16位";
        this.pwdValid = false;
        return false;
      }
      if (!upd_password.test(this.newPwd)) {
        this.newPwdError = "密码由6~16位数字和字母组成";
        this.pwdValid = false;
        return false;
      }
    },
    checkConfirmPwd() {
      this.confirmPwdError = "";
      if (this.confirmPwd === "") {
        this.confirmPwdError = "确认密码不能为空";
        this.pwdValid = false;
        return false;
      }
      if (this.confirmPwd !== this.newPwd) {
        this.confirmPwdError = "确认密码与密码不一致";
        this.pwdValid = false;
        return false;
      }
    },
    submitPwd() {
      var _this = this;
      this.pwdValid = true;
      this.checkOldPwd();
      this.checkNewPwd();
      this.checkConfirmPwd();
      if (this.pwdValid) {
        var data = {
          NewPassword: this.newPwd,
          OldPassword: this.oldPwd
        };
        data = JSON.stringify(data);
        fetch("/api/updatePassword", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            layer.msg("修改成功", { icon: 1, time: 2500 });
            _this.closePwd();
          } else {
            layer.msg(res.Message, { icon: 0, time: 2500 });
          }
        }).catch(error => {
          console.log(error)
        })
      }
    },
    closePwd() {
      layer.close(this.layer);
      this.oldPwd = "";
      this.newPwd = "";
      this.confirmPwd = "";
    },
    //待回复
    stayReply() {
      layer.msg("暂无可回复消息", { icon: 0 });
    },
    //提交评价
    submitEvaluate() {
      var data = {
        BookId: this.BookId[index],
        EvaluateMsg: this.EvaluateMsg[index],
        QualityRate: this.QualityRate[index],
        ServiceRate: this.ServiceRate[index],
        DeliveryRate: this.DeliveryRate[index]
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
          layer.msg("评价成功", { icon: 1, time: 2500 });
        }
        // console.log(res);
      }).catch(function(error) {
        console.log(error)
      })
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
          _this.getUserInfor();
          _this.getOrder();
        } else {
          _this.UsrName = "";
        }
      }).catch(error => {
        console.log(error)
      })
      document.getElementById("account").style.visibility = "visible";
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
          this.usrItem = res.Data;
          this.initUsrItem = this.usrItem;
        } else {
          console.log(res.Message)
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
    getOrder() {
      var data = {
        Index: 0,
        Size: 10,
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
          } else {
            this.downBtn = false;
          }
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    getOrderByStatus(status) {
      fetch("/api/getOrderByStatus?Status=" + status, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          this.orderItem = res.Data;
          for (var i = 0; i < this.orderItem.length; i++) {
            this.orderItem[i].BuyInfor = JSON.parse(this.orderItem[i].BuyInfor);
          }
        } else {
          console.log(res.Message)
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    uploadAvatarScucess(res, file) {
      this.usrItem.Avatar = URL.createObjectURL(file.raw);
      console.log(res);
      console.log(file);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    uploadAvatar(img) {
      var data = {
        Avatar: "http://yunhan723.top/image/" + img
      };
      data = JSON.stringify(data);
      fetch("/api/uploadAvatar", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(result => result.json()).then(res => {
        if (res.Code === 200) {
          layer.msg("上传成功", { icon: 1, time: 2500 });
        } else {
          layer.msg("上传失败，请稍后再试", { icon: 0, time: 2500 });
          console.log(res.Message);
        }
      }).catch(function(error) {
        console.log(error)
      })
    },
    //确认收货
    confirmReceived(index) {
      var _this = this;
      var confirm = layer.confirm('确定要确认收货吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        var data = {
          Id: _this.orderItem[index].Id,
          Status: 9,
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
            Vue.set(_this.orderItem[index], "Status", 9);
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
      this.orderIndex = index;
      this.OrderId = this.orderItem[index].Id;
      var buyinfor = this.orderItem[index].BuyInfor;
      this.BookId = [];
      for (var i = 0; i < buyinfor.length; i++) {
        this.BookId.push(buyinfor[i].BookId);
      }
    },
    //验证评价
    checkEvaluate() {
      var _this = this;
      setTimeout(function() {
        _this.errInfor = "";
      }, 3000);
      if (this.QualityRate === 0) {
        this.errInfor = "请评价图书质量";
        this.evaluateValid = false;
        return this.evaluateValid;
      }
      if (this.DeliveryRate === 0) {
        this.errInfor = "请评价送货速度";
        this.evaluateValid = false;
        return this.evaluateValid;
      }
      if (this.ServiceRate === 0) {
        this.errInfor = "请评价服务态度";
        this.evaluateValid = false;
        return this.evaluateValid;
      }
      if (this.EvaluateMsg === "") {
        this.errInfor = "请填写购买心得";
        this.evaluateValid = false;
        return this.evaluateValid;
      }
    },
    //提交评价
    submitEvaluate() {
      this.evaluateValid = true;
      this.checkEvaluate();
      if (this.evaluateValid) {
        var success_count = 0;
        var _this = this;
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
              success_count = success_count + 1;
              if (success_count === _this.BookId.length) {
                layer.msg("评价成功", { icon: 1, time: 2500 });
                _this.isEvaluated();
                _this.closeEvaluate();
              }
            } else {
              success_count = -1;
              console.log(res.Message);
              layer.msg("评价失败，稍后再试", { icon: 0, time: 2500 });
            }
          }).catch(function(error) {
            success_count = -1;
            console.log(error);
            layer.msg("评价失败，稍后再试", { icon: 0, time: 2500 });
          })
        }
      }
    },
    closeEvaluate() {
      this.EvaluateMsg = "";
      this.QualityRate = 0;
      this.DeliveryRate = 0;
      this.ServiceRate = 0;
      layer.close(this.layer);
    },
    //评价成功后将订单状态改为已评价
    isEvaluated() {
      var _this = this;
      var data = {
        Id: this.OrderId,
        Status: 6,
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
          Vue.set(_this.orderItem[_this.orderIndex], "Status", 6);
        } else {
          console.log(res.Message)
        }
      }).catch(function(error) {
        console.log(error);
      })
    },
    //再次购买
    againBuy(index) {
      var bookid = this.orderItem[index].BuyInfor[0].BookId;
      this.addClickCount(bookid);
      sessionStorage.setItem("lookBookId", bookid);
      location.href = "/book-detail";
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
      if (this.UsrName === "") {
        this.showLoginBox();
      } else {
        location.href = "/account";
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
  computed: {
    noteWordCount() {
      var len = this.noteMsg.length;
      if (len > 140) {
        len = 140;
        this.noteMsg = this.noteMsg.slice(0, 140);
        layer.msg("最多只能输入140个字", { icon: 0, time: 2500 });
      }
      return len;
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
