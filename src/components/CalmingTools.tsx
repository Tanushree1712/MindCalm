import React, { useState, useEffect } from 'react';
import { Wind, Activity, Compass, Volume2, VolumeX, Play, Pause, RotateCcw, CheckCircle2, Clock, Sparkles, Sliders, ChevronRight } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface CalmingToolsProps {
  initialTool?: 'breathing' | 'bodyscan' | 'pmr' | 'grounding';
  onSessionComplete?: (sessionType: string, minutes: number) => void;
}

// Spoken audio cue helper using SpeechSynthesis (if supported) + chime
const speakAudioCue = (text: string, voiceEnabled = true) => {
  audioSynth.playSingingBowlChime(432);
  if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Calming, unhurried tempo
    utterance.pitch = 0.95; // Gentle, warm pitch
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};

export const CalmingTools: React.FC<CalmingToolsProps> = ({
  initialTool = 'breathing',
  onSessionComplete
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'bodyscan' | 'pmr' | 'grounding'>(initialTool);
  const [ambientSounds, setAmbientSounds] = useState<{ rain: boolean; ocean: boolean; bowl: boolean }>({
    rain: false,
    ocean: false,
    bowl: false
  });

  // Sync initialTool prop if it changes
  useEffect(() => {
    if (initialTool) setActiveTab(initialTool);
  }, [initialTool]);

  // Audio ambient toggles
  const handleToggleAmbient = (sound: 'rain' | 'ocean' | 'bowl') => {
    audioSynth.toggleSound(sound);
    setAmbientSounds(prev => ({ ...prev, [sound]: !prev[sound] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Tool Navigation */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#6C786B] font-medium mb-1">
              <span>Somatic Nervous System Reset</span>
              <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
              <span>Evidence-Based</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
              Guided Calming Sanctuary Tools
            </h2>
            <p className="text-[#35463A]/85 text-xs sm:text-sm mt-1 max-w-xl">
              Evidence-based somatic exercises and audio-guided sessions to down-regulate acute anxiety, relieve muscle tension, and anchor the senses.
            </p>
          </div>

          {/* Quick Ambient Sound Bar */}
          <div className="p-2 sm:p-2.5 bg-[#EDE9DF]/70 rounded-2xl border border-[#DEDCCF] flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
            <Volume2 className="w-4 h-4 text-[#6C786B] ml-1 mr-0.5" />
            <button
              onClick={() => handleToggleAmbient('rain')}
              className={`text-xs px-3 py-1.5 rounded-xl transition min-h-[36px] ${
                ambientSounds.rain ? 'bg-[#588157] text-[#FBF9F3] font-semibold' : 'bg-[#FBF9F3] text-[#35463A] hover:bg-[#E2E8D7]'
              }`}
            >
              Rain
            </button>
            <button
              onClick={() => handleToggleAmbient('ocean')}
              className={`text-xs px-3 py-1.5 rounded-xl transition min-h-[36px] ${
                ambientSounds.ocean ? 'bg-[#588157] text-[#FBF9F3] font-semibold' : 'bg-[#FBF9F3] text-[#35463A] hover:bg-[#E2E8D7]'
              }`}
            >
              Ocean
            </button>
            <button
              onClick={() => handleToggleAmbient('bowl')}
              className={`text-xs px-3 py-1.5 rounded-xl transition min-h-[36px] ${
                ambientSounds.bowl ? 'bg-[#588157] text-[#FBF9F3] font-semibold' : 'bg-[#FBF9F3] text-[#35463A] hover:bg-[#E2E8D7]'
              }`}
            >
              Singing Bowl
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Mobile-friendly grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#DEDCCF]">
          {[
            { id: 'breathing', label: '4-7-8 & Box Breath', icon: Wind },
            { id: 'bodyscan', label: 'Audio Body Scan', icon: Activity },
            { id: 'pmr', label: 'Muscle Relaxation', icon: Sliders },
            { id: 'grounding', label: '5-4-3-2-1 Sensory', icon: Compass },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`min-h-[50px] p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 focus-visible:ring-2 focus-visible:ring-[#588157] ${
                  isCurrent
                    ? 'border-[#588157] bg-[#E2E8D7] text-[#3A5A40] font-semibold shadow-2xs'
                    : 'border-[#DEDCCF] bg-[#F4EFE6]/60 hover:bg-[#EDE9DF] text-[#35463A]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#3A5A40]' : 'text-[#6C786B]'}`} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tool */}
      {activeTab === 'breathing' && (
        <BreathingTimerSection onComplete={(mins) => onSessionComplete?.('Breathing', mins)} />
      )}
      {activeTab === 'bodyscan' && (
        <AudioBodyScanSection onComplete={(mins) => onSessionComplete?.('Body Scan', mins)} />
      )}
      {activeTab === 'pmr' && (
        <ProgressiveMuscleRelaxationSection onComplete={(mins) => onSessionComplete?.('Muscle Relaxation', mins)} />
      )}
      {activeTab === 'grounding' && (
        <SensoryGroundingSection onComplete={(mins) => onSessionComplete?.('5-4-3-2-1 Grounding', mins)} />
      )}
    </div>
  );
};

/* =========================================================================
 * 1. Visual 4-7-8 & Box Breathing Component
 * ========================================================================= */
const BreathingTimerSection: React.FC<{ onComplete: (mins: number) => void }> = ({ onComplete }) => {
  const [pattern, setPattern] = useState<'478' | 'box'>('478');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev > 1) {
            return prev - 1;
          }

          // Transition to next phase
          audioSynth.playSingingBowlChime(432);

          if (pattern === '478') {
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 7;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 8;
            } else {
              setPhase('Inhale');
              setCycleCount(c => c + 1);
              return 4;
            }
          } else {
            // Box
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 4;
            } else if (phase === 'Exhale') {
              setPhase('Rest');
              return 4;
            } else {
              setPhase('Inhale');
              setCycleCount(c => c + 1);
              return 4;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, phase, pattern]);

  const handleStart = () => {
    setIsRunning(true);
    setPhase('Inhale');
    setCountdown(4);
    audioSynth.playSingingBowlChime(432);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    if (cycleCount >= 3) {
      onComplete(Math.max(1, Math.round((cycleCount * 19) / 60)));
    }
    setIsRunning(false);
    setPhase('Inhale');
    setCountdown(4);
    setCycleCount(0);
  };

  // Dynamic circle scale based on breathing phase
  const getCircleScaleClass = () => {
    if (!isRunning) return 'scale-100';
    if (phase === 'Inhale') return 'scale-125 transition-transform duration-4000 ease-out';
    if (phase === 'Hold') return 'scale-125';
    if (phase === 'Exhale') return 'scale-90 transition-transform duration-7000 ease-in';
    return 'scale-90';
  };

  return (
    <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-10 border border-[#DEDCCF] shadow-diffused-organic text-center space-y-8">
      {/* Pattern Selector */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 max-w-xl mx-auto">
        <button
          onClick={() => { setPattern('478'); handleReset(); }}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold transition ${
            pattern === '478'
              ? 'bg-[#588157] text-[#FBF9F3] shadow-xs'
              : 'bg-[#EDE9DF] text-[#35463A] hover:bg-[#E2E8D7]'
          }`}
        >
          4-7-8 Calming Breath (Inhale 4s · Hold 7s · Exhale 8s)
        </button>
        <button
          onClick={() => { setPattern('box'); handleReset(); }}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold transition ${
            pattern === 'box'
              ? 'bg-[#588157] text-[#FBF9F3] shadow-xs'
              : 'bg-[#EDE9DF] text-[#35463A] hover:bg-[#E2E8D7]'
          }`}
        >
          4-4-4-4 Box Breathing (Equal 4-Second Balance)
        </button>
      </div>

      {/* Visual Animated Breathing Sphere */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
        {/* Outer glowing pulsing halo */}
        <div className={`absolute inset-0 rounded-full bg-[#A3B18A]/20 blur-2xl transition-all duration-1000 ${
          isRunning ? 'opacity-100 scale-110' : 'opacity-40'
        }`} />

        {/* Concentric rings */}
        <div className="absolute inset-4 rounded-full border border-[#A3B18A]/30" />
        <div className="absolute inset-10 rounded-full border border-[#A3B18A]/40" />

        {/* The main breathing orb (Sage-to-forest gradient) */}
        <div
          className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-[#3A5A40] via-[#588157] to-[#A3B18A] flex flex-col items-center justify-center text-[#FBF9F3] shadow-diffused-organic transform ${getCircleScaleClass()}`}
        >
          <span className="text-xs uppercase tracking-widest font-semibold opacity-90">
            {isRunning ? phase : 'Ready'}
          </span>
          <span className="text-5xl sm:text-6xl font-bold font-serif my-1 tracking-[-0.01em]">
            {isRunning ? countdown : '4'}
          </span>
          <span className="text-xs opacity-85 px-4 text-center">
            {phase === 'Inhale' ? 'Breathe in peace' : phase === 'Hold' ? 'Hold softly' : phase === 'Exhale' ? 'Release tension' : 'Pause'}
          </span>
        </div>
      </div>

      {/* Stats and Controls */}
      <div className="space-y-4">
        <div className="text-xs text-[#6C786B]">
          Completed Cycles: <strong className="text-[#3A5A40] font-bold">{cycleCount}</strong>
          {cycleCount >= 4 && <span className="ml-2 text-[#588157] font-semibold">· Parasympathetic nervous system activated</span>}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{cycleCount > 0 ? 'Resume Breathing' : 'Begin Breathing Session'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#3A5A40] hover:bg-[#2C4430] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="min-h-[48px] min-w-[48px] p-3.5 rounded-2xl border border-[#DEDCCF] hover:bg-[#EDE9DF] text-[#6C786B] transition flex items-center justify-center"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
 * 2. Audio Body Scan Meditation (Adjustable Lengths: 3m, 5m, 10m, 15m)
 * ========================================================================= */
const BODY_SCAN_STEPS = [
  { region: 'Settling into Stillness', cue: 'Close your eyes gently. Feel the weight of your body supported by the ground underneath you. Take three deep, unhurried breaths.' },
  { region: 'Feet & Ankles', cue: 'Bring your awareness down to the soles of your feet, toes, and ankles. Notice temperature, contact with shoes or floor, and release any holding.' },
  { region: 'Lower Legs & Knees', cue: 'Allow awareness to flow up through your calves, shins, and knees. Invite heaviness and warmth to soften these muscles.' },
  { region: 'Thighs & Pelvis', cue: 'Notice where your thighs rest against your seat. Let your pelvis feel completely grounded, supported, and secure.' },
  { region: 'Belly & Digestive Center', cue: 'Softly place your attention on your stomach. Allow the belly to rise and fall naturally without holding it in or restricting breath.' },
  { region: 'Chest & Heart Rhythm', cue: 'Feel the gentle rhythm of your heartbeat and the expansion of your ribs. Acknowledge this tireless center of life with gratitude.' },
  { region: 'Shoulders, Arms & Hands', cue: 'Drop your shoulders down and back away from your ears. Feel tingling warmth down your biceps, wrists, and fingertips.' },
  { region: 'Throat, Jaw & Face', cue: 'Part your teeth slightly to unclench your jaw. Smooth the space between your eyebrows. Let your temples soften.' },
  { region: 'Whole Body Integration', cue: 'Sense your entire physical body as one unified, breathing whole. Grounded, relaxed, and present in this sanctuary.' }
];

const AudioBodyScanSection: React.FC<{ onComplete: (mins: number) => void }> = ({ onComplete }) => {
  const [sessionLength, setSessionLength] = useState<number>(5); // 3, 5, 10, 15 minutes
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(5 * 60);

  const stepDuration = Math.floor((sessionLength * 60) / BODY_SCAN_STEPS.length);

  useEffect(() => {
    setSecondsRemaining(sessionLength * 60);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [sessionLength]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            audioSynth.playSingingBowlChime(528);
            confetti({ particleCount: 50, spread: 60 });
            onComplete(sessionLength);
            return 0;
          }

          // Check step change
          const elapsed = sessionLength * 60 - (prev - 1);
          const newStep = Math.min(
            BODY_SCAN_STEPS.length - 1,
            Math.floor(elapsed / stepDuration)
          );
          if (newStep !== currentStepIndex) {
            setCurrentStepIndex(newStep);
            speakAudioCue(BODY_SCAN_STEPS[newStep].cue, voiceEnabled);
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, secondsRemaining, currentStepIndex, sessionLength, stepDuration, voiceEnabled, onComplete]);

  const handlePlayToggle = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      speakAudioCue(BODY_SCAN_STEPS[currentStepIndex].cue, voiceEnabled);
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeStep = BODY_SCAN_STEPS[currentStepIndex];

  return (
    <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-10 border border-[#DEDCCF] shadow-diffused-organic space-y-6">
      {/* Session Length Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDCCF]">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">
            Audio-Guided Body Scan
          </h3>
          <p className="text-xs text-[#6C786B]">Systematic somatic awareness to dissolve subconscious tension.</p>
        </div>

        {/* Adjustable Session Length Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#6C786B]">Duration:</span>
          {[3, 5, 10, 15].map(mins => (
            <button
              key={mins}
              onClick={() => setSessionLength(mins)}
              disabled={isPlaying}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                sessionLength === mins
                  ? 'bg-[#588157] text-[#FBF9F3] shadow-xs'
                  : 'bg-[#EDE9DF] text-[#35463A] hover:bg-[#E2E8D7] disabled:opacity-50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Main Guided Step Card */}
      <div className="bg-[#EDE9DF]/60 rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] text-center space-y-4">
        <div className="flex justify-between items-center text-xs text-[#6C786B]">
          <span className="font-semibold text-[#3A5A40]">
            Stage {currentStepIndex + 1} of {BODY_SCAN_STEPS.length}: {activeStep.region}
          </span>
          <span className="font-mono font-bold text-[#35463A]">{formatTime(secondsRemaining)} remaining</span>
        </div>

        {/* Body Region Focus Visual */}
        <div className="w-16 h-16 rounded-2xl bg-[#E2E8D7] border border-[#A3B18A] flex items-center justify-center mx-auto text-[#3A5A40] font-serif font-bold text-xl shadow-xs">
          {currentStepIndex + 1}
        </div>

        <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
          {activeStep.region}
        </h4>

        <p className="text-sm sm:text-base text-[#35463A] font-serif italic max-w-xl mx-auto leading-relaxed">
          "{activeStep.cue}"
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#DEDCCF] h-2.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-[#588157] h-full transition-all duration-1000"
            style={{ width: `${((sessionLength * 60 - secondsRemaining) / (sessionLength * 60)) * 100}%` }}
          />
        </div>
      </div>

      {/* Audio & Playback Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`min-h-[44px] flex items-center space-x-2 text-xs px-3.5 py-2 rounded-xl border transition ${
            voiceEnabled ? 'bg-[#E2E8D7] border-[#A3B18A] text-[#3A5A40] font-semibold' : 'bg-[#EDE9DF] border-[#DEDCCF] text-[#6C786B]'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-[#3A5A40]" /> : <VolumeX className="w-4 h-4 text-[#6C786B]" />}
          <span>{voiceEnabled ? 'Audio Voice Guidance On' : 'Chime Only (Mute Voice)'}</span>
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handlePlayToggle}
            className="flex-1 sm:flex-initial min-h-[48px] px-6 py-3 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{secondsRemaining < sessionLength * 60 ? 'Resume Body Scan' : `Start ${sessionLength}-Minute Scan`}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setSecondsRemaining(sessionLength * 60);
              setCurrentStepIndex(0);
            }}
            className="min-h-[48px] min-w-[48px] p-3 rounded-2xl border border-[#DEDCCF] text-[#6C786B] hover:bg-[#EDE9DF] flex items-center justify-center"
            title="Restart"
            aria-label="Restart Body Scan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
 * 3. Progressive Muscle Relaxation (PMR) (Adjustable: 3m, 5m, 10m, 15m)
 * ========================================================================= */
const PMR_STEPS = [
  {
    group: 'Preparation & Breath Grounding',
    instruction: 'Settle comfortably into your chair or bed. Let your arms rest loosely. Take a slow breath into your stomach, and exhale completely.',
    tenseDuration: 0,
    relaxDuration: 10
  },
  {
    group: 'Feet & Calves',
    instruction: 'Curl your toes tightly downward into your shoes or carpet, tensing the arches and calf muscles.',
    tenseDuration: 6,
    relaxDuration: 12
  },
  {
    group: 'Thighs & Glutes',
    instruction: 'Squeeze your upper thigh muscles together firmly, pressing your heels down to activate your hamstrings.',
    tenseDuration: 6,
    relaxDuration: 12
  },
  {
    group: 'Abdomen & Core',
    instruction: 'Tighten your stomach muscles firmly, drawing your navel in toward your spine as if preparing for a gentle bump.',
    tenseDuration: 6,
    relaxDuration: 12
  },
  {
    group: 'Hands & Forearms',
    instruction: 'Clench both hands into firm fists. Notice the gripping tension spreading up your forearms.',
    tenseDuration: 6,
    relaxDuration: 12
  },
  {
    group: 'Shoulders & Neck',
    instruction: 'Hunch your shoulders up toward your ears as high as they can go, compressing the trapezius muscles.',
    tenseDuration: 6,
    relaxDuration: 14
  },
  {
    group: 'Face, Forehead & Jaw',
    instruction: 'Scrunch up your entire face: clench teeth gently, close eyelids tightly, and furrow your brow.',
    tenseDuration: 6,
    relaxDuration: 14
  },
  {
    group: 'Complete Body Wave of Relaxation',
    instruction: 'Allow all muscles to melt completely slack. Feel a warm, soothing wave of heaviness and peace wash from head to toe.',
    tenseDuration: 0,
    relaxDuration: 20
  }
];

const ProgressiveMuscleRelaxationSection: React.FC<{ onComplete: (mins: number) => void }> = ({ onComplete }) => {
  const [sessionLength, setSessionLength] = useState<number>(5);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTensing, setIsTensing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsInPhase, setSecondsInPhase] = useState(6);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(5 * 60);

  const activeStep = PMR_STEPS[stepIndex];

  useEffect(() => {
    setTotalSecondsLeft(sessionLength * 60);
    setStepIndex(0);
    setIsTensing(false);
    setIsPlaying(false);
  }, [sessionLength]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && totalSecondsLeft > 0) {
      timer = setInterval(() => {
        setTotalSecondsLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            audioSynth.playSingingBowlChime(432);
            confetti({ particleCount: 50 });
            onComplete(sessionLength);
            return 0;
          }
          return prev - 1;
        });

        setSecondsInPhase(prev => {
          if (prev > 1) return prev - 1;

          // Transition between Tense and Relax
          if (isTensing) {
            // Tense finished -> Relax now!
            setIsTensing(false);
            audioSynth.playSingingBowlChime(528);
            speakAudioCue(`Release and soften completely. Feel the warmth replace the tension.`, true);
            return activeStep.relaxDuration;
          } else {
            // Relax finished -> Next step
            if (stepIndex < PMR_STEPS.length - 1) {
              const nextIndex = stepIndex + 1;
              setStepIndex(nextIndex);
              const nextStep = PMR_STEPS[nextIndex];
              if (nextStep.tenseDuration > 0) {
                setIsTensing(true);
                audioSynth.playSingingBowlChime(320);
                speakAudioCue(`Now focus on your ${nextStep.group}. ${nextStep.instruction}`, true);
                return nextStep.tenseDuration;
              } else {
                setIsTensing(false);
                speakAudioCue(nextStep.instruction, true);
                return nextStep.relaxDuration;
              }
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSecondsLeft, isTensing, stepIndex, activeStep, sessionLength, onComplete]);

  const handleStartPmr = () => {
    setIsPlaying(true);
    if (activeStep.tenseDuration > 0) {
      setIsTensing(true);
      setSecondsInPhase(activeStep.tenseDuration);
      speakAudioCue(`Tense your ${activeStep.group}. Hold tight.`, true);
    } else {
      setIsTensing(false);
      setSecondsInPhase(activeStep.relaxDuration);
      speakAudioCue(activeStep.instruction, true);
    }
  };

  return (
    <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-10 border border-[#DEDCCF] shadow-diffused-organic space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDCCF]">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">
            Progressive Muscle Relaxation (PMR)
          </h3>
          <p className="text-xs text-[#6C786B]">
            Clinical Jacobson method: contrast deliberate tension with deep, physical release.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#6C786B]">Duration:</span>
          {[3, 5, 10, 15].map(mins => (
            <button
              key={mins}
              onClick={() => setSessionLength(mins)}
              disabled={isPlaying}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                sessionLength === mins
                  ? 'bg-[#588157] text-[#FBF9F3] shadow-xs'
                  : 'bg-[#EDE9DF] text-[#35463A] hover:bg-[#E2E8D7] disabled:opacity-50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Main PMR Visual State */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border text-center transition-all duration-700 space-y-4 ${
          isTensing
            ? 'bg-[#EDE9DF] border-[#DEDCCF] ring-2 ring-[#A75D43]/40'
            : 'bg-[#E2E8D7]/80 border-[#A3B18A]/60 ring-2 ring-[#588157]/30'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className={isTensing ? 'text-[#A75D43]' : 'text-[#3A5A40]'}>
            Step {stepIndex + 1} of {PMR_STEPS.length}: {activeStep.group}
          </span>
          <span className={`px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold ${
            isTensing ? 'bg-[#EDE9DF] text-[#A75D43] border border-[#A75D43]/40' : 'bg-[#FBF9F3] text-[#3A5A40] border border-[#588157]/40'
          }`}>
            {isTensing ? 'TENSE & HOLD' : 'SOFTEN & RELEASE'}
          </span>
        </div>

        {/* Dynamic Countdown Dial */}
        <div className="w-24 h-24 rounded-full mx-auto flex flex-col items-center justify-center border-4 border-[#FBF9F3] shadow-xs bg-[#FBF9F3]">
          <span className="text-3xl font-bold font-serif text-[#3A5A40]">{secondsInPhase}s</span>
          <span className="text-[10px] uppercase font-semibold text-[#6C786B]">
            {isTensing ? 'Holding' : 'Melting'}
          </span>
        </div>

        <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
          {activeStep.group}
        </h4>

        <p className="text-sm text-[#35463A] font-serif italic max-w-lg mx-auto leading-relaxed">
          {isTensing ? activeStep.instruction : 'Let everything go limp. Notice the sensation of blood flow and soothing warmth.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
        {!isPlaying ? (
          <button
            onClick={handleStartPmr}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start {sessionLength}-Min PMR Session</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPlaying(false)}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#3A5A40] hover:bg-[#2C4430] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={() => {
            setIsPlaying(false);
            setStepIndex(0);
            setIsTensing(false);
          }}
          className="min-h-[48px] min-w-[48px] p-3.5 rounded-2xl border border-[#DEDCCF] hover:bg-[#EDE9DF] text-[#6C786B] flex items-center justify-center"
          title="Restart PMR"
          aria-label="Restart PMR"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
 * 4. 5-4-3-2-1 Sensory Grounding Technique
 * ========================================================================= */
const SensoryGroundingSection: React.FC<{ onComplete: (mins: number) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [itemsFound, setItemsFound] = useState<Record<number, string[]>>({
    5: [], 4: [], 3: [], 2: [], 1: []
  });
  const [currentInput, setCurrentInput] = useState('');

  const stepDetails: Record<number, { count: number; sense: string; prompt: string; example: string }> = {
    1: { count: 5, sense: 'SEE', prompt: '5 things you can see with your eyes right now', example: 'e.g. shadow on the wall, wooden desk grain, a plant, a coffee mug, my hand' },
    2: { count: 4, sense: 'TOUCH', prompt: '4 things you can physically feel against your body', example: 'e.g. cool air on skin, fabric of clothes, feet touching the floor, phone texture' },
    3: { count: 3, sense: 'HEAR', prompt: '3 distinct sounds you can notice in your surroundings', example: 'e.g. humming refrigerator, bird chirping outside, sound of your own breath' },
    4: { count: 2, sense: 'SMELL', prompt: '2 scents or aromas present in the room', example: 'e.g. fresh coffee, laundry detergent, book paper, or clean air' },
    5: { count: 1, sense: 'TASTE / AFFIRM', prompt: '1 taste in your mouth or one loving affirmation', example: 'e.g. lingering mint, fresh water, or: "I am safe and grounded in this moment."' }
  };

  const currentConfig = stepDetails[step];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;
    const required = currentConfig.count;
    const existing = itemsFound[required] || [];
    if (existing.length < required) {
      setItemsFound({
        ...itemsFound,
        [required]: [...existing, currentInput.trim()]
      });
      setCurrentInput('');
    }
  };

  const currentCount = (itemsFound[currentConfig.count] || []).length;
  const isStepComplete = currentCount >= currentConfig.count;

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
      audioSynth.playSingingBowlChime(432);
    } else {
      confetti({ particleCount: 60, spread: 70 });
      onComplete(3);
    }
  };

  return (
    <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-10 border border-[#DEDCCF] shadow-diffused-organic space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEDCCF]">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">
            5-4-3-2-1 Sensory Grounding
          </h3>
          <p className="text-xs text-[#6C786B]">Reconnect with the physical present to interrupt panic spirals.</p>
        </div>
        <div className="flex space-x-1.5 self-start sm:self-auto">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-[#588157] text-[#FBF9F3]' : step > s ? 'bg-[#3A5A40] text-[#FBF9F3]' : 'bg-[#EDE9DF] text-[#6C786B]'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#EDE9DF]/60 rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] space-y-4">
        <div className="text-xs font-semibold text-[#588157] tracking-wide">
          <span>Look for {currentConfig.count} Things You Can {currentConfig.sense}</span>
        </div>

        <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
          {currentConfig.prompt}
        </h4>
        <p className="text-xs text-[#6C786B] italic">{currentConfig.example}</p>

        {/* Form to type or tap found items */}
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={isStepComplete}
            placeholder={`Identify item #${currentCount + 1}...`}
            className="flex-1 px-4 py-2.5 bg-[#F4EFE6] border border-[#DEDCCF] rounded-xl text-xs sm:text-sm text-[#35463A] focus:outline-none focus:ring-2 focus:ring-[#588157]/20 min-h-[44px]"
            aria-label="Identified sensory item"
          />
          <button
            type="submit"
            disabled={!currentInput.trim() || isStepComplete}
            className="min-h-[44px] px-5 py-2.5 bg-[#588157] hover:bg-[#3A5A40] disabled:bg-[#EDE9DF] disabled:text-[#6C786B] text-[#FBF9F3] rounded-xl text-xs font-semibold transition"
          >
            Add ({currentCount}/{currentConfig.count})
          </button>
        </form>

        {/* Display Added Items */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(itemsFound[currentConfig.count] || []).map((item, i) => (
            <div key={i} className="px-3.5 py-1.5 rounded-xl bg-[#FBF9F3] border border-[#DEDCCF] text-[#35463A] text-xs font-medium flex items-center space-x-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#588157]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
        <span className="text-xs text-[#6C786B]">Step {step} of 5</span>
        <button
          onClick={handleNextStep}
          disabled={!isStepComplete}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] disabled:bg-[#EDE9DF] disabled:text-[#6C786B] text-[#FBF9F3] font-semibold text-xs sm:text-sm transition flex items-center justify-center space-x-2"
        >
          <span>{step === 5 ? 'Complete Grounding' : 'Next Sense Step'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
