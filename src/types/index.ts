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
  suggestedAction?: 'breathing' | 'grounding' | 'journaling' | 'helpline' | 'none';
  quickReplies?: string[];
}

export interface DayTrend {
  date: string;
  dayName: string;
  score: number;
  count: number;
  primaryMood: string;
}

export interface StatsData {
  averageMood: number;
  checkinCount: number;
  trend: DayTrend[];
  hotspotCounts: {
    head: number;
    shoulders: number;
    chest: number;
    gut: number;
    limbs: number;
  };
  topTriggers: Array<{ name: string; count: number }>;
  streakDays: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'streak' | 'practice' | 'reflection';
}

export interface SanctuaryTheme {
  id: string;
  name: string;
  tagline: string;
  costPoints: number;
  isUnlocked: boolean;
  primaryColor: string;
  accentBg: string;
  cardBg: string;
  textColor: string;
}

export interface UserGamificationState {
  points: number;
  streak: number;
  lastActiveDate: string;
  totalMindfulMinutes: number;
  activeThemeId: string;
  unlockedThemes: string[];
  badges: Badge[];
}
