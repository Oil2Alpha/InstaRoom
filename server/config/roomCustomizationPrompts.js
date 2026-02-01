// config/roomCustomizationPrompts.js
// Room Customization 多语言 Prompt 配置

/**
 * 获取设计方案 Prompt
 */
function getDesignPlanPrompt(roomAnalysis, userRequirements, specialConstraints, language = 'en') {
    const {
        room_purpose,
        occupants,
        style_preferences,
        special_needs,
        budget_range
    } = userRequirements;

    if (language === 'zh') {
        return `
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
    }

    // English version
    return `
You are a professional interior designer with 15 years of experience. Generate a custom design plan based on room analysis and user requirements.

【Room Analysis】
- Type: ${roomAnalysis.room_type}
- Area: ${roomAnalysis.area_range}㎡
- Ceiling Height: ${roomAnalysis.ceiling_height}m
- Space Feeling: ${roomAnalysis.space_feeling}
- Natural Light: ${roomAnalysis.natural_light}
- Current State: ${roomAnalysis.existing_furniture}
- Floor Type: ${roomAnalysis.floor_type}
- Style Hints: ${roomAnalysis.style_hints}

【User Requirements】
- Room Purpose: ${room_purpose}
- Occupants: ${occupants} people
- Style Preferences: ${style_preferences.join(', ')}
- Special Needs: ${special_needs.join(', ') || 'None'}
- Budget Range: ¥${budget_range}

${specialConstraints}

Please generate a design plan (JSON format):

{
  "title": "Design Plan Title (e.g., Modern Minimalist Living Room Design)",
  "description": "Design concept and overall approach (100-150 words)",
  "key_features": [
    "Key Feature 1",
    "Key Feature 2",
    "Key Feature 3"
  ],
  "furniture_layout": {
    "Main Furniture": ["Sofa", "Coffee Table", "TV Cabinet"],
    "Secondary Furniture": ["Side Table", "Shelving"],
    "Decorations": ["Wall Art", "Plants", "Throw Pillows"]
  },
  "color_scheme": {
    "Primary Color": "#FFFFFF",
    "Secondary Color": "#F5F5F5",
    "Accent Color": "#4A90E2"
  },
  "material_suggestions": ["Solid Wood", "Fabric", "Metal"],
  "lighting_plan": "Lighting plan description"
}

Requirements:
1. Match user's style preferences
2. Meet special requirements constraints
3. Stay within budget range
4. Practical and aesthetically pleasing
5. Output JSON directly, no other text
`;
}

/**
 * 获取购物清单 Prompt
 */
function getShoppingListPrompt(designPlan, userRequirements, language = 'en') {
    const { budget_range, accept_second_hand } = userRequirements;
    const [minBudget, maxBudget] = budget_range.split('-').map(Number);

    if (language === 'zh') {
        return `
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
    }

    // English version
    return `
Generate a shopping list based on the design plan.

【Design Plan】
${JSON.stringify(designPlan, null, 2)}

【Budget】¥${budget_range}
【Accept Second-hand】${accept_second_hand ? 'Yes' : 'No'}

Please generate a shopping list (JSON format):

{
  "items": [
    {
      "category": "Sofa/Coffee Table/Lighting/Decor",
      "name": "Specific product name",
      "price": 2800,
      "is_second_hand": false,
      "tags": ["Tag1", "Tag2"],
      "reason": "Recommendation reason (within 20 words)",
      "priority": "Essential/Recommended/Optional"
    }
  ]
}

Requirements:
1. Total price within ¥${minBudget}-${maxBudget}
2. ${accept_second_hand ? 'Can recommend second-hand items (lower price)' : 'Only recommend new items'}
3. Sort by priority (Essential > Recommended > Optional)
4. Prices should be realistic and reasonable
5. Recommend 5-10 items
6. Output JSON directly, no other text
`;
}

/**
 * 构建特殊需求的约束条件
 */
