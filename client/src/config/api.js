// API 配置文件
// 自动适配本地开发和 Vercel 生产环境

const getApiBaseUrl = () => {
    // 优先使用环境变量
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 生产环境 (Vercel)：使用相对路径
    if (import.meta.env.PROD) {
        return '';  // 相对路径，API 和前端在同一域名下
    }

    // 开发环境：使用当前页面的主机地址
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000`;
};

export const API_BASE_URL = getApiBaseUrl();

// API 端点
export const API_ENDPOINTS = {
    score: `${API_BASE_URL}/api/v1/score`,
    dreamHome: `${API_BASE_URL}/api/v1/dream-home/generate`,
    placement: {
        measure: `${API_BASE_URL}/api/v1/placement/measure`,
        generate: `${API_BASE_URL}/api/v1/placement/generate`
    },
    roomCustomization: `${API_BASE_URL}/api/v1/room-customization/generate`
};

export default API_ENDPOINTS;
