//集中管理所有 Gemini 的 Prompt 模板 (非常重要)
// config/prompts.js (修改后的版本)

const { SCORE_DIMENSIONS } = require('./constants');
const { REFERENCE_OBJECTS } = require('./constants'); 
const dimensionsList = SCORE_DIMENSIONS.map(dim => 
        ` - ${dim}`
    ).join('\n');

const generateScoringPrompt = (focusArea = null) => {
    
    // 确保 JSON 模板结构正确
    const jsonTemplate = `{
  "total_score": "[四项得分的平均值，取整]",
  "scores": {
    "Functional_Score": "[0-100]",
    "Aesthetics_Score": "[0-100]",
    "Lighting_Score": "[0-100]",
    "Overall_Design_Score": "[0-100]"
  },
  "inherent_style": "[识别出的房间风格，如 'Industrial' 或 'Minimalist']",
  "summary_text": "对房间的总体积极评价（不超过50字）",
  "improvement_suggestions": [
    "建议 1：具体操作，例如 '考虑增加一盏落地灯来提升照明分数。'",
    "建议 2：..."
  ],
  "key_suggestion_category": "[最急需改进的家具类型，如 'Lighting' 或 'Storage']" 
}`;

    // 核心 Prompt 强化约束
    let prompt = `
        你是一名专业的北美室内设计师。你的任务是分析提供的房间照片，并根据专业设计原则进行打分和提出改进建议。

        --- 任务要求 ---
        1. 严格按照以下四个维度打分（0-100分）：
        ${dimensionsList}
        2. 基于低分项或优化潜力，提出 3-5 条具体、可执行的改进建议。
        3. 识别并输出房间的固有风格。

        ${focusArea ? `用户关注点：请特别评论房间在 [${focusArea}] 方面的表现。` : ''}

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



module.exports = {
    generateScoringPrompt,    //家装评分 Prompt
    generateDimensionsPrompt, // 尺寸计算 Prompt
    generateEnvironmentPrompt //风格识别 Prompt
};