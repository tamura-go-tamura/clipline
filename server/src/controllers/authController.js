import jwt from 'jsonwebtoken';
import { saveUser } from '../db.js';

const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID;
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET;
const LINE_MESSAGING_CHANNEL_ACCESS_TOKEN = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;

/**
 * LINE Login: Authorization Code を Access Token + ID Token に交換
 * POST /api/auth/line/callback
 * Body: { code, redirectUri, codeVerifier }
 */
export async function lineCallback(req, res) {
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

    // ユーザー情報をDynamoDBに保存
    await saveUser({
      lineUserId: idToken.sub,
      displayName: idToken.name,
      pictureUrl: idToken.picture,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    });

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
      
      // Link Tokenも保存
      await saveUser({
        lineUserId: idToken.sub,
        displayName: idToken.name,
        pictureUrl: idToken.picture,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        linkToken,
      });
    } else {
      const linkError = await linkTokenResponse.text();
      console.error('Link Token Error:', linkError);
    }

    // ClipLine用のJWTトークンを発行（7日間有効）
    const jwtToken = jwt.sign(
      {
        userId: idToken.sub,
        name: idToken.name,
        picture: idToken.picture,
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: idToken.sub,
        name: idToken.name,
        picture: idToken.picture,
      },
      token: jwtToken,  // React Nativeアプリで保存して使う
      linkToken,
      accessToken: tokenData.access_token,
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * LINE SDK: Access Token を使ってユーザー情報取得 + Link Token発行
 * POST /api/auth/line/sdk-callback
 * Body: { accessToken }
 */
export async function lineSdkCallback(req, res) {
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

    // ユーザー情報をDynamoDBに保存
    await saveUser({
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      accessToken,
    });

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
      
      // Link Tokenも保存
      await saveUser({
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        accessToken,
        linkToken,
      });
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
}
