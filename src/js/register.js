new Vue({
  el: "#register",
  data: {
    Account: "",
    Nick: "",
    Password: "",
    Mobile: "",
    Pwd: "",
    confirmPassword: "",
    Email: "",
    nickError: "",
    pwdError: "",
    confirmPwdError: "",
    mobileError: "",
    handlerError: "",
    isValid: true,
    regValid: true,
    nickValid: false,
    mobileValid: false,
    pwdValid: false,
    confirmPwdValid: false,
  },
  created() {

  },
  methods: {
    checkNick() {
      this.nickValid = false;
      this.nickError = "";
      var reg_nick = /^([\u4e00-\u9fa5]|[a-zA-Z0-9]){2,10}$/;
      if (this.Nick === "") {
        this.nickError = "昵称不能为空";
        this.regValid = false;
        return this.regValid;
      }
      var length = this.Nick.length;
      if (length < 2 || length > 10) {
        this.nickError = "长度为2~10位";
        this.regValid = false;
        return this.regValid;
      }
      if (!reg_nick.test(this.Nick)) {
        this.nickError = "不能含有特殊字符";
        this.regValid = false;
        return this.regValid;
      }
      var _this = this;
      var data = {
        Nick: this.Nick,
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
          _this.regValid = false;
        } else {
          _this.nickValid = true;
        }
      })
    },
    checkMobile() {
      this.mobileValid = false;
      this.mobileError = "";
      var reg_mobile = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
      if (this.Mobile === "") {
        this.mobileError = "手机号不能为空";
        this.regValid = false;
        return this.regValid;
      }
      if (!reg_mobile.test(this.Mobile)) {
        this.mobileError = "手机号格式有误";
        this.regValid = false;
        return this.regValid;
      }
      var _this = this;
      var data = {
        Nick: "",
        Mobile: this.Mobile
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
          _this.regValid = false;
        } else {
          _this.mobileValid = true;
        }
      })
    },
    checkPwd() {
      this.pwdValid = false;
      this.pwdError = "";
      var reg_password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
      if (this.Pwd === "") {
        this.pwdError = "密码不能为空";
        this.regValid = false;
        return this.regValid;
      }
      var length = this.Pwd.length;
      if (length < 6 || length > 16) {
        this.pwdError = "长度为6~16位";
        this.regValid = false;
        return this.regValid;
      }
      if (!reg_password.test(this.Pwd)) {
        this.pwdError = "密码由6~16位数字和字母组成";
        this.regValid = false;
        return this.regValid;
      }
      this.pwdValid = true;
    },
    checkConfirmPwd() {
      this.confirmPwdValid = false;
      this.confirmPwdError = "";
      if (this.confirmPassword === "") {
        this.confirmPwdError = "确认密码不能为空";
        this.regValid = false;
        return this.regValid;
      }
      if (this.confirmPassword !== this.Pwd) {
        this.confirmPwdError = "确认密码与密码不一致";
        this.regValid = false;
        return this.regValid;
      }
      this.confirmPwdValid = true;
    },
    register() {
      var _this = this;
      this.regValid = true;
      this.checkNick();
      this.checkMobile();
      this.checkPassword();
      this.checkConfirmPwd();
      if (this.regValid) {
        var data = {
          Nick: this.Nick,
          Password: this.Pwd,
          Mobile: this.Mobile
        };
        data = JSON.stringify(data);
        fetch("/api/addUser", {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': "application/json"
          },
          body: data
        }).then(result => result.json()).then(res => {
          if (res.Code === 200) {
            layer.msg("注册成功", { icon: 1, time: 2500 })
            setTimeout(function() {
              location.href = "/index";
            }, 2500);
          } else {
            layer.msg(result.Message);
          }
        })
      }
    },
    toReg() {
      location.href = "/register";
    },
    toHome() {
      location.href = "/index";
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
  }
})
