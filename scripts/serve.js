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

// 存储当前活跃的项目
let activeProject = null

// 存储项目的WebSocket连接，使用项目名称作为键
const projectWebSockets = new Map()

// 防止并发创建服务器实例
const serverCreationLocks = new Map()

// 获取项目路径
function getProjectPath(projectName) {
  const projectPath = path.join(projectsDir, projectName)
  if (fs.existsSync(projectPath) && fs.statSync(projectPath).isDirectory()) {
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
  
  // 检查是否正在创建服务器实例
  if (serverCreationLocks.has(projectName)) {
    console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的服务器正在创建中，等待完成...`)
    // 等待创建完成
    while (serverCreationLocks.has(projectName)) {
      await new Promise(resolve => setTimeout(resolve, 100))
      if (projectServers.has(projectName)) {
        return projectServers.get(projectName)
      }
    }
  }
  
  // 获取项目路径
  const projectPath = getProjectPath(projectName)
  if (!projectPath) {
    throw new Error(`项目 ${projectName} 不存在`)
  }
  
  // 加锁，防止并发创建
  serverCreationLocks.set(projectName, true)
  
  try {
    console.log(`[${new Date().toISOString()}] 正在启动 ${projectName} 的 Vite 服务器...`)
    console.log(`项目路径: ${projectPath}`)
    console.log(`环境配置: ${env}`)
    
    // 为每个项目生成唯一的WebSocket端口
    const wsPort = 3001 + Math.abs(projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000
    console.log(`项目 ${projectName} 的WebSocket端口: ${wsPort}`)
    
    // 为每个项目创建独立的Vite服务器实例
    const viteServer = await createServer({
      configFile: false,
      plugins: [vue()],
      root: projectPath,
      base: `/${projectName}/`,
      resolve: {
        alias: {
          '@': path.join(projectPath, 'src'),
          '@common': path.join(projectRoot, 'src/common')
        }
      },
      define: {
        'import.meta.env.PROJECT_NAME': JSON.stringify(projectName),
        'import.meta.env.ENV_TYPE': JSON.stringify(env),
        'import.meta.env.BASE_URL': JSON.stringify(`/${projectName}/`)
      },
      server: {
        middlewareMode: true,
        hmr: {
          protocol: 'ws',
          port: wsPort,
          path: `/${projectName}/hmr`
        },
        fs: {
          strict: false
        }
      },
      cacheDir: path.join(projectPath, 'node_modules', '.vite'),
      clearScreen: false,
      logLevel: 'info'
    })
    
    projectServers.set(projectName, viteServer)
    console.log(`${projectName} 的 Vite 服务器启动成功！`)
    
    return viteServer
  } finally {
    // 释放锁
    serverCreationLocks.delete(projectName)
  }
}

// 主服务器
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  
  // 添加缓存控制头
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  
  // 解析项目名称
  const pathParts = url.pathname.split('/').filter(Boolean)
  const projectName = pathParts[0]
  
  // 过滤掉系统路径
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
  
  // 项目切换逻辑
  if (activeProject !== projectName) {
    console.log(`[${new Date().toISOString()}] 检测到项目切换: ${activeProject} -> ${projectName}`)
    
    // 清理所有项目资源
    const serversToClose = [...projectServers.entries()]
    projectServers.clear() // 先清空，避免新请求创建新实例
    
    // 清理WebSocket连接
    for (const [name, sockets] of projectWebSockets.entries()) {
      console.log(`[${new Date().toISOString()}] 清理项目 ${name} 的WebSocket连接，共 ${sockets.size} 个`)
      sockets.forEach(socket => {
        try {
          socket.destroy()
        } catch (err) {
          console.error(`关闭WebSocket连接失败:`, err)
        }
      })
    }
    projectWebSockets.clear()
    
    // 关闭服务器实例
    for (const [name, server] of serversToClose) {
      console.log(`[${new Date().toISOString()}] 清理项目 ${name} 的资源`)
      try {
        await server.close()
        console.log(`[${new Date().toISOString()}] 项目 ${name} 服务器已关闭`)
      } catch (err) {
        console.error(`关闭项目 ${name} 服务器失败:`, err)
      }
    }
    
    // 清空锁
    serverCreationLocks.clear()
    
    // 设置活跃项目
    activeProject = projectName
    console.log(`[${new Date().toISOString()}] 项目 ${projectName} 已设置为活跃项目`)
  }
  
  // 检查项目是否存在
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
    
    // 重写路径
    const projectPathPrefix = `/${projectName}`
    const rewrittenUrl = url.pathname.startsWith(projectPathPrefix)
      ? url.pathname.substring(projectPathPrefix.length) || '/' 
      : url.pathname
    const finalUrl = rewrittenUrl + url.search
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${finalUrl} (活跃项目: ${activeProject})`)
    
    // 修改请求URL
    const originalUrl = req.url
    req.url = finalUrl
    
    // 转发给Vite中间件
    viteServer.middlewares(req, res)
    
    // 恢复原始URL
    req.url = originalUrl
    
  } catch (err) {
    console.error(`处理请求失败:`, err)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(err.message)
  }
})

// 处理WebSocket连接
server.on('upgrade', (req, socket, head) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const projectName = pathParts[0]
    
    // 只处理活跃项目的连接
    if (activeProject !== projectName) {
      console.log(`[${new Date().toISOString()}] 拒绝非活跃项目 ${projectName} 的WebSocket连接`)
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
      socket.destroy()
      return
    }
    
    // 获取项目服务器
    const viteServer = projectServers.get(projectName)
    if (viteServer && viteServer.ws && viteServer.ws.handleUpgrade) {
      // 让Vite处理WebSocket升级
      viteServer.ws.handleUpgrade(req, socket, head, (ws) => {
        console.log(`[${new Date().toISOString()}] 建立项目 ${projectName} 的WebSocket连接`)
        
        // 存储WebSocket连接
        if (!projectWebSockets.has(projectName)) {
          projectWebSockets.set(projectName, new Set())
        }
        projectWebSockets.get(projectName).add(ws)
        
        // 监听连接关闭事件
        ws.on('close', () => {
          console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的WebSocket连接关闭`)
          if (projectWebSockets.has(projectName)) {
            projectWebSockets.get(projectName).delete(ws)
          }
        })
        
        viteServer.ws.emit('connection', ws, req)
      })
    } else {
      console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的服务器实例不存在或不支持WebSocket`)
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
      socket.destroy()
    }
  } catch (err) {
    console.error(`处理WebSocket连接失败:`, err)
    try {
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
      socket.destroy()
    } catch (e) {
      // 忽略错误
    }
  }
})

server.listen(port, () => {
  console.log(`\n🚀 开发服务器启动成功！`)
  console.log(`📝 访问地址: http://localhost:${port}`)
  console.log(`📋 首页显示所有项目列表`)
  console.log(`🔧 访问具体项目路径时自动触发构建`)
  console.log(`🌍 开发环境默认使用 .env.test 配置`)
  console.log(`🔄 访问新项目时会自动清空其他项目的构建和连接`)
  console.log(`⚡ 确保每个项目的开发环境完全隔离`)
  console.log(`🔥 已启用HMR功能，支持热模块替换`)
  console.log()
})