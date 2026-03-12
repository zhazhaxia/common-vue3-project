#!/usr/bin/env node

/**
 * 项目创建脚本
 * 用于从模板创建新的Vue项目
 * 自动生成环境配置文件和项目结构
 */

import fs from 'fs';
import path from 'path';

/**
 * 解析命令行参数
 * @returns {string|null} 项目名称，如果没有提供则返回null
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return args[0] || null;
}

/**
 * 检查项目是否已存在
 * @param {string} projectName - 项目名称
 * @returns {boolean} 项目是否存在
 */
function projectExists(projectName) {
  const projectPath = path.resolve(process.cwd(), `src/projects/${projectName}`);
  return fs.existsSync(projectPath);
}

/**
 * 检查模板是否存在
 * @returns {boolean} 模板是否存在
 */
function templateExists() {
  const templatePath = path.resolve(process.cwd(), 'src/template');
  return fs.existsSync(templatePath);
}

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 */
function copyDirectory(src, dest) {
  // 如果目标目录不存在，创建它
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录中的所有文件和子目录
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // 遍历所有条目
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 递归复制子目录
      copyDirectory(srcPath, destPath);
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 创建环境配置文件
 * @param {string} projectPath - 项目路径
 * @param {string} projectName - 项目名称
 */
function createEnvFiles(projectPath, projectName) {
  // 创建测试环境配置文件
  const testEnvPath = path.join(projectPath, '.env.test');
  const testEnvContent = `VITE_APP_TITLE=${projectName}
VITE_APP_ENV=test
VITE_APP_API_BASE_URL=https://test-api.example.com
VITE_APP_APP_ID=${projectName}_test
`;
  fs.writeFileSync(testEnvPath, testEnvContent, 'utf-8');

  // 创建生产环境配置文件
  const prodEnvPath = path.join(projectPath, '.env.prod');
  const prodEnvContent = `VITE_APP_TITLE=${projectName}
VITE_APP_ENV=prod
VITE_APP_API_BASE_URL=https://api.example.com
VITE_APP_APP_ID=${projectName}_prod
`;
  fs.writeFileSync(prodEnvPath, prodEnvContent, 'utf-8');

  console.log(`   ✅ 创建环境配置文件: .env.test, .env.prod`);
}

/**
 * 创建项目结构
 * @param {string} projectName - 项目名称
 */
function createProjectStructure(projectName) {
  const projectPath = path.resolve(process.cwd(), `src/projects/${projectName}`);

  console.log(`\n🚀 开始创建项目: ${projectName}`);
  console.log(`📁 项目路径: ${projectPath}\n`);

  // 检查模板是否存在
  if (!templateExists()) {
    console.log(`⚠️  模板不存在`);
    process.exit(1);
  }

  // 从模板复制项目文件
  console.log(`📋 从模板创建项目...`);
  copyDirectory(path.resolve(process.cwd(), 'src/template'), projectPath);
  console.log(`   ✅ 模板文件复制完成`);

  // 创建环境配置文件
  createEnvFiles(projectPath, projectName);

  // 创建.gitignore文件（暂时注释掉）
  // const gitignorePath = path.join(projectPath, '.gitignore')
  // const gitignoreContent = `node_modules\n.DS_Store\n*.log\ndist\n`
  // fs.writeFileSync(gitignorePath, gitignoreContent, 'utf-8')
  // console.log(`   ✅ 创建: .gitignore`)

  // 显示完成信息和下一步操作
  console.log(`\n✅ 项目创建完成!\n`);
  console.log(`📋 下一步操作:`);
  console.log(`   1. 启动开发服务器: yarn run serve`);
  console.log(`   2. 访问项目: http://localhost:3000/${projectName}`);
  console.log(`   3. 构建项目: yarn run build ${projectName} --env=test\n`);
}

/**
 * 主函数
 * 解析命令行参数，检查项目是否存在，创建项目结构
 */
function main() {
  const projectName = parseArgs();

  // 检查是否提供了项目名称
  if (!projectName) {
    console.error('\n❌ 错误: 请提供项目名称');
    console.log('\n📖 用法: yarn run create <项目名>');
    process.exit(1);
  }

  // 检查项目是否已存在
  if (projectExists(projectName)) {
    console.error(`\n❌ 错误: 项目 "${projectName}" 已存在\n`);
    process.exit(1);
  }

  // 创建项目结构
  createProjectStructure(projectName);
}

// 执行主函数
main();
