import React, { useState } from 'react';
import { Award, Flame, Sparkles, CheckCircle2, Lock, Palette, Volume2, Shield, Star, Clock } from 'lucide-react';
import { Badge, SanctuaryTheme, UserGamificationState } from '../types';
import confetti from 'canvas-confetti';

interface SanctuaryRewardsProps {
  gamification: UserGamificationState;
  onUpdateGamification: (updated: UserGamificationState) => void;
  onThemeChanged: (themeId: string) => void;
  onUnlockSession?: (sessionTitle: string) => void;
}

const THEMES_CONFIG: SanctuaryTheme[] = [
  {
    id: 'theme-sage',
    name: 'Sage & Sand Sanctuary',
    tagline: 'Warm sand linen, botanical sage leaves, and grounded tranquility.',
    costPoints: 0,
    isUnlocked: true,
    primaryColor: '#588157',
    accentBg: '#E2E8D7',
    cardBg: '#FBF9F3',
    textColor: '#35463A'
  },
  {
    id: 'theme-lavender',
    name: 'Twilight Lavender',
    tagline: 'Evening twilight, gentle sleep transition, and quiet rest.',
    costPoints: 100,
    isUnlocked: false,
    primaryColor: '#6B705C',
    accentBg: '#EDE9F6',
    cardBg: '#FBF9F3',
    textColor: '#2D2A4A'
  },
  {
    id: 'theme-sand',
    name: 'Dawn Warm Sand',
    tagline: 'Sun-warmed dunes, terracotta earth, and morning stillness.',
    costPoints: 150,
    isUnlocked: false,
    primaryColor: '#A75D43',
    accentBg: '#F4EFE6',
    cardBg: '#FBF9F3',
    textColor: '#35463A'
  },
  {
    id: 'theme-celestial',
    name: 'Celestial Night Canopy',
    tagline: 'Deep forest dusk, midnight canopy, and deep quietude.',
    costPoints: 250,
    isUnlocked: false,
    primaryColor: '#A3B18A',
    accentBg: '#1C2620',
    cardBg: '#243329',
    textColor: '#EDE9DF'
  }
];

