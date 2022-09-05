const wechatAPI = require("wechat-api");
const moment = require("moment");
const { Config, Message, Weather, daliySoup } = require("./config");
const {
  fetchWeather,
  calBrithDay,
  fetchDaliySoup,
  fetchDaliySoupEn,
} = require("./task");

const api = new wechatAPI(Config.appid, Config.appsercret);

const sendMessage = async function () {
  const openid = Config.openid;
  const templateId = Config.templateId;
  const time = moment().locale("zh-cn").format("LLLL");
  const url = "http://weixin.qq.com/download";

  let daliySoup = await fetchDaliySoup();
  let daliySoupEn = await fetchDaliySoupEn();
  const { city, wea, tem1, tem2, humidity, win_speed } = await fetchWeather();
  const data = {
    first: {
      value: time,
      color: "#60AEF2",
    },
    city: {
      value: city,
      color: "#60AEF2",
    },
    weather: {
      value: wea,
      color: "#b28d0a",
    },
    maxTemperature: {
      value: tem1,
      color: "#dc1010",
    },
    minTemperature: {
      value: tem2,
      color: "#0ace3c",
    },
    windSpeed: {
      value: win_speed,
      color: "#6e6e6e",
    },
    wet: {
      value: humidity,
      color: "#1f95c5",
    },
    togetherDate: {
      value: moment().diff(moment(Message.togetherDate), "days") + "天",
      color: "#FEABB5",
    },
    birthDate1: {
      value: calBrithDay(Message.birthday1) + "天",
    },
    birthDate2: {
      value: calBrithDay(Message.birthday2) + "天",
    },
    daliySoup: {
      value: daliySoup,
      color: "#b28d0a",
    },
    noteEn: {
      value: daliySoupEn.en,
      color: "#879191",
    },
    noteZh: {
      value: daliySoupEn.zh,
      color: "#879191",
    },
  };
  api.sendTemplate(openid, templateId, url, data, function (err, result) {
    if (err) {
      console.log("err");
    } else {
      console.log(result);
    }
  });
};

// * * * * * *
// ┬ ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │ |
// │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
// │ │ │ │ └───── month (1 - 12)
// │ │ │ └────────── day of month (1 - 31)
// │ │ └─────────────── hour (0 - 23)
// │ └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

const schedule = require("node-schedule");
const scheduleCronstyle = () => {
  schedule.scheduleJob("00 30 7 * * *", () => {
    console.log("scheduleCronstyle:" + new Date());
    sendMessage();
  });
};

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("欢迎使用微信云托管！");
});

app.get("/send", (req, res) => {
  sendMessage();
});

const port = process.env.PORT || 80
app.listen(port, () => {
  // scheduleCronstyle();
  sendMessage();
  console.log('服务启动成功，端口：', port)
})
