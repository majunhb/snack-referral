module.exports = {
  setToken: t => wx.setStorageSync('adminToken', t),
  getToken: () => wx.getStorageSync('adminToken'),
  clearToken: () => wx.removeStorageSync('adminToken')
};
