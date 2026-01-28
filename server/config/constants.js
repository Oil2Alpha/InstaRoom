// 项目中使用的常量（如参考物标准尺寸）
// config/constants.js

// 标准参考物尺寸（示例：可乐罐，单位：厘米）
const REFERENCE_OBJECTS = {
    'Coke_Can': {
        name: 'Standard Coke Can',
        height_cm: 12.2,
        width_cm: 6.6, // 直径
        type: 'cylinder'
    },
    'Beer_Can': {
        name: 'Standard Coke Can',
        height_cm: 12.2,
        width_cm: 6.6, // 直径
        type: 'cylinder'
    },
    'A4_Paper': {
        name: 'A4 Paper',
        height_cm: 29.7,
        width_cm: 21.0,
        type: 'flat'
    },
    'Chinese_id_card': {
        name: 'id card',
        height_cm: 8.56,
        width_cm: 5.4,
        type: 'flat'
    }
    // 更多参考物可以添加到这里
};

// 评分维度
const SCORE_DIMENSIONS = [
    'Functional_Score',
    'Aesthetics_Score',
    'Lighting_Score',
    'Overall_Design_Score'
];

// 其他通用的常量
const MAX_PHOTOS = 3; 

module.exports = {
    REFERENCE_OBJECTS,
    SCORE_DIMENSIONS,
    MAX_PHOTOS
};