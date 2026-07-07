import { invoke } from '@tauri-apps/api/core';

/**
 * OSC 服务类
 * 用于与 VRChat 的 OSC 接口通信
 */
export class OscService {
  private initialized = false;

  /**
   * 初始化 OSC 客户端
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await invoke('init_osc');
      this.initialized = true;
      console.log('OSC client initialized');
    } catch (error) {
      console.error('Failed to initialize OSC client:', error);
      throw error;
    }
  }

  /**
   * 发送消息到 VRChat chatbox
   * @param message 消息内容（最多 144 字符）
   * @param sendImmediately true: 立即发送, false: 仅显示预览
   */
  async sendChatbox(message: string, sendImmediately = true): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      await invoke('send_chatbox', {
        message,
        sendImmediately,
      });
    } catch (error) {
      console.error('Failed to send chatbox message:', error);
      throw error;
    }
  }

  /**
   * 设置打字指示器状态
   * @param typing true: 显示打字中, false: 隐藏
   */
  async setTypingIndicator(typing: boolean): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      await invoke('set_typing_indicator', { typing });
    } catch (error) {
      console.error('Failed to set typing indicator:', error);
      throw error;
    }
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// 导出单例实例
export const oscService = new OscService();
