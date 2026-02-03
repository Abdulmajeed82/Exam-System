/**
 * Test MongoDB connection
 * Usage: npx tsx scripts/test-mongo-connection.ts
 */
import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'exam-practice-system';

async function test() {
  console.log('🔧 Testing MongoDB connection...');
  console.log('URL:', url);
  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collections: any[] = await db.collections();
    console.log('✅ Connected to MongoDB. Collections:', collections.map((c: any) => c.collectionName));
    await client.close();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

test().catch((err) => {
  console.error(err);
  process.exit(1);
});