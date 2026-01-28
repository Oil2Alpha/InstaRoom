// # 数据库模拟
// models/db.js - 模拟数据库

const SAMPLE_FURNITURE_DATA = [
    // 假设我们要替换的是一张椅子 (尺寸计算结果 46x46x84)
    {
        furniture_id: 101,
        name: "Skye Ergonomic Chair",
        source: "IKEA",
        is_used: false,
        price: 99.99,
        image_url: "F://InstaRoom/server/test_furniture/skye_chair.jpg", // 真实项目需配置
        length_cm: 44.0, 
        width_cm: 46.0,
        height_cm: 77.0,
        style_tags: ["Minimalist", "Modern"],
        feature_tags: ["Comfort First", "Ergonomics","Visually Spacious"],
        color_tag: "Light_Gray"
    },
    {
        furniture_id: 102,
        name: "Vintage Eames Style Chair",
        source: "Craigslist",
        is_used: true,
        price: 350.00,
        image_url: "F://InstaRoom/server/test_furniture/eames_chair.jpg",
        length_cm: 45.0, 
        width_cm: 45.0,
        height_cm: 85.0,
        style_tags: ["Mid-Century", "Unique Design"],
        feature_tags: ["High Durability"],
        color_tag: "White/Black"
    },
    {
        furniture_id: 103,
        name: "Rustic Wooden Stool",
        source: "Local_Used",
        is_used: true,
        price: 30.00,
        image_url: "F://InstaRoom/server/test_furniture/stool.jpg",
        length_cm: 40.0, 
        width_cm: 40.0,
        height_cm: 60.0,
        style_tags: ["Rustic", "Farmhouse"],
        feature_tags: ["Lightweight"],
        color_tag: "Brown"
    }
    // ... 更多商品数据
];

function getAllFurniture() {
    return SAMPLE_FURNITURE_DATA;
}

module.exports = {
    getAllFurniture
};