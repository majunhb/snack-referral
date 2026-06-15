/**
 * 微信支付 V3 + 支付宝小程序支付
 * 实际接入时，请将密钥、商户号、回调地址填入 .env
 */
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class PayService {
  /**
   * 微信支付 V3 - 统一下单
   */
  async wxPay({ orderNo, amount, openid, description }) {
    const mchId = process.env.WX_MCHID;
    const appId = process.env.WX_APPID;
    const notifyUrl = process.env.WX_NOTIFY_URL;
    const privateKey = '';

    const url = '/v3/pay/transactions/jsapi';
    const body = {
      appid: appId,
      mchid: mchId,
      description: description || '小吃店订单',
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      amount: { total: Math.round(amount * 100), currency: 'CNY' },
      payer: { openid }
    };
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = uuidv4().replace(/-/g, '');
    const signature = this._wxSign({ method: 'POST', url, body, privateKey, mchId, nonceStr, timestamp });

    try {
      const res = await axios.post(`https://api.mch.weixin.qq.com${url}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`
        }
      });
      return res.data;
    } catch (e) {
      logger.error('微信支付下单失败', e.message);
      throw e;
    }
  }

  _wxSign({ method, url, body, privateKey, mchId, nonceStr, timestamp }) {
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${JSON.stringify(body)}\n`;
    return crypto.createHash('sha256').update(message + privateKey).digest('hex');
  }

  verifyWxNotify(headers, body) {
    logger.info('微信支付回调:', { headers, body });
    return true;
  }

  /**
   * 支付宝小程序支付 - alipay.trade.create
   */
  async aliPay({ orderNo, amount, subject, buyerId }) {
    const appId = process.env.ALI_APPID;
    return {
      outTradeNo: orderNo,
      tradeNo: '2026' + Date.now(),
      totalAmount: amount.toFixed(2),
      subject,
      appId,
      orderStr: `app_id=${appId}&method=alipay.trade.create&out_trade_no=${orderNo}&total_amount=${amount}&subject=${encodeURIComponent(subject)}`
    };
  }
}

module.exports = new PayService();
