import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

// ローカルDynamoDBに接続
const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'MockAccessKeyId',
    secretAccessKey: 'MockSecretAccessKey',
  },
});

async function createTables() {
  console.log('🔧 Creating DynamoDB tables...');

  // Memosテーブル作成
  try {
    await client.send(new CreateTableCommand({
      TableName: 'clipline-api-memos-dev',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log('✅ Memos table created');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️  Memos table already exists');
    } else {
      console.error('❌ Error creating Memos table:', error.message);
    }
  }

  // Usersテーブル作成
  try {
    await client.send(new CreateTableCommand({
      TableName: 'clipline-api-users-dev',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'lineUserId', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'LineUserIdIndex',
          KeySchema: [
            { AttributeName: 'lineUserId', KeyType: 'HASH' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log('✅ Users table created');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️  Users table already exists');
    } else {
      console.error('❌ Error creating Users table:', error.message);
    }
  }

  console.log('🎉 Table setup complete!');
}

createTables().catch(console.error);
