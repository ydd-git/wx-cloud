const express = require('express'); //web服务框架模块
const request = require('request'); //http请求模块
const fs = require('fs'); //文件系统模块
const path = require('path'); //文件路径模块
const sha1 = require('node-sha1'); //加密模块
const urlencode = require('urlencode'); //URL编译模块

/**
 * [设置验证微信接口配置参数]
 */
const config = {
  token: '', //对应测试号接口配置信息里填的token
  appid: 'wxf27535c4162e0fda', //对应测试号信息里的appID
  secret: '2bbe51ffdf6e053bde4fb02cd5521f3b', //对应测试号信息里的appsecret
  grant_type: 'client_credential' //默认
};

/**
 * [开启跨域便于接口访问]
 */
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); //访问控制允许来源：所有
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); //访问控制允许报头 X-Requested-With: xhr请求
  res.header('Access-Control-Allow-Metheds', 'PUT, POST, GET, DELETE, OPTIONS'); //访问控制允许方法
  res.header('X-Powered-By', 'nodejs'); //自定义头信息，表示服务端用nodejs
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});


/**
 * [验证微信接口配置信息，]
 */
app.get('/', function (req, res) {

  const token = config.token; //获取配置的token
  const signature = req.query.signature; //获取微信发送请求参数signature
  const nonce = req.query.nonce; //获取微信发送请求参数nonce
  const timestamp = req.query.timestamp; //获取微信发送请求参数timestamp

  const str = [token, timestamp, nonce].sort().join(''); //排序token、timestamp、nonce后转换为组合字符串
  const sha = sha1(str); //加密组合字符串

  //如果加密组合结果等于微信的请求参数signature，验证通过
  if (sha === signature) {
    const echostr = req.query.echostr; //获取微信请求参数echostr
    res.send(echostr + ''); //正常返回请求参数echostr
  } else {
    res.send('验证失败');
  }
});

/**
 * [创建请求微信网页授权接口链接]
 */
app.get('/authentication', function (req, res) {

  const appid = config.appid;
  const redirect_uri = urlencode("http://www.xxx.net/code"); //这里的url需要转为加密格式，它的作用是访问微信网页鉴权接口成功后微信会回调这个地址，并把code参数带在回调地址中
  const scope = 'snsapi_userinfo';
  const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=STATE&connect_redirect=1#wechat_redirect`;

  const html =
    `<!DOCTYPE html>
    <html>
        <head>
        <meta charset="utf-8" >
        <title>微信鉴权引导</title>
        </head>
        <body><a href="${url}">跳转到鉴权页面</a></body>
    </html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});


/**
 * 网页授权回调接口，可以获取code
 */
app.get('/code', function (req, res) {
  const code = req.query.code; //微信回调这个接口后会把code参数带过来
  getOpenId(code); //把code传入getOpenId方法   
});


/**
 * 获取openid
 * @param  { string } code [调用获取openid的接口需要code参数]
 */
function getOpenId(code) {
  const appid = config.appid;
  const secret = config.secret;

  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

  request(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      const openid = body.openid;
      getAccessToken(openid);   //获取openid成功后调用getAccessToken
    }

  });
}


/**
 * 获取access_token
 *  @param  { string } openid [发送模板消息的接口需要用到openid参数]
 */
function getAccessToken(openid) {
  const appid = config.appid;
  const secret = config.secret;
  const grant_type = config.grant_type;

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${appid}&secret=${secret}`;

  request(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      const access_token = JSON.parse(body).access_token;
      sendTemplateMsg(openid, access_token); //获取access_token成功后调用发送模板消息的方法

    } else {
      throw 'update access_token error';
    }
  });


}


/**
 * 发送模板消息
 * @param  { string } openid [发送模板消息的接口需要用到openid参数]
 * @param  { string } access_token [发送模板消息的接口需要用到access_token参数]
 */
function sendTemplateMsg(openid, access_token) {

  const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`; //发送模板消息的接口

  const requestData = { //发送模板消息的数据
    touser: openid,
    template_id: 'VOGsmJW8HIh4zq0Koiy9ewUiJlMDLS9Vrdj',
    url: 'http://weixin.qq.com/download',
    data: {
      first: {
        value: '身份信息',
        color: "#173177"
      },
      keyword1: {
        value: '张三',
        color: '#1d1d1d'
      },
      keyword2: {
        value: '男',
        color: '#1d1d1d'
      },
      keyword3: {
        value: '45',
        color: '#1d1d1d'
      },
      remark: {
        value: '已登记！',
        color: '#173177'
      }
    }
  };

  request({
    url: url,
    method: 'post',
    body: requestData,
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('模板消息推送成功');
    }
  });
}


const hostName = '127.0.0.1'; //ip或域名
const port = 8080; //端口
app.listen(port, hostName, function () {
  console.log(`服务器运行在http://${hostName}:${port}`);
});