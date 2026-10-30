import React, { useState } from 'react';
import { Smile, Heart, Activity, CheckCircle2, Sparkles, MapPin, Coffee, Moon, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiFetch } from '../utils/api';

interface MoodSomaticCheckInProps {
  onCheckInCompleted: () => void;
}

const EMOTION_OPTIONS = [
  'Peaceful', 'Anxious', 'Fatigued', 'Grateful',
  'Overwhelmed', 'Hopeful', 'Numb', 'Restless',
  'Content', 'Vulnerable', 'Lonely', 'Energetic',
  'Distracted', 'Grounded', 'Frustrated', 'Safe'
];

const BODY_REGIONS_CONFIG = [
  { id: 'head', label: 'Head & Mind', sensations: ['Racing thoughts', 'Headache', 'Jaw clenching', 'Brain fog', 'Clear & focused'] },
  { id: 'shoulders', label: 'Neck & Shoulders', sensations: ['Carrying heavy weight', 'Knotted muscles', 'Stiff neck', 'Loose & relaxed'] },
  { id: 'chest', label: 'Chest & Breath', sensations: ['Tightness', 'Shallow breathing', 'Racing heart', 'Expansive & steady'] },
  { id: 'gut', label: 'Gut & Stomach', sensations: ['Butterflies / flutter', 'Tight knot', 'Nausea / uneasy', 'Soft & digestion calm'] },
  { id: 'limbs', label: 'Hands, Legs & Limbs', sensations: ['Restless tapping', 'Heavy / weighted down', 'Trembling', 'Warm & grounded'] }
];

const TRIGGER_OPTIONS = [
  'Work & Deadlines', 'Sleep Quality', 'Relationships & Social',
  'Physical Health', 'Financial Stress', 'Digital Overload',
  'Sensory Overload', 'Weather & Environment', 'None / Serene Day'
];

