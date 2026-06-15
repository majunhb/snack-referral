const CryptoJS = require('crypto-js');

const key = CryptoJS.enc.Utf8.parse(process.env.AES_KEY || 'this_is_a_32byte_key_for_aes_enc!!');

/** AES 加密（手机号等敏感信息） */
function encrypt(text) {
  if (text == null) return null;
  const encrypted = CryptoJS.AES.encrypt(String(text), key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

/** AES 解密 */
function decrypt(cipher) {
  if (cipher == null) return null;
  const decrypted = CryptoJS.AES.decrypt(cipher, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/** 隐藏手机号中间4位 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

module.exports = { encrypt, decrypt, maskPhone };
