const Router = require('express').Router;
const userService = require('../services/userService');
const couponService = require('../services/couponService');
const orderService = require('../services/orderService');
const payService = require('../services/payService');
const { sign, verify } = require('../middlewares/auth');
const { registerLimit } = require('../middlewares/antiCheat');
const { ApiResponse, BizError } = require('../utils/response');
const QRCode = require('qrcode');

const router = Router();

// ========== 1. 用户相关 ==========
router.post('/user/login', registerLimit, async (req, res, next) => {
  try {
    const { platform, openid, phone, nickname, avatarUrl, referrerId } = req.body;
    if (!platform || !openid) throw new BizError('参数缺失', 1001);
    const user = await userService.loginOrRegister({ platform, openid, phone, nickname, avatarUrl, referrerId });
    const token = sign({ userId: user.userId, role: 'user' });
    res.json(ApiResponse.ok({ token, userId: user.userId, status: user.status }));
  } catch (e) { next(e); }
});

router.get('/user/info', verify, async (req, res, next) => {
  try {
    const info = await userService.getInfo(req.user.userId);
    res.json(ApiResponse.ok(info));
  } catch (e) { next(e); }
});

router.post('/user/bind-referrer', verify, async (req, res, next) => {
  try {
    const { referrerId } = req.body;
    const user = await userService.bindReferrer(req.user.userId, referrerId);
    res.json(ApiResponse.ok({ userId: user.userId, referrerId: user.referrerId }));
  } catch (e) { next(e); }
});

router.get('/referral/generate', verify, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const scene = `ref_${userId}_${Date.now()}`;
    const qrCodeDataUrl = await QRCode.toDataURL(`pages/index/index?referrerId=${userId}`, { width: 400 });
    res.json(ApiResponse.ok({ qrCode: qrCodeDataUrl, scene, referrerId: userId }));
  } catch (e) { next(e); }
});

router.get('/referral/stats', verify, async (req, res, next) => {
  try {
    const { Referral } = require('../models');
    const userId = req.user.userId;
    const total = await Referral.count({ where: { referrerId: userId } });
    const completed = await Referral.count({ where: { referrerId: userId, status: 1 } });
    res.json(ApiResponse.ok({
      inviteCount: total,
      completedCount: completed,
      pendingCount: total - completed,
      conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    }));
  } catch (e) { next(e); }
});

// ========== 2. 权益券相关 ==========
router.get('/coupon/list', verify, async (req, res, next) => {
  try {
    const list = await couponService.listByUser(req.user.userId);
    res.json(ApiResponse.ok(list));
  } catch (e) { next(e); }
});

router.post('/coupon/grant', async (req, res, next) => {
  try {
    const { userId, sourceUserId, sourceOrderId, type } = req.body;
    let coupon;
    if (type === 1) coupon = await couponService.grantFreeCoupon(userId, sourceUserId, sourceOrderId);
    else coupon = await couponService.grantDiscountCoupon(userId);
    res.json(ApiResponse.ok(coupon));
  } catch (e) { next(e); }
});

router.post('/coupon/use', verify, async (req, res, next) => {
  try {
    const { couponId, orderAmount } = req.body;
    const r = await couponService.use(req.user.userId, couponId, orderAmount);
    res.json(ApiResponse.ok(r));
  } catch (e) { next(e); }
});

// ========== 3. 订单 + 支付 ==========
router.post('/order/create', verify, async (req, res, next) => {
  try {
    const { amount, payType, couponId } = req.body;
    const order = await orderService.createOrder({ userId: req.user.userId, amount, payType, couponId });
    res.json(ApiResponse.ok(order));
  } catch (e) { next(e); }
});

router.post('/order/pay', verify, async (req, res, next) => {
  try {
    const { orderId, payType, openid } = req.body;
    const order = await orderService.getDetail(orderId, req.user.userId);
    if (!order) throw new BizError('订单不存在', 1504);
    if (order.payStatus === 1) throw new BizError('订单已支付', 1505);
    let payInfo = null;
    if (payType === 1) {
      payInfo = await payService.wxPay({
        orderNo: order.orderNo,
        amount: Number(order.payAmount),
        openid,
        description: '小吃店订单'
      });
    } else if (payType === 2) {
      payInfo = await payService.aliPay({
        orderNo: order.orderNo,
        amount: Number(order.payAmount),
        subject: '小吃店订单',
        buyerId: openid
      });
    }
    res.json(ApiResponse.ok(payInfo));
  } catch (e) { next(e); }
});

router.post('/order/pay-callback', async (req, res, next) => {
  try {
    const body = req.body;
    if (body.out_trade_no) {
      const valid = payService.verifyWxNotify(req.headers, body);
      if (!valid) return res.status(400).json({ code: 'FAIL', message: '签名失败' });
      const { Order } = require('../models');
      const order = await Order.findOne({ where: { orderNo: body.out_trade_no } });
      if (order) await orderService.handlePaySuccess(order.orderId);
      return res.json({ code: 'SUCCESS', message: '成功' });
    }
    if (body.out_trade_no) {
      const { Order } = require('../models');
      const order = await Order.findOne({ where: { orderNo: body.out_trade_no } });
      if (order) await orderService.handlePaySuccess(order.orderId);
      return res.send('success');
    }
    res.status(400).send('unknown payload');
  } catch (e) { next(e); }
});

router.get('/order/detail', verify, async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const order = await orderService.getDetail(orderId, req.user.userId);
    res.json(ApiResponse.ok(order));
  } catch (e) { next(e); }
});

router.get('/order/list', verify, async (req, res, next) => {
  try {
    const list = await orderService.listByUser(req.user.userId);
    res.json(ApiResponse.ok(list));
  } catch (e) { next(e); }
});

module.exports = router;
