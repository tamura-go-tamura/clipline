import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID;
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET;
const LINE_MESSAGING_CHANNEL_ACCESS_TOKEN = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
const PORT = process.env.PORT || 3000;

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * LINE Login: Authorization Code を Access Token + ID Token に交換
 * POST /api/auth/line/callback
 * Body: { code, redirectUri, codeVerifier }
 */
app.post('/api/auth/line/callback', async (req, res) => {
  try {
    const { code, redirectUri, codeVerifier } = req.body;

    if (!code || !redirectUri || !codeVerifier) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('=== Token Exchange Request ===');
    console.log('Code:', code.substring(0, 20) + '...');
    console.log('Redirect URI:', redirectUri);

    // LINE にトークン交換リクエスト
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LINE_LOGIN_CHANNEL_ID,
        client_secret: LINE_LOGIN_CHANNEL_SECRET,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LINE Token Exchange Error:', errorText);
      return res.status(tokenResponse.status).json({ error: errorText });
    }

    const tokenData = await tokenResponse.json();
    console.log('=== Token Exchange Success ===');
    console.log('Access Token:', tokenData.access_token?.substring(0, 20) + '...');
    console.log('ID Token:', tokenData.id_token?.substring(0, 20) + '...');

    // ID Token をデコード（検証はスキップ - 本番では必須）
    const idToken = jwt.decode(tokenData.id_token);
    console.log('=== ID Token Payload ===');
    console.log('User ID (sub):', idToken.sub);
    console.log('Name:', idToken.name);
    console.log('Picture:', idToken.picture);

    // Messaging API との紐付け用に Link Token を発行
    const linkTokenResponse = await fetch(
      `https://api.line.me/v2/bot/user/${idToken.sub}/linkToken`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    let linkToken = null;
    if (linkTokenResponse.ok) {
      const linkTokenData = await linkTokenResponse.json();
      linkToken = linkTokenData.linkToken;
      console.log('=== Link Token Generated ===');
      console.log('Link Token:', linkToken);
    } else {
      const linkError = await linkTokenResponse.text();
      console.error('Link Token Error:', linkError);
      // Link Token 発行失敗してもログインは成功とする
    }

    // クライアントに返却
    res.json({
      success: true,
      user: {
        id: idToken.sub,
        name: idToken.name,
        picture: idToken.picture,
      },
      linkToken, // 紐付け用トークン
      accessToken: tokenData.access_token, // 必要に応じて返す
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * LINE SDK: Access Token を使ってユーザー情報取得 + Link Token発行
 * POST /api/auth/line/sdk-callback
 * Body: { accessToken }
 */
app.post('/api/auth/line/sdk-callback', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Missing accessToken' });
    }

    console.log('=== LINE SDK Callback ===');
    console.log('Access Token:', accessToken.substring(0, 20) + '...');

    // アクセストークンでユーザー情報を取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LINE Profile Error:', errorText);
      return res.status(profileResponse.status).json({ error: errorText });
    }

    const profile = await profileResponse.json();
    console.log('=== User Profile ===');
    console.log('User ID:', profile.userId);
    console.log('Name:', profile.displayName);

    // Link Token を発行
    const linkTokenResponse = await fetch(
      `https://api.line.me/v2/bot/user/${profile.userId}/linkToken`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    let linkToken = null;
    if (linkTokenResponse.ok) {
      const linkTokenData = await linkTokenResponse.json();
      linkToken = linkTokenData.linkToken;
      console.log('=== Link Token Generated ===');
      console.log('Link Token:', linkToken);
    } else {
      const linkError = await linkTokenResponse.text();
      console.error('Link Token Error:', linkError);
    }

    res.json({
      success: true,
      user: {
        id: profile.userId,
        name: profile.displayName,
        picture: profile.pictureUrl,
      },
      linkToken,
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Messaging API: メッセージ送信（テスト用）
 * POST /api/line/send
 * Body: { userId, message }
 */
app.post('/api/line/send', async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`🚀 ClipLine Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
