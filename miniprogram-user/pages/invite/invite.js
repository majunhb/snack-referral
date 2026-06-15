// pages/invite/invite.js
const { request } = require('../../utils/request.js');

Page({
  data: {
    qrCode: '',
    inviteCount: 0,
    completedCount: 0
  },

  onShow() { this.load(); },

  async load() {
    try {
      const [qr, stats] = await Promise.all([
        request({ url: '/referral/generate' }),
        request({ url: '/referral/stats' })
      ]);
      this.setData({
        qrCode: qr.data.qrCode,
        inviteCount: stats.data.inviteCount,
        completedCount: stats.data.completedCount
      });
    } catch (e) { console.error(e); }
  },

  saveImage() {
    if (!this.data.qrCode) return;
    const fsm = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/qr.png`;
    const base64 = this.data.qrCode.replace(/^data:image\/\w+;base64,/, '');
    fsm.writeFile({
      filePath, data: base64, encoding: 'base64',
      success: () => {
        wx.saveImageToPhotosAlbum({
          filePath,
          success: () => wx.showToast({ title: '已保存到相册' })
        });
      }
    });
  },

  onShareAppMessage() {
    const userId = wx.getStorageSync('userId') || 0;
    return {
      title: '老王小吃请你吃霸王餐，扫码领 30 元免单券！',
      path: `/pages/index/index?referrerId=${userId}`
    };
  },

  copyLink() {
    const userId = wx.getStorageSync('userId') || 0;
    wx.setClipboardData({
      data: `https://你的域名.com/?referrerId=${userId}`,
      success: () => wx.showToast({ title: '链接已复制' })
    });
  }
});
