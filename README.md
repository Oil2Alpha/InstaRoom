> **Gemini 3 Hackathon Submission**
>
> A one-stop intelligent home design platform powered by Gemini 3 multimodal capabilities
>
> [View the project on Devpost](https://devpost.com/software/instaroom)
>

## 🌟 Project Overview

**InstaRoom** is a interesting AI home design application that empowers everyone to become their own interior designer. Simply upload a room photo, and AI will help you:

- 🎯 **Smart Scoring** - Evaluate your living space from multiple professional dimensions
- 🛋️ **Furniture Swap** - Replace old furniture with one click and preview the new look
- ✨ **Dream Home** - Generate ideal home renderings based on your existing space
- 🎨 **Style Customization** - Input your design requirements, AI creates tailored solutions

## 🚀 Core Features

### 1. 🎯 AI Room Scoring
Upload a room photo, and AI evaluates it from **five professional dimensions**: Space Layout, Color Harmony, Lighting Utilization, Style Coordination, and Functionality. It also generates a unique "Space Narrative" - a poetic description of your living space.

**Technical Highlights:**
- Gemini 3 Flash multimodal image analysis
- Structured JSON output ensures scoring consistency
- Bilingual scoring reports (English/Chinese)

### 2. 🛋️ AI Furniture Swap
Select the furniture to replace, and AI will:
1. Automatically measure furniture dimensions (using reference objects)
2. Analyze room environment and style
3. Generate 2 different style replacement options
4. Use Gemini image editing to **directly replace furniture in the original photo**
5. Recommend matching products

**Technical Highlights:**
- Dual-perspective dimension measurement algorithm
- Gemini 3 Flash Image for image editing
- Vector similarity-based product matching
- **Semantic Tag Smart Translation**: Automatically converts abstract requirements (e.g., "child-friendly", "easy to clean") into precise material and structural tags (e.g., "rounded corners", "waterproof fabric", "removable and washable"), enabling intelligent mapping from user intent to e-commerce searchable tags

### 3. ✨ One-Click Dream Home Generation
Based on improvement suggestions from the scoring results, AI automatically generates:
- Ideal home effect rendering
- Detailed shopping list (with specific product recommendations)
- Renovation instructions and design concepts

**Technical Highlights:**
- Multi-turn AI dialogue for complete solution generation
- End-to-end flow from scoring to rendering
- Few-Shot Learning improves output quality

### 4. 🎨 Room Style Customization
Input your design requirements (e.g., "I want a pink bedroom suitable for females"), and AI will:
1. Analyze existing room conditions
2. Generate detailed design plans
3. Render effect images
4. Provide complete shopping lists

**Technical Highlights:**
- Natural language requirement understanding
- Automatic constraint extraction
- Multi-option comparison generation

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        InstaRoom                             │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)                                     │
│  ├── i18n Internationalization (EN/ZH)                       │
│  ├── Responsive Design                                       │
│  └── Beautiful UI Animations                                 │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Koa)                                     │
│  ├── RESTful API                                             │
│  ├── Prompt Engineering System (XML Templates + Builder)     │
│  └── Multi-language Prompt Support                           │
├─────────────────────────────────────────────────────────────┤
│  AI Engine (Google Gemini API)                               │
│  ├── Gemini 3 Flash - Text Generation & Image Analysis     │
│  ├── Gemini 3 Flash Image - Image Editing & Generation     │
│  └── Structured JSON Output                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TailwindCSS, react-i18next, React Router |
| **Backend** | Node.js, Koa, @google/genai SDK |
| **AI** | Gemini 3 Flash, Gemini 3 Flash Image |
| **Database** | SQLite (local product data) |
| **Tools** | ESLint, Prettier |

## 🎯 Gemini API Usage

This project deeply integrates multiple Google Gemini API capabilities:

1. **Multimodal Image Analysis** (`gemini-3-flash`)
   - Room photo analysis
   - Furniture recognition and dimension estimation
   - Style identification

2. **Image Editing & Generation** (`gemini-3-flash-image`)
   - Furniture swap renderings
   - Dream home visualizations
   - Style customization effects

3. **Structured Output** (`responseMimeType: "application/json"`)
   - Ensures AI output matches expected format
   - Easy for frontend parsing and display

4. **Few-Shot Learning**
   - Examples improve output quality
   - XML templates + JSON examples system

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0
- npm >= 9.0
- Google Gemini API Key

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Oil2Alpha/InstaRoom.git
cd InstaRoom
```

2. **Install backend dependencies and run service**
```bash
# Install backend dependencies(Terminal 1)
cd server
npm install
# Configure API Key
echo "GEMINI_API_KEY=your_api_key"
> .env
# Start backend service
node server.js
```

3. **Install Frontend dependencies and run**
```bash
# Install frontend dependencies(Terminal 2)
cd client
npm install
npm run dev
```

4. **Access the application**
Open your browser and visit `http://localhost:5173`

## 📂 Project Structure

```
InstaRoom/
├── client/                    # Frontend React Application
│   ├── src/
│   │   ├── components/        # Reusable Components
│   │   ├── pages/             # Page Components
│   │   ├── i18n/              # Internationalization Config
│   │   └── App.jsx            # Main Application
│   └── package.json
│
├── server/                    # Backend Koa Service
│   ├── controllers/           # Controller Layer
│   ├── services/              # Business Logic Layer
│   ├── prompts/               # Prompt Template System
│   │   ├── templates/         # XML Templates
│   │   └── builders/          # Builder Classes
│   ├── models/                # Data Models
│   ├── routes/                # API Routes
│   ├── config/                # Configuration Files
│   └── server.js              # Entry Point
│
└── README.md
```

## 🌍 Internationalization

The application supports English and Chinese:
- Fully internationalized frontend UI
- Backend AI prompts support language switching
- Scoring reports, shopping lists, etc. all support bilingual output

## 🔒 Third-Party Dependencies Declaration

This project uses the following third-party services and libraries:

| Dependency | Purpose | License |
|------------|---------|---------|
| Google Gemini API | Core AI capabilities | Google API Terms |
| React | Frontend framework | MIT |
| Koa | Backend framework | MIT |
| TailwindCSS | CSS framework | MIT |
| react-i18next | Internationalization | MIT |


## 🧪 Testing Instructions

1. Visit `http://localhost:5173` after starting the application
2. Switch language using the toggle in the top-right corner
3. Try each feature:
   - **Room Scoring**: Upload a room photo and get AI evaluation
   - **Furniture Swap**: Upload 2+ photos, annotate furniture, generate swap options
   - **Dream Home**: From scoring results, click "Generate Dream Home"
   - **Room Customization**: Describe your design needs in natural language

## 👥 Team Information

**Team Name**: InstaRoom Team

| Role | Member |
|------|--------|
| Project Lead | [Jiayu_shao] |
| Developer | [Qikang_zhu] |

## 📝 License

MIT License

## 🙏 Acknowledgments

Thanks to Google for providing the powerful Gemini API, enabling us to integrate AI capabilities into the home design field and help everyone create better living spaces.

---

**Made with ❤️ for Google Gemini API Hackathon 2026**
