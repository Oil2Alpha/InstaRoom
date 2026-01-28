// 根据用户需求实现商品数据库匹配

// models/furnitureModel.js

const { getAllFurniture } = require('./db');

/**
 * 根据尺寸、风格、预算和用户偏好权重筛选家具。
 * 
 * @param {object} requirements - 整合后的筛选要求
 * @returns {object[]} 筛选并排好序的商品列表
 */
function filterFurniture(requirements) {
    const allItems = getAllFurniture();
    const { 
        targetDimensions, // { length_cm, width_cm, height_cm }
        environmentStyle, // 'Minimalist/Modern'
        userBudget, // [min, max]
        usedWeight, // 0.0 - 1.0
        userTags // ['Comfort First']
    } = requirements;
    
    const results = [];

    for (const item of allItems) {
        let score = 0; // 匹配分数 (用于排序)
        
        // --- 1. 硬性条件筛选 (尺寸和预算) ---
        
        // 尺寸检查：商品尺寸必须小于等于目标尺寸 (留出微小缓冲)
        if (
            item.length_cm > targetDimensions.length_cm * 1.05 ||
            item.width_cm > targetDimensions.width_cm * 1.05 ||
            item.height_cm > targetDimensions.height_cm * 1.05
        ) {
            continue; // 尺寸超限，直接跳过
        }
        
        // 预算检查
        if (item.price < userBudget[0] || item.price > userBudget[1]) {
            continue;
        }

        // --- 2. 软性条件评分 (加权) ---

        // A. 风格契合度评分
        const styleMatch = item.style_tags.some(tag => environmentStyle.includes(tag));
        if (styleMatch) {
            score += 40; // 匹配风格权重高
        }
        
        // B. 用户特性标签匹配
        const userTagMatchCount = item.feature_tags.filter(tag => userTags.includes(tag)).length;
        score += userTagMatchCount * 15;
        
        // C. 新旧偏好加权 (二手加分或减分)
        if (item.is_used) {
            score += (usedWeight * 30); // 如果用户偏好二手 (usedWeight高), 则二手商品加分
        } else {
            score += ((1 - usedWeight) * 30); // 如果用户偏好新 (1-usedWeight高), 则新商品加分
        }

        // D. 价格/预算舒适度 (价格越接近预算中间，得分越高)
        const budgetRange = userBudget[1] - userBudget[0];
        const priceMidpoint = (userBudget[0] + userBudget[1]) / 2;
        score += 20 * (1 - Math.abs(item.price - priceMidpoint) / (budgetRange / 2));


        // 组合结果
        results.push({ ...item, match_score: Math.round(score) });
    }

    // 3. 排序：按匹配分数从高到低排序
    results.sort((a, b) => b.match_score - a.match_score);
    
    // 返回 Top 10 结果
    return results.slice(0, 10);
}

module.exports = {
    filterFurniture
};