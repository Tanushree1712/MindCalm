import React, { useState, useEffect } from 'react';
import { Navbar, SanctuaryTab } from './components/Navbar';
import { SanctuaryHome } from './components/SanctuaryHome';
import { MoodSomaticCheckIn } from './components/MoodSomaticCheckIn';
import { EmpatheticCompanion } from './components/EmpatheticCompanion';
import { CalmingTools } from './components/CalmingTools';
import { ReflectiveJournaling } from './components/ReflectiveJournaling';
import { TrendAnalyticsExport } from './components/TrendAnalyticsExport';
import { CommunityGratitudeFeed } from './components/CommunityGratitudeFeed';
import { SanctuaryRewards } from './components/SanctuaryRewards';
import { PrivacyModeOverlay } from './components/PrivacyModeOverlay';
import { EmergencyDirectoryModal } from './components/EmergencyDirectoryModal';
import { CrisisSafetyBanner } from './components/CrisisSafetyBanner';
import { UserGamificationState, Badge } from './types';
import { Shield, Heart, Sparkles, Wind, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-breath',
    title: 'First Conscious Breath',
    description: 'Completed your first guided breathing exercise.',
    iconName: 'wind',
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    category: 'practice'
  },
  {
    id: 'badge-somatic-healer',
    title: 'Somatic Pioneer',
    description: 'Completed a Body Scan or Progressive Muscle Relaxation session.',
    iconName: 'activity',
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    category: 'practice'
  },
  {
    id: 'badge-streak-3',
    title: 'Mindful Voyager',
    description: 'Maintained a 3-day conscious mindfulness streak.',
    iconName: 'flame',
    unlocked: true,
    category: 'streak'
  },
  {
    id: 'badge-week-stillness',
    title: 'Week of Stillness',
    description: 'Maintained a 7-day conscious mindfulness streak.',
    iconName: 'flame',
    unlocked: false,
    category: 'streak'
  },
  {
    id: 'badge-reflective-soul',
    title: 'Reflective Soul',
    description: 'Wrote 3 reflective journal entries with AI insights.',
    iconName: 'book',
    unlocked: false,
    category: 'reflection'
  },
  {
    id: 'badge-gratitude-spark',
    title: 'Light Giver',
    description: 'Shared an anonymous gratitude moment with the sanctuary community.',
    iconName: 'heart',
    unlocked: false,
    category: 'reflection'
  },
  {
    id: 'badge-deep-resonance',
    title: 'Deep Resonance',
    description: 'Logged 30+ mindful minutes in the sanctuary.',
    iconName: 'award',
    unlocked: false,
    category: 'practice'
  }
];

const INITIAL_GAMIFICATION: UserGamificationState = {
  points: 175,
  streak: 4,
  lastActiveDate: new Date().toISOString(),
  totalMindfulMinutes: 38,
  activeThemeId: 'theme-sage',
  unlockedThemes: ['theme-sage'],
  badges: INITIAL_BADGES
};

