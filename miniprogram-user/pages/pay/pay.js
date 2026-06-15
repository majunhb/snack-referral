// pages/pay/pay.js
const { request } = require('../../utils/request.js');

Page({
  data: {
    orderId: 0,
    payType: 1,
    order: null,
    payInfo: null
  },

  onLoad(query) {
    this.setData({ orderId: query.orderId, payType: +query.payType || 1 });
    this.loadOrder();
  },

  async loadOrder() {
    const res = await request({ url: `/order/detail?orderId=${this.data.orderId}` });
    this.setData({ order: res.data });
  },

  async doPay() {
    wx.showLoading({ title: '唤起支付...' });
    try {
      const res = await request({
        url: '/order/pay', method: 'POST',
        data: { orderId: this.data.orderId, payType: this.data.payType, openid: 'simulated_openid' }
      });
      wx.hideLoading();
      this.setData({ payInfo: res.data });
      wx.showModal({
        title: '模拟支付',
        content: '真实环境将调起微信/支付宝。已收到下单响应。',
        showCancel: false,
        success: () => {
          wx.showToast({ title: '支付演示完成' });
          setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 1000);
        }
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '支付失败', icon: 'none' });
    }
  }
});
