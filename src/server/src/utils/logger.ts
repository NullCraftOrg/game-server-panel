import * as fs from 'fs'
import * as path from 'path'
import { PATHS } from './paths.ts'

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 100,
  NULLCRAFT: 101
}

// 级别名称
const LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.NULLCRAFT]: 'NULLCRAFT',
}

// 颜色
const LEVEL_COLORS = {
  DEBUG: '\x1b[2m',
  INFO: '\x1b[96m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
  NULLCRAFT: '\x1b[36m',
  RESET: '\x1b[0m'
}

class Logger {
  level: number = LOG_LEVELS.INFO
  logToFile: boolean
  logFilePath: string
  stream: fs.WriteStream | null = null

  constructor(level: number = LOG_LEVELS.INFO, logToFile: boolean, logFilePath: string | null = null) {
    this.level = level ?? LOG_LEVELS.INFO,
    this.logToFile = logToFile ?? false,
    this.logFilePath = logFilePath ?? path.join(PATHS.logs, 'app.log'),
    this.initStream()
  }

  // 初始化写入流
  private initStream() {
    if(!this.logToFile) return

    const dir = path.dirname(this.logFilePath)
    // 检测目录
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    this.stream = fs.createWriteStream(this.logFilePath, {
      flags: 'a', // 追加内容模式
      encoding: 'utf8',
    })

    // 错误监听
    this.stream.on('error', (err) => {
      console.error('Log stream error:', err)
    })
  }

  private formatMessage(level: any, message: string): string {
    const timestamp = new Date().toISOString()
    const levelStr = LEVEL_NAMES[level]
    return `[${timestamp}] [${levelStr}] ${message}`
  }

  private getColor(level: any): string {
    switch (level) {
      case LOG_LEVELS.DEBUG: return LEVEL_COLORS.DEBUG
      case LOG_LEVELS.INFO: return LEVEL_COLORS.INFO
      case LOG_LEVELS.WARN: return LEVEL_COLORS.WARN
      case LOG_LEVELS.ERROR: return LEVEL_COLORS.ERROR
      case LOG_LEVELS.NULLCRAFT: return LEVEL_COLORS.NULLCRAFT
      default: return LEVEL_COLORS.RESET
    }
  }

  private log(level: any, args: string[]): void {
    // 当小于显示级别时返回
    if (level < this.level) return;

    const message = args.join(' ')
    const formattedMessage =
      level === LOG_LEVELS.NONE ? message : this.formatMessage(level, message)

    // 是否需要写文件
    this.logToFileMethod(formattedMessage)

    // 控制台颜色
    const coloredMessage =
      this.getColor(level) + formattedMessage + LEVEL_COLORS.RESET

    // 控制台输出
    const consoleMethod = (() => {
      switch (level) {
        case LOG_LEVELS.DEBUG: return console.debug
        case LOG_LEVELS.INFO: return console.info
        case LOG_LEVELS.WARN: return console.warn
        case LOG_LEVELS.ERROR: return console.error
        default: return console.log
      }
    })()
    consoleMethod(coloredMessage)
  }

  private logToFileMethod(message: string): void {
    if (!this.logToFile || !this.stream) return

    // 写出日志
    this.stream.write(message + '\n')
  }

  // 开关文件日志
  setLogToFile(logToFile: boolean): void {
    this.logToFile = logToFile

    if (logToFile && !this.stream) {
      this.initStream()
    }

    if (!logToFile && this.stream) {
      this.stream.end()
      this.stream = null
    }
  }

  // 修改路径（会自动重建 stream）
  setLogFilePath(logFilePath: string): void {
    this.logFilePath = logFilePath

    if (this.stream) {
      this.stream.end()
      this.stream = null
    }

    if (this.logToFile) {
      this.initStream()
    }
  }

  // 关闭（程序退出时建议调用）
  close(): void {
    if (this.stream) {
      this.stream.end()
      this.stream = null
    }
  }

  none(...message: string[]): void {
    this.log(LOG_LEVELS.NONE, message)
  }

  debug(...message: any[]): void {
    this.log(LOG_LEVELS.DEBUG, message)
  }

  info(...message: any[]): void {
    this.log(LOG_LEVELS.INFO, message)
  }

  warn(...message: string[]): void {
    this.log(LOG_LEVELS.WARN, message)
  }

  error(...message: string[]): void {
    this.log(LOG_LEVELS.ERROR, message)
  }

  nullcraft(...message: string[]): void {
    this.log(LOG_LEVELS.NULLCRAFT, message)
  }
}

export { Logger, LOG_LEVELS, LEVEL_NAMES, LEVEL_COLORS }