export default function App() {
  const [activeTab, setActiveTab] = useState<SanctuaryTab>(() => {
    try {
      const saved = localStorage.getItem('mindcalm_active_tab');
      if (saved && ['home', 'checkin', 'companion', 'tools', 'journal', 'trends', 'gratitude', 'rewards'].includes(saved)) {
        return saved as SanctuaryTab;
      }
    } catch {
      // ignore
    }
    return 'home';
  });

  useEffect(() => {
    try {
      localStorage.setItem('mindcalm_active_tab', activeTab);
    } catch {
      // ignore
    }
  }, [activeTab]);

  const [selectedCalmingTool, setSelectedCalmingTool] = useState<'breathing' | 'bodyscan' | 'pmr' | 'grounding'>('breathing');
  const [isPrivacyModeOpen, setIsPrivacyModeOpen] = useState(false);
  const [isHelplineModalOpen, setIsHelplineModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [gamification, setGamification] = useState<UserGamificationState>(() => {
    const saved = localStorage.getItem('mindcalm_gamification_v1');
    return saved ? JSON.parse(saved) : INITIAL_GAMIFICATION;
  });

  useEffect(() => {
    localStorage.setItem('mindcalm_gamification_v1', JSON.stringify(gamification));
  }, [gamification]);

  // Global keydown for Privacy Shield (Esc key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPrivacyModeOpen) {
        setIsPrivacyModeOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrivacyModeOpen]);

  const showRewardToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const addPoints = (amount: number, reason: string) => {
    setGamification(prev => {
      const updated = {
        ...prev,
        points: prev.points + amount
      };
      return updated;
    });
    showRewardToast(`+${amount} Zen Sparks: ${reason}`);
  };

  const unlockBadge = (badgeId: string) => {
    setGamification(prev => {
      const updatedBadges = prev.badges.map(b => {
        if (b.id === badgeId && !b.unlocked) {
          confetti({ particleCount: 70, spread: 80 });
          showRewardToast(`Badge Unlocked: ${b.title}!`);
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      });
      return { ...prev, badges: updatedBadges };
    });
  };

  const handleCheckInCompleted = () => {
    addPoints(25, 'Daily Check-In Recorded');
    setActiveTab('trends');
  };

  const handleSessionCompleted = (sessionType: string, minutes: number) => {
    addPoints(50, `Completed ${sessionType} (${minutes} mins)`);
    unlockBadge('badge-somatic-healer');
    setGamification(prev => ({
      ...prev,
      totalMindfulMinutes: prev.totalMindfulMinutes + minutes
    }));
  };

  const handleGratitudeShared = () => {
    addPoints(15, 'Shared Gratitude with Community');
    unlockBadge('badge-gratitude-spark');
  };

  const handleNavigateToTools = (tool: 'breathing' | 'grounding' | 'journal') => {
    if (tool === 'journal') {
      setActiveTab('journal');
    } else {
      setSelectedCalmingTool(tool as typeof selectedCalmingTool);
      setActiveTab('tools');
    }
  };

  // Determine theme styles
  const getThemeWrapperClass = () => {
    if (gamification.activeThemeId === 'theme-lavender') {
      return 'bg-[#EDE9F6] text-[#2D2A4A]';
    }
    if (gamification.activeThemeId === 'theme-sand') {
      return 'bg-[#F4EFE6] text-[#35463A]';
    }
    if (gamification.activeThemeId === 'theme-celestial') {
      return 'bg-[#1C2620] text-[#EDE9DF]';
    }
    return 'bg-[#F4EFE6] text-[#35463A]'; // Organic Sage & Sand default
  };

  return (
    <div className={`${activeTab === 'companion' ? 'h-dvh overflow-hidden' : 'min-h-screen'} flex flex-col font-sans transition-colors duration-500 ${getThemeWrapperClass()}`}>
      {/* Privacy Mode Weather Mask Overlay */}
      <PrivacyModeOverlay
        isOpen={isPrivacyModeOpen}
        onExit={() => setIsPrivacyModeOpen(false)}
      />

      {/* Emergency Directory Modal */}
      <EmergencyDirectoryModal
        isOpen={isHelplineModalOpen}
        onClose={() => setIsHelplineModalOpen(false)}
      />

      {/* Main Sanctuary Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenHelplineModal={() => setIsHelplineModalOpen(true)}
        streakCount={gamification.streak}
        zenPoints={gamification.points}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A5A40] text-[#FBF9F3] px-5 py-3 rounded-2xl shadow-diffused-organic border border-[#588157]/40 flex items-center space-x-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#A3B18A]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'companion' ? 'max-w-none min-h-0 px-0 py-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12'}`}>
        {activeTab === 'home' && (
          <SanctuaryHome
            onNavigateTab={(tab) => setActiveTab(tab)}
            onLaunchTool={(tool) => {
              setSelectedCalmingTool(tool);
              setActiveTab('tools');
            }}
            streakCount={gamification.streak}
            zenPoints={gamification.points}
            totalMindfulMinutes={gamification.totalMindfulMinutes}
            onOpenHelplineModal={() => setIsHelplineModalOpen(true)}
            onOpenPrivacyMode={() => setIsPrivacyModeOpen(true)}
          />
        )}

        {activeTab === 'checkin' && (
          <MoodSomaticCheckIn onCheckInCompleted={handleCheckInCompleted} />
        )}

        {activeTab === 'companion' && (
          <EmpatheticCompanion
            onNavigateToTools={handleNavigateToTools}
            onOpenHelplineModal={() => setIsHelplineModalOpen(true)}
          />
        )}

        {activeTab === 'tools' && (
          <CalmingTools
            initialTool={selectedCalmingTool}
            onSessionComplete={handleSessionCompleted}
          />
        )}

        {activeTab === 'journal' && (
          <ReflectiveJournaling
            onOpenBreathingTool={() => handleNavigateToTools('breathing')}
          />
        )}

        {activeTab === 'trends' && (
          <TrendAnalyticsExport
            onCheckInNow={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'gratitude' && (
          <CommunityGratitudeFeed
            onGratitudeShared={handleGratitudeShared}
          />
        )}

        {activeTab === 'rewards' && (
          <SanctuaryRewards
            gamification={gamification}
            onUpdateGamification={setGamification}
            onThemeChanged={(themeId) => setGamification(g => ({ ...g, activeThemeId: themeId }))}
          />
        )}
      </main>

      {/* Sanctuary Footer */}
      <footer className={`${activeTab === 'companion' ? 'hidden' : 'border-t border-[#DEDCCF] bg-[#FBF9F3]/90 py-8 px-4 sm:px-6 lg:px-8 mt-12'} text-xs text-[#6C786B]`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img
              src="/assets/aistudio/047383e7-5198-4375-b67f-85c9c47e4d01_aa351c77.png"
              alt="MindCalm Logo"
              className="w-7 h-7 rounded-lg object-cover shadow-2xs border border-[#DEDCCF]/80"
            />
            <span className="font-serif font-bold text-[#3A5A40] text-sm">MindCalm</span>
            <span>— A digital sanctuary for mindfulness & somatic grounding.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-center text-xs">
            <button
              onClick={() => setIsHelplineModalOpen(true)}
              className="text-[#A75D43] hover:text-[#3A5A40] underline font-medium transition"
            >
              Emergency Helplines (988)
            </button>
            <span aria-hidden="true" className="text-[#DEDCCF] hidden sm:inline">·</span>
            <span className="flex items-center space-x-1 text-[#3A5A40]">
              <Shield className="w-3.5 h-3.5 text-[#588157]" />
              <span>AES-256-GCM Encrypted MongoDB Store</span>
            </span>
            <span aria-hidden="true" className="text-[#DEDCCF] hidden sm:inline">·</span>
            <button
              onClick={() => setIsPrivacyModeOpen(true)}
              className="hover:text-[#35463A] underline transition"
            >
              Privacy Shield (Esc)
            </button>
          </div>
        </div>
        <p className="max-w-7xl mx-auto text-center md:text-left text-[11px] text-[#6C786B]/80 mt-3">
          MindCalm provides supportive mindfulness and reflective tools. It is not a clinical medical provider or substitute for professional psychiatric healthcare. If you are experiencing a crisis, please dial 988 or reach out to local emergency services immediately.
        </p>
      </footer>
    </div>
  );
}
