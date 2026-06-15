// app.js
const { request, setBaseUrl } = require('./utils/request.js');
const { setToken, getToken } = require('./utils/auth.js');

setBaseUrl('http://localhost:3000/api');

App({
  onLaunch() {
    const token = getToken();
    if (token) this.globalData.isLogin = true;
  },
  globalData: { isLogin: false }
});
