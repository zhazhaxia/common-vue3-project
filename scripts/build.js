#!/usr/bin/env node

/**
 * 项目构建脚本
 * 用于构建指定的Vue项目，支持多个项目并行构建
 * 支持指定环境配置，自动加载对应项目的.env文件
 */

import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';

/**
 * 解析命令行参数
 * @returns {Object} 解析后的参数对象
 * @property {Array} projects - 要构建的项目名称数组
 * @property {string} env - 环境配置名称，默认为'test'
 * @property {boolean} useOldSyntax - 是否使用旧的命令格式
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    projects: [],
    env: 'test',
  };

  let useOldSyntax = false;

  for (let i = 0; i < args.length; i++) {
    // 处理 --key=value 格式
    if (args[i].includes('=')) {
      const [key, value] = args[i].split('=').map((item) => item.trim());
      if (key === '--env' || key === '--mode') {
        result.env = value;
      } else if (key === '--projects') {
        result.projects = value.split(',').map((p) => p.trim());
      }
    }
    // 处理 --key value 格式
    else if (args[i] === '--env' && args[i + 1]) {
      result.env = args[i + 1];
      i++;
    } else if (args[i] === '--mode' && args[i + 1]) {
      result.env = args[i + 1];
      i++;
    } else if (args[i] === '--projects' && args[i + 1]) {
      result.projects = args[i + 1].split(',').map((p) => p.trim());
      i++;
    } else if (!args[i].startsWith('--')) {
      // 保持向后兼容，支持旧的用法
      result.projects.push(args[i]);
      useOldSyntax = true;
    }
  }

  return { ...result, useOldSyntax };
}

/**
 * 检查项目是否存在
 * @param {string} projectName - 项目名称
 * @returns {boolean} 项目是否存在
 */
function projectExists(projectName) {
  const projectPath = path.resolve(process.cwd(), `src/projects/${projectName}`);
  return fs.existsSync(projectPath);
}

/**
 * 检查环境配置文件是否存在
 * @param {string} projectName - 项目名称
 * @param {string} env - 环境配置名称
 * @returns {boolean} 环境配置文件是否存在
 */
function envFileExists(projectName, env) {
  const envPath = path.resolve(process.cwd(), `src/projects/${projectName}/.env.${env}`);
  return fs.existsSync(envPath);
}

/**
 * 加载项目的环境变量
 * @param {string} projectName - 项目名称
 * @param {string} env - 环境配置名称
 * @returns {Object} 加载的环境变量对象
 */
function loadProjectEnv(projectName, env) {
  const envPath = path.resolve(process.cwd(), `src/projects/${projectName}/.env.${env}`);
  const envVars = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        envVars[key] = value.trim();
      }
    });
  }

  return envVars;
}

/**
 * 构建单个项目
 * @param {string} projectName - 项目名称
 * @param {string} env - 环境配置名称
 * @returns {Promise<boolean>} 构建是否成功
 */
