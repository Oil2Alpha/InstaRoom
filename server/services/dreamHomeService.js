// services/dreamHomeService.js

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});

/**
 * 基于评分优化点生成梦中情家
 * @param {object} photo - 原始照片对象 {filepath, mimetype}
 * @param {object} scoreData - 评分数据
 * @returns {object} { renderedImage, shoppingList }
 */
async function generateDreamHome(photo, scoreData) {
    try {
        console.log('\n=== 开始生成梦中情家 ===');
        console.log('评分:', scoreData.score);
        console.log('优化建议数量:', scoreData.suggestions?.length || 0);

        // 步骤1：分析优化点并生成改造描述
        const improvementPrompt = generateImprovementPrompt(scoreData);
        console.log('改造描述生成完成');

        // 步骤2：生成购物清单
        const shoppingList = await generateShoppingList(scoreData);
        console.log('购物清单生成完成，商品数量:', shoppingList.length);

        // 步骤3：生成渲染图
        const renderedImage = await generateRenderedImage(photo, improvementPrompt);
        console.log('渲染图生成完成');

        return {
            renderedImage,
            shoppingList
        };

    } catch (error) {
        console.error('生成梦中情家失败:', error);
        throw error;
    }
}

/**
 * 生成改造描述 prompt
 */
function generateImprovementPrompt(scoreData) {
    const { score, suggestions, narrative } = scoreData;

    // 提取优化建议（支持字符串数组和对象数组）
    let suggestionTexts = '无具体建议';
    if (suggestions && suggestions.length > 0) {
        suggestionTexts = suggestions.map(s => {
            // 如果是字符串，直接使用；如果是对象，取 suggestion 字段
            return typeof s === 'string' ? s : (s.suggestion || s);
        }).join('\n- ');
    }

    const prompt = `
请在这张房间照片的基础上，进行以下改造优化：

【当前评分】${score}/100

【优化建议】
- ${suggestionTexts}

【改造要求】
1. **保持原有布局**：不改变房间的整体结构、墙面、地板、窗户位置
2. **根据建议改造**：
   - 如果建议"增加绿植" → 在合适位置添加 1-2 盆绿植（如龟背竹、琴叶榕）
   - 如果建议"改善照明" → 增加落地灯、台灯或调整光线
   - 如果建议"优化收纳" → 添加收纳柜、置物架
   - 如果建议"增加装饰" → 添加挂画、抱枕、地毯等装饰品
   - 如果建议"调整色彩" → 通过软装调整色彩搭配
3. **提升美观度**：整体更加整洁、温馨、有设计感
4. **保持真实感**：改造后的效果要自然、可实现，不要过于夸张
5. **适当消除杂物**：让空间更整洁，但保持生活气息

【风格要求】
- 现代简约、温馨舒适
- 光线明亮、通透
- 色彩和谐、有层次感

请生成改造后的房间效果图。
`;

    return prompt;
}

/**
 * 生成购物清单
 */
async function generateShoppingList(scoreData) {
    try {
        const { suggestions } = scoreData;

        if (!suggestions || suggestions.length === 0) {
            return [];
        }

        // 格式化建议（支持字符串和对象）
        const formattedSuggestions = suggestions.map((s, i) => {
            const text = typeof s === 'string' ? s : (s.suggestion || s);
            return `${i + 1}. ${text}`;
        }).join('\n');

        const prompt = `
你是一位专业的家居设计师。根据以下房间优化建议，生成一份购物清单。

【优化建议】
${formattedSuggestions}

请为每条建议推荐 1-2 个具体商品，生成 JSON 格式的购物清单。

【输出格式】
\`\`\`json
{
  "items": [
    {
      "category": "商品类别（如：绿植、灯具、收纳、装饰品）",
      "name": "具体商品名称",
      "tags": ["标签1", "标签2", "标签3"],
      "reason": "推荐理由（简短，20字以内）",
      "estimatedPrice": "价格区间（如：50-100）"
    }
  ]
}
\`\`\`

【标签示例】
- 绿植：小型、中型、大型、净化空气、耐阴、好养护
- 灯具：暖光、冷光、可调光、护眼、节能
- 收纳：多层、可移动、简约、大容量
- 装饰品：北欧风、现代简约、温馨、艺术感

【要求】
1. 商品要具体、实用、易购买
2. 价格合理，符合大众消费水平
3. 标签要准确、有用
4. 推荐理由要简洁明了
5. 总共推荐 3-6 个商品

请直接输出 JSON，不要有其他文字。
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
        // 返回空列表而不是抛出错误
        return [];
    }
}

/**
 * 生成渲染图
 */
async function generateRenderedImage(photo, improvementPrompt) {
    try {
        console.log('调用 Gemini 2.5 Flash Image 生成渲染图...');

        // 导入 fileToGenerativePart 函数
        const { fileToGenerativePart } = require('./aiService');

        // 将照片转换为 Gemini API 格式
        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        // 使用 Gemini 2.5 Flash Image 模型进行图像编辑
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [
                imagePart,  // 原始照片
                { text: improvementPrompt }  // 改造指令
            ]
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
    generateDreamHome
};
