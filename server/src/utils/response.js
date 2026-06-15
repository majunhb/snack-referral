/**
 * 统一响应格式工具
 */
class ApiResponse {
  static ok(data = null, msg = 'ok') {
    return { code: 0, msg, data };
  }
  static fail(code = 1, msg = 'error', data = null) {
    return { code, msg, data };
  }
}

/**
 * 业务异常类
 */
class BizError extends Error {
  constructor(msg, code = 1001) {
    super(msg);
    this.code = code;
  }
}

module.exports = { ApiResponse, BizError };
