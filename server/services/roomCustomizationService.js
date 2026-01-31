// services/roomCustomizationService.js

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});

/**
 * 生成房间定制方案
 * @param {object} photo - 原始照片对象 {filepath, mimetype}
 * @param {object} userRequirements - 用户需求
 * @returns {object} { room_analysis, design_plan, rendered_image, shopping_list, total_cost }
 */
async function generateCustomizationPlan(photo, userRequirements) {
    try {
        console.log('\n=== 开始生成房间定制方案 ===');
        console.log('房间用途:', userRequirements.room_purpose);
        console.log('风格偏好:', userRequirements.style_preferences);
        console.log('预算:', userRequirements.budget_range);

        // 步骤1：分析房间
        const roomAnalysis = await analyzeRoom(photo, userRequirements.room_purpose);
        console.log('房间分析完成');

        // 步骤2：生成设计方案
        const designPlan = await generateDesignPlan(roomAnalysis, userRequirements);
        console.log('设计方案生成完成');

        // 步骤3：生成购物清单
        const shoppingList = await generateShoppingList(designPlan, userRequirements);
        console.log('购物清单生成完成，商品数量:', shoppingList.length);

        // 步骤4：生成渲染图
        const renderedImage = await generateRenderedImage(photo, designPlan);
        console.log('渲染图生成完成');

        // 计算总价
        const totalCost = shoppingList.reduce((sum, item) => sum + (item.price || 0), 0);

        return {
            room_analysis: roomAnalysis,
            design_plan: designPlan,
            rendered_image: renderedImage,
            shopping_list: shoppingList,
            total_cost: totalCost
        };

    } catch (error) {
        console.error('生成定制方案失败:', error);
        throw error;
    }
}

/**
 * 分析房间
 */
async function analyzeRoom(photo, roomPurposeHint) {
    try {
        const { fileToGenerativePart } = require('./aiService');
        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        const prompt = `
分析这张房间照片，提供以下信息（JSON格式）：

{
  "room_type": "客厅/卧室/书房/厨房/餐厅",
  "area_range": "15-20",
  "ceiling_height": "2.6-2.8",
  "space_feeling": "宽敞/适中/紧凑",
  "natural_light": "充足/一般/较暗",
  "existing_furniture": "空房/部分家具/已有家具",
  "floor_type": "木地板/瓷砖/地毯",
  "floor_color": "#D2B48C",
  "wall_color": "#FFFFFF",
  "overall_condition": "新房/旧房翻新",
  "style_hints": "现代简约/北欧/工业风/中式/混搭"
}

注意：
1. 面积估算基于可见的空间大小和家具比例
2. 层高根据门窗比例推测（标准门高2.1m）
3. 用户提示这是：${roomPurposeHint}
4. 如果不确定，给出合理范围
5. 直接输出 JSON，不要有其他文字

请分析：
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [imagePart, { text: prompt }]
        });

        const text = response.text.trim();

        // 提取 JSON
        let jsonText = text;
        if (text.includes('```json')) {
            jsonText = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
            jsonText = text.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonText);

    } catch (error) {
        console.error('房间分析失败:', error);
        // 返回默认值
        return {
            room_type: roomPurposeHint || "未知",
            area_range: "15-20",
            ceiling_height: "2.6-2.8",
            space_feeling: "适中",
            natural_light: "一般",
            existing_furniture: "空房",
            floor_type: "木地板",
            floor_color: "#D2B48C",
            wall_color: "#FFFFFF",
            overall_condition: "新房",
            style_hints: "现代简约"
        };
    }
}

/**
 * 生成设计方案
 */
async function generateDesignPlan(roomAnalysis, userRequirements) {
    try {
        const {
            room_purpose,
            occupants,
            style_preferences,
            special_needs,
            budget_range
        } = userRequirements;

        // 构建特殊需求的约束条件
        const specialConstraints = buildSpecialConstraints(special_needs);

        const prompt = `
你是一位拥有15年经验的专业室内设计师。根据房间分析和用户需求，生成定制设计方案。

【房间分析】
- 类型：${roomAnalysis.room_type}
- 面积：${roomAnalysis.area_range}㎡
- 层高：${roomAnalysis.ceiling_height}m
- 空间感：${roomAnalysis.space_feeling}
- 采光：${roomAnalysis.natural_light}
- 现状：${roomAnalysis.existing_furniture}
- 地板：${roomAnalysis.floor_type}
- 风格倾向：${roomAnalysis.style_hints}

【用户需求】
- 房间用途：${room_purpose}
- 居住人数：${occupants}人
- 风格偏好：${style_preferences.join('、')}
- 特殊需求：${special_needs.join('、') || '无'}
- 预算范围：¥${budget_range}

${specialConstraints}

请生成设计方案（JSON格式）：

{
  "title": "设计方案标题（如：现代简约客厅定制方案）",
  "description": "设计理念和整体思路（100-150字）",
  "key_features": [
    "关键特点1",
    "关键特点2",
    "关键特点3"
  ],
  "furniture_layout": {
    "主要家具": ["沙发", "茶几", "电视柜"],
    "辅助家具": ["边几", "置物架"],
    "装饰品": ["挂画", "绿植", "抱枕"]
  },
  "color_scheme": {
    "主色调": "#FFFFFF",
    "辅助色": "#F5F5F5",
    "点缀色": "#4A90E2"
  },
  "material_suggestions": ["实木", "布艺", "金属"],
  "lighting_plan": "照明方案描述"
}

要求：
1. 符合用户风格偏好
2. 满足特殊需求约束
3. 预算控制在范围内
4. 实用且美观
5. 直接输出 JSON，不要其他文字
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        const text = response.text.trim();

        // 提取 JSON
        let jsonText = text;
        if (text.includes('```json')) {
            jsonText = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
            jsonText = text.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonText);

    } catch (error) {
        console.error('生成设计方案失败:', error);
        throw error;
    }
}

