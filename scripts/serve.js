import http from 'http';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';
import { DEFAULT_PORT } from '../vite.config.ts';

const projectRoot = process.cwd();
const port = DEFAULT_PORT;

// 解析命令行参数
let commandMode = null;
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--mode' && process.argv[i + 1]) {
    commandMode = process.argv[i + 1];
    break;
  }
}

const projectsDir = path.join(projectRoot, 'src/projects');

// 存储项目服务器实例，使用项目名称作为键
const projectServers = new Map();

// 存储当前活跃的项目
let activeProject = null;

// 存储项目的WebSocket连接，使用项目名称作为键
const projectWebSockets = new Map();

// 防止并发创建服务器实例
const serverCreationLocks = new Map();

// 获取项目路径
function getProjectPath(projectName) {
  const projectPath = path.join(projectsDir, projectName);
  if (fs.existsSync(projectPath) && fs.statSync(projectPath).isDirectory()) {
    const indexPath = path.join(projectPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return projectPath;
    }
  }
  return null;
}

// 获取项目服务器
async function getProjectServer(projectName, env, projectEnv = {}) {
  // 如果已经存在服务器实例，直接返回
  if (projectServers.has(projectName)) {
    return projectServers.get(projectName);
  }

  // 检查是否正在创建服务器实例
  if (serverCreationLocks.has(projectName)) {
    console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的服务器正在创建中，等待完成...`);
    // 等待创建完成
    while (serverCreationLocks.has(projectName)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (projectServers.has(projectName)) {
        return projectServers.get(projectName);
      }
    }
  }

  // 获取项目路径
  const projectPath = getProjectPath(projectName);
  if (!projectPath) {
    throw new Error(`项目 ${projectName} 不存在`);
  }

  // 加锁，防止并发创建
  serverCreationLocks.set(projectName, true);

  try {
    console.log(`[${new Date().toISOString()}] 正在启动 ${projectName} 的 Vite 服务器...`);
    console.log(`项目路径: ${projectPath}`);
    console.log(`环境配置: ${env}`);

    // 为每个项目生成唯一的WebSocket端口
    const wsPort = 30001 + (Math.abs(projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000);
    console.log(`项目 ${projectName} 的WebSocket端口: ${wsPort}`);

    // 为每个项目创建独立的Vite服务器实例
    const viteServer = await createServer({
      configFile: false,
      plugins: [vue()],
      root: projectPath,
      base: `/projects/${projectName}/`,
      resolve: {
        alias: {
          '@common': path.join(projectRoot, 'src/common'),
        },
      },
      define: {
        'import.meta.env.PROJECT_NAME': JSON.stringify(projectName),
        'import.meta.env.ENV_TYPE': JSON.stringify(env),
        'import.meta.env.BASE_URL': JSON.stringify(`/projects/${projectName}/`),
        // 注入环境变量
        ...Object.fromEntries(
          Object.entries(projectEnv).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
        ),
      },
      server: {
        middlewareMode: true,
        hmr: {
          protocol: 'ws',
          host: '127.0.0.1',
          port: wsPort,
          path: `/hmr`,
        },
        fs: {
          strict: false,
        },
      },
      cacheDir: path.join(projectPath, 'node_modules', '.vite'),
      clearScreen: false,
      logLevel: 'info',
    });

    projectServers.set(projectName, viteServer);
    console.log(`${projectName} 的 Vite 服务器启动成功！`);

    return viteServer;
  } finally {
    // 释放锁
    serverCreationLocks.delete(projectName);
  }
}

// 加载环境变量
function loadEnv(projectPath, mode) {
  const envFile = path.join(projectPath, `.env.${mode}`);
  if (!fs.existsSync(envFile)) {
    throw new Error(`环境文件 ${envFile} 不存在`);
  }

  const env = {};
  const content = fs.readFileSync(envFile, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    // 忽略空行和注释
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const [key, value] = line.split('=').map((item) => item.trim());
    if (key && value) {
      // 移除引号
      const cleanedValue = value.replace(/^['"](.*)['"]$/, '$1');
      env[key] = cleanedValue;
    }
  }

  return env;
}

// 主服务器
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);

    // 添加缓存控制头
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 解析项目名称（支持projects前缀）
    const pathParts = url.pathname.split('/').filter(Boolean);
    let projectName = null;
    if (pathParts[0] === 'projects' && pathParts[1]) {
      projectName = pathParts[1];
    } else if (pathParts[0] && pathParts[0] !== 'projects') {
      // 保持向后兼容，支持直接访问项目
      projectName = pathParts[0];
    }

    // 过滤掉系统路径
    const systemPaths = ['.well-known', 'favicon.ico', 'robots.txt', 'sitemap.xml'];
    if (systemPaths.includes(projectName)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    if (!projectName) {
      // 显示项目列表
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

      const projects = [];
      if (fs.existsSync(projectsDir)) {
        const projectNames = fs.readdirSync(projectsDir);
        projectNames.forEach((name) => {
          const projectPath = path.join(projectsDir, name);
          if (fs.statSync(projectPath).isDirectory()) {
            projects.push({ name, type: 'project' });
          }
        });
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
    ${projects
      .map(
        (p) => `
      <li class="project-item">
        <a href="/projects/${p.name}/">
          <strong>${p.name}</strong>
          <span class="project-type">项目</span>
        </a>
      </li>
    `
      )
      .join('')}
  </ul>
</body>
</html>
    `;

      res.end(html);
      return;
    }

    // 获取环境参数
    const env = commandMode || url.searchParams.get('env') || 'test';

    // 项目切换逻辑
    if (activeProject !== projectName) {
      console.log(`[${new Date().toISOString()}] 检测到项目切换: ${activeProject} -> ${projectName}`);

      // 清理所有项目资源
      const serversToClose = [...projectServers.entries()];
      projectServers.clear(); // 先清空，避免新请求创建新实例

      // 清理WebSocket连接
      for (const [name, sockets] of projectWebSockets.entries()) {
        console.log(`[${new Date().toISOString()}] 清理项目 ${name} 的WebSocket连接，共 ${sockets.size} 个`);
        sockets.forEach((socket) => {
          try {
            socket.destroy();
          } catch (err) {
            console.error(`关闭WebSocket连接失败:`, err);
          }
        });
      }
      projectWebSockets.clear();

      // 关闭服务器实例
      for (const [name, server] of serversToClose) {
        console.log(`[${new Date().toISOString()}] 清理项目 ${name} 的资源`);
        try {
          await server.close();
          console.log(`[${new Date().toISOString()}] 项目 ${name} 服务器已关闭`);
        } catch (err) {
          console.error(`关闭项目 ${name} 服务器失败:`, err);
        }
      }

      // 清空锁
      serverCreationLocks.clear();

      // 设置活跃项目
      activeProject = projectName;
      console.log(`[${new Date().toISOString()}] 项目 ${projectName} 已设置为活跃项目`);
    }

    // 检查项目是否存在
    const projectPath = getProjectPath(projectName);
    if (!projectPath) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
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
</html>`);
      return;
    }

    try {
      console.log(`[${new Date().toISOString()}] 处理项目 ${projectName} 的请求，当前活跃项目: ${activeProject}`);

      // 确保当前项目是活跃项目
      if (activeProject !== projectName) {
        console.log(`[${new Date().toISOString()}] 项目 ${projectName} 不是活跃项目，重新设置`);
        activeProject = projectName;
        console.log(`[${new Date().toISOString()}] 项目 ${projectName} 已设置为活跃项目`);
      }

      // 获取项目路径
      const projectPath = getProjectPath(projectName);
      if (!projectPath) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
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
</html>`);
        return;
      }

      // 加载环境变量
      let projectEnv = {};
      try {
        projectEnv = loadEnv(projectPath, env);
        console.log(`[${new Date().toISOString()}] 成功加载项目 ${projectName} 的 .env.${env} 环境变量`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] 加载环境变量失败:`, error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(error.message);
        return;
      }

      // 获取项目服务器
      console.log(`[${new Date().toISOString()}] 获取项目 ${projectName} 的服务器实例`);
      const viteServer = await getProjectServer(projectName, env, projectEnv);
      console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的服务器实例获取成功`);

      // 重写路径（支持projects前缀）
      let projectPathPrefix = `/${projectName}`;
      if (url.pathname.startsWith('/projects/')) {
        projectPathPrefix = `/projects/${projectName}`;
      }
      const rewrittenUrl = url.pathname.startsWith(projectPathPrefix)
        ? url.pathname.substring(projectPathPrefix.length) || '/'
        : url.pathname;
      const finalUrl = rewrittenUrl + url.search;

      console.log(`[${new Date().toISOString()}] 重写URL: ${req.url} -> ${finalUrl}`);

      // 转发请求
      const originalUrl = req.url;
      req.url = finalUrl;

      console.log(`[${new Date().toISOString()}] 转发请求给Vite中间件`);
      viteServer.middlewares(req, res);
      req.url = originalUrl;
      console.log(`[${new Date().toISOString()}] 请求处理完成`);
    } catch (err) {
      console.error(`处理请求失败:`, err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err.message);
    }
  } catch (err) {
    console.error(`处理请求失败:`, err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(err.message);
  }
});

