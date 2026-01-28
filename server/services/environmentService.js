// 做环境评估，用于数据库匹配关键词

const { ai, fileToGenerativePart, cleanupTempFile } = require('./aiService');
const { generateEnvironmentPrompt } = require('../config/prompts');

async function analyzeRoomEnvironment(photo) {
    const photoPath = photo.filepath;
    const photoMimeType = photo.mimetype;
    
    if (!photoPath) {
        throw new Error("Missing photo file path for environment analysis.");
    }

    try {
        const imagePart = fileToGenerativePart(photoPath, photoMimeType);
        const prompt = generateEnvironmentPrompt('房间'); // 默认使用 '房间'

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // flash 足够应对风格和光照分析
            contents: [imagePart, { text: prompt }],
            config: {
                responseMimeType: "application/json", 
                temperature: 0.2 // 略微增加创造性，以识别风格
            }
        });

        let resultJson;
        try {
            resultJson = JSON.parse(response.text.trim());
        } catch (e) {
            console.error("Gemini environment analysis returned invalid JSON:", response.text);
            throw new Error("AI 环境分析输出格式错误。");
        }

        return resultJson;

    } catch (error) {
        console.error("Error during environment service:", error.message);
        throw error;
    } finally {
        // 分析后清理临时文件
        // 暂不清理，后续统一清理
        // if (photoPath) {
        //     cleanupTempFile(photoPath);
        // }
    }
}

module.exports = {
    analyzeRoomEnvironment
};