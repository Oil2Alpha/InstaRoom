//  Gemini 客户端初始化、文件处理等基础 AI 交互

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); // 加载根目录的 .env

// 初始化 Gemini 客户端
if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not defined in .env");
    throw new Error("Missing GEMINI_API_KEY");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


/**
 * 辅助函数：将本地文件（如上传的照片）转换为 Gemini API 可接受的 Part 格式。
 * Gemini 推荐使用 Base64 编码的 inlineData。
 * @param {string} localPath - 文件在服务器上的临时路径 (Koa-body/Multer 提供)
 * @param {string} mimeType - 文件的 MIME 类型 (e.g., 'image/jpeg')
 * @returns {object} Generative Part 对象
 */
function fileToGenerativePart(localPath, mimeType) {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        return {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            },
        };
    } catch (error) {
        console.error(`Error reading file at ${localPath}:`, error);
        throw new Error("Failed to read local file for Gemini API.");
    }
}

/**
 * 辅助函数：处理完文件后，清理服务器上的临时文件
 * @param {string} localPath - 文件路径
 */
function cleanupTempFile(localPath) {
    if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
    }
}

module.exports = {
    ai,
    fileToGenerativePart,
    cleanupTempFile
};