// pages/login/login.js
const app = getApp();

Page({
  data: {},

  async wxLogin() {
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    const referrerId = current.options.referrerId ? +current.options.referrerId : null;
    try {
      await app.wxLogin(referrerId);
      wx.showToast({ title: '登录成功' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800);
    } catch (e) { wx.showToast({ title: '登录失败', icon: 'none' }); }
  },

  aliLogin() {
    wx.showModal({ title: '提示', content: '支付宝环境请使用 my.login', showCancel: false });
  }
});
