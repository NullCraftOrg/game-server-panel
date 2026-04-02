// 初始化日志配置
import { Logger } from './utils/logger.ts';
import config  from './utils/config.ts';

const enableFileLog = config['app-log-to-file'] ?? false;

export const log = new Logger(enableFileLog)