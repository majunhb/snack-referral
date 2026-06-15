// pages/orders/orders.js
const { request } = require('../../utils/request.js');
Page({
  data: { list: [], total: 0, page: 1, pageSize: 20 },
  onShow() { this.load(); },
  onReachBottom() {
    if (this.data.list.length < this.data.total) {
      this.setData({ page: this.data.page + 1 }, () => this.load(true));
    }
  },
  async load(append = false) {
    const res = await request({ url: `/admin/orders?page=${this.data.page}&pageSize=${this.data.pageSize}` });
    const list = append ? [...this.data.list, ...res.data.list] : res.data.list;
    this.setData({ list, total: res.data.total });
  }
});
