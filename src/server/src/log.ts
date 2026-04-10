// 初始化日志配置
import { Logger, LOG_LEVELS } from './utils/logger.ts';
import config  from './config.ts';

const enableFileLog = config['app-log-to-file'] ?? false;

export const log = new Logger(LOG_LEVELS.DEBUG, enableFileLog)