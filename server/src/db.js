import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
// .envファイルを読み込む
dotenv.config();

// DynamoDBクライアントの初期化
const isLocal = process.env.NODE_ENV === 'development';
console.log(`🌐 DynamoDB Client Mode: ${process.env.NODE_ENV }`);

const client = new DynamoDBClient(
  isLocal
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        credentials: {
          accessKeyId: 'MockAccessKeyId',
          secretAccessKey: 'MockSecretAccessKey',
        },
      }
    : {
        region: process.env.AWS_REGION || 'ap-northeast-1',
      }
);

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // undefinedな値を削除
    convertClassInstanceToMap: true,
  },
});

const MEMOS_TABLE = process.env.DYNAMODB_TABLE_MEMOS || 'clipline-api-memos-dev';
const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS || 'clipline-api-users-dev';

/**
 * メモをDynamoDBに保存
 * @param {string} userId - LINE User ID
 * @param {object} memoData - メモデータ
 * @returns {Promise<object>} 保存されたメモ
 */
export async function saveMemo(userId, memoData) {
  const timestamp = new Date().toISOString();
  const memoId = `${timestamp}_${Math.random().toString(36).substring(7)}`;
  
  const item = {
    PK: `USER#${userId}`,
    SK: `MEMO#${timestamp}#${memoId}`,
    memoId,
    userId,
    type: memoData.type || 'text',
    text: memoData.text,
    url: memoData.url,
    metadata: memoData.metadata ? JSON.stringify(memoData.metadata) : undefined,
    userComment: memoData.userComment,
    isSentToLine: memoData.isSentToLine || false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  await docClient.send(new PutCommand({
    TableName: MEMOS_TABLE,
    Item: item,
  }));
  
  console.log(`✅ Memo saved: ${memoId} for user ${userId}`);
  return item;
}

/**
 * ユーザーのメモ一覧を取得
 * @param {string} userId - LINE User ID
 * @param {number} limit - 取得件数制限
 * @returns {Promise<Array>} メモ配列
 */
export async function getMemosByUserId(userId, limit = 100) {
  const response = await docClient.send(new QueryCommand({
    TableName: MEMOS_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
    },
    ScanIndexBackward: true, // 新しい順
    Limit: limit,
  }));
  
  const memos = (response.Items || []).map(item => ({
    id: item.memoId,
    type: item.type,
    text: item.text,
    url: item.url,
    metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
    userComment: item.userComment,
    isSentToLine: item.isSentToLine,
    createdAt: item.createdAt,
  }));
  
  console.log(`✅ Retrieved ${memos.length} memos for user ${userId}`);
  return memos;
}

/**
 * 特定のメモを取得
 * @param {string} userId - LINE User ID
 * @param {string} timestamp - タイムスタンプ
 * @param {string} memoId - メモID
 * @returns {Promise<object|null>} メモオブジェクト
 */
export async function getMemoById(userId, timestamp, memoId) {
  const response = await docClient.send(new GetCommand({
    TableName: MEMOS_TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `MEMO#${timestamp}#${memoId}`,
    },
  }));
  
  if (!response.Item) {
    return null;
  }
  
  return {
    id: response.Item.memoId,
    type: response.Item.type,
    text: response.Item.text,
    url: response.Item.url,
    metadata: response.Item.metadata ? JSON.parse(response.Item.metadata) : undefined,
    userComment: response.Item.userComment,
    isSentToLine: response.Item.isSentToLine,
    createdAt: response.Item.createdAt,
  };
}

/**
 * メモを削除
 * @param {string} userId - LINE User ID
 * @param {string} timestamp - タイムスタンプ
 * @param {string} memoId - メモID
 * @returns {Promise<boolean>} 削除成功フラグ
 */
export async function deleteMemo(userId, timestamp, memoId) {
  await docClient.send(new DeleteCommand({
    TableName: MEMOS_TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `MEMO#${timestamp}#${memoId}`,
    },
  }));
  
  console.log(`✅ Memo deleted: ${memoId} for user ${userId}`);
  return true;
}

/**
 * メモをLINE送信済みにマーク
 * @param {string} userId - LINE User ID
 * @param {string} timestamp - タイムスタンプ
 * @param {string} memoId - メモID
 * @returns {Promise<object>} 更新されたメモ
 */
export async function markMemoAsSentToLine(userId, timestamp, memoId) {
  const response = await docClient.send(new UpdateCommand({
    TableName: MEMOS_TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `MEMO#${timestamp}#${memoId}`,
    },
    UpdateExpression: 'SET isSentToLine = :sent, updatedAt = :updated',
    ExpressionAttributeValues: {
      ':sent': true,
      ':updated': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  }));
  
  console.log(`✅ Memo marked as sent to LINE: ${memoId}`);
  return response.Attributes;
}

/**
 * ユーザー情報を保存
 * @param {object} userData - ユーザーデータ
 * @returns {Promise<object>} 保存されたユーザー
 */
export async function saveUser(userData) {
  const timestamp = new Date().toISOString();
  
  const item = {
    PK: `USER#${userData.lineUserId}`,
    lineUserId: userData.lineUserId,
    displayName: userData.displayName,
    pictureUrl: userData.pictureUrl,
    accessToken: userData.accessToken,
    refreshToken: userData.refreshToken,
    linkToken: userData.linkToken,
    createdAt: userData.createdAt || timestamp,
    updatedAt: timestamp,
  };
  
  await docClient.send(new PutCommand({
    TableName: USERS_TABLE,
    Item: item,
  }));
  
  console.log(`✅ User saved: ${userData.lineUserId}`);
  return item;
}

/**
 * ユーザー情報を取得
 * @param {string} lineUserId - LINE User ID
 * @returns {Promise<object|null>} ユーザーオブジェクト
 */
export async function getUserByLineUserId(lineUserId) {
  const response = await docClient.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: {
      PK: `USER#${lineUserId}`,
    },
  }));
  
  return response.Item || null;
}

export { docClient, MEMOS_TABLE, USERS_TABLE };
