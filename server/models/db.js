// # 数据库模拟
// models/db.js - 模拟家具商品数据库

// 家具商品数据库
const FURNITURE_DATABASE = [
    // ========== 沙发类 ==========
    {
        furniture_id: 'sofa_001',
        name: '北欧简约布艺沙发',
        category: '沙发',
        source: 'IKEA',
        is_used: false,
        price: 2999,
        image_url: 'https://via.placeholder.com/400x300?text=Nordic+Sofa',
        dimensions: {
            length_cm: 205,
            width_cm: 88,
            height_cm: 82
        },
        style_tags: ['现代', '北欧', '简约'],
        feature_tags: ['舒适', '可拆洗', '三人位'],
        color_tag: '米色',
        material: '布艺',
        brand: 'IKEA',
        rating: 4.5,
        sales: 1250
    },
    {
        furniture_id: 'sofa_002',
        name: '意式轻奢真皮沙发',
        category: '沙发',
        source: '天猫',
        is_used: false,
        price: 8999,
        image_url: 'https://via.placeholder.com/400x300?text=Luxury+Sofa',
        dimensions: {
            length_cm: 220,
            width_cm: 95,
            height_cm: 85
        },
        style_tags: ['轻奢', '现代', '意式'],
        feature_tags: ['真皮', '高端', '三人位'],
        color_tag: '灰色',
        material: '真皮',
        brand: '顾家家居',
        rating: 4.8,
        sales: 580
    },
    {
        furniture_id: 'sofa_003',
        name: '日式无印风布艺沙发',
        category: '沙发',
        source: '京东',
        is_used: false,
        price: 1899,
        image_url: 'https://via.placeholder.com/400x300?text=Muji+Sofa',
        dimensions: {
            length_cm: 180,
            width_cm: 85,
            height_cm: 75
        },
        style_tags: ['日式', '无印', '简约'],
        feature_tags: ['小户型', '舒适', '双人位'],
        color_tag: '原木色',
        material: '棉麻',
        brand: '无印良品',
        rating: 4.6,
        sales: 920
    },

    // ========== 茶几类 ==========
    {
        furniture_id: 'table_001',
        name: '北欧大理石茶几',
        category: '茶几',
        source: 'IKEA',
        is_used: false,
        price: 899,
        image_url: 'https://via.placeholder.com/400x300?text=Marble+Table',
        dimensions: {
            length_cm: 120,
            width_cm: 60,
            height_cm: 45
        },
        style_tags: ['现代', '北欧', '轻奢'],
        feature_tags: ['大理石', '防水', '易清洁'],
        color_tag: '白色',
        material: '大理石+金属',
        brand: 'IKEA',
        rating: 4.4,
        sales: 1580
    },
    {
        furniture_id: 'table_002',
        name: '实木圆形茶几',
        category: '茶几',
        source: '天猫',
        is_used: false,
        price: 1299,
        image_url: 'https://via.placeholder.com/400x300?text=Wood+Table',
        dimensions: {
            length_cm: 80,
            width_cm: 80,
            height_cm: 42
        },
        style_tags: ['日式', '原木', '简约'],
        feature_tags: ['实木', '圆角', '小户型'],
        color_tag: '原木色',
        material: '橡木',
        brand: '林氏木业',
        rating: 4.7,
        sales: 760
    },

    // ========== 电视柜类 ==========
    {
        furniture_id: 'tv_001',
        name: '现代简约电视柜',
        category: '电视柜',
        source: '京东',
        is_used: false,
        price: 1599,
        image_url: 'https://via.placeholder.com/400x300?text=TV+Cabinet',
        dimensions: {
            length_cm: 180,
            width_cm: 40,
            height_cm: 50
        },
        style_tags: ['现代', '简约', '北欧'],
        feature_tags: ['大容量', '抽屉', '开放格'],
        color_tag: '白色',
        material: '板材',
        brand: '全友家居',
        rating: 4.5,
        sales: 1120
    },

    // ========== 床类 ==========
    {
        furniture_id: 'bed_001',
        name: '北欧实木双人床',
        category: '床',
        source: '天猫',
        is_used: false,
        price: 3299,
        image_url: 'https://via.placeholder.com/400x300?text=Nordic+Bed',
        dimensions: {
            length_cm: 200,
            width_cm: 180,
            height_cm: 90
        },
        style_tags: ['北欧', '现代', '简约'],
        feature_tags: ['实木', '1.8米', '高箱'],
        color_tag: '原木色',
        material: '橡木',
        brand: '源氏木语',
        rating: 4.8,
        sales: 650
    },

    // ========== 椅子类 ==========
    {
        furniture_id: 'chair_001',
        name: 'Skye 人体工学椅',
        category: '椅子',
        source: 'IKEA',
        is_used: false,
        price: 599,
        image_url: 'https://via.placeholder.com/400x300?text=Ergonomic+Chair',
        dimensions: {
            length_cm: 44,
            width_cm: 46,
            height_cm: 77
        },
        style_tags: ['现代', '简约', '办公'],
        feature_tags: ['人体工学', '舒适', '透气'],
        color_tag: '灰色',
        material: '网布+金属',
        brand: 'IKEA',
        rating: 4.6,
        sales: 2100
    },
    {
        furniture_id: 'chair_002',
        name: 'Eames 复刻餐椅',
        category: '椅子',
        source: '淘宝',
        is_used: false,
        price: 299,
        image_url: 'https://via.placeholder.com/400x300?text=Eames+Chair',
        dimensions: {
            length_cm: 45,
            width_cm: 45,
            height_cm: 85
        },
        style_tags: ['中古', '设计师款', '现代'],
        feature_tags: ['经典', '轻便', '百搭'],
        color_tag: '白色',
        material: 'PP+金属',
        brand: '设计师复刻',
        rating: 4.3,
        sales: 3500
    },

    // ========== 书桌类 ==========
    {
        furniture_id: 'desk_001',
        name: '极简电脑桌',
        category: '书桌',
        source: '京东',
        is_used: false,
        price: 899,
        image_url: 'https://via.placeholder.com/400x300?text=Minimal+Desk',
        dimensions: {
            length_cm: 120,
            width_cm: 60,
            height_cm: 75
        },
        style_tags: ['现代', '极简', '北欧'],
        feature_tags: ['简约', '实用', '小户型'],
        color_tag: '白色',
        material: '板材',
        brand: '网易严选',
        rating: 4.5,
        sales: 1800
    },

    // ========== 衣柜类 ==========
    {
        furniture_id: 'wardrobe_001',
        name: '北欧推拉门衣柜',
        category: '衣柜',
        source: '天猫',
        is_used: false,
        price: 4599,
        image_url: 'https://via.placeholder.com/400x300?text=Wardrobe',
        dimensions: {
            length_cm: 200,
            width_cm: 60,
            height_cm: 220
        },
        style_tags: ['北欧', '现代', '简约'],
        feature_tags: ['推拉门', '大容量', '静音'],
        color_tag: '白色',
        material: '板材',
        brand: '索菲亚',
        rating: 4.7,
        sales: 420
    },

    // ========== 餐桌类 ==========
    {
        furniture_id: 'dining_001',
        name: '实木餐桌',
        category: '餐桌',
        source: '京东',
        is_used: false,
        price: 2199,
        image_url: 'https://via.placeholder.com/400x300?text=Dining+Table',
        dimensions: {
            length_cm: 140,
            width_cm: 80,
            height_cm: 75
        },
        style_tags: ['北欧', '原木', '简约'],
        feature_tags: ['实木', '4-6人', '耐用'],
        color_tag: '原木色',
        material: '橡木',
        brand: '林氏木业',
        rating: 4.6,
        sales: 890
    }
];

