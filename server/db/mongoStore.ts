import fs from 'fs';
import path from 'path';
import { encryptPayload, decryptPayload, EncryptedData } from './crypto.js';
import { atlasStore } from './atlasStore.js';

export interface MoodCheckIn {
  _id: string;
  userId: string;
  moodScore: number; // 1-10
  moodLabel: string;
  emotions: string[];
  somaticSensations: string[];
  bodyRegions: string[]; // 'head' | 'chest' | 'shoulders' | 'gut' | 'limbs'
  stressTriggers: string[];
  gratitudeNote: string;
  energyLevel: number; // 1-5
  sleepQuality?: number; // 1-5
  notes?: string;
  createdAt: string;
}

export interface JournalEntry {
  _id: string;
  userId: string;
  title: string;
  prompt: string;
  content: string;
  empatheticReflection?: string;
  positiveActionTakeaways?: string[];
  sentimentLabel?: string;
  groundingExerciseDone?: boolean;
  createdAt: string;
}

export interface GratitudePost {
  _id: string;
  category: 'Nature & Senses' | 'Human Kindness' | 'Small Victories' | 'Healing & Rest' | 'Overcoming Obstacles' | 'General';
  text: string;
  hearts: number;
  tags?: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isCrisis?: boolean;
}

interface EncryptedDatabaseState {
  version: number;
  encryptedCollections: {
    checkins: EncryptedData;
    journals: EncryptedData;
    gratitudes: EncryptedData;
    chatSessions: EncryptedData;
  };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'mongodb_encrypted.json');

