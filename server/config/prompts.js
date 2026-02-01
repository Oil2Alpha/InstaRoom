//集中管理所有 Gemini 的 Prompt 模板 (非常重要)
// config/prompts.js (优化版本 - 添加空间叙事功能)

const { SCORE_DIMENSIONS } = require('./constants');
const { REFERENCE_OBJECTS } = require('./constants');
const RoomScoringBuilder = require('../prompts/builders/RoomScoringBuilder');

const dimensionsList = SCORE_DIMENSIONS.map(dim =>
  ` - ${dim}`
).join('\n');

const generateScoringPrompt = async (focusArea = null, language = 'en') => {
  // 使用 Builder 构建多语言 Prompt
  const builder = new RoomScoringBuilder(language);

  // 先加载模板和示例
  await builder.loadTemplate();

  if (focusArea) {
    builder.setFocusArea(focusArea);
  }

  // 添加 2 个示例
  builder.addExamples(builder.allExamples.slice(0, 2));

  return await builder.build();
};

// 保留原始中文版本作为备用（向后兼容）
const generateScoringPromptLegacy = (focusArea = null) => {

  // 确保 JSON 模板结构正确
  const jsonTemplate = `{
  "narrative_opening": "[温情的空间叙事，50-80字，用诗意化、温暖的语言描述你对这个空间的第一印象，捕捉光线、色彩、氛围等感性元素，肯定空间的优点和生活气息]",
  "total_score": "[四项得分的平均值，取整]",
  "scores": {
    "Functional_Score": "[0-100]",
    "Aesthetics_Score": "[0-100]",
    "Lighting_Score": "[0-100]",
    "Overall_Design_Score": "[0-100]"
  },
  "inherent_style": "[识别出的房间风格，如 'Industrial' 或 'Minimalist']",
  "summary_text": "对房间的总体客观评价（不超过50字）",
  "improvement_suggestions": [
    "建议 1：具体操作，例如 '考虑增加一盏落地灯来提升照明分数。'",
    "建议 2：..."
  ],
  "key_suggestion_category": "[最急需改进的家具类型，如 'Lighting' 或 'Storage']" 
}`;

  // 核心 Prompt 强化约束
  let prompt = `
你是一名专业且富有同理心的室内设计师。你不仅提供专业评分，更重要的是与用户建立情感连接，让他们感受到空间被"看见"和理解。

--- 任务要求 ---

**第一步：空间叙事开场（最重要）**
用温暖、诗意化的语言描述你对这个空间的第一印象。这不是评分，而是情感共鸣。

叙事要求：
- 字数：50-80字
- 捕捉光线、色彩、氛围等感性元素
- 肯定空间的优点和生活气息
- 使用"我感受到..."、"这里有..."等第一人称表达
- 即使空间有缺陷，也要先找到值得肯定的地方

叙事示例：
• 现代简约："阳光透过落地窗洒在浅色木地板上，勾勒出一个宁静的角落。简洁的线条和克制的色彩，让人感受到一种都市中难得的从容。"
• 温馨居家："这里有生活的温度——墙上的照片、桌上的绿植、随意搭在椅背上的外套。虽然略显拥挤，但每一件物品都在诉说着家的故事。"
• 工业风格："裸露的砖墙与金属灯具碰撞出一种粗粝的美感。光影在混凝土地面上游走，这是一个属于创作者的自由空间。"

**第二步：专业评分**
严格按照以下四个维度打分（0-100分）：
${dimensionsList}

**第三步：改进建议**
基于低分项或优化潜力，提出 3-5 条具体、可执行的改进建议。
建议应该温和、实用，避免批评性语言。

${focusArea ? `\n**用户关注点**：请特别评论房间在 [${focusArea}] 方面的表现。\n` : ''}
--- 输出逻辑（重要）---
遵循"先肯定、再评分、后建议"的原则：
1. narrative_opening: 温情肯定，建立情感连接
2. scores + summary_text: 客观专业评价
3. improvement_suggestions: 温和的改进建议

--- 严格输出要求 ---
你的响应 **必须只包含** 一个 JSON 对象。
**禁止输出任何其他文字、解释、Markdown 标记（例如 \`\`\`json 或 \`\`\`)。**
请严格遵循以下 JSON 结构输出：

${jsonTemplate}
  `;

  return prompt.trim();
};

