const config =require('./utils/config');
const { Logger, LOG_LEVELS, LEVEL_NAMES } = require('./utils/logger');

// 输出类型：控制台、文件路径
const outputs = ['console'];

// 是否记录运行日志
if(config['app_log_to_file']){
 outputs.push('./logs/app.log');   
}

// 创建日志实例：输出到控制台和文件
const logger = new Logger({
    level: LOG_LEVELS.DEBUG,
    output: outputs,
    timestamp: true,
    color: 'auto',
    formatter: (level, args, timestamp) => {
        // 现在 LEVEL_NAMES 已经导入，可以正常使用
        return `[${timestamp.toLocaleString()}] ${LEVEL_NAMES[level]}: ${args.join(' ')}`;
    }
});

module.exports = logger;