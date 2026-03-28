const fs = require('fs');
const path = require('path');

// 日志级别定义
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
  NULLCRAFT: 101
};

// 级别名称映射
const LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.NONE]: 'NONE',
  [LOG_LEVELS.NULLCRAFT]: 'NULLCRAFT',
};

// ANSI 颜色代码
const COLORS = {
  DEBUG: '\x1b[37m',
  INFO: '\x1b[96m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
  NULLCRAFT: '\x1b[36m',
  RESET: '\x1b[0m'
};

class Logger {
  constructor(options = {}) {
    this.level = options.level ?? LOG_LEVELS.INFO;
    this.timestamp = options.timestamp !== false;
    this.formatter = options.formatter || this.defaultFormatter.bind(this);
    this.fileMode = options.fileMode === 'write' ? 'w' : 'a';

    // 颜色配置：'auto' 自动检测TTY，true 强制开启，false 强制关闭
    this.color = options.color === undefined ? 'auto' : options.color;

    // 处理输出目标
    let outputs = options.output ?? 'console';
    if (typeof outputs === 'boolean') {
      outputs = outputs ? 'console' : null;
    }
    if (typeof outputs === 'string') {
      outputs = [outputs];
    }
    this.outputs = (outputs || []).map(output => {
      if (output === 'console') {
        return { type: 'console' };
      } else if (typeof output === 'string') {
        const dir = path.dirname(output);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const stream = fs.createWriteStream(output, { flags: this.fileMode });
        return { type: 'file', stream, path: output };
      } else {
        throw new Error('Invalid output target');
      }
    });
  }

  defaultFormatter(level, args, timestamp) {
    const parts = [];
    if (this.timestamp) {
      parts.push(`[${timestamp.toISOString()}]`);
    }
    parts.push(`[${LEVEL_NAMES[level]}]`);
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    parts.push(formattedArgs);
    return parts.join(' ');
  }

  /**
   * 为控制台消息添加颜色
   */
  _colorize(level, message) {
    // 判断是否启用颜色
    let useColor = false;
    if (this.color === true) {
      useColor = true;
    } else if (this.color === 'auto') {
      // 自动检测：仅在控制台输出且为TTY环境时启用
      useColor = process.stdout.isTTY && process.stderr.isTTY;
    }

    if (!useColor) return message;

    let colorCode = COLORS.RESET;
    switch (level) {
      case LOG_LEVELS.DEBUG:
        colorCode = COLORS.DEBUG;
        break;
      case LOG_LEVELS.INFO:
        colorCode = COLORS.INFO;
        break;
      case LOG_LEVELS.WARN:
        colorCode = COLORS.WARN;
        break;
      case LOG_LEVELS.ERROR:
        colorCode = COLORS.ERROR;
        break;
      case LOG_LEVELS.NULLCRAFT:
        colorCode = COLORS.NULLCRAFT;
        break;
    }
    return `${colorCode}${message}${COLORS.RESET}`;
  }

  _log( format = true, level,...args) {
    if (level < this.level) return;

    const timestamp = new Date();
    let formattedMessage = this.formatter(level, args, timestamp);

    for (const output of this.outputs) {
      if (output.type === 'console') {
        // 应用颜色（仅控制台）
        const message = format ? this._colorize(level, formattedMessage) : args.join(' ') ;
        const consoleMethod = (() => {
          switch (level) {
            case LOG_LEVELS.DEBUG: return console.debug;
            case LOG_LEVELS.INFO: return console.info;
            case LOG_LEVELS.WARN: return console.warn;
            case LOG_LEVELS.ERROR: return console.error;
            default: return console.log;
          }
        })();
        consoleMethod(message);

      } else if (output.type === 'file') {
        // 文件输出保持纯文本
        output.stream.write(formattedMessage + '\n', (err) => {
          if (err) console.error('Failed to write log to file:', err);
        });
      }
    }
  }

  raw(...args){
    this._log(false, LOG_LEVELS.NONE, ...args);
  }

  nullcraft(...args) {
    this._log(true, LOG_LEVELS.NULLCRAFT,...args);
  }

  debug(...args) {
    this._log(true, LOG_LEVELS.DEBUG, ...args);
  }

  info(...args) {
    this._log(true, LOG_LEVELS.INFO, ...args);
  }

  warn(...args) {
    this._log(true, LOG_LEVELS.WARN, ...args);
  }

  error(...args) {
    this._log( true, LOG_LEVELS.ERROR,...args);
  }

  setLevel(level) {
    if (typeof level === 'string') {
      const upper = level.toUpperCase();
      const map = {
        DEBUG: LOG_LEVELS.DEBUG,
        INFO: LOG_LEVELS.INFO,
        WARN: LOG_LEVELS.WARN,
        ERROR: LOG_LEVELS.ERROR,
        NONE: LOG_LEVELS.NONE
      };
      if (map[upper] !== undefined) {
        this.level = map[upper];
      } else {
        throw new Error(`Invalid log level: ${level}`);
      }
    } else if (typeof level === 'number') {
      this.level = level;
    } else {
      throw new Error('Level must be number or string');
    }
  }

  close() {
    for (const output of this.outputs) {
      if (output.type === 'file' && output.stream) {
        output.stream.end();
      }
    }
  }
}

module.exports = {
  Logger,
  LOG_LEVELS,
  LEVEL_NAMES
};