import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

// Routes
import authRoutes from './routes/auth.js';
import lineRoutes from './routes/line.js';
import memoRoutes from './routes/memos.js';

dotenv.config();

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/line', lineRoutes);
app.use('/api/memos', memoRoutes);

// Webhookは別パス（/api配下ではない）
app.post('/webhook', lineRoutes);

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Lambda用のハンドラーをエクスポート
export const handler = serverless(app);

// ローカル開発用のサーバー起動（Lambda環境では実行されない）
if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_TASK_ROOT) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 ClipLine Server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 DynamoDB: http://localhost:8000`);
  });
}
