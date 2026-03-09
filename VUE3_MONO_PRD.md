# Vue3 + TypeScript Monorepo 脚手架需求文档

## 项目概述

构建一个**多项目 Monorepo 架构**的 Vue3 + TypeScript 脚手架工具，支持快速创建、管理和运行多个独立的前端项目，共享公共代码和依赖。

---

## 核心需求

### 1. 多项目管理

#### 1.1 项目创建
- 支持从模板快速创建新项目
- 项目存储位置：`src/projects/项目名/`
- 模板来源：`src/template/`
- 创建命令：
  ```bash
  yarn run create <项目名>
  ```

#### 1.2 项目列表
- 访问根路径 `http://localhost:3000/` 显示所有项目列表
- 每个项目显示：
  - 项目名称
  - 项目类型（如"项目"标签）
  - 可点击跳转到对应项目

#### 1.3 项目访问
- 通过路径规则访问项目：`/项目名/`
- 示例：
  - `http://localhost:3000/test1/` → 访问 test1 项目
  - `http://localhost:3000/test2/` → 访问 test2 项目

---

### 2. 开发服务器

#### 2.1 统一开发服务器
- 单个服务器管理所有项目
- 监听端口：`3000`
- 启动命令：
  ```bash
  yarn run serve
  ```

#### 2.2 路径重写规则
- 将 `/项目名/路径` 重写为 `/路径`
- 示例：
  - 请求：`/test1/src/main.ts` → 重写为：`/src/main.ts`
  - 请求：`/test2/index.html` → 重写为：`/index.html`

#### 2.3 HMR（热模块替换）
- 每个项目独立支持 HMR
- HMR WebSocket 配置：
  ```javascript
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 3000,
    clientPort: 3000,
    path: '/项目名/__vite_hmr'
  }
  ```
- 确保项目间 HMR 互不干扰

#### 2.4 系统路径过滤
- 过滤掉非项目路径，避免误判：
  - `.well-known`
  - `favicon.ico`
  - `robots.txt`
  - `sitemap.xml`
  - 其他 Vite 系统路径

---

### 3. 项目结构

#### 3.1 根目录结构
```
common-vue3-project/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── scripts/
│   ├── serve.js          # 开发服务器
│   ├── build.js          # 构建脚本
│   └── create.js         # 项目创建脚本
├── src/
│   ├── common/           # 公共代码
│   │   ├── request/      # 请求封装
│   │   └── utils/        # 工具函数
│   ├── projects/         # 项目目录
│   │   ├── test1/
│   │   └── test2/
│   └── template/         # 项目模板
```

#### 3.2 单个项目结构
```
src/projects/项目名/
├── index.html
├── .env.test
├── .env.prod
├── .gitignore
├── src/
│   ├── main.ts           # 入口文件
│   ├── App.vue           # 根组件
│   ├── router/
│   │   └── index.ts      # 路由配置
│   ├── views/
│   │   ├── Home.vue
│   │   └── About.vue
│   └── vite-env.d.ts
```

---

### 4. 技术栈

#### 4.1 核心技术
- **构建工具**：Vite 5.x
- **框架**：Vue 3.x
- **语言**：TypeScript 5.x
- **路由**：vue-router
- **插件**：@vitejs/plugin-vue

#### 4.2 依赖管理
- 包管理器：yarn 或 npm
- 依赖类型：
  - `dependencies`：vue, vue-router
  - `devDependencies`：@vitejs/plugin-vue, vite, typescript, vue-tsc, @types/node, dotenv

---

### 5. 环境配置

#### 5.1 环境变量
- 支持多环境：`test`、`prod`
- 环境变量文件：
  - `.env.test`（测试环境）
  - `.env.prod`（生产环境）

#### 5.2 全局环境变量
- `import.meta.env.PROJECT_NAME`：当前项目名
- `import.meta.env.ENV_TYPE`：环境类型（test/prod）

---

### 6. 构建配置

