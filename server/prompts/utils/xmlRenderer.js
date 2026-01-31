// prompts/utils/xmlRenderer.js

/**
 * 渲染 XML 模板，替换变量
 * @param {string} template - XML 模板字符串
 * @param {object} variables - 变量对象
 * @returns {string} 渲染后的内容
 */
function renderTemplate(template, variables = {}) {
    let rendered = template;

    // 替换所有 {{variable}} 格式的变量
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, String(value));
    }

    return rendered;
}

/**
 * 格式化 Few-Shot Examples 为 XML 格式
 * @param {Array} examples - 示例数组
 * @returns {string} XML 格式的示例
 */
function formatExamples(examples) {
    if (!examples || examples.length === 0) {
        return '';
    }

    const exampleXml = examples.map((example, index) => {
        return `
    <example id="${example.id || `example_${index + 1}`}">
      <input>
${formatObject(example.input, 8)}
      </input>
      ${example.reasoning ? `<reasoning>${example.reasoning}</reasoning>` : ''}
      <output>
${formatObject(example.output, 8)}
      </output>
    </example>`;
    }).join('\n');

    return exampleXml;
}

/**
 * 格式化对象为缩进的文本
 * @param {object|string} obj - 要格式化的对象
 * @param {number} indent - 缩进空格数
 * @returns {string} 格式化后的文本
 */
function formatObject(obj, indent = 0) {
    const spaces = ' '.repeat(indent);

    if (typeof obj === 'string') {
        return `${spaces}${obj}`;
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj)
            .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return `${spaces}${key}:\n${formatObject(value, indent + 2)}`;
                }
                return `${spaces}${key}: ${value}`;
            })
            .join('\n');
    }

    return `${spaces}${String(obj)}`;
}

/**
 * 清理 XML 中的空白行和多余空格
 * @param {string} xml - XML 字符串
 * @returns {string} 清理后的 XML
 */
function cleanXml(xml) {
    return xml
        .split('\n')
        .map(line => line.trimEnd())
        .filter(line => line.trim().length > 0)
        .join('\n');
}

module.exports = {
    renderTemplate,
    formatExamples,
    formatObject,
    cleanXml
};