async function buildProject(projectName, env) {
  const startTime = Date.now();

  console.log(`🔨 开始构建项目: ${projectName}`);
  console.log(`📦 环境配置: ${env}`);

  // 检查项目是否存在
  if (!projectExists(projectName)) {
    console.error(`❌ 错误: 项目 "${projectName}" 不存在`);
    console.log(`💡 提示: 使用 "yarn run create ${projectName}" 创建新项目`);
    return false;
  }

  // 检查环境配置文件是否存在
  if (!envFileExists(projectName, env)) {
    console.error(`❌ 错误: 环境配置文件 ".env.${env}" 不存在`);
    console.log(`💡 提示: 请在 src/projects/${projectName}/ 下创建 .env.${env} 文件`);
    return false;
  }

  // 加载环境变量
  const envVars = loadProjectEnv(projectName, env);
  console.log(`📋 加载的环境变量:`);
  Object.keys(envVars).forEach((key) => {
    console.log(`   ${key} = ${envVars[key]}`);
  });

  try {
    // 执行构建
    await build({
      configFile: false, // 不使用配置文件
      mode: 'production', // 生产模式构建
      plugins: [vue()], // 使用Vue插件
      root: path.resolve(process.cwd(), `src/projects/${projectName}`), // 项目根目录
      base: `/projects/${projectName}/`, // 基础路径，用于CDN部署
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), `src/projects/${projectName}/src`), // 项目内路径别名
          '@common': path.resolve(process.cwd(), 'src/common'), // 公共代码路径别名
        },
      },
      define: {
        // 定义环境变量
        'import.meta.env.PROJECT_NAME': JSON.stringify(projectName),
        'import.meta.env.ENV_TYPE': JSON.stringify(env),
        'import.meta.env.BASE_URL': JSON.stringify(`/projects/${projectName}/`),
        // 加载.env文件中的环境变量
        ...Object.keys(envVars).reduce((acc, key) => {
          acc[`import.meta.env.${key}`] = JSON.stringify(envVars[key]);
          return acc;
        }, {}),
      },
      build: {
        outDir: path.resolve(process.cwd(), `dist/projects/${projectName}`), // 输出目录
        emptyOutDir: true, // 构建前清空输出目录
        minify: 'terser', // 使用terser进行代码压缩
        terserOptions: {
          compress: {
            drop_console: true, // 移除console.log
            drop_debugger: true, // 移除debugger
          },
        },
        rollupOptions: {
          output: {
            // 输出文件命名规则
            entryFileNames: 'assets/[name].[hash].js',
            chunkFileNames: 'assets/[name].[hash].js',
            assetFileNames: 'assets/[name].[hash].[ext]',
          },
        },
      },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const outDir = path.resolve(process.cwd(), `dist/projects/${projectName}`);

    console.log(`✅ 构建成功!`);
    console.log(`⏱️  耗时: ${duration}s`);
    console.log(`📁 输出目录: ${outDir}`);
    console.log(`🌐 部署路径: /projects/${projectName}/`);
    console.log();

    return true;
  } catch (error) {
    console.error(`❌ 构建失败:`);
    console.error(error);
    console.log();
    return false;
  }
}

/**
 * 主函数
 * 解析命令行参数，构建指定的项目
 */
async function main() {
  const { projects, env, useOldSyntax } = parseArgs();

  // 检查是否指定了项目
  if (projects.length === 0) {
    console.error('\n❌ 错误: 请指定要构建的项目名称');
    console.log('\n📖 用法:');
    console.log('   yarn run build --projects <项目1,项目2> --mode <环境>');
    console.log('   yarn run build --projects=<项目1,项目2> --mode=<环境>');
    console.log('\n📌 示例:');
    console.log('   yarn run build --projects test1 --mode test');
    console.log('   yarn run build --projects test1,test2 --mode prod');
    console.log('   yarn run build --projects=test1,test2 --mode=prod');
    process.exit(1);
  }

  // 提醒使用新的语法
  if (useOldSyntax) {
    console.log('\n⚠️  警告: 您正在使用旧的命令格式');
    console.log('   建议使用新的命令格式:');
    console.log(`   yarn run build --projects ${projects.join(',')} --mode ${env}`);
    console.log();
  }

  console.log(`🚀 开始构建 ${projects.length} 个项目`);
  console.log(`📦 环境配置: ${env}`);
  console.log(`📋 项目列表: ${projects.join(', ')}\n`);

  try {
    // 并行构建所有项目
    const results = await Promise.all(projects.map((project) => buildProject(project, env)));

    // 统计构建结果
    const successCount = results.filter((r) => r).length;
    console.log(`\n🎯 构建完成!`);
    console.log(`✅ 成功: ${successCount} 个项目`);
    console.log(`❌ 失败: ${projects.length - successCount} 个项目`);
    console.log();
    if (successCount !== projects.length) {
      throw new Error(`构建失败: ${projects.length - successCount} 个项目`);
    }
  } catch (error) {
    console.error(`\n❌ 构建过程中发生错误:`);
    console.error(error);
    process.exit(1);
  }
}

// 执行主函数
main();
