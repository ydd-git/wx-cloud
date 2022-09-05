
const {
  Config,
  Message,
  Weather,
  daliySoup } = require('./config')
const axios = require("axios");
const moment = require("moment");

const fetchWeather = async () => {
  const url = `https://v0.yiketianqi.com/api?unescape=1&version=v61&appid=85268131&appsecret=3R6IDLz4`
  return axios({
    url,
    method: 'GET',
  }).then(res => {
    console.log(res.data);
    return res.data
  })
}

const calBrithDay = (date) => {
  const currentYear = moment().year()
  const diff = moment(currentYear + '-' + date).diff(moment(), 'days')
  if (diff < 0) {
    return moment(currentYear + 1 + '-' + date).diff(moment(), 'days')
  }
  return diff
}


const fetchDaliySoup = () => {
  let random = Math.floor(Math.random() * 60)
  var requestInfo = {
    method: "POST",
    url: "https://eolink.o.apispace.com/myjj/common/aphorism/getAphorismList",
    headers: {
      "X-APISpace-Token": daliySoup.token,
      "Authorization-Type": "apikey",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    transformRequest: [
      function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'));
        return ret
      }
    ],
    data: {
      titleID: random
    }
  };
  return axios(requestInfo).then(res => {
    const random = Math.floor(Math.random() * 90)
    console.log(res.data.result);
    const result = JSON.parse(res.data.result[0].words)[random]
    return result.slice(3)
  })
}

const fetchDaliySoupEn = () => {
  let random = Math.ceil(Math.random() * 4) + 80
  var requestInfo = {
    method: "POST",
    url: "https://eolink.o.apispace.com/yymy/common/aphorism/getEnglishAphorismList",
    headers: {
      "X-APISpace-Token": daliySoup.token,
      "Authorization-Type": "apikey",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    transformRequest: [
      function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'));
        return ret
      }
    ],
    data: {
      titleID: random
    }
  };
  return axios(requestInfo).then(res => {
    console.log(res.data.result[0]);
    const random = Math.floor(Math.random() * 100)
    const result = JSON.parse(res.data.result[0].words)[random]
    console.log(result);
    return {
      zh: result.ch,
      en: result.en.slice(3)
    }
  })
}

module.exports = {
  fetchWeather,
  calBrithDay,
  fetchDaliySoup,
  fetchDaliySoupEn
}