function buildSpecialConstraints(specialNeeds, language = 'en') {
    if (!specialNeeds || specialNeeds.length === 0) {
        return '';
    }

    const constraints = [];

    // 儿童友好 / Child-friendly
    if (specialNeeds.includes('儿童友好') || specialNeeds.includes('Child-friendly')) {
        if (language === 'zh') {
            constraints.push('- 圆角家具，避免尖锐边角');
            constraints.push('- 环保材料，无甲醛');
            constraints.push('- 易清洁表面');
            constraints.push('- 充足收纳空间（玩具、书籍）');
        } else {
            constraints.push('- Rounded furniture, avoid sharp edges');
            constraints.push('- Eco-friendly materials, formaldehyde-free');
            constraints.push('- Easy-to-clean surfaces');
            constraints.push('- Ample storage space (toys, books)');
        }
    }

    // 宠物友好 / Pet-friendly
    if (specialNeeds.includes('宠物友好') || specialNeeds.includes('Pet-friendly')) {
        if (language === 'zh') {
            constraints.push('- 耐抓耐磨材质');
            constraints.push('- 易清洁地板和沙发');
            constraints.push('- 避免易碎装饰品');
        } else {
            constraints.push('- Scratch and wear resistant materials');
            constraints.push('- Easy-to-clean floors and sofas');
            constraints.push('- Avoid fragile decorations');
        }
    }

    // 易清洁 / Easy to Clean
    if (specialNeeds.includes('易清洁') || specialNeeds.includes('Easy to Clean')) {
        if (language === 'zh') {
            constraints.push('- 选择易擦拭材质（皮质、防水布料）');
            constraints.push('- 避免复杂装饰和死角');
            constraints.push('- 简洁线条，减少积灰');
        } else {
            constraints.push('- Choose easy-to-wipe materials (leather, waterproof fabric)');
            constraints.push('- Avoid complex decorations and corners');
            constraints.push('- Clean lines, reduce dust accumulation');
        }
    }

    // 收纳需求大 / Large Storage
    if (specialNeeds.includes('收纳需求大') || specialNeeds.includes('Large Storage')) {
        if (language === 'zh') {
            constraints.push('- 多功能家具（带储物的沙发、床）');
            constraints.push('- 墙面收纳（置物架、挂钩）');
            constraints.push('- 隐藏式收纳空间');
        } else {
            constraints.push('- Multi-functional furniture (storage sofa, bed)');
            constraints.push('- Wall storage (shelves, hooks)');
            constraints.push('- Hidden storage space');
        }
    }

    // 在家办公 / Home Office
    if (specialNeeds.includes('在家办公') || specialNeeds.includes('Home Office')) {
        if (language === 'zh') {
            constraints.push('- 舒适的办公区域');
            constraints.push('- 充足的照明（护眼灯）');
            constraints.push('- 合理的线路规划');
        } else {
            constraints.push('- Comfortable work area');
            constraints.push('- Adequate lighting (eye-care lamps)');
            constraints.push('- Proper cable management');
        }
    }

    if (constraints.length > 0) {
        const header = language === 'zh' ? '\n【特殊需求约束】\n' : '\n【Special Requirements Constraints】\n';
        return header + constraints.join('\n');
    }

    return '';
}

/**
 * 获取渲染图生成 Prompt
 */
function getRenderImagePrompt(designPlan, language = 'en') {
    // 安全获取颜色值
    const primaryColor = designPlan.color_scheme?.['主色调'] || designPlan.color_scheme?.['Primary Color'] || '#FFFFFF';
    const secondaryColor = designPlan.color_scheme?.['辅助色'] || designPlan.color_scheme?.['Secondary Color'] || '#F5F5F5';
    const accentColor = designPlan.color_scheme?.['点缀色'] || designPlan.color_scheme?.['Accent Color'] || '#4A90E2';
    const materials = designPlan.material_suggestions?.join(', ') || '';
    const furniture = JSON.stringify(designPlan.furniture_layout || {}, null, 2);

    if (language === 'zh') {
        return `基于这张房间照片，生成定制后的效果图。

【设计方案】
标题：${designPlan.title}
设计理念：${designPlan.description}

【家具布置】
${furniture}

【色彩方案】
主色调：${primaryColor}
辅助色：${secondaryColor}
点缀色：${accentColor}

【材质】${materials}

【要求】
1. **保持原有硬装**：不改变地板、墙面、窗户、门的位置和样式
2. **添加家具**：根据家具布置方案，添加相应的家具
3. **色彩协调**：使用指定的色彩方案
4. **风格统一**：整体风格符合设计理念
5. **真实感强**：效果图要自然、可实现，不要过于夸张
6. **光线合理**：保持原图的采光条件
7. **空间布局**：家具摆放合理，符合人体工程学

请生成改造后的房间效果图。`;
    }

    return `Based on this room photo, generate a customized rendering.

【Design Plan】
Title: ${designPlan.title}
Design Concept: ${designPlan.description}

【Furniture Layout】
${furniture}

【Color Scheme】
Primary Color: ${primaryColor}
Secondary Color: ${secondaryColor}
Accent Color: ${accentColor}

【Materials】${materials}

【Requirements】
1. **Keep original fixtures**: Don't change floor, walls, windows, doors position and style
2. **Add furniture**: Add furniture according to the layout plan
3. **Color coordination**: Use the specified color scheme
4. **Unified style**: Overall style matches design concept
5. **Realistic**: Rendering should be natural and achievable, not exaggerated
6. **Proper lighting**: Maintain original lighting conditions
7. **Space layout**: Furniture placement is reasonable and ergonomic

Please generate the customized room rendering.`;
}

module.exports = {
    getDesignPlanPrompt,
    getShoppingListPrompt,
    buildSpecialConstraints,
    getRenderImagePrompt
};
