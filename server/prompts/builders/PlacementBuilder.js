// prompts/builders/PlacementBuilder.js

const BasePromptBuilder = require('./BasePromptBuilder');

/**
 * 家具置换 Prompt 构建器
 */
class PlacementBuilder extends BasePromptBuilder {
    /**
     * 创建环境分析构建器
     * @param {string} language - 语言 ('en' 或 'zh')
     */
    static createEnvironmentBuilder(language = 'en') {
        return new PlacementEnvironmentBuilder(language);
    }

    /**
     * 创建方案生成构建器
     * @param {string} language - 语言 ('en' 或 'zh')
     */
    static createPlacementBuilder(language = 'en') {
        return new PlacementGenerationBuilder(language);
    }
}

/**
 * 家具置换 - 环境分析构建器
 */
class PlacementEnvironmentBuilder extends BasePromptBuilder {
    constructor(language = 'en') {
        const lang = language === 'zh' ? 'zh' : 'en';
        super(`placement/environment-analysis.${lang}.xml`);
        this.language = lang;
    }

    /**
     * 设置房间类型
     * @param {string} roomType - 房间类型描述
     * @returns {PlacementEnvironmentBuilder} this
     */
    setRoomType(roomType) {
        const defaultRoomType = this.language === 'zh' ? '房间' : 'Room';
        this.setVariable('room_type', roomType || defaultRoomType);
        return this;
    }
}

/**
 * 家具置换 - 方案生成构建器
 */
class PlacementGenerationBuilder extends BasePromptBuilder {
    constructor(language = 'en') {
        const lang = language === 'zh' ? 'zh' : 'en';
        super(
            `placement/placement-generation.${lang}.xml`,
            `placement/placement-examples.${lang}.json`
        );
        this.language = lang;
    }

    /**
     * 设置环境信息
     * @param {object} environment - 环境分析结果
     * @returns {PlacementGenerationBuilder} this
     */
    setEnvironment(environment) {
        const unknown = this.language === 'zh' ? '未知' : 'Unknown';
        this.setVariable('inherent_style', environment.inherent_style || unknown);
        this.setVariable('dominant_color_material', environment.dominant_color_material || unknown);
        this.setVariable('light_source_direction', environment.light_source_direction || unknown);
        this.setVariable('shadow_intensity', environment.shadow_intensity || unknown);
        return this;
    }

    /**
     * 设置家具信息
     * @param {object} furnitureInfo - 家具信息
     * @param {object} dimensions - 尺寸信息
     * @returns {PlacementGenerationBuilder} this
     */
    setFurniture(furnitureInfo, dimensions) {
        const defaultFurniture = this.language === 'zh' ? '家具' : 'Furniture';
        const defaultDesc = this.language === 'zh' ? '无' : 'None';
        this.setVariable('furniture_name', furnitureInfo.name || defaultFurniture);
        this.setVariable('furniture_description', furnitureInfo.description || defaultDesc);
        this.setVariable('length_cm', dimensions.length_cm || 0);
        this.setVariable('width_cm', dimensions.width_cm || 0);
        this.setVariable('height_cm', dimensions.height_cm || 0);
        return this;
    }

    /**
     * 设置用户偏好
     * @param {object} preferences - 用户偏好
     * @returns {PlacementGenerationBuilder} this
     */
    setPreferences(preferences) {
        let preferencesText = '';

        if (preferences) {
            if (this.language === 'zh') {
                // 中文偏好文本
                if (preferences.stylePreference && preferences.stylePreference.length > 0) {
                    preferencesText += `\n- 风格偏好：${preferences.stylePreference.join('、')}`;
                }
                if (preferences.preferUsed) {
                    preferencesText += `\n- 优先推荐二手家具`;
                }
                if (preferences.featureTags && preferences.featureTags.length > 0) {
                    preferencesText += `\n- 特殊需求标签：${preferences.featureTags.join('、')}`;
                }
                if (preferences.budgetRange) {
                    preferencesText += `\n- 预算范围：${preferences.budgetRange.min}-${preferences.budgetRange.max}元`;
                }
                this.setVariable('preferences', preferencesText || '无特殊偏好');
            } else {
                // 英文偏好文本
                if (preferences.stylePreference && preferences.stylePreference.length > 0) {
                    preferencesText += `\n- Style preference: ${preferences.stylePreference.join(', ')}`;
                }
                if (preferences.preferUsed) {
                    preferencesText += `\n- Prefer second-hand furniture`;
                }
                if (preferences.featureTags && preferences.featureTags.length > 0) {
                    preferencesText += `\n- Special requirement tags: ${preferences.featureTags.join(', ')}`;
                }
                if (preferences.budgetRange) {
                    preferencesText += `\n- Budget range: ${preferences.budgetRange.min}-${preferences.budgetRange.max} CNY`;
                }
                this.setVariable('preferences', preferencesText || 'No special preferences');
            }
        } else {
            this.setVariable('preferences', this.language === 'zh' ? '无特殊偏好' : 'No special preferences');
        }
        return this;
    }

    /**
     * 根据家具类型自动选择相关示例
     * @param {string} furnitureName - 家具名称
     * @param {number} limit - 最多选择几个示例（默认 1）
     * @returns {PlacementGenerationBuilder} this
     */
    addRelevantExamples(furnitureName, limit = 1) {
        if (!furnitureName) {
            return this;
        }

        // 根据家具名称匹配示例
        const matchedExamples = this.allExamples.filter(ex => {
            const category = ex.category.toLowerCase();
            return category.includes(furnitureName.toLowerCase());
        });

        if (matchedExamples.length > 0) {
            this.addExamples(matchedExamples.slice(0, limit));
        } else {
            // 如果没有匹配的，随机选择
            this.addExamples(this.allExamples.slice(0, limit));
        }

        return this;
    }
}

module.exports = PlacementBuilder;
