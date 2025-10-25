import {LINE_CHANNEL_ID, SERVER_URL} from '@env';

export const Config = {
  // LINE設定
  line: {
    channelId: LINE_CHANNEL_ID,
  },
  
  // API設定
  api: {
    baseUrl: SERVER_URL,
    timeout: 10000,
  },
  
  // App Group（iOS Share Extension用）
  appGroup: 'group.com.tamuy.clipline',
  
  // ストレージキー
  storageKeys: {
    authToken: 'auth_token',
    user: 'user_data',
    shareQueue: 'share_queue',
  },
} as const;
