// pages/dashboard/dashboard.js
const { request } = require('../../utils/request.js');
const app = getApp();

Page({
  data: { report: null },

  onShow() {
    if (!app.globalData.isLogin && !wx.getStorageSync('adminToken')) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.load();
  },

  async load() {
    try {
      const res = await request({ url: '/admin/report' });
      this.setData({ report: res.data });
    } catch (e) {}
  }
});
