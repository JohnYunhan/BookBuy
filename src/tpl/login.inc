 <div id="loginbox">
  <div class="login-item login-title">欢迎登录BookBuy图书网</div>
  <div class="input-group login-item">
    <span class="input-group-addon"><span class="glyphicon glyphicon-user"></span></span>
    <input type="text" class="form-control" placeholder="昵称或手机号" v-model="Account" autofocus @input="checkAccount" @keyup.enter="login" />
  </div>
  <div class="input-group login-item">
    <span class="input-group-addon"><span class="glyphicon glyphicon-lock"></span></span>
    <input type="password" class="form-control" placeholder="密码" @input="checkPassword" @keyup.enter="login" v-model="Password" />
  </div>
  <p class="error-infor">{{errorInfor}}</p>
  <div>
    <button class="login-btn" type="button" @click="login">登 录</button>
  </div>
  <div class="other-item" flex="main:justify"><span>没有账号？<a @click="toReg" href="javascript:;">注册</a></span><a href="javascript:;">忘记密码</a></div>
</div>
