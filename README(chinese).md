# 创建初衷

# 数据库结构

# 项目组织架构
┌─────────────────┐    HTTP API     ┌─────────────────┐
│   React + Vite  │◄───────────────►│      Koa        │
│   (前端应用)     │   (REST/GraphQL)│   (后端服务)    │
│   localhost:5173 │                 │  localhost:3000 │
└─────────────────┘                 └─────────────────┘

# 后端文件结构说明
后端使用Koa架构。
1. 根目录 (/)
server.js: 启动 Koa 服务器，加载路由和中间件。这是应用的入口点。
.env: 存储敏感信息和配置，通过 dotenv 库加载到 process.env。
2. config/
集中管理配置和不变的业务规则。
prompts.js: 将复杂的 Gemini 提示词和输出 JSON 格式模板化，避免代码中硬编码，方便管理和迭代。
3. controllers/
HTTP 接口层。 负责接收请求（ctx.request），调用相应的服务（services/），然后发送响应（ctx.body）。不包含复杂的业务逻辑。
4. routes/
管理 URL 路径和 Controller 的映射。
api.js: 包含所有 router.post('/api/v1/score', scoringController.getScore) 这样的定义。
5. services/
业务逻辑核心层。 负责执行复杂的业务流程和所有外部 API 交互。
将 Gemini 交互代码放在这里，确保 controllers 层保持干净。例如，scoringService.js 负责调用 aiService 并处理其返回结果。
6. models/
数据访问层。 负责所有数据库操作，如查询、插入、更新。它将数据操作与上层逻辑分离。

# 前端文件结构说明
前端使用React架构，基于Vite开发
insta-room-frontend/
├── node_modules/
├── public/                 # 公共静态文件，直接被浏览器访问 (用于favicon, robots.txt等)
│   └── logo.svg            
│   └── favicon.ico
│
├── src/                    # 核心源代码目录
│   ├── assets/             # 静态资源：图片、字体、图标等
│   │   ├── images/         # 放置美观的背景图、引导图、产品图等
│   │   │   └── background_hero.jpg
│   │   └── fonts/
│   │   └── icons/
│   │
│   ├── components/         # 可重用的 UI 组件 (原子组件)
│   │   ├── Button.jsx
│   │   ├── InputField.jsx
│   │   ├── ScoreCard.jsx   # 用于评分结果页
│   │   ├── RenderCard.jsx  # 用于置换结果页
│   │   └── LoadingSpinner.jsx
│   │
│   ├── styles/             # 全局样式和工具类
│   │   ├── global.css      # Tailwind CSS 基础或自定义 CSS
│   │   └── theme.js        # 品牌颜色变量和排版配置
│   │
│   ├── pages/              # 对应不同的路由或主视图
│   │   ├── ScoreInput.jsx    # (对应之前的 input.html) 评分输入页
│   │   ├── ScoreResult.jsx   # (对应之前的 result.html) 评分结果页
│   │   ├── PlacementInput.jsx# 【新】功能1：单家具置换输入页
│   │   └── PlacementResult.jsx# 【新】功能1：置换方案展示页 (MVP 核心展示)
│   │
│   ├── hooks/              # 可重用逻辑 (如 useFetch, useFormValidation)
│   │   └── useApi.js       # 用于封装后端 API 调用，处理代理和错误
│   │
│   ├── App.jsx             # 主组件，通常用于定义路由结构
│   └── main.jsx            # 应用入口点 (ReactDOM.render)
│
├── .gitignore
├── index.html              # Vite 根 HTML 文件
├── package.json
└── vite.config.js          # Vite 构建配置