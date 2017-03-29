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
    bookId: "book1sh5kqf7gaizjld9he",
    bookItem: [],
    areaItem: ["1栋", "2栋", "3栋", "4栋", "5栋", "6栋", "7栋", "8栋", "9栋", "10栋", "11栋", "12栋", "13栋", "14栋", "15栋", "16栋"],
  },
  created() {
    this.getCategory();
    this.checkLogin();
    this.getBookDetail();
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
        } else {
          this.bookItem = [];
        }
      }).catch(error => {
        layer.msg("服务器错误，请稍后再试")
        console.log(error)
      })
    },
    toIndex() {},
    toCategory() {},
    //验证是否登录
    checkLogin() {
      if (localStorage.nick !== "" || typeof localStorage.nick !== "undefined") {
        this.UsrName = localStorage.nick;
      } else {
        this.UsrName = "";
      }
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