/**
 * 生成尺寸校准的 Prompt
 * @param {object} inputDetails - 包含参考物、尺寸和待替换区域的描述
 * @returns {string} 完整的几何推理 Prompt
 */
const generateDimensionsPrompt = (inputDetails) => {

  const refDetails = REFERENCE_OBJECTS[inputDetails.referenceObject] || { name: '未知参考物', height_cm: 0, width_cm: 0 };

  // 关键：将 BBox 描述转化为 AI 可理解的文本指令
  const targetFurnitureDescription = inputDetails.furnitureDescriptions.map((desc, index) =>
    `家具 ${index + 1}: ${desc.name} (位于用户圈选区域)。目标是计算其尺寸。`
  ).join('\n');


  const prompt = `
        你是一个专业的 3D 几何计算机视觉 Agent。你的唯一任务是基于多张房间照片、一个已知尺寸的参考物，以及待替换家具的物理位置，进行高精度尺寸计算。

        --- 几何输入 ---
        1. **已知参考物**: ${refDetails.name} (类型: ${refDetails.type})。
        2. **参考物精确尺寸**: 高 ${refDetails.height_cm} cm，宽 ${refDetails.width_cm} cm。
        3. **待测量家具**: ${targetFurnitureDescription} (请根据圈选区域和透视关系定位)。

        --- 几何推理要求 ---
        a. **比例尺校准**: 利用参考物尺寸和多张照片的透视信息，精确计算出房间的比例尺。
        b. **三维计算**: 根据比例尺，测量出待替换家具在三维空间中的精确：长 (L)、宽 (W)、高 (H)。
        c. **输出单位**: 所有尺寸必须以厘米 (cm) 为单位。

        --- 严格输出格式要求 ---
        请以 JSON 格式返回结果，**禁止输出任何其他解释性文本或 Markdown 标记**。
        你必须为每个待测量的家具返回一个尺寸对象数组。
        
        {
          "calculated_dimensions": [
            {
              "name": "[家具名称 1]",
              "length_cm": [L1], 
              "width_cm": [W1], 
              "height_cm": [H1],
              "confidence_score": [0.0 - 1.0 之间的置信度分数]
            },
            {
              "name": "[家具名称 2]",
              "length_cm": [L2], 
              "width_cm": [W2], 
              "height_cm": [H2],
              "confidence_score": [0.0 - 1.0 之间的置信度分数]
            }
          ]
        }
    `;

  return prompt.trim();
};

/**
 * 生成环境分析 Prompt (用于风格匹配和光影渲染)
 * @param {string} roomType - 房间类型描述（如 '客厅'）
 * @returns {string} 完整的环境分析 Prompt
 */
const generateEnvironmentPrompt = (roomType = '房间') => {

  const prompt = `
        你是一个专业的室内设计分析师。你的任务是分析提供的${roomType}照片，输出房间的结构化环境数据，用于高精度家具匹配和渲染。

        --- 结构化分析要求 ---
        1. **固有风格 (Inherent_Style)**: 识别房间的主要风格和次要风格（例如：Nordic, Industrial, Contemporary）。
        2. **主色调 (Dominant_Color)**: 房间内占比最高的颜色，和主要的木材/金属材质类型（例如：Warm_Gray, White_Oak, Brushed_Steel）。
        3. **光照分析 (Lighting_Analysis)**: 确定主要的自然光来源方向（例如：Top-Left, Frontal），光照强度，以及阴影的方向。

        --- 严格输出格式要求 ---
        请以 JSON 格式返回结果，**禁止输出任何其他解释性文本或 Markdown 标记**。
        {
          "inherent_style": "[识别出的风格，例如 'Minimalist/Japandi']",
          "dominant_color_material": "[主色调和材质，例如 'Beige/Pine Wood']",
          "light_source_direction": "[主要光照方向，例如 'Top-Left 45 degrees']",
          "shadow_intensity": "[阴影强度描述，例如 'Soft and Diffused']"
        }
    `;

  return prompt.trim();
};



/**
 * 生成家具置换方案的 Prompt
 * @param {object} params - 参数对象
 * @param {object} params.furnitureInfo - 要替换的家具信息
 * @param {object} params.dimensions - 测量的尺寸
 * @param {object} params.environment - 环境分析结果
 * @param {object} params.preferences - 用户偏好
 * @param {string} params.language - 语言 ('en' 或 'zh')
 */
