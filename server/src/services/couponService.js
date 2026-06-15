/**
 * 权益服务：发放、查询、使用
 */
const { Coupon, Config } = require('../models');
const { Op } = require('sequelize');
const { BizError } = require('../utils/response');

class CouponService {
  /** 获取用户所有券 */
  async listByUser(userId) {
    return await Coupon.findAll({
      where: { userId },
      order: [['createTime', 'DESC']]
    });
  }

  /** 给老客发免单券(异步) */
  async grantFreeCoupon(userId, sourceUserId, sourceOrderId) {
    const dailyLimit = parseInt((await this.getConfig('referral_coupon_daily_limit', '5')), 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await Coupon.count({
      where: { userId, createTime: { [Op.gte]: today } }
    });
    if (count >= dailyLimit) {
      throw new BizError(`今日发券已达上限(${dailyLimit})`, 1301);
    }
    const maxAmount = parseFloat((await this.getConfig('coupon_free_max_amount', '30')), 10);
    const expireDays = parseInt((await this.getConfig('coupon_expire_days', '30')), 10);
    const expireTime = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

    return await Coupon.create({
      userId, couponType: 1, status: 0,
      sourceOrderId, sourceUserId,
      maxAmount, expireTime
    });
  }

  /** 新客首单发折扣券 */
  async grantDiscountCoupon(userId) {
    const rate = parseFloat((await this.getConfig('coupon_discount_rate', '0.85')), 10);
    const expireDays = parseInt((await this.getConfig('coupon_expire_days', '30')), 10);
    const expireTime = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);
    return await Coupon.create({
      userId, couponType: 2, status: 0,
      discountRate: rate, expireTime
    });
  }

  /** 使用券（消费时） */
  async use(userId, couponId, orderAmount) {
    const c = await Coupon.findOne({ where: { couponId, userId } });
    if (!c) throw new BizError('券不存在', 1304);
    if (c.status !== 0) throw new BizError('券状态不可用', 1305);
    if (c.expireTime < new Date()) throw new BizError('券已过期', 1306);

    let discount = 0;
    if (c.couponType === 1) {
      discount = Math.min(Number(c.maxAmount), orderAmount);
    } else {
      discount = orderAmount * (1 - Number(c.discountRate));
    }
    return { coupon: c, discount: Number(discount.toFixed(2)) };
  }

  async getConfig(key, def = '') {
    const c = await Config.findByPk(key);
    return c ? c.configValue : def;
  }
}

module.exports = new CouponService();
