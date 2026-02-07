// 最简单的 Vercel Serverless Function 测试
module.exports = (req, res) => {
    res.status(200).json({
        message: 'Hello from InstaRoom API!',
        timestamp: new Date().toISOString()
    });
};
