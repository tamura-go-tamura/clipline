import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createMemo, getMemos, deleteMemoById } from '../controllers/memoController.js';

const router = express.Router();

// すべてのルートに認証ミドルウェアを適用
router.use(authenticateToken);

// メモ保存
router.post('/', createMemo);

// メモ一覧取得
router.get('/', getMemos);

// メモ削除
router.delete('/:timestamp/:memoId', deleteMemoById);

export default router;
