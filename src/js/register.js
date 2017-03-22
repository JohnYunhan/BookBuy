new Vue({
  el: "#register",
  data: {
    Nick: "",
    Password: "",
    Mobile: "",
    confirmPassword: "",
  },
  created() {

  },
  methods: {
    save() {
      var data = {
        Nick: this.Nick,
        Password: this.Password,
        Mobile: this.Mobile
      };
      data = JSON.stringify(data);
      fetch("/user/addUser", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': "application/json"
        },
        body: data
      }).then(res => res.json()).then(result => {
        if (result.Code === 200) {
          window.location.href = "/index";
        } else {
          layer.msg(result.Message);
        }
      })
    },
  }
})
