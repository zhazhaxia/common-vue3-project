#!/usr/bin/env node

import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const result = {
    projectName: null,
    env: 'test'
  }
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) {
      result.env = args[i + 1]
      i++
    } else if (!args[i].startsWith('--')) {
      result.projectName = args[i]
    }
  }
  
  return result
}

// 检查项目是否存在
function projectExists(projectName) {
  const projectPath = path.resolve(process.cwd(), `src/projects/${projectName}`)
  return fs.existsSync(projectPath)
}

// 检查环境配置文件是否存在
function envFileExists(projectName, env) {
  const envPath = path.resolve(process.cwd(), `src/projects/${projectName}/.env.${env}`)
  return fs.existsSync(envPath)
}

// 加载环境变量
function loadProjectEnv(projectName, env) {
  const envPath = path.resolve(process.cwd(), `src/projects/${projectName}/.env.${env}`)
  const envVars = {}
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    dotenv.parse(envContent).env
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=')
      if (key && value) {
        envVars[key] = value.trim()
      }
    })
  }
  
  return envVars
}

// 构建项目
async function buildProject(projectName, env) {
  const startTime = Date.now()
  
  console.log(`\n🔨 开始构建项目: ${projectName}`)
  console.log(`📦 环境配置: ${env}`)
  
  // 检查项目是否存在
  if (!projectExists(projectName)) {
    console.error(`\n❌ 错误: 项目 "${projectName}" 不存在`)
    console.log(`\n💡 提示: 使用 "yarn run create ${projectName}" 创建新项目\n`)
    process.exit(1)
  }
  
  // 检查环境配置文件是否存在
  if (!envFileExists(projectName, env)) {
    console.error(`\n❌ 错误: 环境配置文件 ".env.${env}" 不存在`)
    console.log(`\n💡 提示: 请在 src/projects/${projectName}/ 下创建 .env.${env} 文件\n`)
    process.exit(1)
  }
  
  // 加载环境变量
  const envVars = loadProjectEnv(projectName, env)
  console.log(`\n📋 加载的环境变量:`)
  Object.keys(envVars).forEach(key => {
    console.log(`   ${key} = ${envVars[key]}`)
  })
  
  try {
    await build({
      configFile: path.resolve(process.cwd(), 'vite.config.js'),
      mode: 'production',
      plugins: [vue()],
      root: path.resolve(process.cwd(), `src/projects/${projectName}`),
      base: `/${projectName}/`,
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), `src/projects/${projectName}/src`),
          '@common': path.resolve(process.cwd(), 'src/common')
        }
      },
      define: {
        'import.meta.env.PROJECT_NAME': JSON.stringify(projectName),
        'import.meta.env.ENV_TYPE': JSON.stringify(env),
        ...Object.keys(envVars).reduce((acc, key) => {
          acc[`import.meta.env.${key}`] = JSON.stringify(envVars[key])
          return acc
        }, {})
      },
      build: {
        outDir: path.resolve(process.cwd(), `dist/${projectName}`),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: 'assets/[name].[hash].js',
            chunkFileNames: 'assets/[name].[hash].js',
            assetFileNames: 'assets/[name].[hash].[ext]'
          }
        }
      }
    })
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    const outDir = path.resolve(process.cwd(), `dist/${projectName}`)
    
    console.log(`\n✅ 构建成功!`)
    console.log(`⏱️  耗时: ${duration}s`)
    console.log(`📁 输出目录: ${outDir}`)
    console.log(`🌐 部署路径: /${projectName}/\n`)
    
    return true
  } catch (error) {
    console.error(`\n❌ 构建失败:`)
    console.error(error)
    process.exit(1)
  }
}

// 主函数
async function main() {
  const { projectName, env } = parseArgs()
  
  if (!projectName) {
    console.error('\n❌ 错误: 请指定要构建的项目名称')
    console.log('\n📖 用法:')
    console.log('   yarn run build <项目名>')
    console.log('   yarn run build <项目名> --env=<环境>')
    console.log('\n📌 示例:')
    console.log('   yarn run build project1')
    console.log('   yarn run build project1 --env=test')
    console.log('   yarn run build project1 --env=prod')
    console.log('   yarn run build project1 --env=test1\n')
    process.exit(1)
  }
  
  await buildProject(projectName, env)
}

main()
