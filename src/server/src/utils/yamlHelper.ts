import * as fs from 'fs';
import YAML from 'yaml';

/**
 * YAML 键值存储助手（保留注释与格式）
 * 使用 yaml 包的 Document 模式，读写键值同时保留原有注释。
 */
export class YamlHelper {
  private readonly filePath: string;
  private doc: YAML.Document;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.doc = this.loadDocument();
  }

  /**
   * 加载 YAML 文件为 Document 对象
   * 若文件不存在，创建空文档
   */
  private loadDocument(): YAML.Document {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      // 将文本解析为 Document，自动保留注释和节点位置信息
      return YAML.parseDocument(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`读取 YAML 文件失败: ${error}`);
      }
      // 返回一个空文档
      return new YAML.Document();
    }
  }

  /**
   * 将当前文档写入文件（保留注释和格式）
   */
  private save(): void {
    try {
      // toString 会输出包含注释的完整 YAML 文本
      const yamlString = this.doc.toString();
      fs.writeFileSync(this.filePath, yamlString, 'utf8');
    } catch (error) {
      throw new Error(`保存 YAML 文件失败: ${error}`);
    }
  }

  /**
   * 获取指定键的值
   */
  public get<T = any>(key: string): T | undefined {
    return this.doc.get(key) as T | undefined;
  }

  /**
   * 设置键值对（保留原有注释）
   * 注意：如果键已存在，会覆盖原值，但该行注释会被保留
   */
  public set(key: string, value: any): void {
    this.doc.set(key, value);
    this.save();
  }

  /**
   * 删除指定键（会移除该行及注释）
   */
  public delete(key: string): boolean {
    const hasKey = this.doc.has(key);
    if (hasKey) {
      this.doc.delete(key);
      this.save();
    }
    return hasKey;
  }

  /**
   * 获取所有键值对（浅拷贝）
   */
  public getAll(): Record<string, any> {
    return this.doc.toJSON() as Record<string, any>;
  }

  /**
   * 重新从文件加载（覆盖内存中的文档）
   */
  public reload(): void {
    this.doc = this.loadDocument();
  }
}