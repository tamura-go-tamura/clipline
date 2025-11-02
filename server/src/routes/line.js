import express from 'express';
import { lineWebhook, sendLineMessage } from '../controllers/lineController.js';

const router = express.Router();

// LINE Webhook
router.post('/webhook', lineWebhook);

// メッセージ送信（テスト用）
router.post('/send', sendLineMessage);

export default router;
