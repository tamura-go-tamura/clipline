# DynamoDB接続コード & Lambda セットアップ完了！

## 📦 インストールしたパッケージ

```bash
✅ serverless@4.22.0 - Serverless Framework
✅ serverless-offline@14.4.0 - ローカル開発用
✅ @aws-sdk/client-dynamodb@3.922.0 - DynamoDB クライアント
✅ @aws-sdk/lib-dynamodb@3.922.0 - DynamoDB Document Client
✅ serverless-http@4.0.0 - Express → Lambda 変換
```

## 🎯 作成したファイル

### 1. `serverless.yml`
- Lambda関数定義（handler: src/handler.js）
- DynamoDB テーブル定義（Memos, Users）
- API Gateway設定
- IAM権限設定

### 2. `src/db.js`
- DynamoDB接続コード
- メモCRUD操作関数
  - `saveMemo()` - メモ保存
  - `getMemosByUserId()` - ユーザーのメモ一覧取得
  - `deleteMemo()` - メモ削除
  - `markMemoAsSentToLine()` - LINE送信済みフラグ更新
- ユーザー管理関数
  - `saveUser()` - ユーザー保存
  - `getUserByLineUserId()` - ユーザー取得

### 3. `src/handler.js`
- 既存のindex.jsをLambda対応に変換
- DynamoDB統合（メモ保存・取得）
- 追加エンドポイント:
  - `POST /webhook` - LINE Webhook受信
  - `POST /api/memos` - メモ保存
  - `GET /api/memos/:userId` - メモ一覧取得
  - `DELETE /api/memos/:userId/:timestamp/:memoId` - メモ削除

## 🚀 使い方

### ローカル開発（Serverless Offline）

```bash
cd /Users/yuta/Downloads/ClipLine/server

# ローカルサーバー起動
npm run dev

# サーバーが http://localhost:3000 で起動します
```

**注意**: ローカル開発ではDynamoDBに接続できないので、エラーが出ます。
次のステップで **DynamoDB Local** をセットアップします。

### AWSにデプロイ

```bash
# AWS認証情報を設定（初回のみ）
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# 開発環境にデプロイ
npm run deploy:dev

# 本番環境にデプロイ
npm run deploy:prod
```

## 📊 DynamoDBテーブル構造

### Memosテーブル
```
PK: USER#U1234567890 (パーティションキー)
SK: MEMO#2025-11-02T10:00:00Z#abc123 (ソートキー)

データ:
- memoId: abc123
- userId: U1234567890
- type: url | text
- text: メモテキスト
- url: https://example.com
- metadata: { title, description, thumbnailUrl }
- userComment: ユーザーコメント
- isSentToLine: true/false
- createdAt: 2025-11-02T10:00:00Z
- updatedAt: 2025-11-02T10:00:00Z
```

### Usersテーブル
```
PK: USER#U1234567890 (パーティションキー)

データ:
- lineUserId: U1234567890
- displayName: ユーザー名
- pictureUrl: プロフィール画像URL
- accessToken: LINEアクセストークン
- refreshToken: リフレッシュトークン
- linkToken: Link Token
- createdAt: 2025-11-02T10:00:00Z
- updatedAt: 2025-11-02T10:00:00Z
```

## 🔌 新しいエンドポイント

### 1. LINE Webhook
```bash
POST /webhook
Content-Type: application/json
X-LINE-Signature: signature_here

{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "text": "メモしたいテキスト"
      },
      "source": {
        "userId": "U1234567890"
      },
      "replyToken": "token"
    }
  ]
}

# LINEからメッセージを受け取ってDynamoDBに保存
# 自動返信: "📝 メモを保存しました！"
```

### 2. メモ保存（React Native → API）
```bash
POST /api/memos
Content-Type: application/json

{
  "userId": "U1234567890",
  "type": "url",
  "url": "https://example.com",
  "text": "サンプルテキスト",
  "metadata": {
    "title": "ページタイトル",
    "description": "説明文",
    "thumbnailUrl": "https://..."
  },
  "userComment": "自分のコメント"
}

# Response:
{
  "success": true,
  "memo": { ... }
}
```

### 3. メモ一覧取得
```bash
GET /api/memos/U1234567890?limit=50

# Response:
{
  "success": true,
  "memos": [
    {
      "id": "abc123",
      "type": "url",
      "url": "https://example.com",
      "metadata": { ... },
      "createdAt": "2025-11-02T10:00:00Z"
    }
  ]
}
```

### 4. メモ削除
```bash
DELETE /api/memos/U1234567890/2025-11-02T10:00:00Z/abc123

# Response:
{
  "success": true
}
```

## 📝 次のステップ

1. **DynamoDB Local のセットアップ** ← 次はこれ！
   - ローカル開発でDynamoDBをエミュレート
   
2. **LINE Webhookの登録**
   - LINE Developers Console で Webhook URL を設定
   
3. **React Native アプリ統合**
   - APIエンドポイントを使ってメモを保存・取得

準備できたら次に進みましょう！ 🚀