#### 6.1 Vite 配置要点
- **项目根目录**：`src/projects/项目名/`
- **Base 路径**：`/项目名/`
- **路径别名**：
  - `@` → `src/projects/项目名/src`
  - `@common` → `src/common`
- **输出目录**：`dist/项目名/`
- **输出文件命名**：
  - JS 文件：`assets/[name].[hash].js`
  - Chunk 文件：`assets/[name].[hash].js`
  - 资源文件：`assets/[name].[hash].[ext]`

#### 6.2 路径解析
- `index.html` 中的资源路径使用**相对路径**：
  - ❌ `/src/main.ts`
  - ✅ `src/main.ts`
- 避免与 `base` 配置冲突

---

### 7. 公共代码共享

#### 7.1 公共模块
- **请求封装**：`src/common/request/`
- **工具函数**：`src/common/utils/`
- 其他公共模块...

#### 7.2 使用方式
通过路径别名 `@common` 引入：
```typescript
import { request } from '@common/request'
import { formatDate } from '@common/utils'
```

---

## 功能清单

### 必需功能
- [x] 创建新项目
- [x] 启动开发服务器
- [x] 多项目路由管理
- [x] HMR 热更新
- [x] 环境变量支持
- [x] 公共代码共享
- [x] 项目列表展示
- [x] 构建打包

### 优化功能
- [ ] 项目删除
- [ ] 项目重命名
- [ ] 构建预览
- [ ] 代码生成器（如生成页面、组件）
- [ ] Lint + Prettier 配置
- [ ] Git 集成

---

## 使用示例

### 创建项目
```bash
yarn run create myproject
```

### 启动开发服务器
```bash
yarn run serve
```

### 访问项目
- 浏览器打开：`http://localhost:3000/`
- 点击项目列表中的项目，或直接访问 `http://localhost:3000/myproject/`

### 构建项目
```bash
yarn run build --project myproject --env prod
```

---

## 注意事项

### 关键配置点
1. **`index.html` 中的资源路径必须使用相对路径**
2. **HMR WebSocket 路径必须包含项目名前缀**
3. **系统路径必须正确过滤，避免误判为项目名**
4. **确保每个项目有独立的 `index.html`**

### 常见问题
1. **404 错误**：检查 `index.html` 中的资源路径是否使用相对路径
2. **无限刷新**：检查 HMR WebSocket 配置是否完整
3. **模块无法解析**：检查 `vue-router` 等依赖是否安装
4. **项目无法访问**：检查项目目录是否包含 `index.html`

---

## 技术约束

### Node.js 版本
- 最低要求：`>=18.0.0`

### 浏览器兼容性
- 支持现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）

### TypeScript 配置
- `tsconfig.json`：项目根目录配置
- `tsconfig.node.json`：Node.js 环境配置

---

## 交付物

### 核心文件
- `package.json`：项目依赖配置
- `vite.config.ts`：Vite 构建配置
- `scripts/serve.js`：开发服务器
- `scripts/build.js`：构建脚本
- `scripts/create.js`：项目创建脚本
- `src/template/`：项目模板
- `src/common/`：公共代码

### 项目示例
- `src/projects/404-test/`：示例项目

---

## 附录

### 开发服务器核心逻辑

#### 路径解析与重写
```javascript
// 解析项目名称
const pathParts = url.pathname.split('/').filter(Boolean)
const projectName = pathParts[0]

// 重写路径，去掉项目名前缀
req.url = url.pathname.substring(`/${projectName}`.length) || '/'
```

#### Vite 服务器创建
```javascript
const viteServer = await createServer({
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
    'import.meta.env.ENV_TYPE': JSON.stringify(env)
  },
  server: {
    middlewareMode: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      clientPort: 3000,
      path: `/${projectName}/__vite_hmr`
    }
  }
})
```

---

## 文档版本

- **版本号**：v1.0.0
- **创建日期**：2026-03-09
- **最后更新**：2026-03-09
