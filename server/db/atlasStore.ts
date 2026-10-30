import { MongoClient, type Db } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { encryptPayload, decryptPayload, type EncryptedData } from './crypto.js';
import type { ChatMessage, GratitudePost, JournalEntry, MoodCheckIn } from './mongoStore.js';

type PrivateRecord = {
  _id: string;
  sessionId: string;
  createdAt: string;
  payload: EncryptedData;
};

let clientPromise: Promise<MongoClient> | undefined;

async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 5, maxIdleTimeMS: 5000 });
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'mindcalm');
}

const decryptRecords = <T>(records: PrivateRecord[]) =>
  records.map(record => decryptPayload<T>(record.payload));

export const atlasStore = {
  async ping(): Promise<void> {
    const db = await getDatabase();
    await db.command({ ping: 1 });
  },
  async getCheckins(sessionId: string): Promise<MoodCheckIn[]> {
    const db = await getDatabase();
    const records = await db.collection<PrivateRecord>('checkins')
      .find({ sessionId }).sort({ createdAt: -1 }).toArray();
    return decryptRecords<MoodCheckIn>(records);
  },

  async addCheckin(data: Omit<MoodCheckIn, '_id' | 'createdAt'>): Promise<MoodCheckIn> {
    const db = await getDatabase();
    const record: MoodCheckIn = {
      ...data,
      _id: `chk_${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    await db.collection<PrivateRecord>('checkins').insertOne({
      _id: record._id,
      sessionId: data.userId,
      createdAt: record.createdAt,
      payload: encryptPayload(record)
    });
    return record;
  },

  async deleteCheckin(id: string, sessionId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection<PrivateRecord>('checkins').deleteOne({ _id: id, sessionId });
    return result.deletedCount > 0;
  },

  async getJournals(sessionId: string): Promise<JournalEntry[]> {
    const db = await getDatabase();
    const records = await db.collection<PrivateRecord>('journals')
      .find({ sessionId }).sort({ createdAt: -1 }).toArray();
    return decryptRecords<JournalEntry>(records);
  },

  async addJournal(data: Omit<JournalEntry, '_id' | 'createdAt'>): Promise<JournalEntry> {
    const db = await getDatabase();
    const record: JournalEntry = {
      ...data,
      _id: `jrn_${randomUUID()}`,
      createdAt: new Date().toISOString()
    };
    await db.collection<PrivateRecord>('journals').insertOne({
      _id: record._id,
      sessionId: data.userId,
      createdAt: record.createdAt,
      payload: encryptPayload(record)
    });
    return record;
  },

  async getGratitudes(category?: string): Promise<GratitudePost[]> {
    const db = await getDatabase();
    const filter = category && category !== 'All'
      ? { category: category as GratitudePost['category'] }
      : {};
    return db.collection<GratitudePost>('gratitudes').find(filter).sort({ createdAt: -1 }).toArray();
  },

  async addGratitude(category: GratitudePost['category'], text: string): Promise<GratitudePost> {
    const db = await getDatabase();
    const record: GratitudePost = {
      _id: `grat_${randomUUID()}`,
      category: category || 'General',
      text: text.trim(),
      hearts: 1,
      createdAt: new Date().toISOString()
    };
    await db.collection<GratitudePost>('gratitudes').insertOne(record);
    return record;
  },

  async heartGratitude(id: string): Promise<GratitudePost | null> {
    const db = await getDatabase();
    return db.collection<GratitudePost>('gratitudes').findOneAndUpdate(
      { _id: id },
      { $inc: { hearts: 1 } },
      { returnDocument: 'after' }
    );
  },

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const db = await getDatabase();
    const records = await db.collection<PrivateRecord>('chatMessages')
      .find({ sessionId }).sort({ createdAt: -1 }).limit(40).toArray();
    return decryptRecords<ChatMessage>(records.reverse());
  },

  async appendChatMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<PrivateRecord>('chatMessages');
    await collection.insertOne({
      _id: `${sessionId}:${message.id}`,
      sessionId,
      createdAt: message.timestamp,
      payload: encryptPayload(message)
    });
    const overflow = await collection.find({ sessionId })
      .sort({ createdAt: -1 }).skip(40).project({ _id: 1 }).toArray();
    if (overflow.length) await collection.deleteMany({ _id: { $in: overflow.map(item => item._id) } });
  },

  async clearChatHistory(sessionId: string): Promise<void> {
    const db = await getDatabase();
    await db.collection<PrivateRecord>('chatMessages').deleteMany({ sessionId });
  }
};