export const SanctuaryRewards: React.FC<SanctuaryRewardsProps> = ({
  gamification,
  onUpdateGamification,
  onThemeChanged,
  onUnlockSession
}) => {
  const [themes, setThemes] = useState<SanctuaryTheme[]>(() => {
    return THEMES_CONFIG.map(t => ({
      ...t,
      isUnlocked: gamification.unlockedThemes.includes(t.id) || t.costPoints === 0
    }));
  });

  const handleUnlockTheme = (theme: SanctuaryTheme) => {
    if (gamification.points < theme.costPoints) {
      alert(`You need ${theme.costPoints - gamification.points} more Zen Sparks to unlock ${theme.name}. Complete a daily check-in or breathing session to earn more!`);
      return;
    }

    const newPoints = gamification.points - theme.costPoints;
    const newUnlocked = [...gamification.unlockedThemes, theme.id];

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });

    const updated = {
      ...gamification,
      points: newPoints,
      unlockedThemes: newUnlocked,
      activeThemeId: theme.id
    };

    onUpdateGamification(updated);
    setThemes(prev => prev.map(t => t.id === theme.id ? { ...t, isUnlocked: true } : t));
    onThemeChanged(theme.id);
  };

  const handleApplyTheme = (themeId: string) => {
    const updated = {
      ...gamification,
      activeThemeId: themeId
    };
    onUpdateGamification(updated);
    onThemeChanged(themeId);
  };

  const unlockedCount = gamification.badges.filter(b => b.unlocked).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Gamification Dashboard Header */}
      <div className="bg-[#3A5A40] text-[#FBF9F3] rounded-3xl p-6 sm:p-8 shadow-diffused-organic relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#A3B18A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mindful Growth & Neural Resilience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-[-0.01em]">
            Sanctuary Milestones & Rewards
          </h2>
          <p className="text-[#E2E8D7]/85 text-xs sm:text-sm leading-relaxed">
            Every conscious breath, emotional check-in, and journal reflection strengthens somatic resilience. Collect Zen Sparks and unlock botanical sanctuary themes and restorative sessions.
          </p>
        </div>

        {/* Big Sparks and Streak Stats */}
        <div className="flex items-center gap-4 bg-[#2C4430]/60 backdrop-blur p-4 rounded-2xl border border-[#588157]/40 shrink-0">
          <div className="text-center px-2">
            <div className="flex items-center justify-center space-x-1 text-[#E2E8D7]">
              <Sparkles className="w-5 h-5 text-[#A3B18A]" />
              <span className="text-3xl font-bold font-serif">{gamification.points}</span>
            </div>
            <span className="text-[11px] text-[#A3B18A] uppercase tracking-wider font-semibold">Zen Sparks</span>
          </div>

          <div className="w-px h-10 bg-[#588157]/40" />

          <div className="text-center px-2">
            <div className="flex items-center justify-center space-x-1 text-[#F4EFE6]">
              <Flame className="w-5 h-5 fill-[#A75D43] text-[#A75D43]" />
              <span className="text-3xl font-bold font-serif">{gamification.streak}</span>
            </div>
            <span className="text-[11px] text-[#E2E8D7] uppercase tracking-wider font-semibold">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Point Earning Guide Bar */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] shadow-diffused-organic">
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#6C786B] mb-3">
          How to Earn Zen Sparks Daily:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#EDE9DF]/60 border border-[#DEDCCF] flex items-center space-x-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E2E8D7] text-[#3A5A40]">+25</span>
            <span className="text-xs text-[#35463A]">Daily Check-In</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EDE9DF]/60 border border-[#DEDCCF] flex items-center space-x-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E2E8D7] text-[#3A5A40]">+50</span>
            <span className="text-xs text-[#35463A]">Body Scan / PMR</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EDE9DF]/60 border border-[#DEDCCF] flex items-center space-x-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E2E8D7] text-[#3A5A40]">+40</span>
            <span className="text-xs text-[#35463A]">Journal Reflection</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EDE9DF]/60 border border-[#DEDCCF] flex items-center space-x-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EDE9DF] text-[#A75D43] border border-[#A75D43]/30">+15</span>
            <span className="text-xs text-[#35463A]">Gratitude Post</span>
          </div>
        </div>
      </div>

      {/* Badges System */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DEDCCF]">
          <div>
            <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">Resilience Badges</h3>
            <p className="text-xs text-[#6C786B]">Commemorate your dedication to your mental well-being.</p>
          </div>
          <div className="text-xs font-semibold text-[#3A5A40] bg-[#E2E8D7] px-3.5 py-1.5 rounded-full border border-[#DEDCCF] self-start sm:self-auto">
            {unlockedCount} of {gamification.badges.length} Unlocked
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {gamification.badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition flex flex-col justify-between space-y-3 ${
                  badge.unlocked
                    ? 'bg-[#E2E8D7]/50 border-[#A3B18A] shadow-2xs'
                    : 'bg-[#EDE9DF]/40 border-[#DEDCCF] opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                    badge.unlocked ? 'bg-[#588157] text-[#FBF9F3] shadow-xs' : 'bg-[#DEDCCF] text-[#6C786B]'
                  }`}>
                    {badge.unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-[#3A5A40] text-sm">{badge.title}</h4>
                  <p className="text-[11px] text-[#6C786B] leading-relaxed">{badge.description}</p>
                </div>

                <div className="pt-2 border-t border-[#DEDCCF]">
                  {badge.unlocked ? (
                    <span className="text-[11px] text-[#3A5A40] font-semibold flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#588157]" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#6C786B] font-medium">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unlockable Sanctuary Aesthetic Themes */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#DEDCCF]">
          <Palette className="w-5 h-5 text-[#588157]" />
          <div>
            <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">Aesthetic Sanctuary Themes</h3>
            <p className="text-xs text-[#6C786B]">Transform the color palette and atmosphere of your sanctuary.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((t) => {
            const isActive = gamification.activeThemeId === t.id;
            return (
              <div
                key={t.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'border-[#588157] ring-2 ring-[#588157]/20 bg-[#E2E8D7]/40 shadow-xs'
                    : 'border-[#DEDCCF] bg-[#EDE9DF]/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-[#3A5A40]">{t.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full border border-[#DEDCCF]" style={{ backgroundColor: t.primaryColor }} />
                    </div>
                  </div>
                  <p className="text-xs text-[#6C786B] leading-relaxed">{t.tagline}</p>
                </div>

                <div className="pt-3 border-t border-[#DEDCCF] flex items-center justify-between">
                  {t.isUnlocked ? (
                    isActive ? (
                      <span className="text-xs font-semibold text-[#3A5A40] flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-[#588157]" />
                        <span>Active Sanctuary Theme</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyTheme(t.id)}
                        className="min-h-[40px] px-4 py-2 rounded-xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] text-xs font-semibold transition"
                      >
                        Apply Theme
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleUnlockTheme(t)}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-[#3A5A40] hover:bg-[#2C4430] text-[#FBF9F3] text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#A3B18A]" />
                      <span>Unlock ({t.costPoints} Sparks)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
