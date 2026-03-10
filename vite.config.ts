import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

const getProjectName = (): string | null => {
  const args = process.argv.slice(2)
  const projectIndex = args.indexOf('--project')
  return projectIndex !== -1 ? args[projectIndex + 1] : null
}

const getEnv = (): string => {
  const args = process.argv.slice(2)
  const envIndex = args.indexOf('--env')
  return envIndex !== -1 ? args[envIndex + 1] : 'test'
}

const projectName = getProjectName()
const env = getEnv()

export default defineConfig(({ mode }) => {
  if (!projectName) {
    // 没有指定项目时，返回基础配置（用于主服务器）
    return {
      plugins: [vue()],
      server: {
        port: 8963,
        middlewareMode: true
      }
    }
  }

  // 从 src/projects 目录获取项目路径
  const projectsDir = path.resolve(process.cwd(), 'src/projects')
  const projectPath = path.resolve(projectsDir, projectName)

  if (!fs.existsSync(projectPath)) {
    throw new Error(`项目 ${projectName} 不存在`)
  }

  return {
    plugins: [vue()],
    root: projectPath,
    base: `/${projectName}/`,
    resolve: {
      alias: {
        '@': path.resolve(projectPath, 'src'),
        '@common': path.resolve(process.cwd(), 'src/common')
      }
    },
    define: {
      'import.meta.env.PROJECT_NAME': JSON.stringify(projectName),
      'import.meta.env.ENV_TYPE': JSON.stringify(env)
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
    },
    server: {
      middlewareMode: true
    }
  }
})