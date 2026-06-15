/**
 * 用户服务：登录、注册、推荐关系绑定
 */
const { User, Referral } = require('../models');
const { encrypt, decrypt, maskPhone } = require('../utils/crypto');
const { BizError } = require('../utils/response');

class UserService {
  /**
   * 一键登录：微信/支付宝授权后绑定手机号
   */
  async loginOrRegister({ platform, openid, phone, nickname, avatarUrl, referrerId }) {
    // 1. 查询已存在
    let user = null;
    if (platform === 'wx') user = await User.findOne({ where: { wxOpenid: openid } });
    else user = await User.findOne({ where: { aliUid: openid } });

    // 2. 二次校验手机号
    if (!user && phone) {
      const phoneEnc = encrypt(phone);
      user = await User.findOne({ where: { phone: phoneEnc } });
    }

    // 3. 校验推荐人有效性
    if (referrerId) {
      const refUser = await User.findByPk(referrerId);
      if (!refUser) referrerId = null;
    }

    // 4. 不存在则创建
    if (!user) {
      const phoneEnc = encrypt(phone);
      user = await User.create({
        phone: phoneEnc,
        nickname: nickname || `小吃客${Date.now().toString().slice(-4)}`,
        avatarUrl: avatarUrl || '',
        status: 0, // 新客户
        referrerId: referrerId || null,
        wxOpenid: platform === 'wx' ? openid : null,
        aliUid: platform === 'ali' ? openid : null
      });
      // 建立推荐关系
      if (referrerId) {
        await Referral.create({ referrerId, referredId: user.userId, status: 0 });
      }
    } else if (!user.wxOpenid && platform === 'wx') {
      await user.update({ wxOpenid: openid });
    } else if (!user.aliUid && platform === 'ali') {
      await user.update({ aliUid: openid });
    }

    return user;
  }

  async getInfo(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new BizError('用户不存在', 1404);
    const phone = decrypt(user.phone);
    return {
      userId: user.userId,
      phone: maskPhone(phone),
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      status: user.status,
      isOldCustomer: user.status === 1,
      referrerId: user.referrerId
    };
  }

  /** 绑定推荐人(扫码时调用) */
  async bindReferrer(userId, referrerId) {
    if (userId === referrerId) throw new BizError('不能推荐自己', 1401);
    const user = await User.findByPk(userId);
    if (user.referrerId) return user; // 已绑定过
    const ref = await User.findByPk(referrerId);
    if (!ref) throw new BizError('推荐人不存在', 1404);
    await user.update({ referrerId });
    await Referral.findOrCreate({
      where: { referredId: userId },
      defaults: { referrerId, referredId: userId, status: 0 }
    });
    return user;
  }
}

module.exports = new UserService();
