import 'dotenv/config';
import express, { Request, Response } from 'express';
import { mongoStore } from './server/db/mongoStore.js';
import { getEmpatheticCompanionReply, generateJournalReflection, detectCrisisSignals } from './server/gemini.js';

const app = express();

app.use(express.json());

const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
app.use('/api', (req: Request, res: Response, next) => {
  if (req.path === '/health' || req.path.startsWith('/gratitude')) {
    next();
    return;
  }
  const suppliedSession = req.header('X-MindCalm-Session');
  if (suppliedSession && !SESSION_ID_PATTERN.test(suppliedSession)) {
    res.status(400).json({ success: false, error: 'Invalid app session' });
    return;
  }
  if (process.env.VERCEL && !suppliedSession) {
    res.status(400).json({ success: false, error: 'App session is required' });
    return;
  }
  res.locals.sessionId = process.env.VERCEL || process.env.MONGODB_URI ? suppliedSession : 'default_user';
  next();
});

// --- REST API Endpoints ---

// 1. Health & Database Encryption Status
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await mongoStore.ping();
    res.json({
      status: 'ok',
      database: process.env.MONGODB_URI ? 'MongoDB Atlas connected' : 'Local encrypted development store',
      aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini configured' : 'Gemini API key missing',
      crisisProtocolActive: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'MongoDB unavailable or not configured',
      aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini configured' : 'Gemini API key missing',
      crisisProtocolActive: true,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. Check-ins Endpoints
app.get('/api/checkins', async (req: Request, res: Response) => {
  try {
    const checkins = await mongoStore.getCheckins(res.locals.sessionId);
    res.json({ success: true, count: checkins.length, data: checkins });
  } catch (error) {
    console.error('Error fetching checkins:', error);
    res.status(500).json({ success: false, error: 'Could not fetch check-ins' });
  }
});

app.post('/api/checkins', async (req: Request, res: Response) => {
  try {
    const {
      moodScore,
      moodLabel,
      emotions,
      somaticSensations,
      bodyRegions,
      stressTriggers,
      gratitudeNote,
      energyLevel,
      sleepQuality,
      notes
    } = req.body;

    if (!moodScore || typeof moodScore !== 'number') {
      res.status(400).json({ success: false, error: 'Mood score is required (1-10)' });
      return;
    }

    const newCheckin = await mongoStore.addCheckin({
      userId: res.locals.sessionId,
      moodScore: Math.min(10, Math.max(1, moodScore)),
      moodLabel: moodLabel || 'Checked in',
      emotions: Array.isArray(emotions) ? emotions : [],
      somaticSensations: Array.isArray(somaticSensations) ? somaticSensations : [],
      bodyRegions: Array.isArray(bodyRegions) ? bodyRegions : [],
      stressTriggers: Array.isArray(stressTriggers) ? stressTriggers : [],
      gratitudeNote: gratitudeNote || '',
      energyLevel: energyLevel || 3,
      sleepQuality: sleepQuality || 3,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: newCheckin });
  } catch (error) {
    console.error('Error saving checkin:', error);
    res.status(500).json({ success: false, error: 'Failed to record check-in' });
  }
});

app.delete('/api/checkins/:id', async (req: Request, res: Response) => {
  try {
    const success = await mongoStore.deleteCheckin(req.params.id, res.locals.sessionId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete check-in' });
  }
});

// 3. Clinical CSV Data Export for Healthcare Professionals
app.get('/api/checkins/export/csv', async (req: Request, res: Response) => {
  try {
    const checkins = await mongoStore.getCheckins(res.locals.sessionId);
    
    // CSV Header matching clinical mental health assessment formats
    const headers = [
      'Date',
      'Time (UTC)',
      'Mood Score (1-10)',
      'Mood Descriptor',
      'Primary Emotions',
      'Somatic Sensations',
      'Body Regions Identified',
      'Stress Triggers',
      'Energy Level (1-5)',
      'Sleep Quality (1-5)',
      'Gratitude Note',
      'Personal Notes'
    ];

    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = checkins.map(c => {
      const dt = new Date(c.createdAt);
      const dateStr = dt.toISOString().split('T')[0];
      const timeStr = dt.toTimeString().split(' ')[0];
      return [
        escapeCsv(dateStr),
        escapeCsv(timeStr),
        c.moodScore,
        escapeCsv(c.moodLabel),
        escapeCsv(c.emotions.join('; ')),
        escapeCsv(c.somaticSensations.join('; ')),
        escapeCsv(c.bodyRegions.join('; ')),
        escapeCsv(c.stressTriggers.join('; ')),
        c.energyLevel || '',
        c.sleepQuality || '',
        escapeCsv(c.gratitudeNote),
        escapeCsv(c.notes || '')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="MindCalm_Clinical_Export_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating CSV export:', error);
    res.status(500).json({ success: false, error: 'Failed to generate clinical export' });
  }
});

// 4. Analytics & 7-Day Stats
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const checkins = await mongoStore.getCheckins(res.locals.sessionId);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const recentCheckins = checkins.filter(c => new Date(c.createdAt) >= sevenDaysAgo);

    const scores = recentCheckins.map(c => c.moodScore);
    const avgScore = scores.length > 0 
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) 
      : 7.0;

    // Daily buckets for 7-day trend chart
    const daysMap: Record<string, { date: string; dayName: string; score: number; count: number; primaryMood: string }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[key] = { date: key, dayName, score: 0, count: 0, primaryMood: 'Gentle' };
    }

    recentCheckins.forEach(c => {
      const key = new Date(c.createdAt).toISOString().split('T')[0];
      if (daysMap[key]) {
        daysMap[key].score += c.moodScore;
        daysMap[key].count += 1;
        daysMap[key].primaryMood = c.moodLabel || 'Calm';
      }
    });

    const trend = Object.values(daysMap).map(d => ({
      date: d.date,
      dayName: d.dayName,
      score: d.count > 0 ? parseFloat((d.score / d.count).toFixed(1)) : avgScore,
      count: d.count,
      primaryMood: d.primaryMood
    }));

    // Somatic Hotspot counts
    const hotspotCounts: Record<string, number> = {
      head: 0,
      shoulders: 0,
      chest: 0,
      gut: 0,
      limbs: 0
    };
    checkins.forEach(c => {
      c.bodyRegions?.forEach(r => {
        const lower = r.toLowerCase();
        if (lower.includes('head') || lower.includes('jaw')) hotspotCounts.head++;
        else if (lower.includes('shoulder') || lower.includes('neck')) hotspotCounts.shoulders++;
        else if (lower.includes('chest') || lower.includes('breath')) hotspotCounts.chest++;
        else if (lower.includes('gut') || lower.includes('stomach')) hotspotCounts.gut++;
        else hotspotCounts.limbs++;
      });
    });

    // Top Stress Triggers
    const triggerCounts: Record<string, number> = {};
    checkins.forEach(c => {
      c.stressTriggers?.forEach(t => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });

    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        averageMood: avgScore,
        checkinCount: checkins.length,
        trend,
        hotspotCounts,
        topTriggers,
        streakDays: Math.min(checkins.length, 7)
      }
    });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ success: false, error: 'Could not calculate statistics' });
  }
});

