import crypto from 'crypto';
import { saveMemo } from '../db.js';

const LINE_MESSAGING_CHANNEL_ACCESS_TOKEN = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || process.env.LINE_LOGIN_CHANNEL_SECRET;

/**
 * LINE Webhook: メッセージ受信
 * POST /webhook
 */
export async function lineWebhook(req, res) {
  try {
    const signature = req.headers['x-line-signature'];
    
    // 署名検証
    if (signature) {
      const body = JSON.stringify(req.body);
      const hash = crypto
        .createHmac('SHA256', LINE_CHANNEL_SECRET)
        .update(body)
        .digest('base64');
      
      if (hash !== signature) {
        console.error('❌ Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { events } = req.body;
    console.log(`📨 Received ${events?.length || 0} events`);

    if (!events || events.length === 0) {
      return res.json({ success: true, message: 'No events' });
    }

    // 各イベントを処理
    for (const event of events) {
      await handleLineEvent(event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Messaging API: メッセージ送信（テスト用）
 * POST /api/line/send
 * Body: { userId, message }
 */
export async function sendLineMessage(req, res) {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE Message Push Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * LINEイベントを処理（内部関数）
 */
async function handleLineEvent(event) {
  console.log('📨 Event Type:', event.type);
  
  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('ℹ️ Skipping non-text message');
    return;
  }

  const userId = event.source.userId;
  const messageText = event.message.text;
  
  console.log(`💬 Message from ${userId}: ${messageText}`);

  // メモをDynamoDBに保存
  const memo = await saveMemo(userId, {
    type: 'text',
    text: messageText,
    isSentToLine: true,
  });

  // 確認メッセージを返信
  await replyLineMessage(event.replyToken, `📝 メモを保存しました！\n\n${messageText}`);
}

/**
 * LINE返信メッセージ送信（内部関数）
 */
async function replyLineMessage(replyToken, text) {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LINE Reply Error:', errorText);
    throw new Error(errorText);
  }

  console.log('✅ Reply sent');
}
