// config.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 配置文件路径（默认位于项目根目录下的 config.yml）
const CONFIG_FILE_PATH = path.join(__dirname,'..','config.yml');

let cachedConfig = null;

/**
 * 加载 YAML 配置文件
 * @returns {Object} 配置对象
 * @throws {Error} 读取或解析失败时抛出错误
 */
function loadConfig() {
    try {
        // 读取文件内容
        const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
        // 解析 YAML
        const config = yaml.load(fileContent);
        return config;
    } catch (err) {
        // 处理错误（文件不存在、YAML 格式错误等）
        console.error('Failed to load configuration:', err.message);
        throw err; // 让上层决定如何处理（如退出进程）
    }
}

/**
 * 获取配置（懒加载 + 缓存）
 * @returns {Object} 配置对象
 */
function getConfig() {
    if (!cachedConfig) {
        cachedConfig = loadConfig();
    }
    return cachedConfig;
}

// 导出配置对象（直接使用）
module.exports = getConfig();