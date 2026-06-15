# 小吃店"老带新"裂变营销小程序

> 一套面向小吃店的高性价比"老带新"裂变营销系统，支持微信小程序 + 支付宝小程序双端，覆盖用户端与商家管理后台。

## 🎯 核心特性

- 🔗 **裂变推荐**：老用户生成专属二维码，新用户扫码自动建立推荐关系
- 🎁 **双向激励**：老客得免单券（推荐奖励），新客得折扣券（首单优惠）
- 💰 **双支付通道**：微信支付 V3 + 支付宝小程序支付
- 🛡️ **防刷机制**：同手机号/设备/IP 多重防刷，限频限次
- 📊 **数据看板**：商家端实时查看拉新 ROI、裂变层级、转化漏斗
- 🚀 **云原生**：Docker + Kubernetes 部署，支持水平扩展

## 📁 仓库结构

```
snack-referral/
├── miniprogram-user/        # 用户端小程序（微信 + 支付宝）
│   ├── pages/
│   │   ├── index/           # 首页（推荐状态展示）
│   │   ├── invite/          # 邀请页（生成二维码）
│   │   ├── coupons/         # 我的权益券
│   │   ├── orders/          # 消费记录
│   │   └── pay/             # 支付页
│   ├── utils/               # 工具类（request, auth, qrcode）
│   ├── app.js
│   ├── app.json
│   └── app.wxss
├── miniprogram-merchant/    # 商家管理后台小程序
│   ├── pages/
│   │   ├── dashboard/       # 数据看板
│   │   ├── users/           # 用户管理
│   │   ├── orders/          # 订单管理
│   │   ├── coupons/         # 权益管理
│   │   └── settings/        # 系统设置
│   └── ...
├── server/                  # 后端服务（Node.js + Express）
│   ├── src/
│   │   ├── controllers/     # 业务控制器
│   │   ├── models/          # Sequelize 模型
│   │   ├── services/        # 业务服务层
│   │   ├── middlewares/     # 中间件（JWT/限流/防刷）
│   │   ├── routes/          # 路由
│   │   ├── utils/           # 工具（加密/签名/二维码）
│   │   └── config/          # 配置
│   ├── app.js
│   ├── package.json
│   └── .env.example
├── server/sql/              # 数据库脚本
│   └── schema.sql           # 6 张核心表
├── docs/                    # 项目文档
│   ├── 需求文档.md
│   ├── 接口文档.md
│   ├── 部署文档.md
│   └── 业务流程.md
└── README.md
```

## 🛠️ 技术栈

| 层级 | 选型 |
|---|---|
| 用户端 | 微信原生小程序（兼容支付宝小程序） |
| 商家端 | 微信原生小程序（管理后台） |
| 后端 | Node.js 18 + Express 4 + Sequelize 6 |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis 7.0 |
| 消息队列 | RabbitMQ 3.x（异步发券/通知） |
| 部署 | Docker + Docker Compose |

## 🚀 快速开始

### 1. 启动后端

```bash
cd server
cp .env.example .env       # 修改数据库/Redis/支付配置
npm install
mysql -u root -p < sql/schema.sql
npm run dev
```

后端默认监听 `http://localhost:3000`

### 2. 启动小程序

使用微信开发者工具导入 `miniprogram-user` 或 `miniprogram-merchant` 目录即可。

修改 `miniprogram-user/utils/config.js` 中的 `API_BASE` 指向你的后端地址。

## 📖 文档导航

- [需求文档](docs/需求文档.md) - 完整业务需求
- [接口文档](docs/接口文档.md) - REST API 详细说明
- [业务流程](docs/业务流程.md) - 核心业务流转图
- [部署文档](docs/部署文档.md) - 生产环境部署指南

## 📅 实施计划

| 阶段 | 周次 | 内容 |
|---|---|---|
| 1. 需求 | W1 | 需求确认、原型设计 |
| 2. 设计 | W2 | 数据库设计、接口设计、架构设计 |
| 3. 后端 | W3-W4 | 用户/订单/权益/推荐/通知模块 |
| 4. 前端 | W3-W5 | 用户端 + 商家端 + 支付对接 |
| 5. 联调 | W5 | 微信/支付宝支付对接 |
| 6. 测试 | W6 | 功能/性能/集成/压测 |
| 7. 上线 | W7 | 灰度发布 + 正式上线 |

## 🔒 安全要点

- 微信/支付宝 OAuth 一键登录，手机号+短信二次校验
- 手机号/AES 加密存储，全链路 HTTPS
- 支付回调签名验证
- 防刷单：手机号/设备/IP 多维度频控
- 限权益：每日发券上限、30 天过期、每单限 1 张

## 📄 License

MIT
