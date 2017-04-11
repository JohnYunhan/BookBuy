<header>
  <div class="header" flex="main:justify">
    <div class="header-left-logo">
      <img @click="toHome" src="img/logo.png" alt="BookBuy图书网">
      <span>用户注册</span>
    </div>
    <div class="header-right-manage">
      <div class="manage-left">
        <a href="javascript:;"><span class="glyphicon glyphicon-shopping-cart" aria-hidden="true"></span> 购物车&nbsp;<b>0</b></a>
        <span>|</span>
        <a href="javascript:;"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span> 我的订单</a>
        <span>|</span>
        <a href="javascript:;"><span class="glyphicon glyphicon-user" aria-hidden="true"></span> 我的账户</a>
        <span>|</span>
        <a href="javascript:;"><span class="glyphicon glyphicon-envelope" aria-hidden="true"></span> 留言</a>
      </div>
      <div class="manage-right">
        欢迎光临<b>BookBuy</b>图书网，<a href="javascript:;" @click="showLoginBox">[请登录]</a>
        <a @click="toReg" href="javascript:;">[免费注册]</a>
      </div>
    </div>
  </div>
</header>
