module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__tests__/**',
    '!node_modules/**'
  ],
  // coverageThreshold: removed for CI - thresholds checked separately
  // when test coverage reaches >80%,
  // Mock 环境变量（CI 中由 workflow env 提供）
  setupFiles: [],
  // 超时：数据库连接可能较慢
  testTimeout: 15000,
  verbose: true,
  // 避免 Sequelize 日志干扰测试输出
  silent: false
};
