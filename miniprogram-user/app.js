// app.js
const { request, setBaseUrl } = require('./utils/request.js');
const { setToken, getToken } = require('./utils/auth.js');

// ⚠️ 部署到生产环境时，改为你的后端域名
setBaseUrl('http://localhost:3000/api');

App({
  globalData: {
    userInfo: null,
    isLogin: false
  },

  onLaunch() {
    const token = getToken();
    if (token) this.globalData.isLogin = true;
  },

  /** 一键登录：微信 */
  async wxLogin(referrerId) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async ({ code }) => {
          try {
            const res = await request({
              url: '/user/login',
              method: 'POST',
              data: { platform: 'wx', openid: 'sim_' + code, phone: '', nickname: '', avatarUrl: '', referrerId }
            });
            if (res.code === 0) {
              setToken(res.data.token);
              wx.setStorageSync('userId', res.data.userId);
              this.globalData.userInfo = res.data;
              this.globalData.isLogin = true;
              resolve(res.data);
            } else reject(res);
          } catch (e) { reject(e); }
        },
        fail: reject
      });
    });
  }
});