/**
 * 构建特殊需求的约束条件
 */
function buildSpecialConstraints(specialNeeds) {
    if (!specialNeeds || specialNeeds.length === 0) {
        return '';
    }

    const constraints = [];

    if (specialNeeds.includes('儿童友好')) {
        constraints.push('- 圆角家具，避免尖锐边角');
        constraints.push('- 环保材料，无甲醛');
        constraints.push('- 易清洁表面');
        constraints.push('- 充足收纳空间（玩具、书籍）');
    }

    if (specialNeeds.includes('宠物友好')) {
        constraints.push('- 耐抓耐磨材质');
        constraints.push('- 易清洁地板和沙发');
        constraints.push('- 避免易碎装饰品');
    }

    if (specialNeeds.includes('易清洁')) {
        constraints.push('- 选择易擦拭材质（皮质、防水布料）');
        constraints.push('- 避免复杂装饰和死角');
        constraints.push('- 简洁线条，减少积灰');
    }

    if (specialNeeds.includes('收纳需求大')) {
        constraints.push('- 多功能家具（带储物的沙发、床）');
        constraints.push('- 墙面收纳（置物架、挂钩）');
        constraints.push('- 隐藏式收纳空间');
    }

    if (specialNeeds.includes('在家办公')) {
        constraints.push('- 舒适的办公区域');
        constraints.push('- 充足的照明（护眼灯）');
        constraints.push('- 合理的线路规划');
    }

    if (constraints.length > 0) {
        return '\n【特殊需求约束】\n' + constraints.join('\n');
    }

    return '';
}

/**
 * 生成购物清单
 */
async function generateShoppingList(designPlan, userRequirements) {
    try {
        const { budget_range, accept_second_hand } = userRequirements;
        const [minBudget, maxBudget] = budget_range.split('-').map(Number);

        const prompt = `
根据设计方案，生成购物清单。

【设计方案】
${JSON.stringify(designPlan, null, 2)}

【预算】¥${budget_range}
【是否接受二手】${accept_second_hand ? '是' : '否'}

请生成购物清单（JSON格式）：

{
  "items": [
    {
      "category": "沙发/茶几/灯具/装饰品",
      "name": "具体商品名称",
      "price": 2800,
      "is_second_hand": false,
      "tags": ["标签1", "标签2"],
      "reason": "推荐理由（20字以内）",
      "priority": "必需/推荐/可选"
    }
  ]
}

要求：
1. 总价控制在 ¥${minBudget}-${maxBudget}
2. ${accept_second_hand ? '可以推荐二手商品（价格更低）' : '只推荐全新商品'}
3. 按优先级排序（必需 > 推荐 > 可选）
4. 价格要真实、合理
5. 推荐 5-10 个商品
6. 直接输出 JSON，不要其他文字
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        const text = response.text.trim();

        // 提取 JSON
        let jsonText = text;
        if (text.includes('```json')) {
            jsonText = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
            jsonText = text.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonText);
        return result.items || [];

    } catch (error) {
        console.error('生成购物清单失败:', error);
        return [];
    }
}

/**
 * 生成渲染图
 */
async function generateRenderedImage(photo, designPlan) {
    try {
        console.log('调用 Gemini 2.5 Flash Image 生成渲染图...');

        const { fileToGenerativePart } = require('./aiService');
        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        // 构建渲染指令
        const renderPrompt = `
基于这张房间照片，生成定制后的效果图。

【设计方案】
标题：${designPlan.title}
设计理念：${designPlan.description}

【家具布置】
${JSON.stringify(designPlan.furniture_layout, null, 2)}

【色彩方案】
主色调：${designPlan.color_scheme.主色调}
辅助色：${designPlan.color_scheme.辅助色}
点缀色：${designPlan.color_scheme.点缀色}

【材质】${designPlan.material_suggestions.join('、')}

【要求】
1. **保持原有硬装**：不改变地板、墙面、窗户、门的位置和样式
2. **添加家具**：根据家具布置方案，添加相应的家具
3. **色彩协调**：使用指定的色彩方案
4. **风格统一**：整体风格符合设计理念
5. **真实感强**：效果图要自然、可实现，不要过于夸张
6. **光线合理**：保持原图的采光条件
7. **空间布局**：家具摆放合理，符合人体工程学

请生成改造后的房间效果图。
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [imagePart, { text: renderPrompt }]
        });

        // 从响应中提取图像数据
        if (response.candidates && response.candidates.length > 0) {
            const parts = response.candidates[0].content.parts;

            for (const part of parts) {
                if (part.inlineData) {
                    const imageData = part.inlineData.data;
                    console.log('渲染图生成成功，大小:', imageData.length);
                    return imageData; // 返回 base64 字符串
                }
            }
        }

        console.warn('未找到图像数据');
        return null;

    } catch (error) {
        console.error('生成渲染图失败:', error);
        return null;
    }
}

module.exports = {
    generateCustomizationPlan
};
