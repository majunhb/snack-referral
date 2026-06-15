// pages/login/login.js
const { request } = require('../../utils/request.js');
const { setToken } = require('../../utils/auth.js');

Page({
  data: { username: 'admin', password: 'admin123' },

  onInput(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); },

  async doLogin() {
    try {
      const res = await request({
        url: '/admin/login', method: 'POST',
        data: { username: this.data.username, password: this.data.password }
      });
      if (res.code === 0) {
        setToken(res.data.token);
        wx.switchTab({ url: '/pages/dashboard/dashboard' });
      }
    } catch (e) {}
  }
});