// In-memory decrypted collections cache for fast queries
class EncryptedMongoStore {
  private checkins: MoodCheckIn[] = [];
  private journals: JournalEntry[] = [];
  private gratitudes: GratitudePost[] = [];
  private chatSessions: Record<string, ChatMessage[]> = {};
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed: EncryptedDatabaseState = JSON.parse(raw);
        this.checkins = decryptPayload<MoodCheckIn[]>(parsed.encryptedCollections.checkins) || [];
        this.journals = decryptPayload<JournalEntry[]>(parsed.encryptedCollections.journals) || [];
        this.gratitudes = decryptPayload<GratitudePost[]>(parsed.encryptedCollections.gratitudes) || [];
        this.chatSessions = decryptPayload<Record<string, ChatMessage[]>>(parsed.encryptedCollections.chatSessions) || {};
        this.initialized = true;
        return;
      } catch (err) {
        console.warn('Could not read existing encrypted database, resetting with seed data:', err);
      }
    }

    // Seed realistic 7-day data so analytics, community, and export are rich immediately
    this.seedInitialData();
    this.persist();
    this.initialized = true;
  }

  private seedInitialData() {
    const now = new Date();
    
    // 7 days of mood check-ins leading up to today
    const sampleCheckins: MoodCheckIn[] = [
      {
        _id: 'chk_seed_1',
        userId: 'default_user',
        moodScore: 4,
        moodLabel: 'Overwhelmed',
        emotions: ['Anxious', 'Fatigued', 'Overwhelmed'],
        somaticSensations: ['Tight chest', 'Shallow breathing', 'Heavy eyelids'],
        bodyRegions: ['chest', 'head'],
        stressTriggers: ['Work deadline', 'Poor sleep'],
        gratitudeNote: 'My warm cup of lavender tea before starting work.',
        energyLevel: 2,
        sleepQuality: 2,
        notes: 'Felt like racing through the day without catching a breath.',
        createdAt: new Date(now.getTime() - 6 * 86400000).toISOString()
      },
      {
        _id: 'chk_seed_2',
        userId: 'default_user',
        moodScore: 5,
        moodLabel: 'Restless',
        emotions: ['Restless', 'Guarded'],
        somaticSensations: ['Shoulder tension', 'Jaw clenching'],
        bodyRegions: ['shoulders', 'head'],
        stressTriggers: ['Financial tasks', 'Digital screen overload'],
        gratitudeNote: 'A gentle breeze while walking around the block.',
        energyLevel: 3,
        sleepQuality: 3,
        createdAt: new Date(now.getTime() - 5 * 86400000).toISOString()
      },
      {
        _id: 'chk_seed_3',
        userId: 'default_user',
        moodScore: 6,
        moodLabel: 'Neutral & Present',
        emotions: ['Calm', 'Thoughtful'],
        somaticSensations: ['Relaxed neck', 'Deep breath'],
        bodyRegions: ['chest'],
        stressTriggers: ['Commute'],
        gratitudeNote: 'My friend texted a funny memory out of the blue.',
        energyLevel: 3,
        sleepQuality: 4,
        createdAt: new Date(now.getTime() - 4 * 86400000).toISOString()
      },
      {
        _id: 'chk_seed_4',
        userId: 'default_user',
        moodScore: 7,
        moodLabel: 'Hopeful',
        emotions: ['Hopeful', 'Grateful'],
        somaticSensations: ['Warmth in hands', 'Steady pulse'],
        bodyRegions: ['chest', 'limbs'],
        stressTriggers: ['Minor meeting conflict'],
        gratitudeNote: 'Finished an important project milestone early.',
        energyLevel: 4,
        sleepQuality: 4,
        createdAt: new Date(now.getTime() - 3 * 86400000).toISOString()
      },
      {
        _id: 'chk_seed_5',
        userId: 'default_user',
        moodScore: 6,
        moodLabel: 'Calm',
        emotions: ['Content', 'Patient'],
        somaticSensations: ['Soft stomach', 'Slow breathing'],
        bodyRegions: ['gut', 'chest'],
        stressTriggers: ['Family news'],
        gratitudeNote: 'Listened to the rainfall outside my window.',
        energyLevel: 3,
        sleepQuality: 3,
        createdAt: new Date(now.getTime() - 2 * 86400000).toISOString()
      },
      {
        _id: 'chk_seed_6',
        userId: 'default_user',
        moodScore: 8,
        moodLabel: 'Serene',
        emotions: ['Peaceful', 'Empowered', 'Grateful'],
        somaticSensations: ['Lightness throughout', 'Open shoulders'],
        bodyRegions: ['shoulders', 'limbs'],
        stressTriggers: [],
        gratitudeNote: 'Took time for morning 4-7-8 breathing and felt deeply rooted.',
        energyLevel: 4,
        sleepQuality: 5,
        createdAt: new Date(now.getTime() - 1 * 86400000).toISOString()
      },
      {
        _id: 'chk_seed_7',
        userId: 'default_user',
        moodScore: 8,
        moodLabel: 'Grounded & Peaceful',
        emotions: ['Grounded', 'Calm', 'Joyful'],
        somaticSensations: ['Relaxed belly', 'Open chest', 'Clear head'],
        bodyRegions: ['chest', 'gut', 'head'],
        stressTriggers: [],
        gratitudeNote: 'Grateful for this quiet sanctuary space to reconnect with myself.',
        energyLevel: 4,
        sleepQuality: 4,
        createdAt: now.toISOString()
      }
    ];

    const sampleJournals: JournalEntry[] = [
      {
        _id: 'jrn_seed_1',
        userId: 'default_user',
        title: 'Unpacking the knot in my chest',
        prompt: 'What sensation is present in your body right now, and what does it need to feel safe?',
        content: 'I noticed my shoulders were hunched almost to my ears today. When I paused to breathe, I realized how much unspoken tension I was carrying from this week’s workload. I don’t have to solve everything today. Breathing out feels like putting down a heavy backpack.',
        empatheticReflection: 'It takes real vulnerability and mindfulness to notice physical tension before it boils over. Releasing your shoulders and acknowledging that you don’t need to hold everything alone is a powerful act of self-compassion.',
        positiveActionTakeaways: [
          'Take a slow glass of cool water and gently roll your shoulders back three times.',
          'Give yourself permission to close non-essential browser tabs for the rest of the evening.',
          'Rest your feet flat on the floor and feel the sturdy support underneath you.'
        ],
        sentimentLabel: 'Reflective & Relieved',
        groundingExerciseDone: true,
        createdAt: new Date(now.getTime() - 2 * 86400000).toISOString()
      }
    ];

    const sampleGratitudes: GratitudePost[] = [
      {
        _id: 'grat_1',
        category: 'Nature & Senses',
        text: 'The crisp morning air smelling like eucalyptus and rain, giving me a moment of total stillness before my day started.',
        hearts: 24,
        createdAt: new Date(now.getTime() - 4 * 3600000).toISOString()
      },
      {
        _id: 'grat_2',
        category: 'Human Kindness',
        text: 'A kind stranger at the train platform saw me struggling with heavy bags and carried one without even being asked. Faith restored.',
        hearts: 41,
        createdAt: new Date(now.getTime() - 8 * 3600000).toISOString()
      },
      {
        _id: 'grat_3',
        category: 'Small Victories',
        text: 'I practiced 4-7-8 breathing instead of spiraling into panic before my presentation. I made it through with steady hands!',
        hearts: 53,
        createdAt: new Date(now.getTime() - 12 * 3600000).toISOString()
      },
      {
        _id: 'grat_4',
        category: 'Healing & Rest',
        text: 'Finally allowed myself an afternoon nap without feelings of guilt. Rest is not a reward to earn; it is fuel for the soul.',
        hearts: 38,
        createdAt: new Date(now.getTime() - 18 * 3600000).toISOString()
      },
      {
        _id: 'grat_5',
        category: 'Overcoming Obstacles',
        text: 'Celebrated 3 months of gently showing up for therapy and journaling. Healing is non-linear, but I am proud of my progress.',
        hearts: 67,
        createdAt: new Date(now.getTime() - 26 * 3600000).toISOString()
      },
      {
        _id: 'grat_6',
        category: 'Nature & Senses',
        text: 'My cat curling into a purring ball right against my side when I was having a difficult evening.',
        hearts: 89,
        createdAt: new Date(now.getTime() - 32 * 3600000).toISOString()
      }
    ];

    this.checkins = sampleCheckins;
    this.journals = sampleJournals;
    this.gratitudes = sampleGratitudes;
  }

  private persist() {
    try {
      const state: EncryptedDatabaseState = {
        version: 1,
        encryptedCollections: {
          checkins: encryptPayload(this.checkins),
          journals: encryptPayload(this.journals),
          gratitudes: encryptPayload(this.gratitudes),
          chatSessions: encryptPayload(this.chatSessions)
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to securely persist encrypted database to disk:', err);
    }
  }

  // --- Checkins Collection ---
  public getCheckins(userId = 'default_user'): MoodCheckIn[] {
    return [...this.checkins]
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addCheckin(checkinData: Omit<MoodCheckIn, '_id' | 'createdAt'>): MoodCheckIn {
    const newCheckin: MoodCheckIn = {
      ...checkinData,
      _id: 'chk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    };
    this.checkins.unshift(newCheckin);
    this.persist();
    return newCheckin;
  }

  public deleteCheckin(id: string, userId = 'default_user'): boolean {
    const initialLen = this.checkins.length;
    this.checkins = this.checkins.filter(c => !(c._id === id && c.userId === userId));
    if (this.checkins.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Journals Collection ---
  public getJournals(userId = 'default_user'): JournalEntry[] {
    return [...this.journals]
      .filter(j => j.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addJournal(entryData: Omit<JournalEntry, '_id' | 'createdAt'>): JournalEntry {
    const newJournal: JournalEntry = {
      ...entryData,
      _id: 'jrn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    };
    this.journals.unshift(newJournal);
    this.persist();
    return newJournal;
  }

  // --- Gratitude Collection ---
  public getGratitudes(category?: string): GratitudePost[] {
    let posts = [...this.gratitudes];
    if (category && category !== 'All') {
      posts = posts.filter(p => p.category === category);
    }
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addGratitude(category: GratitudePost['category'], text: string): GratitudePost {
    const newPost: GratitudePost = {
      _id: 'grat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      category: category || 'General',
      text: text.trim(),
      hearts: 1,
      createdAt: new Date().toISOString()
    };
    this.gratitudes.unshift(newPost);
    this.persist();
    return newPost;
  }

  public heartGratitude(id: string): GratitudePost | null {
    const post = this.gratitudes.find(p => p._id === id);
    if (post) {
      post.hearts += 1;
      this.persist();
      return post;
    }
    return null;
  }

  // --- Chat Sessions Collection ---
  public getChatHistory(sessionId = 'default_user'): ChatMessage[] {
    return this.chatSessions[sessionId] || [];
  }

  public appendChatMessage(sessionId: string, msg: ChatMessage) {
    if (!this.chatSessions[sessionId]) {
      this.chatSessions[sessionId] = [];
    }
    this.chatSessions[sessionId].push(msg);
    // Keep last 40 messages
    if (this.chatSessions[sessionId].length > 40) {
      this.chatSessions[sessionId] = this.chatSessions[sessionId].slice(-40);
    }
    this.persist();
  }

  public clearChatHistory(sessionId = 'default_user') {
    this.chatSessions[sessionId] = [];
    this.persist();
  }
}

const localStore = process.env.VERCEL ? undefined : new EncryptedMongoStore();

function getLocalStore(): EncryptedMongoStore {
  if (!localStore) throw new Error('MONGODB_URI is required when running on Vercel');
  return localStore;
}

const useAtlas = () => Boolean(process.env.MONGODB_URI);

// Local development keeps the encrypted file store; deployments use Atlas.
export const mongoStore = {
  ping: async () => {
    if (useAtlas()) return atlasStore.ping();
    getLocalStore();
  },
  getCheckins: async (userId = 'default_user') => useAtlas()
    ? atlasStore.getCheckins(userId)
    : getLocalStore().getCheckins(userId),
  addCheckin: async (data: Omit<MoodCheckIn, '_id' | 'createdAt'>) => useAtlas()
    ? atlasStore.addCheckin(data)
    : getLocalStore().addCheckin(data),
  deleteCheckin: async (id: string, userId = 'default_user') => useAtlas()
    ? atlasStore.deleteCheckin(id, userId)
    : getLocalStore().deleteCheckin(id, userId),
  getJournals: async (userId = 'default_user') => useAtlas()
    ? atlasStore.getJournals(userId)
    : getLocalStore().getJournals(userId),
  addJournal: async (data: Omit<JournalEntry, '_id' | 'createdAt'>) => useAtlas()
    ? atlasStore.addJournal(data)
    : getLocalStore().addJournal(data),
  getGratitudes: async (category?: string) => useAtlas()
    ? atlasStore.getGratitudes(category)
    : getLocalStore().getGratitudes(category),
  addGratitude: async (category: GratitudePost['category'], text: string) => useAtlas()
    ? atlasStore.addGratitude(category, text)
    : getLocalStore().addGratitude(category, text),
  heartGratitude: async (id: string) => useAtlas()
    ? atlasStore.heartGratitude(id)
    : getLocalStore().heartGratitude(id),
  getChatHistory: async (sessionId = 'default_user') => useAtlas()
    ? atlasStore.getChatHistory(sessionId)
    : getLocalStore().getChatHistory(sessionId),
  appendChatMessage: async (sessionId: string, message: ChatMessage) => useAtlas()
    ? atlasStore.appendChatMessage(sessionId, message)
    : getLocalStore().appendChatMessage(sessionId, message),
  clearChatHistory: async (sessionId = 'default_user') => useAtlas()
    ? atlasStore.clearChatHistory(sessionId)
    : getLocalStore().clearChatHistory(sessionId)
};
