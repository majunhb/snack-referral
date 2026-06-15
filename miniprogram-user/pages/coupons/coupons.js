// pages/coupons/coupons.js
const { request } = require('../../utils/request.js');

Page({
  data: {
    coupons: [],
    activeTab: 0,
    tabs: ['全部', '可使用', '已使用', '已过期']
  },

  onShow() { this.load(); },

  async load() {
    try {
      const res = await request({ url: '/coupon/list' });
      this.setData({ coupons: res.data || [] });
    } catch (e) {}
  },

  switchTab(e) {
    this.setData({ activeTab: +e.currentTarget.dataset.idx });
  },

  get filteredList() {
    const { coupons, activeTab } = this.data;
    if (activeTab === 0) return coupons;
    if (activeTab === 1) return coupons.filter(c => c.status === 0);
    if (activeTab === 2) return coupons.filter(c => c.status === 1);
    if (activeTab === 3) return coupons.filter(c => c.status === 2);
    return coupons;
  }
});
