// utils/auth.js
function setToken(token) { wx.setStorageSync('token', token); }
function getToken() { return wx.getStorageSync('token'); }
function clearToken() { wx.removeStorageSync('token'); }
module.exports = { setToken, getToken, clearToken };
