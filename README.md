# Vite Vue3 TypeScript Monorepo 脚手架

一个基于 Vite + Vue3 + TypeScript 的 Monorepo 脚手架，支持多项目管理、按需构建、环境隔离等功能。

- https://github.com/zhazhaxia/common-vue3-project

# 核心特性

- 📦 模板化项目 - 基于模板快速创建新项目，保持项目结构统一。开箱即用。
  - 支持使用yarn run create projectName来创建新项目
  - 新项目会基于template目录下的模板创建，保持项目结构统一
  - 单仓多项目，项目按需运行，提升性能

- 🚀 按需构建 - 访问项目时才触发构建，避免资源浪费
  - 比如访问 http://localhost:8963/projects/test1/index.html 只会构建和调试test1项目，而不会构建其他项目
  - 访问test2项目时也只会构建和调试test2项目，而不会去构建test1项目

- 🔧 环境隔离 - 每个项目独立的环境配置，支持 test/prod 等多环境

- 🛠️ 公共工具 - 统一的 src/common 目录，存放项目间共享的工具和函数
  - 多个项目复用同类型工具，避免重复工作，保持代码质量和一致性

- ⚡ TypeScript 支持 - 完整的 TypeScript 类型定义和类型检查

- 打包构建 - 支持使用yarn run build --projects=projectName来打包项目，支持test/prod等多环境
  - 比如使用yarn run build --projects=test1 --mode=prod来打包test1项目的生产环境
  - 打包后的文件会输出到dist目录下，每个项目的打包文件会放在对应的子目录下，比如test1项目的打包文件会放在dist/projects/test1目录下
  - 每个项目的打包文件都有一个对应的index.html文件，用于访问项目

- 统一协作规范
  - 每个项目都有一个对应的开发分支、测试分支、主分支
  - 代码格式统一：使用eslint进行代码规范检查、同时进行代码格式化（若不生效参考底部FAQ）
  - 统一创建项目指令：yarn run create projectName
  - 统一构建项目指令：yarn run build --projects=projectName --mode=prod
  - 统一环境设置：.env.test, .env.prod, .env.custom


# 快速开始

1. 安装依赖

`yarn install`


2. 创建新项目

创建名为 project1 的新项目
`yarn run create project1`


3. 启动开发服务器

`yarn run serve`


开发服务器启动后，访问：

http://localhost:8963 - 查看项目列表
http://localhost:8963/projects/project1 - 访问 project1（首次访问会自动构建）

4. 构建项目

- 使用测试环境配置构建
`yarn run build --projects=project1 --mode=test`
- 使用生产环境配置构建
`yarn run build --projects=project1 --mode=prod`

- 使用自定义环境配置构建
`yarn run build --projects=project1 --mode=test1`

- 打包多个项目
`yarn run build --projects=project1,project2 --mode=prod`


5. whistle配置代理

若需要用业务域名联调，比如使用a.test.com，推荐使用whistle配置代理，需要在whistle配置中添加如下规则：

```log
*.test.com/projects 127.0.0.1:8963/projects
```
建议搭配SwitchyOmega插件，先在SwitchyOmega中配置proxy到whistle端口，比如配置为127.0.0.1:8899。
配置好后，访问项目时whistle会自动切换到localhost:8963访问

## 协作说明
- 开发分支、测试分支、主分支
  - 开发分支：用于日常开发，每个项目有一个对应的开发分支，比如project1的开发分支为dev/project1
  - 测试分支：用于测试，每个项目有一个对应的测试分支，比如project1的测试分支为test/project1
  - 主分支：测试完成后，走MR合入master

- 代码规范
  - 统一在git commit阶段，git hooks会使用eslint进行代码规范检查、同时进行代码格式化（若不生效参考底部FAQ）

# 目录结构
```log
plaintext
├── package.json                  # 项目配置
├── vite.config.js               # Vite 配置
├── scripts/                     # 脚本目录
│   ├── serve.js               # 开发服务器启动脚本
│   ├── build.js               # 项目构建脚本
│   └── create.js              # 项目创建脚本
├── src/                        # 源码目录
│   ├── projects/              # 项目目录（自动创建）
│   │   ├── project1/          # 项目1
│   │   │   ├── .env.test      # 测试环境配置
│   │   │   ├── .env.prod      # 生产环境配置
│   │   │   ├── index.html     # 入口HTML
│   │   │   └── src/           # 项目源码
│   │   └── project2/          # 项目2
│   ├── template/              # 项目模板
│   │   ├── index.html
│   │   └── src/
│   └── common/                # 公共模块
│       ├── utils/            # 工具函数
│       │   └── index.js
│       └── request/          # 请求封装
│           └── index.js
└── dist/                      # 构建输出目录
```



