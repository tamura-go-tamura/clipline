# ローカル開発ガイド

## 🚀 起動方法

### 1. DynamoDB Localを起動
```bash
npm run dynamodb:start
```

### 2. サーバーを起動
```bash
npm run dev
```

サーバーが起動したら:
- API: http://localhost:3000
- DynamoDB Local: http://localhost:8000

---

## 🧪 動作確認

### ヘルスチェック
```bash
curl http://localhost:3000/health
```

### メモ保存（JWT認証なしでテスト）
```bash
curl -X POST http://localhost:3000/api/memos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "テストメモ"
  }'
```

### メモ一覧取得
```bash
curl http://localhost:3000/api/memos
```

---

## 🛠️ トラブルシューティング

### DynamoDB接続エラー
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**対処法**: DynamoDB Localが起動しているか確認
```bash
docker ps | grep dynamodb
```

起動していない場合:
```bash
npm run dynamodb:start
```

### テーブルが存在しないエラー
```
ResourceNotFoundException: Cannot do operations on a non-existent table
```

**対処法**: Serverless Offlineが自動でテーブルを作成します。
`serverless.yml`の`migrate: true`設定が有効になっているか確認。

---

## 🧹 停止方法

### サーバー停止
Ctrl + C

### DynamoDB Local停止
```bash
npm run dynamodb:stop
```

---

## 📊 DynamoDB Local 管理ツール

### DynamoDB Admin（GUI）をインストール（オプション）
```bash
npm install -g dynamodb-admin
```

### 起動
```bash
DYNAMO_ENDPOINT=http://localhost:8000 dynamodb-admin
```

ブラウザで http://localhost:8001 を開く
→ テーブルの中身をGUIで確認できる！

---

## 🐳 Docker を使わない場合

Java がインストール済みなら、DynamoDB Local を直接実行:

```bash
# ダウンロード
wget https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz
tar -xzf dynamodb_local_latest.tar.gz

# 起動
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -inMemory
```
