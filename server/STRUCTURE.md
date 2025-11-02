# ClipLine Server ディレクトリ構造

```
server/
├── src/
│   ├── app.js                      # メインアプリケーション（ルート統合）
│   ├── db.js                       # DynamoDB接続・CRUD操作
│   │
│   ├── controllers/                # ビジネスロジック
│   │   ├── authController.js       # LINE Login認証
│   │   ├── lineController.js       # LINE Webhook & メッセージング
│   │   └── memoController.js       # メモ管理
│   │
│   ├── routes/                     # ルート定義
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── line.js                 # /api/line/*
│   │   └── memos.js                # /api/memos/*
│   │
│   ├── middleware/                 # ミドルウェア
│   │   └── auth.js                 # JWT認証
│   │
│   └── handler.js                  # （旧ファイル - 削除可能）
│
├── serverless.yml                  # Serverless Framework設定
├── docker-compose.yml              # DynamoDB Local
├── package.json
├── .env
└── .env.example
```

## 📂 各ファイルの役割

### `/src/app.js` - メインアプリケーション
- Express設定
- ミドルウェア（CORS, JSON）
- ルート統合
- エラーハンドリング
- Lambda & ローカル開発対応

### `/src/controllers/` - ビジネスロジック
- **authController.js**: LINE Login認証処理
  - `lineCallback()` - 認証コード → トークン交換
  - `lineSdkCallback()` - SDK認証処理
  
- **lineController.js**: LINE Messaging API
  - `lineWebhook()` - Webhook受信
  - `sendLineMessage()` - メッセージ送信
  - 内部: `handleLineEvent()`, `replyLineMessage()`
  
- **memoController.js**: メモ管理
  - `createMemo()` - メモ作成
  - `getMemos()` - メモ一覧
  - `deleteMemoById()` - メモ削除

### `/src/routes/` - ルート定義
- **auth.js**: `/api/auth/*`
  - `POST /api/auth/line/callback`
  - `POST /api/auth/line/sdk-callback`
  
- **line.js**: `/api/line/*`
  - `POST /webhook` (LINE Webhook)
  - `POST /api/line/send` (テスト用)
  
- **memos.js**: `/api/memos/*` (全て認証必須)
  - `POST /api/memos`
  - `GET /api/memos`
  - `DELETE /api/memos/:timestamp/:memoId`

### `/src/middleware/auth.js` - 認証ミドルウェア
- `authenticateToken()` - JWT検証
- `optionalAuthentication()` - オプショナル認証

### `/src/db.js` - データベース
- DynamoDB接続
- CRUD操作関数

## 🎯 改善ポイント

### Before (handler.js 450行)
```
❌ 1ファイルに全ロジック
❌ コントローラーとルートが混在
❌ スクロールが大変
❌ 責任分離なし
```

### After (モジュール化)
```
✅ 機能ごとにファイル分割
✅ Controllers / Routes 分離
✅ 各ファイル 50-200行
✅ 責任明確
✅ テストしやすい
✅ 拡張しやすい
```

## 🚀 使い方（変更なし）

```bash
# DynamoDB Local起動
docker compose up -d

# サーバー起動
npm run dev
```

エンドポイントは変わりません！
