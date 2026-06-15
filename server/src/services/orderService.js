/**
 * 订单 + 推荐结算服务
 */
const { v4: uuidv4 } = require('uuid');
const { Order, User, Referral } = require('../models');
const { BizError } = require('../utils/response');
const couponService = require('./couponService');
const logger = require('../utils/logger');

class OrderService {
  /**
   * 创建订单
   */
  async createOrder({ userId, amount, payType, couponId }) {
    const user = await User.findByPk(userId);
    if (!user) throw new BizError('用户不存在', 1404);

    let payAmount = Number(amount);
    let discountAmount = 0;
    let couponUsed = 0;
    let usedCouponId = null;

    if (couponId) {
      const { discount } = await couponService.use(userId, couponId, payAmount);
      discountAmount = discount;
      payAmount = Number((payAmount - discount).toFixed(2));
      couponUsed = 1;
      usedCouponId = couponId;
    }

    const orderNo = 'SN' + Date.now() + Math.floor(Math.random() * 1000);
    const order = await Order.create({
      orderNo, userId, amount, payAmount,
      payType, payStatus: 0,
      isFirstOrder: user.status === 0 ? 1 : 0,
      couponUsed, couponId: usedCouponId, discountAmount
    });
    return order;
  }

  /**
   * 支付回调处理：核心裂变逻辑
   * - 新客首单后，给推荐人发免单券
   * - 标记推荐关系完成
   */
  async handlePaySuccess(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new BizError('订单不存在', 1504);
    if (order.payStatus === 1) return order;

    const user = await User.findByPk(order.userId);
    await order.update({ payStatus: 1, payTime: new Date() });

    if (order.isFirstOrder === 1 && user.status === 0) {
      // 1) 升级用户为老客
      await user.update({ status: 1 });
      // 2) 新客得折扣券
      await couponService.grantDiscountCoupon(user.userId);
      // 3) 推荐人得免单券
      if (user.referrerId) {
        try {
          await couponService.grantFreeCoupon(user.referrerId, user.userId, order.orderId);
          await Referral.update(
            { status: 1, completeTime: new Date() },
            { where: { referredId: user.userId } }
          );
          logger.info(`✅ 裂变奖励发放: 推荐人=${user.referrerId} 新客=${user.userId}`);
        } catch (e) {
          logger.error('发放裂变奖励失败', e);
        }
      }
    }
    return order;
  }

  async getDetail(orderId, userId) {
    return await Order.findOne({ where: { orderId, userId } });
  }

  async listByUser(userId) {
    return await Order.findAll({ where: { userId }, order: [['createTime', 'DESC']] });
  }
}

module.exports = new OrderService();
