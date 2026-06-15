// pages/index/index.js
const { request } = require('../../utils/request.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    isOldCustomer: false,
    inviteCount: 0,
    pendingCoupons: 0
  },

  onShow() {
    if (!app.globalData.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.loadData();
  },

  async loadData() {
    try {
      const [user, stats, coupons] = await Promise.all([
        request({ url: '/user/info' }),
        request({ url: '/referral/stats' }),
        request({ url: '/coupon/list' })
      ]);
      const usableCoupons = (coupons.data || []).filter(c => c.status === 0);
      this.setData({
        userInfo: user.data,
        isOldCustomer: user.data.isOldCustomer,
        inviteCount: stats.data.inviteCount,
        pendingCoupons: usableCoupons.length
      });
    } catch (e) { console.error(e); }
  },

  async onLoad(query) {
    if (query.referrerId && app.globalData.isLogin) {
      try {
        await request({ url: '/user/bind-referrer', method: 'POST', data: { referrerId: +query.referrerId } });
        wx.showToast({ title: '推荐关系已建立', icon: 'success' });
      } catch (e) {}
    }
  },

  goInvite() { wx.navigateTo({ url: '/pages/invite/invite' }); },
  goCoupons() { wx.switchTab({ url: '/pages/coupons/coupons' }); },
  goOrders() { wx.switchTab({ url: '/pages/orders/orders' }); },

  async quickOrder() {
    const amount = 50;
    wx.showActionSheet({
      itemList: ['微信支付', '支付宝支付'],
      success: async (res) => {
        const payType = res.tapIndex + 1;
        try {
          const order = await request({
            url: '/order/create', method: 'POST',
            data: { amount, payType, couponId: null }
          });
          if (order.code === 0) {
            wx.navigateTo({ url: `/pages/pay/pay?orderId=${order.data.orderId}&payType=${payType}` });
          }
        } catch (e) {}
      }
    });
  }
});
