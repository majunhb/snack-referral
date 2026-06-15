-- =============================================
-- 小吃店"老带新"裂变营销小程序 数据库脚本
-- Version: V1.0
-- Date: 2026-06
-- =============================================

CREATE DATABASE IF NOT EXISTS `snack_referral`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `snack_referral`;

-- =============================================
-- 1. 用户表 t_user
-- =============================================
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `user_id`      BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `phone`        VARCHAR(11)  NOT NULL COMMENT '手机号(加密存储)',
  `nickname`     VARCHAR(64)  DEFAULT NULL COMMENT '用户昵称',
  `avatar_url`   VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status`       TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '0=新客户,1=老客户',
  `referrer_id`  BIGINT       DEFAULT NULL COMMENT '推荐人user_id',
  `wx_openid`    VARCHAR(64)  DEFAULT NULL COMMENT '微信openid',
  `ali_uid`      VARCHAR(64)  DEFAULT NULL COMMENT '支付宝uid',
  `create_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_referrer` (`referrer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 2. 权益券表 t_coupon
-- =============================================
DROP TABLE IF EXISTS `t_coupon`;
CREATE TABLE `t_coupon` (
  `coupon_id`       BIGINT         NOT NULL AUTO_INCREMENT COMMENT '券ID',
  `user_id`         BIGINT         NOT NULL COMMENT '所属用户ID',
  `coupon_type`     TINYINT(1)     NOT NULL COMMENT '1=免单券,2=折扣券',
  `status`          TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '0=未使用,1=已使用,2=已过期',
  `source_order_id` BIGINT         DEFAULT NULL COMMENT '来源订单ID',
  `source_user_id`  BIGINT         DEFAULT NULL COMMENT '触发券发放的新客户ID',
  `max_amount`      DECIMAL(10,2)  DEFAULT NULL COMMENT '免单上限金额(元)',
  `discount_rate`   DECIMAL(3,2)   DEFAULT NULL COMMENT '折扣率(0.8=8折)',
  `expire_time`     DATETIME       DEFAULT NULL COMMENT '过期时间',
  `create_time`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  `use_time`        DATETIME       DEFAULT NULL COMMENT '使用时间',
  PRIMARY KEY (`coupon_id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_expire` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权益券表';

-- =============================================
-- 3. 订单表 t_order
-- =============================================
DROP TABLE IF EXISTS `t_order`;
CREATE TABLE `t_order` (
  `order_id`        BIGINT         NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no`        VARCHAR(32)    NOT NULL COMMENT '业务订单号',
  `user_id`         BIGINT         NOT NULL COMMENT '下单用户ID',
  `amount`          DECIMAL(10,2)  NOT NULL COMMENT '订单总金额',
  `pay_amount`      DECIMAL(10,2)  NOT NULL COMMENT '实付金额',
  `pay_type`        TINYINT(1)     NOT NULL COMMENT '1=微信,2=支付宝',
  `pay_status`      TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '0=未支付,1=已支付,2=已退款',
  `is_first_order`  TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '是否首单 0=否 1=是',
  `coupon_used`     TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '是否使用权益券',
  `coupon_id`       BIGINT         DEFAULT NULL COMMENT '使用券ID',
  `discount_amount` DECIMAL(10,2)  DEFAULT 0.00 COMMENT '优惠金额',
  `create_time`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `pay_time`        DATETIME       DEFAULT NULL COMMENT '支付时间',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_pay_status` (`pay_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- =============================================
-- 4. 推荐关系表 t_referral
-- =============================================
DROP TABLE IF EXISTS `t_referral`;
CREATE TABLE `t_referral` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `referrer_id`   BIGINT       NOT NULL COMMENT '推荐人(老客)user_id',
  `referred_id`   BIGINT       NOT NULL COMMENT '被推荐人(新客)user_id',
  `status`        TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '0=待首单,1=已完成',
  `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '推荐关系建立时间',
  `complete_time` DATETIME     DEFAULT NULL COMMENT '首单完成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_referred` (`referred_id`),
  KEY `idx_referrer_status` (`referrer_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐关系表';

-- =============================================
-- 5. 系统配置表 t_config
-- =============================================
DROP TABLE IF EXISTS `t_config`;
CREATE TABLE `t_config` (
  `config_key`   VARCHAR(64)  NOT NULL COMMENT '配置key',
  `config_value` VARCHAR(255) NOT NULL COMMENT '配置value',
  `description`  VARCHAR(255) DEFAULT NULL COMMENT '说明',
  `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- =============================================
-- 初始化配置
-- =============================================
INSERT INTO `t_config`(`config_key`,`config_value`,`description`) VALUES
  ('coupon_free_max_amount', '30', '免单券单次封顶金额(元)'),
  ('coupon_discount_rate',   '0.85', '折扣券折扣率'),
  ('coupon_expire_days',     '30', '权益券有效期(天)'),
  ('referral_coupon_daily_limit', '5', '单用户每日发券上限'),
  ('coupon_per_order_limit', '1', '每单限用券数'),
  ('first_order_grant_coupon', '1', '新客首单后是否给推荐人发券 0否1是'),
  ('merchant_name',          '老王小吃店', '店铺名称');

-- =============================================
-- 商家管理员表 t_admin
-- =============================================
DROP TABLE IF EXISTS `t_admin`;
CREATE TABLE `t_admin` (
  `admin_id`    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username`    VARCHAR(64)  NOT NULL COMMENT '账号',
  `password`    VARCHAR(128) NOT NULL COMMENT '密码(bcrypt)',
  `role`        TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '1=普通管理员,9=超管',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家管理员表';

-- 初始管理员 账号:admin 密码:admin123 (bcrypt hash)
INSERT INTO `t_admin`(`username`,`password`,`role`) VALUES
  ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 9);
