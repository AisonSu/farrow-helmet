module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档更新
        'style',    // 代码格式调整（不影响功能）
        'refactor', // 重构代码
        'perf',     // 性能优化
        'test',     // 测试相关
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回滚commit
        'build',    // 构建系统或外部依赖的变动
        'ci'        // CI配置文件和脚本的变动
      ]
    ],
    'subject-case': [0], // 不限制subject的大小写
    'subject-max-length': [2, 'always', 100] // subject最大长度100字符
  }
}