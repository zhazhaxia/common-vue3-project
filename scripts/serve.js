import http from 'http'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

const projectRoot = process.cwd()
const port = 3000

const projectsDir = path.join(projectRoot, 'src/projects')

// 存储项目服务器实例，使用项目名称作为键
const projectServers = new Map()

// 获取项目路径
function getProjectPath(projectName) {
  const projectPath = path.join(projectsDir, projectName)
  if (fs.existsSync(projectPath) && fs.statSync(projectPath).isDirectory()) {
    // 检查是否包含项目必要文件（如index.html）
    const indexPath = path.join(projectPath, 'index.html')
    if (fs.existsSync(indexPath)) {
      return projectPath
    }
  }
  return null
}

// 获取项目服务器
async function getProjectServer(projectName, env) {
  // 如果已经存在服务器实例，直接返回
  if (projectServers.has(projectName)) {
    return projectServers.get(projectName)
  }
  
  const projectPath = getProjectPath(projectName)
  
  if (!projectPath) {
    throw new Error(`项目 ${projectName} 不存在`)
  }
  
  console.log(`正在启动 ${projectName} 的 Vite 服务器...`)
  console.log(`项目路径: ${projectPath}`)
  
  // 为每个项目创建独立的Vite服务器实例
  const viteServer = await createServer({
    // 禁用配置文件，确保每个项目使用独立的配置
    configFile: false,
    // 每个项目使用独立的插件实例
    plugins: [vue()],
    // 设置项目根目录
    root: projectPath,
    // 设置正确的base路径
    base: `/${projectName}/`,
    // 解析别名
    resolve: {
      alias: {
        '@': path.join(projectPath, 'src'),
        '@common': path.join(projectRoot, 'src/common')
      }
    },
    // 定义环境变量
    define: {
      'import.meta.env.PROJECT_NAME': JSON.stringify(projectName),
      'import.meta.env.ENV_TYPE': JSON.stringify(env),
      'import.meta.env.BASE_URL': JSON.stringify(`/${projectName}/`)
    },
    // 使用中间件模式
    server: {
      middlewareMode: true,
      fs: {
        // 允许访问项目目录外的文件
        strict: false
      }
    },
    // 确保每个项目使用独立的依赖缓存
    cacheDir: path.join(projectPath, 'node_modules', '.vite'),
    // 确保每个项目使用独立的构建配置
    clearScreen: false,
    logLevel: 'info'
  })
  
  // 缓存服务器实例
  projectServers.set(projectName, viteServer)
  
  console.log(`${projectName} 的 Vite 服务器启动成功！`)
  
  return viteServer
}

// 主服务器
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  
  // 解析项目名称
  const pathParts = url.pathname.split('/').filter(Boolean)
  const projectName = pathParts[0]
  
  // 过滤掉系统路径和非项目路径
  const systemPaths = ['.well-known', 'favicon.ico', 'robots.txt', 'sitemap.xml']
  if (systemPaths.includes(projectName)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
    return
  }
  
  if (!projectName) {
    // 显示项目列表
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    
    const projects = []
    
    // 扫描 src/projects 目录
    if (fs.existsSync(projectsDir)) {
      const projectNames = fs.readdirSync(projectsDir)
      projectNames.forEach(name => {
        const projectPath = path.join(projectsDir, name)
        if (fs.statSync(projectPath).isDirectory()) {
          projects.push({ name, type: 'project' })
        }
      })
    }
    
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>项目列表</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #333; }
    .project-list { list-style: none; padding: 0; }
    .project-item { 
      padding: 15px; 
      margin: 10px 0; 
      background: #f5f5f5; 
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .project-item:hover { background: #e0e0e0; }
    .project-type { 
      display: inline-block; 
      padding: 3px 8px; 
      background: #667eea; 
      color: white; 
      border-radius: 3px; 
      font-size: 12px; 
      margin-left: 10px;
    }
    a { text-decoration: none; color: inherit; }
  </style>
</head>
<body>
  <h1>🚀 项目列表</h1>
  ${projects.length === 0 ? '<p>暂无项目，请使用 <code>yarn run create</code> 创建新项目</p>' : ''}
  <ul class="project-list">
    ${projects.map(p => `
      <li class="project-item">
        <a href="/${p.name}/">
          <strong>${p.name}</strong>
          <span class="project-type">项目</span>
        </a>
      </li>
    `).join('')}
  </ul>
</body>
</html>
    `
    
    res.end(html)
    return
  }
  
  // 获取环境参数
  const env = url.searchParams.get('env') || 'test'
  
  // 检查项目是否存在，避免不必要的错误
  const projectPath = getProjectPath(projectName)
  if (!projectPath) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>404 - 项目不存在</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 60px 20px; 
           background: #fef2f2; color: #991b1b; }
    h1 { font-size: 4em; margin: 0; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>项目 "${projectName}" 不存在</p>
  <p><a href="/">返回首页</a></p>
</body>
</html>`)
    return
  }
  
  try {
    // 获取项目服务器
    const viteServer = await getProjectServer(projectName, env)
    
    // 保存原始URL
    const originalUrl = req.url
    
    // 重写路径，去掉项目名前缀
    const projectPathPrefix = `/${projectName}`
    const rewrittenUrl = url.pathname.startsWith(projectPathPrefix) 
      ? url.pathname.substring(projectPathPrefix.length) || '/' 
      : url.pathname
    
    // 确保保留查询参数
    const finalUrl = rewrittenUrl + url.search
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${originalUrl} -> ${finalUrl}`)
    
    // 修改请求URL为重写后的URL
    req.url = finalUrl
    
    // 将请求转发给 Vite 中间件
    viteServer.middlewares(req, res)
    
    // 恢复原始URL
    req.url = originalUrl
    
  } catch (err) {
    console.error(`处理请求失败:`, err)
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(err.message)
  }
})

// 处理WebSocket连接
server.on('upgrade', async (req, socket, head) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  
  // 解析项目名称
  const pathParts = url.pathname.split('/').filter(Boolean)
  const projectName = pathParts[0]
  
  if (!projectName) {
    socket.destroy()
    return
  }
  
  try {
    // 获取项目服务器
    const env = url.searchParams.get('env') || 'test'
    const viteServer = await getProjectServer(projectName, env)
    
    // 重写路径，去掉项目名前缀
    const projectPathPrefix = `/${projectName}`
    const rewrittenUrl = url.pathname.startsWith(projectPathPrefix) 
      ? url.pathname.substring(projectPathPrefix.length) || '/' 
      : url.pathname
    
    // 确保保留查询参数
    const finalUrl = rewrittenUrl + url.search
    
    console.log(`[${new Date().toISOString()}] WebSocket ${url.pathname} -> ${finalUrl}`)
    
    // 保存原始URL并修改为重写后的URL
    const originalWebSocketUrl = req.url
    req.url = finalUrl
    
    console.log(`[${new Date().toISOString()}] WebSocket ${originalWebSocketUrl} -> ${finalUrl}`)
    
    // 处理WebSocket连接
    if (viteServer.ws) {
      viteServer.ws.handleUpgrade(req, socket, head, (ws) => {
        viteServer.ws.emit('connection', ws, req)
      })
    } else {
      socket.destroy()
    }
    
    // 恢复原始URL
    req.url = originalWebSocketUrl
  } catch (err) {
    console.error(`处理WebSocket连接失败:`, err)
    socket.destroy()
  }
})

server.listen(port, () => {
  console.log(`\n🚀 开发服务器启动成功！`)
  console.log(`📝 访问地址: http://localhost:${port}`)
  console.log()
})