# 项目命令

### 创建项目

`yarn run create <项目名>`


示例：

`yarn run create project3`


### 启动开发服务器

`yarn run serve`


服务器启动后：

首页显示所有项目列表
访问具体项目路径时自动触发构建
开发环境默认使用 .env.test 配置

构建项目

`yarn run build --projects=<项目名> --mode=<环境>`


参数说明：

项目名: 必需，要构建的项目名称
--mode: 可选，指定环境配置文件（test、prod、test1、test2 等），默认为 test

示例：

`yarn run build --projects=project1 --mode=test`
`yarn run build --projects=project1 --mode=prod`
`yarn run build --projects=project1 --mode=test1`


### 环境配置

每个项目在创建时会自动生成环境配置文件：

.env.test - 测试环境
```log
VITE_APP_TITLE=project1
VITE_APP_ENV=test
VITE_APP_API_BASE_URL=https://test-api.example.com
VITE_APP_APP_ID=project1_test
```

.env.prod - 生产环境

```log
VITE_APP_TITLE=project1
VITE_APP_ENV=prod
VITE_APP_API_BASE_URL=https://api.example.com
VITE_APP_APP_ID=project1_prod
```

### 自定义环境

你可以创建自定义的环境配置文件，如 .env.test1、.env.test2 等：

`yarn run build project1 --mode=test1`


### 公共工具

所有项目都可以通过 @common/utils 和 @common/request 引用公共模块：

#### 公共工具函数

```javascript
import { formatDate, deepClone, debounce, storage } from '@common/utils'

// 格式化日期
const date = formatDate(new Date())

// 深拷贝
const cloned = deepClone(obj)

// 防抖函数
const debouncedFn = debounce(() => {
  console.log('防抖执行')
}, 300)

// 本地存储
storage.set('key', 'value')
const value = storage.get('key')
```

#### 公共请求封装

```javascript
import { get, post, createRequest } from '@common/request'

// 直接使用
get('/api/users')
post('/api/users', { name: 'John' })

// 创建请求实例
const request = createRequest({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 5000
})

request.get('/api/users')
```

### 模板自定义

你可以通过修改 src/template/ 目录来自定义项目模板：

修改默认的页面结构和样式
添加默认的组件和路由
配置默认的环境变量

所有基于模板创建的新项目都会继承这些配置。

### 开发规范

项目命名

项目名称只能包含小写字母、数字和连字符：

bash
# 正确
```bash
yarn run create project1
yarn run create my-app
yarn run create admin-v2

# 错误
yarn run create Project1  # 包含大写字母
yarn run create project_1  # 包含下划线
```

### 路径别名

@common - 指向公共的 src/common 目录

使用示例：

```javascript
import { formatDate } from '@common/utils'
```

环境变量

在代码中访问环境变量：

```javascript
const projectName = import.meta.env.PROJECT_NAME
const envType = import.meta.env.ENV_TYPE
const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL
```

### 技术栈

构建工具: Vite 5.x
前端框架: Vue 3.x
路由: Vue Router 4.x
包管理: Yarn

### 注意事项

首次访问构建: 开发服务器启动后，首次访问某个项目时会自动触发构建，请耐心等待
环境配置: 构建前请确保目标环境配置文件存在，否则会报错
端口占用: 默认使用 8963 端口，如果被占用请修改 scripts/serve.js 中的端口配置
公共模块: 修改 src/common 中的内容后，需要重新构建项目才能生效

# 常见问题

Q: 如何修改开发服务器端口？

A: 编辑 scripts/serve.js 文件，修改 端口 常量。

Q: 如何添加新的依赖？

A: 直接在根目录执行 yarn add <依赖名>，所有项目都可以使用。

Q: 如何自定义项目模板？

A: 修改 src/template/ 目录下的文件，之后创建的新项目会使用新模板。

Q: 构建失败怎么办？

A: 检查：

环境配置文件是否存在
项目目录结构是否完整
查看控制台错误信息

Q：git hooks失败或者告警？

A：项目根目录执行`yarn prepare`，安装git hook。mac下并执行`chmod +x .husky/pre-commit`

# 许可证

MIT