const generatePlacementPrompt = async ({ furnitureInfo, dimensions, environment, preferences, language = 'en' }) => {
  const PlacementBuilder = require('../prompts/builders/PlacementBuilder');

  try {
    const prompt = await PlacementBuilder.createPlacementBuilder(language)
      .setEnvironment(environment)
      .setFurniture(furnitureInfo, dimensions)
      .setPreferences(preferences)
      .addRelevantExamples(furnitureInfo.name, 1)
      .build();

    return prompt;
  } catch (error) {
    console.error('Error building placement prompt with PlacementBuilder:', error);
    // Fallback to inline prompt if builder fails
    return buildFallbackPlacementPrompt({ furnitureInfo, dimensions, environment, preferences, language });
  }
};

/**
 * Fallback prompt builder for placement
 */
const buildFallbackPlacementPrompt = ({ furnitureInfo, dimensions, environment, preferences, language }) => {
  const isZh = language === 'zh';

  let preferencesText = '';
  if (preferences) {
    if (isZh) {
      if (preferences.stylePreference && preferences.stylePreference.length > 0) {
        preferencesText += `\n- 风格偏好：${preferences.stylePreference.join('、')}`;
      }
      if (preferences.preferUsed) {
        preferencesText += `\n- 优先推荐二手家具`;
      }
      if (preferences.featureTags && preferences.featureTags.length > 0) {
        preferencesText += `\n- 特殊需求标签：${preferences.featureTags.join('、')}`;
      }
      if (preferences.budgetRange) {
        preferencesText += `\n- 预算范围：${preferences.budgetRange.min}-${preferences.budgetRange.max}元`;
      }
    } else {
      if (preferences.stylePreference && preferences.stylePreference.length > 0) {
        preferencesText += `\n- Style preference: ${preferences.stylePreference.join(', ')}`;
      }
      if (preferences.preferUsed) {
        preferencesText += `\n- Prefer second-hand furniture`;
      }
      if (preferences.featureTags && preferences.featureTags.length > 0) {
        preferencesText += `\n- Special requirements: ${preferences.featureTags.join(', ')}`;
      }
      if (preferences.budgetRange) {
        preferencesText += `\n- Budget range: ${preferences.budgetRange.min}-${preferences.budgetRange.max} CNY`;
      }
    }
  }

  if (isZh) {
    return `
你是一名专业的室内设计师。基于用户房间的环境分析，为用户设计 2 套家具置换方案。

--- 输入信息 ---
**房间环境**：
- 房间风格：${environment.inherent_style}
- 主色调材质：${environment.dominant_color_material}
- 光照方向：${environment.light_source_direction}
- 阴影强度：${environment.shadow_intensity}

**要替换的家具**：
- 家具名称：${furnitureInfo.name}
- 家具描述：${furnitureInfo.description || '无'}
- 测量尺寸：长 ${dimensions.length_cm}cm × 宽 ${dimensions.width_cm}cm × 高 ${dimensions.height_cm}cm
${preferencesText}

--- 任务要求 ---
1. 生成 2 套不同风格的家具置换方案
2. 每套方案只针对 ${furnitureInfo.name} 提供替换建议
3. 包含 imagePrompt 用于图像编辑

--- 输出 JSON ---
`.trim();
  } else {
    return `
You are a professional interior designer. Based on the room environment analysis, design 2 furniture replacement options for the user.

--- Input Information ---
**Room Environment**:
- Room style: ${environment.inherent_style}
- Dominant color/material: ${environment.dominant_color_material}
- Light direction: ${environment.light_source_direction}
- Shadow intensity: ${environment.shadow_intensity}

**Furniture to Replace**:
- Furniture name: ${furnitureInfo.name}
- Description: ${furnitureInfo.description || 'None'}
- Dimensions: L ${dimensions.length_cm}cm × W ${dimensions.width_cm}cm × H ${dimensions.height_cm}cm
${preferencesText}

--- Task Requirements ---
1. Generate 2 different style furniture replacement options
2. Each option should only provide replacement suggestions for ${furnitureInfo.name}
3. Include imagePrompt for image editing

--- Output JSON ---
`.trim();
  }
};

module.exports = {
  generateScoringPrompt,
  generateDimensionsPrompt,
  generateEnvironmentPrompt,
  generatePlacementPrompt
};