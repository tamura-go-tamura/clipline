// User型定義
export interface User {
  id: string;
  name: string;
  picture: string;
}

// LINE認証レスポンス
export interface LineAuthResponse {
  user: User;
  linkToken: string;
}

// Share data型定義
export interface ShareData {
  url?: string;
  text?: string;
  title?: string;
  image?: string;
  timestamp: number;
}

// Memo型定義
export interface Memo {
  id: string;
  userId: string;
  source: 'browser' | 'app' | 'extension';
  url?: string;
  title?: string;
  quote?: string;
  note?: string;
  media?: string;
  createdAt: string;
}
