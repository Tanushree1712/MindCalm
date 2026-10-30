import React, { useState } from 'react';
import { Wind, Activity, Sparkles, BookOpen, TrendingUp, Heart, Shield, ArrowRight, Volume2, Flame, PhoneCall } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { SanctuaryTab } from './Navbar';

interface SanctuaryHomeProps {
  onNavigateTab: (tab: SanctuaryTab) => void;
  onLaunchTool: (tool: 'breathing' | 'bodyscan' | 'pmr' | 'grounding') => void;
  streakCount: number;
  zenPoints: number;
  totalMindfulMinutes: number;
  onOpenHelplineModal: () => void;
  onOpenPrivacyMode: () => void;
}

export const SanctuaryHome: React.FC<SanctuaryHomeProps> = ({
  onNavigateTab,
  onLaunchTool,
  streakCount,
  zenPoints,
  totalMindfulMinutes,
  onOpenHelplineModal,
  onOpenPrivacyMode
}) => {
  const [activeSound, setActiveSound] = useState<'rain' | 'ocean' | 'bowl' | null>(null);

  const toggleSound = (sound: 'rain' | 'ocean' | 'bowl') => {
    if (activeSound === sound) {
      audioSynth.stopAll();
      setActiveSound(null);
    } else {
      audioSynth.stopAll();
      if (sound === 'rain') audioSynth.startRain();
      else if (sound === 'ocean') audioSynth.startOcean();
      else if (sound === 'bowl') audioSynth.startSingingBowl();
      setActiveSound(sound);
    }
  };

  const handlePlayChime = () => {
    audioSynth.playSingingBowlChime(432);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* 1. Main Hero Section — Editorial Organic Minimalism */}
      <section className="relative overflow-hidden rounded-3xl bg-[#FBF9F3] border border-[#DEDCCF] p-8 sm:p-12 md:p-16 shadow-diffused-organic">
        {/* Understated atmospheric natural blur accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#E2E8D7]/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#EDE9DF]/70 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="flex items-center space-x-3.5">
            <img
              src="/assets/aistudio/047383e7-5198-4375-b67f-85c9c47e4d01_aa351c77.png"
              alt="MindCalm Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-2xs border border-[#DEDCCF]"
            />
            <div>
              <div className="flex items-center space-x-2 text-xs text-[#6C786B] font-medium tracking-wide">
                <span className="font-semibold text-[#3A5A40]">MindCalm Sanctuary</span>
                <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
                <span>Nervous System Care</span>
                <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
                <span>AES-256 Encrypted</span>
              </div>
              <p className="text-xs text-[#6C786B] mt-0.5">A quiet digital sanctuary for emotional grounding</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em] leading-[1.15] text-balance">
            Return to your center. A quiet sanctuary for your mind and body.
          </h1>

          <p className="text-[#35463A]/90 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Slow down, listen gently to where emotions live in your physical body, and restore equilibrium with clinically sensitive tools, reflective journaling, and empathetic presence.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('checkin')}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
            >
              <span>Begin Daily Check-In</span>
              <ArrowRight className="w-4 h-4 text-[#E2E8D7]" />
            </button>

            <button
              onClick={() => onLaunchTool('breathing')}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#E2E8D7] hover:bg-[#D4DEC5] text-[#3A5A40] border border-[#DEDCCF] font-semibold text-xs sm:text-sm transition flex items-center justify-center space-x-2"
            >
              <Wind className="w-4 h-4 text-[#588157]" />
              <span>4-7-8 Breathing Reset</span>
            </button>

            <button
              onClick={() => onNavigateTab('companion')}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#EDE9DF] hover:bg-[#E2E8D7] text-[#35463A] border border-[#DEDCCF] font-medium text-xs sm:text-sm transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#588157]" />
              <span>Talk with Mental Bot</span>
            </button>
          </div>
        </div>

        {/* Daily Intention Banner */}
        <div className="mt-10 pt-8 border-t border-[#DEDCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start space-x-3.5">
            <button
              onClick={handlePlayChime}
              className="w-10 h-10 rounded-2xl bg-[#E2E8D7] hover:bg-[#D4DEC5] text-[#3A5A40] flex items-center justify-center shrink-0 transition shadow-2xs"
              title="Ring crystal singing bowl chime"
            >
              <Volume2 className="w-4 h-4 text-[#3A5A40]" />
            </button>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6C786B]">
                Today's Grounding Intention
              </span>
              <p className="font-serif italic text-[#35463A] text-sm sm:text-base leading-relaxed">
                "You do not have to carry everything at once. Put down what does not belong to this minute, take one unhurried breath, and arrive here."
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center space-x-2">
            <span className="text-xs text-[#6C786B]">Ambient sound:</span>
            <button
              onClick={() => toggleSound('rain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeSound === 'rain'
                  ? 'bg-[#588157] text-[#FBF9F3] font-semibold'
                  : 'bg-[#EDE9DF] border border-[#DEDCCF] text-[#35463A] hover:bg-[#E2E8D7]'
              }`}
            >
              Rain
            </button>
            <button
              onClick={() => toggleSound('ocean')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeSound === 'ocean'
                  ? 'bg-[#588157] text-[#FBF9F3] font-semibold'
                  : 'bg-[#EDE9DF] border border-[#DEDCCF] text-[#35463A] hover:bg-[#E2E8D7]'
              }`}
            >
              Ocean
            </button>
            <button
              onClick={() => toggleSound('bowl')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeSound === 'bowl'
                  ? 'bg-[#588157] text-[#FBF9F3] font-semibold'
                  : 'bg-[#EDE9DF] border border-[#DEDCCF] text-[#35463A] hover:bg-[#E2E8D7]'
              }`}
            >
              Singing Bowl
            </button>
          </div>
        </div>
      </section>

      {/* 2. Personal Practice Snapshot Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('rewards')}
          className="bg-[#FBF9F3] p-5 rounded-3xl border border-[#DEDCCF] hover:border-[#A3B18A] transition cursor-pointer flex items-center space-x-4 shadow-2xs hover:shadow-diffused-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9DF] text-[#A75D43] flex items-center justify-center">
            <Flame className="w-6 h-6 fill-[#A75D43]" />
          </div>
          <div>
            <div className="text-xs text-[#6C786B] font-medium">Daily Streak</div>
            <div className="text-2xl font-bold font-serif text-[#3A5A40] mt-0.5">
              {streakCount} <span className="text-sm font-sans font-normal text-[#6C786B]">days active</span>
            </div>
            <span className="text-[11px] text-[#A75D43] font-medium">Showing up for your well-being</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('rewards')}
          className="bg-[#FBF9F3] p-5 rounded-3xl border border-[#DEDCCF] hover:border-[#A3B18A] transition cursor-pointer flex items-center space-x-4 shadow-2xs hover:shadow-diffused-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E2E8D7] text-[#588157] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6C786B] font-medium">Zen Sparks Balance</div>
            <div className="text-2xl font-bold font-serif text-[#3A5A40] mt-0.5">
              {zenPoints} <span className="text-sm font-sans font-normal text-[#6C786B]">points</span>
            </div>
            <span className="text-[11px] text-[#588157] font-medium">Unlock botanical sanctuary themes</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('tools')}
          className="bg-[#FBF9F3] p-5 rounded-3xl border border-[#DEDCCF] hover:border-[#A3B18A] transition cursor-pointer flex items-center space-x-4 shadow-2xs hover:shadow-diffused-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E2E8D7] text-[#3A5A40] flex items-center justify-center">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6C786B] font-medium">Total Mindful Time</div>
            <div className="text-2xl font-bold font-serif text-[#3A5A40] mt-0.5">
              {totalMindfulMinutes} <span className="text-sm font-sans font-normal text-[#6C786B]">minutes</span>
            </div>
            <span className="text-[11px] text-[#3A5A40] font-medium">Regulating the nervous system</span>
          </div>
        </div>
      </section>

      {/* 3. Sanctuary Pillars Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3A5A40]">
            Sanctuary Practices & Spaces
          </h2>
          <p className="text-xs text-[#6C786B] mt-0.5">
            Choose the mindful pathway that meets your current physical and emotional state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Pillar 1: Daily Mood & Somatic Check-In */}
          <div
            onClick={() => onNavigateTab('checkin')}
            className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] hover:border-[#A3B18A] hover:shadow-diffused-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E2E8D7] text-[#3A5A40] flex items-center justify-center group-hover:bg-[#588157] group-hover:text-[#FBF9F3] transition">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3A5A40] group-hover:text-[#2C4430]">
                Daily Mood & Somatic Check-In
              </h3>
              <p className="text-xs text-[#35463A]/80 leading-relaxed">
                Connect mind and body with an interactive somatic map. Log where tension lives (Head, Chest, Shoulders, Gut), track emotional resonance (1-10), and capture daily gratitude.
              </p>
            </div>
            <div className="pt-2 border-t border-[#DEDCCF] flex items-center justify-between text-xs font-semibold text-[#588157]">
              <span>Start Check-In</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 2: Empathetic AI Companion */}
          <div
            onClick={() => onNavigateTab('companion')}
            className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] hover:border-[#A3B18A] hover:shadow-diffused-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EDE9DF] text-[#588157] flex items-center justify-center group-hover:bg-[#588157] group-hover:text-[#FBF9F3] transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3A5A40] group-hover:text-[#2C4430]">
                Mental Bot (AI Companion)
              </h3>
              <p className="text-xs text-[#35463A]/80 leading-relaxed">
                A supportive, rapid, psychologically sensitive conversational interface. Fast responses without unsolicited lectures, and immediate crisis de-escalation protocols.
              </p>
            </div>
            <div className="pt-2 border-t border-[#DEDCCF] flex items-center justify-between text-xs font-semibold text-[#588157]">
              <span>Enter Safe Chat</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 3: Guided Calming Tools */}
          <div
            onClick={() => onNavigateTab('tools')}
            className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] hover:border-[#A3B18A] hover:shadow-diffused-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E2E8D7] text-[#3A5A40] flex items-center justify-center group-hover:bg-[#588157] group-hover:text-[#FBF9F3] transition">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3A5A40] group-hover:text-[#2C4430]">
                Guided Calming Tools
              </h3>
              <p className="text-xs text-[#35463A]/80 leading-relaxed">
                Visual 4-7-8 and box breathing timers, audio-guided body scan sessions, Jacobson progressive muscle relaxation (PMR), and the 5-4-3-2-1 sensory grounding journey.
              </p>
            </div>
            <div className="pt-2 border-t border-[#DEDCCF] flex items-center justify-between text-xs font-semibold text-[#588157]">
              <span>Explore Calming Tools</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 4: Reflective AI Journaling */}
          <div
            onClick={() => onNavigateTab('journal')}
            className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] hover:border-[#A3B18A] hover:shadow-diffused-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EDE9DF] text-[#3A5A40] flex items-center justify-center group-hover:bg-[#3A5A40] group-hover:text-[#FBF9F3] transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3A5A40] group-hover:text-[#2C4430]">
                Reflective AI Journaling
              </h3>
              <p className="text-xs text-[#35463A]/80 leading-relaxed">
                Guided somatic writing prompts with automated empathetic reflections and 3 microscopic positive action takeaways you can complete in under 15 minutes.
              </p>
            </div>
            <div className="pt-2 border-t border-[#DEDCCF] flex items-center justify-between text-xs font-semibold text-[#588157]">
              <span>Open Journal</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 5: 7-Day Trends & Clinical CSV Export */}
          <div
            onClick={() => onNavigateTab('trends')}
            className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] hover:border-[#A3B18A] hover:shadow-diffused-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E2E8D7] text-[#3A5A40] flex items-center justify-center group-hover:bg-[#588157] group-hover:text-[#FBF9F3] transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3A5A40] group-hover:text-[#2C4430]">
                7-Day Trends & Clinical Export
              </h3>
              <p className="text-xs text-[#35463A]/80 leading-relaxed">
                Interactive SVG emotional trajectory analytics, somatic tension hotspot distribution, and 1-click formatted CSV download for sharing with healthcare professionals.
              </p>
            </div>
            <div className="pt-2 border-t border-[#DEDCCF] flex items-center justify-between text-xs font-semibold text-[#588157]">
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 6: Community Gratitude Wall */}
          <div
            onClick={() => onNavigateTab('gratitude')}
            className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] hover:border-[#A3B18A] hover:shadow-diffused-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EDE9DF] text-[#A75D43] flex items-center justify-center group-hover:bg-[#A75D43] group-hover:text-[#FBF9F3] transition">
                <Heart className="w-5 h-5 fill-[#A75D43] group-hover:fill-white" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3A5A40] group-hover:text-[#2C4430]">
                Community Gratitude Wall
              </h3>
              <p className="text-xs text-[#35463A]/80 leading-relaxed">
                An anonymous sanctuary where visitors from around the world post moments of appreciation, browse by themes, and send supportive heart reactions.
              </p>
            </div>
            <div className="pt-2 border-t border-[#DEDCCF] flex items-center justify-between text-xs font-semibold text-[#A75D43]">
              <span>Share Gratitude</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Safety & Privacy Card in Warm Forest Green */}
      <section className="rounded-3xl bg-[#3A5A40] text-[#FBF9F3] p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-diffused-organic">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#A3B18A]">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>24/7 Immediate Mental Health Support</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-[#FBF9F3]">
            Free, Confidential Crisis Helplines
          </h3>
          <p className="text-xs text-[#E2E8D7]/80 leading-relaxed">
            If you or someone you know is in acute distress, call or text <strong>988</strong> (USA & Canada), text HOME to <strong>741741</strong>, or browse international crisis centers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenHelplineModal}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#A75D43] hover:bg-[#8F4E37] text-[#FBF9F3] text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-2xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Open Helpline Directory (988)</span>
          </button>

          <button
            onClick={onOpenPrivacyMode}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2C4430] hover:bg-[#1E2E21] text-[#E2E8D7] text-xs font-medium border border-[#588157]/40 transition flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4 text-[#A3B18A]" />
            <span>Privacy Mask (Esc)</span>
          </button>
        </div>
      </section>
    </div>
  );
};
