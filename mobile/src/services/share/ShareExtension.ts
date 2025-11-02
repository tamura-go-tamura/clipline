import {NativeModules, NativeEventEmitter} from 'react-native';
import type {ShareData} from '@/types/models';

const {ShareExtensionModule} = NativeModules;

// デバッグ: 利用可能なNative Modulesを確認
console.log('=== Available Native Modules ===');
console.log(Object.keys(NativeModules));
console.log('=== ShareExtensionModule ===');
console.log(ShareExtensionModule);

// Native Module から返される生データの型
interface RawShareData {
  type: string;
  value: string;
  timestamp?: string;
  metadata?: string;  // JSON文字列
}

class ShareExtension {
  private eventEmitter: NativeEventEmitter | null = null;

  constructor() {
    if (ShareExtensionModule) {
      this.eventEmitter = new NativeEventEmitter(ShareExtensionModule);
    }
  }

  /**
   * Get data shared from other apps
   * Native Moduleから取得した生データをShareData型に変換
   */
  async getSharedData(): Promise<ShareData | null> {
    if (!ShareExtensionModule) {
      console.warn('ShareExtensionModule not available');
      return null;
    }
    
    try {
      const rawData: RawShareData | null = await ShareExtensionModule.getSharedData();
      
      if (!rawData) {
        return null;
      }
      
      // 生データをShareData型に変換
      return this.parseRawData(rawData);
    } catch (error) {
      console.error('Failed to get shared data:', error);
      return null;
    }
  }
  
  /**
   * Native Moduleから取得した生データをパース
   */
  private parseRawData(rawData: RawShareData): ShareData {
    const timestamp = rawData.timestamp 
      ? new Date(rawData.timestamp).getTime() 
      : Date.now();
    
    const shareData: ShareData = {
      type: rawData.type as any, // 'url' | 'text' など
      timestamp,
    };
    
    // typeに応じてデータを設定
    if (rawData.type === 'url') {
      shareData.url = rawData.value;
    } else if (rawData.type === 'text') {
      shareData.text = rawData.value;
    }
    
    // メタデータがあればパース
    if (rawData.metadata) {
      try {
        shareData.metadata = JSON.parse(rawData.metadata);
      } catch (e) {
        console.warn('Failed to parse metadata:', e);
      }
    }
    
    return shareData;
  }

  /**
   * Clear shared data after processing
   */
  async clearSharedData(): Promise<void> {
    if (!ShareExtensionModule) {
      console.warn('ShareExtensionModule not available');
      return;
    }
    
    try {
      await ShareExtensionModule.clearSharedData();
    } catch (error) {
      console.error('Failed to clear shared data:', error);
    }
  }

  /**
   * Close share extension
   */
  close(): void {
    if (!ShareExtensionModule) {
      console.warn('ShareExtensionModule not available');
      return;
    }
    
    ShareExtensionModule.close();
  }
}

export default new ShareExtension();
