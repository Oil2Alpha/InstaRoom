// # 实现家居环境评分的逻辑 (调用 aiService)
const { ai, fileToGenerativePart, cleanupTempFile } = require('./aiService');
const { generateScoringPrompt } = require('../config/prompts');

/**
 * 调用 Gemini 3 Agent 对上传的房间照片进行打分和建议分析。
 * @param {object} photo - 上传的文件对象，包含 path, mimeType, size 等信息 (由 Koa 中间件提供)
 * @param {string} [focusArea] - 用户可选的关注点
 * @returns {object} 结构化的 JSON 评分结果
 */

async function getHomeScore(photo, focusArea = null, language = 'en') {

    //const photoPath = photo.path;
    const photoPath = photo.filepath;
    const photoMimeType = photo.mimetype;
    //const photoMimeType = photo.type; // Koa-bodyparser 通常将 mimeType 命名为 type

    // 确保文件路径存在
    if (!photoPath) {
        throw new Error("Missing photo file path for scoring.");
    }

    try {
        // 1. 准备 Gemini API 的输入数据
        const imagePart = fileToGenerativePart(photoPath, photoMimeType);
        const prompt = await generateScoringPrompt(focusArea, language);

        // 2. 调用 Gemini API 进行内容生成
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // 使用强大的模型进行复杂的视觉和逻辑推理
            contents: [
                imagePart, // 传入图片
                { text: prompt } // 传入详细指令
            ],
            config: {
                // 要求模型返回严格的 JSON 格式
                responseMimeType: "application/json",
                temperature: 0.1 // 降低温度，要求更客观和一致的输出
            }
        });

        // 3. 解析结果并处理
        let resultJson;

        const rawText = response.text.trim();
        console.log("--- RAW GEMINI RESPONSE START ---");
        console.log(rawText);
        console.log("--- RAW GEMINI RESPONSE END ---");

        try {
            // Gemini API 响应的 text 字段包含了我们要求输出的 JSON 字符串
            resultJson = JSON.parse(response.text);
        } catch (e) {
            console.error("Gemini did not return valid JSON:", response.text);
            throw new Error("AI 模型输出格式错误，请检查 Prompt。");
        }

        // 4. 返回处理后的结果
        return resultJson;

    } catch (error) {
        console.error("Error during scoring service:", error.message);
        throw error;
    } finally {
        // 5. 关键：清理上传的临时文件
        if (photoPath) {
            cleanupTempFile(photoPath);
        }
    }
}

module.exports = {
    getHomeScore
};