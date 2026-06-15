/**
 * Sequelize 模型：使用原生 SQL 模式
 * 数据库初始化通过 sql/schema.sql 完成，这里仅做 ORM 映射
 */
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: false,
    pool: { max: 20, min: 0, idle: 10000 }
  }
);

// 用户表
const User = sequelize.define('t_user', {
  userId:     { field: 'user_id',     type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  phone:      { field: 'phone',       type: DataTypes.STRING(11) },
  nickname:   { field: 'nickname',    type: DataTypes.STRING(64) },
  avatarUrl:  { field: 'avatar_url',  type: DataTypes.STRING(255) },
  status:     { field: 'status',      type: DataTypes.TINYINT },
  referrerId: { field: 'referrer_id', type: DataTypes.BIGINT },
  wxOpenid:   { field: 'wx_openid',   type: DataTypes.STRING(64) },
  aliUid:     { field: 'ali_uid',     type: DataTypes.STRING(64) },
  createTime: { field: 'create_time', type: DataTypes.DATE },
  updateTime: { field: 'update_time', type: DataTypes.DATE }
}, { tableName: 't_user', timestamps: false, underscored: false });

// 权益券表
const Coupon = sequelize.define('t_coupon', {
  couponId:     { field: 'coupon_id',     type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  userId:       { field: 'user_id',       type: DataTypes.BIGINT },
  couponType:   { field: 'coupon_type',   type: DataTypes.TINYINT },
  status:       { field: 'status',        type: DataTypes.TINYINT },
  sourceOrderId:{ field: 'source_order_id',type: DataTypes.BIGINT },
  sourceUserId: { field: 'source_user_id',type: DataTypes.BIGINT },
  maxAmount:    { field: 'max_amount',    type: DataTypes.DECIMAL(10,2) },
  discountRate: { field: 'discount_rate', type: DataTypes.DECIMAL(3,2) },
  expireTime:   { field: 'expire_time',   type: DataTypes.DATE },
  createTime:   { field: 'create_time',   type: DataTypes.DATE },
  useTime:      { field: 'use_time',      type: DataTypes.DATE }
}, { tableName: 't_coupon', timestamps: false });

// 订单表
const Order = sequelize.define('t_order', {
  orderId:       { field: 'order_id',       type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  orderNo:       { field: 'order_no',       type: DataTypes.STRING(32) },
  userId:        { field: 'user_id',        type: DataTypes.BIGINT },
  amount:        { field: 'amount',         type: DataTypes.DECIMAL(10,2) },
  payAmount:     { field: 'pay_amount',     type: DataTypes.DECIMAL(10,2) },
  payType:       { field: 'pay_type',       type: DataTypes.TINYINT },
  payStatus:     { field: 'pay_status',     type: DataTypes.TINYINT },
  isFirstOrder:  { field: 'is_first_order', type: DataTypes.TINYINT },
  couponUsed:    { field: 'coupon_used',    type: DataTypes.TINYINT },
  couponId:      { field: 'coupon_id',      type: DataTypes.BIGINT },
  discountAmount:{ field: 'discount_amount',type: DataTypes.DECIMAL(10,2) },
  createTime:    { field: 'create_time',    type: DataTypes.DATE },
  payTime:       { field: 'pay_time',       type: DataTypes.DATE }
}, { tableName: 't_order', timestamps: false });

// 推荐关系表
const Referral = sequelize.define('t_referral', {
  id:            { field: 'id',            type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  referrerId:    { field: 'referrer_id',   type: DataTypes.BIGINT },
  referredId:    { field: 'referred_id',   type: DataTypes.BIGINT },
  status:        { field: 'status',        type: DataTypes.TINYINT },
  createTime:    { field: 'create_time',   type: DataTypes.DATE },
  completeTime:  { field: 'complete_time', type: DataTypes.DATE }
}, { tableName: 't_referral', timestamps: false });

// 系统配置
const Config = sequelize.define('t_config', {
  configKey:   { field: 'config_key',   type: DataTypes.STRING(64), primaryKey: true },
  configValue: { field: 'config_value', type: DataTypes.STRING(255) },
  description: { field: 'description',  type: DataTypes.STRING(255) },
  updateTime:  { field: 'update_time',  type: DataTypes.DATE }
}, { tableName: 't_config', timestamps: false });

// 管理员
const Admin = sequelize.define('t_admin', {
  adminId:    { field: 'admin_id',    type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  username:   { field: 'username',    type: DataTypes.STRING(64) },
  password:   { field: 'password',    type: DataTypes.STRING(128) },
  role:       { field: 'role',        type: DataTypes.TINYINT },
  createTime: { field: 'create_time', type: DataTypes.DATE }
}, { tableName: 't_admin', timestamps: false });

module.exports = { sequelize, User, Coupon, Order, Referral, Config, Admin };