// 5. Journal Endpoints
app.get('/api/journals', async (req: Request, res: Response) => {
  try {
    const journals = await mongoStore.getJournals(res.locals.sessionId);
    res.json({ success: true, count: journals.length, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not fetch journals' });
  }
});

app.post('/api/journals/reflect', async (req: Request, res: Response) => {
  try {
    const { title, prompt, content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, error: 'Journal content is required' });
      return;
    }

    const reflection = await generateJournalReflection(title || prompt || 'Open Reflection', content);
    res.json({ success: true, data: reflection });
  } catch (error) {
    console.error('Error reflecting on journal:', error);
    res.status(500).json({ success: false, error: 'Reflection generation failed' });
  }
});

app.post('/api/journals', async (req: Request, res: Response) => {
  try {
    const { title, prompt, content, empatheticReflection, positiveActionTakeaways, sentimentLabel } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, error: 'Content is required' });
      return;
    }

    const newJournal = await mongoStore.addJournal({
      userId: res.locals.sessionId,
      title: title || 'Sanctuary Journal',
      prompt: prompt || 'Free-flow thoughts',
      content,
      empatheticReflection,
      positiveActionTakeaways,
      sentimentLabel,
      groundingExerciseDone: true
    });

    res.status(201).json({ success: true, data: newJournal });
  } catch (error) {
    console.error('Error saving journal:', error);
    res.status(500).json({ success: false, error: 'Could not save journal entry' });
  }
});

// 6. Community Gratitude Feed Endpoints
app.get('/api/gratitude', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const posts = await mongoStore.getGratitudes(category);
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not fetch gratitude feed' });
  }
});

app.post('/api/gratitude', async (req: Request, res: Response) => {
  try {
    const { category, text } = req.body;
    if (!text || text.trim().length < 3) {
      res.status(400).json({ success: false, error: 'Gratitude text must be at least 3 characters' });
      return;
    }

    // Safety check for harmful content
    if (detectCrisisSignals(text)) {
      res.status(400).json({
        success: false,
        error: 'Your post contains words associated with high distress. If you need support right now, please visit the Emergency Helpline Directory or call/text 988.'
      });
      return;
    }

    const newPost = await mongoStore.addGratitude(category, text);
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating gratitude:', error);
    res.status(500).json({ success: false, error: 'Could not share gratitude' });
  }
});

app.post('/api/gratitude/:id/heart', async (req: Request, res: Response) => {
  try {
    const updated = await mongoStore.heartGratitude(req.params.id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not react to gratitude' });
  }
});

// 7. Empathetic AI Companion Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ success: false, error: 'Message cannot be empty' });
      return;
    }

    const replyData = await getEmpatheticCompanionReply(message, history || []);
    
    // Save to encrypted session history
    const sessionId = res.locals.sessionId as string;
    await mongoStore.appendChatMessage(sessionId, {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    });

    await mongoStore.appendChatMessage(sessionId, {
      id: 'ast_' + Date.now(),
      sender: 'assistant',
      text: replyData.reply,
      timestamp: new Date().toISOString(),
      isCrisis: replyData.isCrisis
    });

    res.json({ success: true, data: replyData });
  } catch (error) {
    console.error('Error in chat companion:', error);
    res.status(500).json({
      success: false,
      error: 'Mental Bot is taking a deep breath. Please try again or reach out to the crisis hotline if needed.'
    });
  }
});

app.get('/api/chat/history', async (req: Request, res: Response) => {
  try {
    const history = await mongoStore.getChatHistory(res.locals.sessionId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not fetch chat history' });
  }
});

app.post('/api/chat/clear', async (req: Request, res: Response) => {
  try {
    await mongoStore.clearChatHistory(res.locals.sessionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not clear chat history' });
  }
});

export default app;