export const MoodSomaticCheckIn: React.FC<MoodSomaticCheckInProps> = ({ onCheckInCompleted }) => {
  const [moodScore, setMoodScore] = useState<number>(7);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Grounded', 'Grateful']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['chest']);
  const [selectedSensations, setSelectedSensations] = useState<string[]>(['Expansive & steady']);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['None / Serene Day']);
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [submitting, setSubmitting] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  const getMoodDescriptor = (score: number) => {
    if (score <= 2) return { label: 'In Deep Struggle', color: 'text-[#A75D43] bg-[#EDE9DF] border-[#A75D43]/40' };
    if (score <= 4) return { label: 'Heavy & Overwhelmed', color: 'text-[#A75D43] bg-[#EDE9DF] border-[#DEDCCF]' };
    if (score <= 6) return { label: 'Steady & Neutral', color: 'text-[#35463A] bg-[#EDE9DF] border-[#DEDCCF]' };
    if (score <= 8) return { label: 'Grounded & Peaceful', color: 'text-[#3A5A40] bg-[#E2E8D7] border-[#A3B18A]/60' };
    return { label: 'Radiant & Thriving', color: 'text-[#3A5A40] bg-[#E2E8D7] border-[#A3B18A]' };
  };

  const currentMood = getMoodDescriptor(moodScore);

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        moodScore,
        moodLabel: currentMood.label,
        emotions: selectedEmotions,
        somaticSensations: selectedSensations,
        bodyRegions: selectedRegions,
        stressTriggers: selectedTriggers,
        gratitudeNote,
        notes: personalNotes,
        energyLevel,
        sleepQuality
      };

      const res = await apiFetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        setSuccessSaved(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#588157', '#A3B18A', '#F4EFE6']
        });
        setTimeout(() => {
          onCheckInCompleted();
        }, 1200);
      }
    } catch (err) {
      console.error('Error recording check-in:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic relative overflow-hidden">
        <div className="max-w-xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#6C786B] mb-2">
            <Activity className="w-3.5 h-3.5 text-[#588157]" />
            <span>Daily Somatic & Emotional Alignment</span>
            <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
            <span>AES-256 Encrypted</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
            How is your mind and body feeling today?
          </h2>
          <p className="text-[#35463A]/85 text-xs sm:text-sm mt-2 leading-relaxed">
            Emotions do not just live in our thoughts—they resonate through our physical bodies. Take 60 seconds to listen gently to your sensations without judgment.
          </p>
        </div>
      </div>

      {successSaved ? (
        <div className="bg-[#FBF9F3] border border-[#A3B18A] rounded-3xl p-10 text-center space-y-3 shadow-diffused-sm">
          <div className="w-14 h-14 bg-[#588157] text-[#FBF9F3] rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">Your Check-In is Safely Encrypted</h3>
          <p className="text-sm text-[#35463A] max-w-md mx-auto">
            Thank you for checking in with yourself. Your feelings have been acknowledged and saved securely to your private trend log.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Mood Score Slider */}
          <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-serif font-bold text-[#3A5A40] text-lg tracking-[-0.01em]">
                1. Overall Emotional Resonance
              </label>
              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold self-start sm:self-auto ${currentMood.color}`}>
                Score: {moodScore}/10 · {currentMood.label}
              </div>
            </div>

            <div className="py-4">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={moodScore}
                onChange={(e) => setMoodScore(parseInt(e.target.value, 10))}
                className="w-full h-3 bg-[#EDE9DF] rounded-lg appearance-none cursor-pointer accent-[#588157]"
                aria-label="Mood score slider from 1 to 10"
              />
              <div className="flex justify-between text-[11px] text-[#6C786B] font-medium mt-2">
                <span>1 (Deep Struggle)</span>
                <span>3</span>
                <span>5 (Steady / Neutral)</span>
                <span>7</span>
                <span>10 (Radiant / Thriving)</span>
              </div>
            </div>

            {/* Emotional Tag Buttons */}
            <div className="pt-3 border-t border-[#DEDCCF]">
              <p className="text-xs font-medium text-[#6C786B] mb-2.5">
                Which words resonate with what you feel right now? (Select all that fit)
              </p>
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map((emotion) => {
                  const isSelected = selectedEmotions.includes(emotion);
                  return (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => toggleArrayItem(selectedEmotions, setSelectedEmotions, emotion)}
                      className={`min-h-[38px] text-xs px-3.5 py-1.5 rounded-full transition-all ${
                        isSelected
                          ? 'bg-[#588157] text-[#FBF9F3] font-semibold shadow-2xs'
                          : 'bg-[#EDE9DF] text-[#35463A] border border-[#DEDCCF] hover:bg-[#E2E8D7]'
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Somatic Body Map & Physical Sensations */}
          <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-5">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-[#6C786B] font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#588157]" />
                <span>Somatic Resonance Map</span>
              </div>
              <h3 className="font-serif font-bold text-[#3A5A40] text-lg tracking-[-0.01em]">
                2. Where are you holding tension or lightness in your body?
              </h3>
              <p className="text-xs text-[#6C786B] mt-1">
                Select the physical regions where sensations are most pronounced right now.
              </p>
            </div>

            {/* Interactive Body Region Grid (Mobile-friendly) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {BODY_REGIONS_CONFIG.map((region) => {
                const isSelected = selectedRegions.includes(region.id);
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => toggleArrayItem(selectedRegions, setSelectedRegions, region.id)}
                    className={`min-h-[64px] p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                      isSelected
                        ? 'border-[#588157] bg-[#E2E8D7] text-[#3A5A40] font-semibold shadow-2xs'
                        : 'border-[#DEDCCF] bg-[#F4EFE6] hover:bg-[#EDE9DF] text-[#35463A]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-[#588157] text-[#FBF9F3]' : 'bg-[#DEDCCF] text-[#3A5A40]'
                    }`}>
                      {region.label.charAt(0)}
                    </div>
                    <span className="text-xs leading-tight">{region.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Granular Sensations */}
            <div className="pt-3 border-t border-[#DEDCCF]">
              <p className="text-xs font-medium text-[#6C786B] mb-2.5">
                Detailed physical sensations to note:
              </p>
              <div className="flex flex-wrap gap-2">
                {BODY_REGIONS_CONFIG.filter(r => selectedRegions.includes(r.id)).flatMap(r => r.sensations).map((sensation) => {
                  const isSelected = selectedSensations.includes(sensation);
                  return (
                    <button
                      key={sensation}
                      type="button"
                      onClick={() => toggleArrayItem(selectedSensations, setSelectedSensations, sensation)}
                      className={`min-h-[38px] text-xs px-3.5 py-1.5 rounded-full transition-all ${
                        isSelected
                          ? 'bg-[#3A5A40] text-[#FBF9F3] font-semibold shadow-2xs'
                          : 'bg-[#EDE9DF] text-[#35463A] border border-[#DEDCCF] hover:bg-[#E2E8D7]'
                      }`}
                    >
                      {sensation}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Stress Triggers, Energy & Sleep */}
          <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-5">
            <h3 className="font-serif font-bold text-[#3A5A40] text-lg tracking-[-0.01em]">
              3. Influences & Daily Factors
            </h3>

            <div>
              <p className="text-xs font-medium text-[#6C786B] mb-2.5">
                Any notable stressors or triggers present today?
              </p>
              <div className="flex flex-wrap gap-2">
                {TRIGGER_OPTIONS.map((trigger) => {
                  const isSelected = selectedTriggers.includes(trigger);
                  return (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => toggleArrayItem(selectedTriggers, setSelectedTriggers, trigger)}
                      className={`min-h-[38px] text-xs px-3.5 py-1.5 rounded-full transition-all ${
                        isSelected
                          ? 'bg-[#3A5A40] text-[#FBF9F3] font-semibold shadow-2xs'
                          : 'bg-[#EDE9DF] text-[#35463A] border border-[#DEDCCF] hover:bg-[#E2E8D7]'
                      }`}
                    >
                      {trigger}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#DEDCCF]">
              <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#DEDCCF]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#3A5A40] flex items-center space-x-1.5">
                    <Coffee className="w-4 h-4 text-[#588157]" />
                    <span>Energy Level</span>
                  </span>
                  <span className="text-xs font-bold text-[#3A5A40]">{energyLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#DEDCCF] rounded-lg cursor-pointer accent-[#588157]"
                  aria-label="Energy level from 1 to 5"
                />
              </div>

              <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#DEDCCF]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#3A5A40] flex items-center space-x-1.5">
                    <Moon className="w-4 h-4 text-[#588157]" />
                    <span>Rest / Sleep Quality</span>
                  </span>
                  <span className="text-xs font-bold text-[#3A5A40]">{sleepQuality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#DEDCCF] rounded-lg cursor-pointer accent-[#588157]"
                  aria-label="Sleep quality from 1 to 5"
                />
              </div>
            </div>
          </div>

          {/* 4. Daily Gratitude & Notes */}
          <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-4">
            <h3 className="font-serif font-bold text-[#3A5A40] text-lg flex items-center space-x-2 tracking-[-0.01em]">
              <Heart className="w-4 h-4 text-[#A75D43] fill-[#A75D43]" />
              <span>4. Daily Gratitude Spark</span>
            </h3>
            <p className="text-xs text-[#6C786B]">
              Even on tough days, naming one microscopic thing can anchor the mind (e.g. warm tea, a soft blanket, a text message).
            </p>
            <input
              type="text"
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="One thing that brought a glimmer of comfort today..."
              className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#DEDCCF] rounded-2xl text-sm text-[#35463A] placeholder-[#6C786B]/80 focus:outline-none focus:ring-2 focus:ring-[#588157]/20 focus:border-[#588157] transition min-h-[48px]"
              aria-label="Gratitude note"
            />

            <div className="pt-2">
              <label className="text-xs font-medium text-[#6C786B] block mb-1">
                Optional Clinical Notes / Private Reflections
              </label>
              <textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Any additional thoughts or somatic observations for your therapist / healthcare log..."
                rows={2}
                className="w-full px-4 py-2.5 bg-[#F4EFE6] border border-[#DEDCCF] rounded-2xl text-xs sm:text-sm text-[#35463A] placeholder-[#6C786B]/80 focus:outline-none focus:ring-2 focus:ring-[#588157]/20 focus:border-[#588157] transition"
                aria-label="Optional clinical notes"
              />
            </div>
          </div>

          {/* Submission Button (Mobile-First Stacked or Row) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-[#6C786B] text-center sm:text-left">
              <Shield className="w-4 h-4 text-[#588157] shrink-0" />
              <span>Encrypted with AES-256-GCM. Never shared without your export.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#E2E8D7]" />
              <span>{submitting ? 'Saving Check-In...' : 'Record My Check-In'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