/**
 * 获取所有家具数据
 */
function getAllFurniture() {
    return FURNITURE_DATABASE;
}

/**
 * 根据类别获取家具
 * @param {string} category - 家具类别（如"沙发"、"茶几"）
 */
function getFurnitureByCategory(category) {
    return FURNITURE_DATABASE.filter(item => item.category === category);
}

/**
 * 根据风格标签搜索家具
 * @param {array} styleKeywords - 风格关键词数组
 * @param {string} category - 家具类别（可选）
 */
function searchByStyle(styleKeywords, category = null) {
    let results = FURNITURE_DATABASE;

    // 按类别过滤
    if (category) {
        results = results.filter(item => item.category === category);
    }

    // 计算匹配度并排序
    results = results.map(item => {
        const matchCount = styleKeywords.filter(keyword =>
            item.style_tags.some(tag => tag.includes(keyword) || keyword.includes(tag))
        ).length;

        return {
            ...item,
            matchScore: matchCount / styleKeywords.length
        };
    });

    // 只返回有匹配的商品，按匹配度排序
    return results
        .filter(item => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 根据尺寸和风格搜索家具（核心搜索函数）
 * @param {object} params - 搜索参数
 * @param {string} params.category - 家具类别
 * @param {object} params.dimensions - 目标尺寸 {length, width, height}
 * @param {array} params.styleKeywords - 风格关键词
 * @param {number} params.tolerance - 尺寸容差（默认 15%）
 */
function searchFurniture({ category, dimensions, styleKeywords, tolerance = 0.15 }) {
    let results = FURNITURE_DATABASE;

    // 1. 按类别过滤
    if (category) {
        results = results.filter(item => item.category === category);
    }

    // 2. 计算综合匹配分数
    results = results.map(item => {
        // 风格匹配分数 (0-1)
        const styleMatchCount = styleKeywords.filter(keyword =>
            item.style_tags.some(tag => tag.includes(keyword) || keyword.includes(tag)) ||
            item.color_tag.includes(keyword) || keyword.includes(item.color_tag)
        ).length;
        const styleScore = styleMatchCount / Math.max(styleKeywords.length, 1);

        // 尺寸匹配分数 (0-1)
        let sizeScore = 1.0;
        if (dimensions) {
            const lengthDiff = Math.abs(item.dimensions.length_cm - dimensions.length) / dimensions.length;
            const widthDiff = Math.abs(item.dimensions.width_cm - dimensions.width) / dimensions.width;
            const heightDiff = Math.abs(item.dimensions.height_cm - dimensions.height) / dimensions.height;

            const avgDiff = (lengthDiff + widthDiff + heightDiff) / 3;
            sizeScore = Math.max(0, 1 - avgDiff / tolerance);
        }

        // 综合分数：风格 60% + 尺寸 40%
        const matchScore = styleScore * 0.6 + sizeScore * 0.4;

        return {
            ...item,
            matchScore: parseFloat(matchScore.toFixed(2)),
            styleScore: parseFloat(styleScore.toFixed(2)),
            sizeScore: parseFloat(sizeScore.toFixed(2))
        };
    });

    // 3. 过滤和排序
    return results
        .filter(item => item.matchScore > 0.3) // 至少 30% 匹配度
        .sort((a, b) => {
            // 优先按匹配度排序
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            // 匹配度相同时，按销量排序
            return b.sales - a.sales;
        })
        .slice(0, 10); // 最多返回 10 个结果
}

/**
 * 根据 ID 获取家具
 */
function getFurnitureById(id) {
    return FURNITURE_DATABASE.find(item => item.furniture_id === id);
}

/**
 * 获取热门商品
 * @param {number} limit - 返回数量
 */
function getPopularFurniture(limit = 10) {
    return [...FURNITURE_DATABASE]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
}

module.exports = {
    getAllFurniture,
    getFurnitureByCategory,
    searchByStyle,
    searchFurniture,
    getFurnitureById,
    getPopularFurniture,
    FURNITURE_DATABASE
};