import { invoke } from '@tauri-apps/api/core';

export interface AppConfig {
  firstRunCompleted: boolean;
  uiLanguage: string;
  translationEngine: 'online' | 'local';
  translationProvider?: 'google' | 'deepl' | 'baidu';
  sttEngine: 'online' | 'local';
  sttProvider?: 'google' | 'azure';
  oscEnabled: boolean;
  oscPort: number;
  // API Keys (optional)
  apiKeys?: {
    deepl?: string;
    google?: string;
    azure?: string;
    baidu?: string;
  };
  // 显式引擎资源路径（覆盖自动扫描）
  modelPath?: string;
  llamaCliPath?: string;
}

const DEFAULT_CONFIG: AppConfig = {
  firstRunCompleted: false,
  uiLanguage: 'zh-Hans',
  translationEngine: 'online',
  translationProvider: 'google',
  sttEngine: 'local',
  oscEnabled: true,
  oscPort: 9000,
};

/**
 * 配置管理服务
 */
export class ConfigService {
  private config: AppConfig | null = null;

  /**
   * 加载配置
   */
  async load(): Promise<AppConfig> {
    try {
      const configJson = await invoke<string>('load_config');
      const parsed = JSON.parse(configJson) as Partial<AppConfig>;
      // 与默认值浅合并，保证缺字段时仍可用；apiKeys 单独合并以保留嵌套默认。
      this.config = {
        ...DEFAULT_CONFIG,
        ...parsed,
        apiKeys: { ...DEFAULT_CONFIG.apiKeys, ...parsed.apiKeys },
      };
      return this.config;
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      this.config = { ...DEFAULT_CONFIG };
      return this.config;
    }
  }

  /**
   * 保存配置
   */
  async save(config: Partial<AppConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...config,
    } as AppConfig;

    try {
      await invoke('save_config', {
        configJson: JSON.stringify(this.config, null, 2),
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /**
   * 标记首次运行完成
   */
  async completeFirstRun(config: Partial<AppConfig>): Promise<void> {
    await this.save({
      ...config,
      firstRunCompleted: true,
    });
  }

  /**
   * 检查是否是首次运行
   */
  async isFirstRun(): Promise<boolean> {
    if (!this.config) {
      await this.load();
    }
    return !this.config?.firstRunCompleted;
  }

  /**
   * 获取当前配置
   */
  getConfig(): AppConfig {
    return this.config || { ...DEFAULT_CONFIG };
  }

  /**
   * 重置配置
   */
  async reset(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };
    await this.save(this.config);
  }
}

// 导出单例
export const configService = new ConfigService();
