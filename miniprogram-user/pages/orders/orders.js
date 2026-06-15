// pages/orders/orders.js
const { request } = require('../../utils/request.js');
const app = getApp();

Page({
  data: { orders: [] },
  onShow() { this.load(); },
  async load() {
    try {
      const res = await request({ url: '/order/list' });
      this.setData({ orders: res.data || [] });
    } catch (e) {}
  }
});
