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

// Share Extension - 共有データ型
export type ShareContentType = 
  | 'url'           // Webページのリンク
  | 'text'          // プレーンテキスト
  | 'image'         // 画像
  | 'video'         // 動画
  | 'pdf'           // PDFファイル
  | 'file'          // その他のファイル
  | 'contact'       // 連絡先
  | 'location';     // 位置情報

// Share Extension - メタデータ
export interface ShareMetadata {
  title?: string;           // ページタイトル、ファイル名など
  description?: string;     // 説明文
  siteName?: string;        // サイト名
  thumbnailUrl?: string;    // サムネイル画像URL
  author?: string;          // 作者
  publishedDate?: string;   // 公開日
}

// Share Extension - 添付ファイル情報
export interface ShareAttachment {
  type: string;             // MIMEタイプ (image/png, video/mp4 など)
  fileName?: string;        // ファイル名
  fileSize?: number;        // ファイルサイズ (bytes)
  data?: string;            // Base64エンコードされたデータ
  localPath?: string;       // ローカルファイルパス
}

// Share Extension - 共有データの統合型
export interface ShareData {
  // 基本情報
  type: ShareContentType;
  timestamp: number;
  
  // コンテンツ
  url?: string;             // URL (type='url'の場合)
  text?: string;            // テキスト (type='text'の場合)
  
  // メタデータ
  metadata?: ShareMetadata;
  
  // 添付ファイル
  attachments?: ShareAttachment[];
  
  // ユーザー入力 (Share Extension画面で入力されたコメントなど)
  userComment?: string;
  
  // 拡張用フィールド (将来的な機能追加用)
  extra?: Record<string, any>;
}

// 旧ShareData型 - 後方互換性のため残す
export interface LegacyShareData {
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
