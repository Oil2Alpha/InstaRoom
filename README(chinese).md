# 🏠 InstaRoom - AI 智能家居设计助手

> **Google Gemini API Hackathon 2026 参赛作品**
>
> 基于 Gemini 2.5 Flash 多模态能力的一站式智能家居设计平台


## 🌟 项目简介

**InstaRoom** 是一款有趣的 AI 家居设计应用，让每个人都能成为自己的室内设计师。只需上传一张房间照片，AI 就能帮你：

- 🎯 **智能评分** - 从多个专业维度评估你的家居空间
- 🛋️ **家具置换** - 一键替换老旧家具，预览全新效果
- ✨ **梦想家园** - 基于你的现有空间，AI 生成理想家居效果图
- 🎨 **风格定制** - 输入你的设计需求，AI 为你量身打造方案

## 🚀 核心功能

### 1. 🎯 AI 房间评分 (Room Scoring)
上传房间照片，AI 从**空间布局**、**色彩搭配**、**光线利用**、**风格协调**、**功能性**五大维度进行专业评估，并生成独特的"空间叙事"，用诗意的语言描述你的居住空间。

**技术亮点：**
- Gemini 2.5 Flash 多模态图像分析
- 结构化 JSON 输出确保评分一致性
- 支持中英文双语评分报告

### 2. 🛋️ AI 家具置换 (Furniture Swap)
选择要替换的家具，AI 会：
1. 自动测量家具尺寸（基于参考物）
2. 分析房间环境和风格
3. 生成 2 套不同风格的替换方案
4. 使用 Gemini 图像编辑能力，**在原图上直接替换家具**
5. 推荐匹配的商品链接

**技术亮点：**
- 双视角尺寸测量算法
- Gemini 2.5 Flash Image 实现图像编辑
- 基于向量相似度的商品匹配
- **语义标签智能翻译**：将抽象需求（如"儿童友好"、"易于清洁"）自动转换为精确的材质和结构标签（如"圆角设计"、"防水面料"、"可拆洗"），实现从用户意图到电商可搜索标签的智能映射

### 3. ✨ 一键生成梦中情家 (Dream Home)
基于评分结果中的改进建议，AI 自动生成：
- 理想家居效果渲染图
- 详细的购物清单（包含具体商品推荐）
- 改造说明和设计理念

**技术亮点：**
- 多轮 AI 对话生成完整方案
- 从评分到渲染的端到端流程
- Few-Shot Learning 提升输出质量

### 4. 🎨 房间风格定制 (Room Customization)
输入你的设计需求（如"我想要一个适合女性的粉色系卧室"），AI 会：
1. 分析现有房间条件
2. 生成详细设计方案
3. 渲染效果图
4. 提供完整购物清单

**技术亮点：**
- 自然语言需求理解
- 约束条件自动提取
- 多方案对比生成

## 🛠️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        InstaRoom                             │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)                                     │
│  ├── i18n 国际化 (中/英)                                      │
│  ├── 响应式设计                                               │
│  └── 精美 UI 动效                                             │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Koa)                                     │
│  ├── RESTful API                                             │
│  ├── Prompt 工程体系 (XML 模板 + Builder 模式)                 │
│  └── 多语言 Prompt 支持                                       │
├─────────────────────────────────────────────────────────────┤
│  AI Engine (Google Gemini API)                               │
│  ├── Gemini 2.5 Flash - 文本生成 & 图像分析                   │
│  ├── Gemini 2.5 Flash Image - 图像编辑 & 生成                 │
│  └── 结构化 JSON 输出                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📦 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18, Vite, TailwindCSS, react-i18next, React Router |
| **后端** | Node.js, Koa, @google/genai SDK |
| **AI** | Gemini 2.5 Flash, Gemini 2.5 Flash Image |
| **数据库** | SQLite (本地商品数据) |
| **工具** | ESLint, Prettier |

## 🎯 Gemini API 使用

本项目深度使用 Google Gemini API 的多项能力：

1. **多模态图像分析** (`gemini-2.5-flash`)
   - 房间照片分析
   - 家具识别与尺寸估算
   - 风格识别

2. **图像编辑与生成** (`gemini-2.5-flash-image`)
   - 家具置换效果图
   - 梦想家园渲染
   - 风格定制效果图

3. **结构化输出** (`responseMimeType: "application/json"`)
   - 确保 AI 输出符合预期格式
   - 便于前端解析和展示

4. **Few-Shot Learning**
   - 通过示例提升输出质量
   - XML 模板 + JSON 示例系统

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- npm >= 9.0
- Google Gemini API Key

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/instaroom.git
cd instaroom
```

2. **安装依赖**
```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

3. **配置环境变量**
```bash
# 在 server 目录创建 .env 文件
cd ../server
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

4. **启动服务**
```bash
# 启动后端 (端口 3000)
cd server
npm start

# 新终端，启动前端 (端口 5173)
cd client
npm run dev
```

5. **访问应用**
打开浏览器访问 `http://localhost:5173`

## 📂 项目结构

```
InstaRoom/
├── client/                    # 前端 React 应用
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   ├── pages/             # 页面组件
│   │   ├── i18n/              # 国际化配置
│   │   └── App.jsx            # 主应用
│   └── package.json
│
├── server/                    # 后端 Koa 服务
│   ├── controllers/           # 控制器层
│   ├── services/              # 业务逻辑层
│   ├── prompts/               # Prompt 模板系统
│   │   ├── templates/         # XML 模板
│   │   └── builders/          # Builder 类
│   ├── models/                # 数据模型
│   ├── routes/                # API 路由
│   ├── config/                # 配置文件
│   └── server.js              # 入口文件
│
└── README.md
```

## 🌍 国际化

应用支持中英文双语：
- 前端 UI 完全国际化
- 后端 AI Prompt 支持中英文切换
- 评分报告、购物清单等均支持双语输出

## 🔒 第三方依赖声明

本项目使用以下第三方服务和库：

| 依赖 | 用途 | 许可证 |
|------|------|--------|
| Google Gemini API | AI 核心能力 | Google API Terms |
| React | 前端框架 | MIT |
| Koa | 后端框架 | MIT |
| TailwindCSS | CSS 框架 | MIT |
| react-i18next | 国际化 | MIT |

## 👥 团队信息

**团队名称**: InstaRoom Team

| 角色 | 成员 |
|------|------|
| 项目负责人&开发者 | [Jiayu Shao] [Qikang Zhu] |

## 📝 许可证

MIT License

## 🙏 致谢

感谢来自谷歌的支持，Gemini3的强大能力令人印象深刻。感谢我的队友，我们一起在两周时间内完成了这个有趣的项目，科技向善，创意无限，愿我们的未来更美好！

---

**Made with ❤️ for Google Gemini API Hackathon 2026**