/**
 * 商家管理后台路由
 */
const Router = require('express').Router;
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
const { Admin, User, Order, Coupon, Referral } = require('../models');
const { sign, verifyAdmin } = require('../middlewares/auth');
const { ApiResponse, BizError } = require('../utils/response');

const router = Router();

router.post('/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) throw new BizError('账号或密码错误', 2001);
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) throw new BizError('账号或密码错误', 2001);
    const token = sign({ adminId: admin.adminId, role: 'admin' });
    res.json(ApiResponse.ok({ token, username: admin.username, role: admin.role }));
  } catch (e) { next(e); }
});

router.get('/admin/users', verifyAdmin, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const where = {};
    if (status !== undefined && status !== '') where.status = status;
    if (keyword) where.nickname = { [Op.like]: `%${keyword}%` };
    const { count, rows } = await User.findAndCountAll({
      where, offset: (page - 1) * pageSize, limit: +pageSize, order: [['userId', 'DESC']]
    });
    res.json(ApiResponse.ok({ list: rows, total: count, page: +page, pageSize: +pageSize }));
  } catch (e) { next(e); }
});

router.get('/admin/orders', verifyAdmin, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, payStatus, isFirstOrder } = req.query;
    const where = {};
    if (payStatus !== undefined && payStatus !== '') where.payStatus = payStatus;
    if (isFirstOrder !== undefined && isFirstOrder !== '') where.isFirstOrder = isFirstOrder;
    const { count, rows } = await Order.findAndCountAll({
      where, include: [{ model: User, attributes: ['nickname', 'phone'] }],
      offset: (page - 1) * pageSize, limit: +pageSize, order: [['orderId', 'DESC']]
    });
    res.json(ApiResponse.ok({ list: rows, total: count, page: +page, pageSize: +pageSize }));
  } catch (e) { next(e); }
});

router.get('/admin/report', verifyAdmin, async (req, res, next) => {
  try {
    const [totalUsers, newUsers, oldUsers, paidOrders, totalRevenue, firstOrders] = await Promise.all([
      User.count(),
      User.count({ where: { status: 0 } }),
      User.count({ where: { status: 1 } }),
      Order.count({ where: { payStatus: 1 } }),
      Order.sum('payAmount', { where: { payStatus: 1 } }),
      Order.count({ where: { isFirstOrder: 1, payStatus: 1 } })
    ]);
    const couponCount = await Coupon.count();
    const referralCount = await Referral.count({ where: { status: 1 } });
    const couponGranted = await Coupon.count({ where: { couponType: 1 } });
    res.json(ApiResponse.ok({
      totalUsers, newUsers, oldUsers,
      paidOrders, totalRevenue: totalRevenue || 0,
      firstOrders, couponCount, referralCount,
      couponGranted,
      roi: couponGranted > 0
        ? ((totalRevenue || 0) / (couponGranted * 30)).toFixed(2)
        : '0'
    }));
  } catch (e) { next(e); }
});

router.post('/admin/config/update', verifyAdmin, async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const { Config } = require('../models');
    await Config.upsert({ configKey: key, configValue: String(value) });
    res.json(ApiResponse.ok());
  } catch (e) { next(e); }
});

router.get('/admin/config/list', verifyAdmin, async (req, res, next) => {
  try {
    const { Config } = require('../models');
    const list = await Config.findAll();
    res.json(ApiResponse.ok(list));
  } catch (e) { next(e); }
});

router.get('/admin/coupons', verifyAdmin, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, couponType } = req.query;
    const where = {};
    if (status !== undefined && status !== '') where.status = status;
    if (couponType !== undefined && couponType !== '') where.couponType = couponType;
    const { count, rows } = await Coupon.findAndCountAll({
      where, include: [{ model: User, attributes: ['nickname'] }],
      offset: (page - 1) * pageSize, limit: +pageSize, order: [['couponId', 'DESC']]
    });
    res.json(ApiResponse.ok({ list: rows, total: count, page: +page, pageSize: +pageSize }));
  } catch (e) { next(e); }
});

module.exports = router;