// 处理WebSocket连接
server.on('upgrade', (req, socket, head) => {
  try {
    // 检查请求头中的协议
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.connection.encrypted;
    const protocol = isSecure ? 'wss' : 'ws';

    // 解析URL，修复路径
    const url = new URL(req.url, `${protocol}://localhost:${port}`);
    let projectName = null;

    // 解析项目名称（支持/projects/{projectName}/hmr路径）
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'projects' && pathParts[1]) {
      projectName = pathParts[1];
    } else if (pathParts[0] && pathParts[0] !== 'projects') {
      projectName = pathParts[0];
    }

    // 只处理活跃项目的连接
    if (!projectName || activeProject !== projectName) {
      console.log(`[${new Date().toISOString()}] 拒绝非活跃项目 ${projectName} 的WebSocket连接`);
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    // 获取项目服务器
    const viteServer = projectServers.get(projectName);
    if (viteServer && viteServer.ws && viteServer.ws.handleUpgrade) {
      // 重写WebSocket路径，移除projects前缀和可能的重复项目名称
      const originalUrl = req.url;
      // 移除/projects/{projectName}前缀
      req.url = req.url.replace(`/projects/${projectName}`, '');
      // 移除可能的重复项目名称前缀
      req.url = req.url.replace(`/${projectName}`, '');

      // 让Vite处理WebSocket升级
      viteServer.ws.handleUpgrade(req, socket, head, (ws) => {
        console.log(`[${new Date().toISOString()}] 建立项目 ${projectName} 的WebSocket连接 (${protocol})`);

        // 存储WebSocket连接
        if (!projectWebSockets.has(projectName)) {
          projectWebSockets.set(projectName, new Set());
        }
        projectWebSockets.get(projectName).add(ws);

        // 监听连接关闭事件
        ws.on('close', () => {
          console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的WebSocket连接关闭`);
          if (projectWebSockets.has(projectName)) {
            projectWebSockets.get(projectName).delete(ws);
          }
        });

        viteServer.ws.emit('connection', ws, req);
      });

      // 恢复原始URL
      req.url = originalUrl;
    } else {
      console.log(`[${new Date().toISOString()}] 项目 ${projectName} 的服务器实例不存在或不支持WebSocket`);
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
    }
  } catch (err) {
    console.error(`处理WebSocket连接失败:`, err);
    try {
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    } catch (e) {
      // 忽略错误
    }
  }
});

server.listen(port, () => {
  console.log(`\n🚀 开发服务器启动成功！`);
  console.log(`📝 访问地址: http://localhost:${port}`);
  console.log(`📋 首页显示所有项目列表`);
  console.log(`🔧 访问具体项目路径时自动触发构建`);
  console.log(`🌍 开发环境默认使用 .env.test 配置`);
  console.log(`🔄 访问新项目时会自动清空其他项目的构建和连接`);
  console.log(`⚡ 确保每个项目的开发环境完全隔离`);
  console.log(`🔥 已启用HMR功能，支持热模块替换`);
  console.log(`📁 项目访问路径: http://localhost:${port}/projects/{项目名称}/`);
  if (commandMode) {
    console.log(`🎯 命令行指定环境: ${commandMode}`);
  }
  console.log();
});
