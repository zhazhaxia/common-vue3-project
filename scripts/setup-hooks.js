/**
 * 设置Git hooks脚本
 * 用于创建pre-commit钩子，确保代码提交前运行lint检查
 */

import fs from 'fs';
import path from 'path';

const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;

// 检查并创建.husky目录
const huskyDir = path.join(process.cwd(), '.husky');
if (!fs.existsSync(huskyDir)) {
  fs.mkdirSync(huskyDir, { recursive: true });
  console.log('✅ 创建 .husky 目录');
}

// 检查并创建pre-commit钩子
if (!fs.existsSync(hookPath)) {
  fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
  console.log('✅ 创建 pre-commit 钩子');
  console.log('✅ 钩子内容:');
  console.log(hookContent);
  console.log('✅ Git hooks 设置完成');
} else {
  console.log('ℹ️  pre-commit 钩子已存在');
}
