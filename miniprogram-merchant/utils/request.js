// utils/request.js
let BASE_URL = 'http://localhost:3000/api';
function setBaseUrl(url) { BASE_URL = url; }
function request({ url, method = 'GET', data = {}, header = {} }) {
  const token = wx.getStorageSync('adminToken');
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url, method, data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...header
      },
      success: (res) => {
        if (res.statusCode === 401) {
          wx.removeStorageSync('adminToken');
          wx.reLaunch({ url: '/pages/login/login' });
          return reject(res.data);
        }
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else { wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' }); reject(res.data); }
      },
      fail: (err) => { wx.showToast({ title: '网络异常', icon: 'none' }); reject(err); }
    });
  });
}
module.exports = { request, setBaseUrl };
