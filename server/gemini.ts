import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI instance with the required User-Agent header
function getAI() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}


// Real-time crisis detection patterns for self-harm, suicidal ideation, or extreme clinical emergency
const CRISIS_PATTERNS = [
  /\b(kill myself|want to die|end my life|end it all|suicide|suicidal|better off dead|hang myself|slit my wrist|slit my wrists|overdose|take all my pills|no reason to live|don't want to wake up|can't keep living|hurting myself|self harm)\b/i,
  /\b(goodbye cruel world|everyone would be better without me|nobody would care if I died|planning my death)\b/i
];

export function detectCrisisSignals(text: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some(regex => regex.test(text));
}

// Pattern matching negative emotional states, distress, somatic tension, or pain
const NEGATIVE_EMOTION_PATTERNS = [
  /\b(anxious|anxiety|stressed|stress|overwhelmed|panic|panicking|sad|sadness|depressed|depression|down|lonely|alone|hurt|hurting|crying|tears|scared|fear|afraid|terrible|horrible|angry|frustrated|exhausted|burnout|burned out|tired|drained|insomnia|can't sleep|struggling|hard day|bad day|hopeless|heavy|nervous|worry|worried|failing|guilty|shame|grief|numb|restless|tense|tension|tight|chest tightness|headache|pressure|shaking|freaking out)\b/i
];

export function detectNegativeFeelings(text: string): boolean {
  if (!text) return false;
  return NEGATIVE_EMOTION_PATTERNS.some(regex => regex.test(text));
}

export interface CompanionResponse {
  reply: string;
  isCrisis: boolean;
  suggestedAction?: 'breathing' | 'grounding' | 'journaling' | 'helpline' | 'none';
  quickReplies?: string[];
}

/**
 * Generates an empathetic, clinically sensitive response from the AI Companion
 */
export async function getEmpatheticCompanionReply(
  userMessage: string,
  history: Array<{ sender: 'user' | 'assistant'; text: string }> = []
): Promise<CompanionResponse> {
  const isCrisisDirect = detectCrisisSignals(userMessage);

  if (isCrisisDirect) {
    return {
      isCrisis: true,
      suggestedAction: 'helpline',
      reply: `I hear how deeply in pain you are right now, and I want you to know you are not alone in this heavy moment. Please pause and take one gentle breath with me.\n\nBecause I care about your safety and I am an AI, I want to connect you immediately with people who are trained to listen and support you without judgment:\n\n• **988 Suicide & Crisis Lifeline**: Call or text **988** (available 24/7, free & confidential in US & Canada)\n• **Crisis Text Line**: Text **HOME to 741741**\n• **International Befrienders**: Visit befrienders.org for global support\n• **The Trevor Project** (LGBTQ+ youth): Call 1-866-488-7386 or text START to 678-678\n\nPlease reach out to one of these free resources or a loved one right now. I am right here beside you to guide you through a gentle grounding breath whenever you are ready.`,
      quickReplies: ['Call 988 Lifeline', 'Guide me through slow breathing', 'I need grounding right now']
    };
  }

  // Check if the user is expressing negative feelings
  const hasNegativeFeelings = detectNegativeFeelings(userMessage);

  // Build conversational context
  const recentHistory = history.slice(-6).map(h => 
    `${h.sender === 'user' ? 'User' : 'Mental Bot'}: ${h.text}`
  ).join('\n');

  const systemInstruction = `You are "Mental Bot", an empathetic, rapid, psychologically supportive companion in a mental well-being sanctuary.

CRITICAL EXERCISE RULE:
- ONLY offer or prescribe an exercise (such as breathing, grounding, muscle relaxation, or body scan) IF the user's message expresses negative feelings, distress, anxiety, stress, sadness, overwhelm, or physical tension.
- If the user is sharing positive feelings (e.g. happiness, gratitude, calm, celebrating a win, feeling good), neutral thoughts, casual conversation ("Hello", "How does this work?"), or general questions: DO NOT suggest, prescribe, or push any exercise! Instead, celebrate warmly with them, discuss their thought, or converse naturally.

SPEED & BREVITY:
- Keep replies under 70-90 words. Be quick, crisp, empathetic, and genuine.
- Avoid robotic clichés. Speak in a tranquil, authentic tone.`;

  try {
    const prompt = recentHistory 
      ? `Previous conversation:\n${recentHistory}\n\nUser: ${userMessage}\n\nMental Bot:`
      : `User: ${userMessage}\n\nMental Bot:`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    const reply = response.text?.trim() || (hasNegativeFeelings 
      ? "I hear you, and I am right here with you. Take one slow, gentle breath and let your shoulders drop. How are you holding up right now?"
      : "I appreciate you sharing that with me. It is wonderful to pause and connect in this quiet sanctuary space. How else are you feeling today?");
    const hasCrisis = detectCrisisSignals(userMessage) || detectCrisisSignals(reply);

    const lowerReply = reply.toLowerCase();
    let suggestedAction: CompanionResponse['suggestedAction'] = 'none';

    // ONLY provide an exercise action if the user has negative feelings
    if (hasNegativeFeelings) {
      if (lowerReply.includes('breath') || lowerReply.includes('sigh') || userMessage.toLowerCase().includes('breath') || userMessage.toLowerCase().includes('panic') || userMessage.toLowerCase().includes('anxi')) {
        suggestedAction = 'breathing';
      } else if (lowerReply.includes('ground') || lowerReply.includes('muscle') || userMessage.toLowerCase().includes('tight') || userMessage.toLowerCase().includes('overwhelm')) {
        suggestedAction = 'grounding';
      } else if (lowerReply.includes('journal') || lowerReply.includes('write')) {
        suggestedAction = 'journaling';
      }
    }

    const quickReplies = hasNegativeFeelings
      ? ['Start 4-7-8 Breathing', 'Guide me through grounding', 'I feel a bit calmer now', 'Tell me more']
      : ['Tell me more', 'I am feeling grateful', 'What are other sanctuary tools?', 'Celebrate this win!'];

    return {
      reply,
      isCrisis: hasCrisis,
      suggestedAction,
      quickReplies
    };
  } catch (error) {
    console.error('Error generating AI companion response:', error);
    return {
      reply: hasNegativeFeelings 
        ? "I hear you, and I am right here beside you. When things feel heavy, taking one slow breath out can create a small pocket of space."
        : "Thank you for connecting with me today. It is always a gift to pause in this quiet space together.",
      isCrisis: isCrisisDirect,
      suggestedAction: hasNegativeFeelings ? 'breathing' : 'none',
      quickReplies: hasNegativeFeelings ? ['Start 4-7-8 Breathing', 'Grounding 5-4-3-2-1'] : ['Tell me more', 'Explore sanctuary']
    };
  }
}

export interface JournalReflectionResult {
  empatheticReflection: string;
  positiveActionTakeaways: string[];
  sentimentLabel: string;
  isCrisis: boolean;
}

/**
 * Analyzes a journal entry and produces compassionate reflection + actionable micro-steps
 */
export async function generateJournalReflection(
  promptTitle: string,
  userEntry: string
): Promise<JournalReflectionResult> {
  const isCrisis = detectCrisisSignals(userEntry);

  if (isCrisis) {
    return {
      empatheticReflection: "I read what you wrote, and I feel the tremendous weight of what you are carrying. Please know that your pain matters, and you do not have to carry this in silence. You deserve human support and care right this second.",
      positiveActionTakeaways: [
        "Call or text 988 to speak with a compassionate crisis counselor (free, confidential, 24/7).",
        "Text HOME to 741741 to connect via text message.",
        "Drink a few sips of water and reach out to someone you trust."
      ],
      sentimentLabel: "High Distress / Urgent Care",
      isCrisis: true
    };
  }

  const systemInstruction = `You are an empathetic, licensed-style reflective journaling counselor in MindCalm.
Analyze the user's journal entry. Provide:
1. "empatheticReflection": A warm, validating, psychologically safe 2-3 sentence reflection that honors their feelings, points out their resilience, and offers a gentle cognitive reframing without toxic positivity.
2. "positiveActionTakeaways": Exactly 3 microscopic, low-friction, realistic calming actions they can take in the next 15 minutes (e.g. "Sip warm herbal tea without looking at a screen", "Step outside for 60 seconds to feel the breeze", "Do 3 rounds of gentle shoulder rolls").
3. "sentimentLabel": A 2-3 word gentle emotional descriptor (e.g., "Reflective & Tired", "Quietly Hopeful", "Overburdened but Seeking Peace").`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Journal Prompt: "${promptTitle}"\n\nUser Journal Content:\n"${userEntry}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empatheticReflection: {
              type: Type.STRING,
              description: "Empathetic 2-3 sentence reflection"
            },
            positiveActionTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 microscopic positive actions"
            },
            sentimentLabel: {
              type: Type.STRING,
              description: "Short emotional state label"
            }
          },
          required: ["empatheticReflection", "positiveActionTakeaways", "sentimentLabel"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      empatheticReflection: parsed.empatheticReflection || "Thank you for putting your thoughts into words. Acknowledging your feelings is the very first step toward emotional clarity and relief.",
      positiveActionTakeaways: parsed.positiveActionTakeaways && parsed.positiveActionTakeaways.length > 0
        ? parsed.positiveActionTakeaways
        : [
            "Take three deep diaphragmatic breaths.",
            "Rest your hands in your lap and unclench your jaw.",
            "Drink a soothing glass of water."
          ],
      sentimentLabel: parsed.sentimentLabel || "Mindful Reflection",
      isCrisis: false
    };
  } catch (err) {
    console.error('Error generating journal reflection:', err);
    return {
      empatheticReflection: "Giving voice to your inner world takes courage. Whatever you are experiencing right now is valid, and you are taking deliberate care of yourself by putting it onto the page.",
      positiveActionTakeaways: [
        "Unclench your jaw and gently roll your shoulders back.",
        "Take a slow sip of water and notice the sensation of swallowing.",
        "Rest your eyes away from screens for two minutes."
      ],
      sentimentLabel: "Reflective Self-Care",
      isCrisis: false
    };
  }
}
