import React, { useState } from 'react';
import { Sparkles, Heart, Activity, Wind, BookOpen, TrendingUp, Flame, PhoneCall, Award, Menu, X, Home, ChevronRight } from 'lucide-react';

export type SanctuaryTab = 
  | 'home'
  | 'checkin'
  | 'companion'
  | 'tools'
  | 'journal'
  | 'trends'
  | 'gratitude'
  | 'rewards';

interface NavbarProps {
  activeTab: SanctuaryTab;
  onTabChange: (tab: SanctuaryTab) => void;
  onOpenHelplineModal: () => void;
  streakCount: number;
  zenPoints: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenHelplineModal,
  streakCount,
  zenPoints
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems: Array<{
    id: SanctuaryTab;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Sanctuary Home', shortLabel: 'Home', description: 'Arrival hero, daily intention & overview', icon: Home },
    { id: 'checkin', label: 'Daily Mood Check-In', shortLabel: 'Check-In', description: 'Somatic body map, triggers & gratitude', icon: Activity },
    { id: 'companion', label: 'Mental Bot', shortLabel: 'Mental Bot', description: 'Empathetic companion with crisis detection', icon: Sparkles },
    { id: 'tools', label: 'Guided Calming Tools', shortLabel: 'Calming Tools', description: '4-7-8 Breathing, Audio Body Scan & PMR', icon: Wind },
    { id: 'journal', label: 'Reflective Journal', shortLabel: 'Journal', description: 'Guided prompts & 15-min micro-actions', icon: BookOpen },
    { id: 'trends', label: '7-Day Trends', shortLabel: 'Trends & Export', description: 'Somatic patterns & clinical CSV export', icon: TrendingUp },
    { id: 'gratitude', label: 'Gratitude Wall', shortLabel: 'Gratitude', description: 'Anonymous reflections & heart reactions', icon: Heart },
    { id: 'rewards', label: 'Rewards & Themes', shortLabel: 'Rewards', description: 'Zen sparks, daily streaks & themes', icon: Award },
  ];

  const handleSelectTab = (tab: SanctuaryTab) => {
    onTabChange(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Shared header with drawer navigation on every screen size */}
      <header className="sticky top-0 z-40 bg-[#FBF9F3]/95 backdrop-blur-md border-b border-[#DEDCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Left: Mobile Drawer Trigger + Brand Wordmark */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-[#3A5A40] bg-[#E2E8D7] hover:bg-[#D4DEC5] active:bg-[#C9D4B9] transition text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#588157] focus-visible:outline-none"
                aria-label="Open sanctuary navigation menu"
                aria-expanded={drawerOpen}
              >
                <Menu className="w-5 h-5 text-[#3A5A40]" />
                <span className="hidden sm:inline font-sans">Menu</span>
              </button>

              <div
                className="flex items-center space-x-2.5 cursor-pointer select-none group"
                onClick={() => handleSelectTab('home')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectTab('home'); }}
                aria-label="Return to MindCalm sanctuary home"
              >
                <img
                  src="/assets/aistudio/047383e7-5198-4375-b67f-85c9c47e4d01_aa351c77.png"
                  alt="MindCalm Logo"
                  className="w-10 h-10 rounded-2xl object-cover shadow-2xs border border-[#DEDCCF]/80 group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="font-serif font-bold text-xl sm:text-2xl text-[#3A5A40] tracking-[-0.01em] block">
                    MindCalm
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Streak Badge and 988 Helpline */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Streak & Points (Pill for tablet/desktop) */}
              <div
                onClick={() => handleSelectTab('rewards')}
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EDE9DF] border border-[#DEDCCF] text-xs font-semibold cursor-pointer hover:bg-[#E2E8D7] transition text-[#35463A] min-h-[40px]"
                title="View your Zen Sparks & Badges"
                role="button"
                tabIndex={0}
              >
                <span className="flex items-center text-[#A75D43] font-bold">
                  <Flame className="w-3.5 h-3.5 fill-[#A75D43] mr-0.5" />
                  {streakCount}
                </span>
                <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
                <span className="flex items-center text-[#588157] font-bold">
                  <Sparkles className="w-3.5 h-3.5 mr-0.5" />
                  {zenPoints}
                </span>
              </div>

              {/* Emergency Hotline Button */}
              <button
                onClick={onOpenHelplineModal}
                className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-[#FBF9F3] hover:bg-[#EDE9DF] text-[#A75D43] border border-[#DEDCCF] text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#A75D43] focus-visible:outline-none"
                title="Emergency Crisis Helpline Directory (988)"
                aria-label="Emergency Crisis Helplines 988"
              >
                <PhoneCall className="w-4 h-4 text-[#A75D43]" />
                <span className="hidden sm:inline">988 Help</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer (Full-height, Touch-friendly 48px targets) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Sanctuary Navigation Menu">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#35463A]/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-[#FBF9F3] h-full shadow-diffused-organic flex flex-col z-10 border-r border-[#DEDCCF] animate-slideIn">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#EDE9DF]/70 border-b border-[#DEDCCF] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/assets/aistudio/047383e7-5198-4375-b67f-85c9c47e4d01_aa351c77.png"
                  alt="MindCalm Logo"
                  className="w-11 h-11 rounded-2xl object-cover shadow-2xs border border-[#DEDCCF]/80"
                />
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">MindCalm</h2>
                  <p className="text-xs text-[#6C786B]">Digital Sanctuary Menu</p>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6C786B] hover:text-[#35463A] rounded-xl hover:bg-[#DEDCCF]/50 transition focus-visible:ring-2 focus-visible:ring-[#588157]"
                aria-label="Close menu drawer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Streak & Rewards Card in Drawer */}
            <div className="px-5 sm:px-6 py-3.5 bg-[#F4EFE6] border-b border-[#DEDCCF] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-[#A75D43] fill-[#A75D43]" />
                <span className="text-xs font-semibold text-[#35463A]">{streakCount} Day Streak</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#588157]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{zenPoints} Zen Sparks</span>
              </div>
            </div>

            {/* Navigation Items (Touch-Friendly List) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full min-h-[48px] p-3.5 rounded-2xl text-left transition flex items-center justify-between group active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#588157] focus-visible:outline-none ${
                      isActive
                        ? 'bg-[#E2E8D7] border border-[#A3B18A]/70 text-[#3A5A40] font-semibold shadow-2xs'
                        : 'hover:bg-[#EDE9DF] text-[#35463A] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                        isActive ? 'bg-[#588157] text-[#FBF9F3]' : 'bg-[#EDE9DF] text-[#588157] group-hover:bg-[#E2E8D7]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold block truncate text-[#35463A]">{item.label}</span>
                        <span className="text-xs text-[#6C786B] block truncate">{item.description}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-[#3A5A40]' : 'text-[#6C786B]/50 group-hover:text-[#6C786B]'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-[#EDE9DF]/60 border-t border-[#DEDCCF] space-y-2.5">
              <button
                onClick={() => { setDrawerOpen(false); onOpenHelplineModal(); }}
                className="w-full min-h-[46px] py-2.5 px-3 rounded-xl bg-[#FBF9F3] hover:bg-[#EDE9DF] active:bg-[#E2E8D7] text-[#A75D43] border border-[#DEDCCF] text-xs font-semibold flex items-center justify-center space-x-2 transition"
              >
                <PhoneCall className="w-4 h-4 text-[#A75D43]" />
                <span>Emergency Crisis Helplines (988)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
