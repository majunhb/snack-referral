// pages/settings/settings.js
const { request } = require('../../utils/request.js');
Page({
  data: { configs: [] },
  onShow() { this.load(); },
  async load() {
    const res = await request({ url: '/admin/config/list' });
    this.setData({ configs: res.data || [] });
  }
});
