<header>
  <div class="header" flex="main:justify">
    <div v-if="UsrName == ''" class="head-left">
      欢迎光临<b>BookBuy</b>图书网，<a href="javascript:;" @click="showLoginBox">[请登录]</a>
      <a @click="toReg" href="javascript:;">[免费注册]</a>
    </div>
    <div v-else class="head_left">
      <span>Hi, </span>
      <a style="color: #f86d0d" href="javascript:;">{{UsrName}}</a>&nbsp; 欢迎光临BookBuy图书网 &nbsp;
      <a href="javascript:;" @click="loginOut"> [ 退出 ]</a>
    </div>
    <div class="head_right">
      <a @click="toCart" href="javascript:;"><span class="glyphicon glyphicon-shopping-cart" aria-hidden="true"></span> 购物车&nbsp;<b>{{carNum}}</b></a>
      <span>|</span>
      <a @click="toMyorder" href="javascript:;"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span> 我的订单</a>
      <span>|</span>
      <a href="javascript:;"><span class="glyphicon glyphicon-user" aria-hidden="true"></span> 我的账户</a>
      <span>|</span>
      <a href="javascript:;"><span class="glyphicon glyphicon-envelope" aria-hidden="true"></span> 留言</a>
    </div>
  </div>
</header>
    <!-- 导航、搜索 -->
<div class="wraps">
  <div class="wrap">
    <div class="seach-bar" flex="main:justify">
      <div class="logo" @click="toHome"><img src="img/logo.png" alt="BookBuy图书网"></div>
      <div style="width: 420px;" flex="dir:top cross:center" class="input-group">
        <div class="search-box" flex="cross:center">
          <input @keyup.enter="search" v-model="searchKey" style="display: inline;width: 340px;" type="text" class="form-control search" :placeholder="hotSearch">
          <span style="width: 45px" class="input-group-btn">
    <button @click="search" class="btn btn-default" type="button"><span style="font-size: 16px;" class="glyphicon glyphicon-search" aria-hidden="true"></span></button>
          </span>
        </div>
        <div class="hot-search">热搜:<a href="javascript:;" @click="lookDetail(item.Id)" v-for="(item,index) in hotBook" v-if="index<3">{{item.Name}}</a></div>
      </div>
      <div class="cart-order">
        <a @click="toCart" href="javascript:;" class="cart"><span style="font-size: 18px;" class="glyphicon glyphicon-shopping-cart" aria-hidden="true"></span> 购物车 <b>{{carNum}}</b></a><a href="javascript:;" class="myorder">我的订单</a>
      </div>
    </div>
    <nav>
      <ul flex="box:mean">
        <li class="selected">首页</li>
        <li>畅销榜</li>
        <li v-for="item in categoryItem">{{item.Name}}</li>
        <li>更多</li>
      </ul>
    </nav>
  </div>
</div>
