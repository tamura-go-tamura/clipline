import { saveMemo, getMemosByUserId, deleteMemo } from '../db.js';

/**
 * メモ管理API: メモ保存
 * POST /api/memos
 * Headers: Authorization: Bearer <JWT_TOKEN>
 * Body: { type, text, url, metadata, userComment }
 */
export async function createMemo(req, res) {
  try {
    const { type, text, url, metadata, userComment } = req.body;
    
    // JWTトークンから userId を取得（改ざん不可能）
    const userId = req.user.userId;

    const memo = await saveMemo(userId, {
      type,
      text,
      url,
      metadata,
      userComment,
      isSentToLine: false,
    });

    res.json({ success: true, memo });
  } catch (error) {
    console.error('Save Memo Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * メモ管理API: メモ一覧取得
 * GET /api/memos
 * Headers: Authorization: Bearer <JWT_TOKEN>
 */
export async function getMemos(req, res) {
  try {
    // JWTトークンから userId を取得
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 100;

    const memos = await getMemosByUserId(userId, limit);

    res.json({ success: true, memos });
  } catch (error) {
    console.error('Get Memos Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * メモ管理API: メモ削除
 * DELETE /api/memos/:timestamp/:memoId
 * Headers: Authorization: Bearer <JWT_TOKEN>
 */
export async function deleteMemoById(req, res) {
  try {
    // JWTトークンから userId を取得
    const userId = req.user.userId;
    const { timestamp, memoId } = req.params;

    await deleteMemo(userId, timestamp, memoId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete Memo Error:', error);
    res.status(500).json({ error: error.message });
  }
}
