import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Heart, CheckCircle2, RefreshCw, Feather, Shield, ListChecks, Calendar, ArrowRight } from 'lucide-react';
import { JournalEntry } from '../types';

interface ReflectiveJournalingProps {
  onOpenBreathingTool?: () => void;
}

const GUIDED_PROMPTS = [
  {
    title: 'Unpacking the knot in my chest',
    prompt: 'What physical sensation is present in your body right now, and what does it need to feel safe and heard?'
  },
  {
    title: 'What would kindness to myself look like right now?',
    prompt: 'If a close, cherished friend were carrying the exact weight you carry today, what words of grace would you offer them?'
  },
  {
    title: 'Releasing what I cannot control',
    prompt: 'What thoughts or outcomes are consuming your mental energy that are outside of your immediate control? Write them down and consciously exhale them.'
  },
  {
    title: 'Finding stillness in the storm',
    prompt: 'Name three small, ordinary things that are working well or bringing you stability in this exact moment.'
  },
  {
    title: 'Free-flow brain dump',
    prompt: 'No filters, no formatting, no judgment. Pour out whatever thoughts are circling in your mind onto this private sanctuary page.'
  }
];

export const ReflectiveJournaling: React.FC<ReflectiveJournalingProps> = ({ onOpenBreathingTool }) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [entryText, setEntryText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [currentReflection, setCurrentReflection] = useState<{
    empatheticReflection: string;
    positiveActionTakeaways: string[];
    sentimentLabel: string;
  } | null>(null);

  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/journals');
      const json = await res.json();
      if (json.success && json.data) {
        setSavedEntries(json.data);
      }
    } catch (e) {
      console.warn('Could not fetch journals:', e);
    }
  };

  const handlePromptSelect = (idx: number) => {
    setSelectedPromptIndex(idx);
    setCustomTitle(GUIDED_PROMPTS[idx].title);
  };

  const activePrompt = GUIDED_PROMPTS[selectedPromptIndex];

  const handleGenerateReflection = async () => {
    if (!entryText.trim() || loadingReflection) return;
    setLoadingReflection(true);
    setCurrentReflection(null);

    try {
      const res = await fetch('/api/journals/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle || activePrompt.title,
          prompt: activePrompt.prompt,
          content: entryText.trim()
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCurrentReflection(json.data);

        // Also save to database
        await fetch('/api/journals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: customTitle || activePrompt.title,
            prompt: activePrompt.prompt,
            content: entryText.trim(),
            empatheticReflection: json.data.empatheticReflection,
            positiveActionTakeaways: json.data.positiveActionTakeaways,
            sentimentLabel: json.data.sentimentLabel
          })
        });

        setSaveSuccess(true);
        fetchEntries();
      }
    } catch (err) {
      console.error('Reflection error:', err);
    } finally {
      setLoadingReflection(false);
    }
  };

  const wordCount = entryText.trim() ? entryText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#6C786B] font-medium mb-1">
            <span>Reflective AI Journaling</span>
            <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
            <span>AES-256 Encrypted</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
            Guided Reflections & Actionable Clarity
          </h2>
          <p className="text-[#35463A]/85 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Unpack your inner thoughts in a completely safe, private sanctuary. When you are ready, receive an empathetic reflection and 3 microscopic positive action steps in under 15 minutes.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="self-start md:self-center min-h-[44px] px-4 py-2.5 rounded-xl border border-[#DEDCCF] bg-[#EDE9DF] hover:bg-[#E2E8D7] text-[#3A5A40] text-xs font-semibold flex items-center space-x-2 transition"
        >
          <BookOpen className="w-4 h-4 text-[#588157]" />
          <span>{showHistory ? 'Back to Editor' : `Journal Archive (${savedEntries.length})`}</span>
        </button>
      </div>

      {showHistory ? (
        /* Journal History Archive */
        <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DEDCCF]">
            <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">
              Past Sanctuary Entries
            </h3>
            <span className="text-xs text-[#6C786B]">Encrypted with AES-256 at rest</span>
          </div>

          {savedEntries.length === 0 ? (
            <p className="text-[#6C786B] text-sm text-center py-12">No past journal entries yet. Write your first entry today!</p>
          ) : (
            <div className="space-y-4">
              {savedEntries.map((item) => (
                <div key={item._id} className="p-5 rounded-2xl border border-[#DEDCCF] bg-[#EDE9DF]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#3A5A40] text-base">{item.title}</span>
                    <span className="text-xs text-[#6C786B] font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#6C786B] italic border-l-2 border-[#588157] pl-3">
                    Prompt: {item.prompt}
                  </p>

                  <p className="text-sm text-[#35463A] leading-relaxed whitespace-pre-wrap">{item.content}</p>

                  {item.empatheticReflection && (
                    <div className="bg-[#E2E8D7]/80 border border-[#A3B18A] rounded-2xl p-4 mt-3 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#3A5A40]">
                        <Sparkles className="w-4 h-4 text-[#588157]" />
                        <span>Empathetic AI Reflection</span>
                        {item.sentimentLabel && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-[#EDE9DF] text-[#3A5A40] font-semibold text-[10px] border border-[#DEDCCF]">
                            {item.sentimentLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#35463A] leading-relaxed font-serif italic">"{item.empatheticReflection}"</p>

                      {item.positiveActionTakeaways && item.positiveActionTakeaways.length > 0 && (
                        <div className="pt-2 border-t border-[#A3B18A]/50">
                          <span className="text-[11px] font-semibold text-[#3A5A40] block mb-1">
                            Recommended Micro-Actions:
                          </span>
                          <ul className="text-xs text-[#35463A] space-y-1 list-disc list-inside">
                            {item.positiveActionTakeaways.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Journal Editor */
        <div className="space-y-6">
          {/* Guided Prompt Selection Pills */}
          <div className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] shadow-diffused-organic space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6C786B] block">
              Select a Guided Inward Inquiry
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {GUIDED_PROMPTS.map((p, idx) => {
                const isSelected = selectedPromptIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptSelect(idx)}
                    className={`min-h-[70px] p-3.5 rounded-2xl text-left border text-xs transition flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-[#588157] bg-[#E2E8D7] text-[#3A5A40] font-semibold shadow-xs ring-1 ring-[#588157]/40'
                        : 'border-[#DEDCCF] bg-[#EDE9DF]/60 hover:bg-[#E2E8D7] text-[#35463A]'
                    }`}
                  >
                    <span className="font-semibold text-xs text-[#3A5A40]">{p.title}</span>
                    <span className="text-[11px] text-[#6C786B] line-clamp-2">{p.prompt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Writing Surface */}
          <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-4">
            <div className="border-b border-[#DEDCCF] pb-4 space-y-1">
              <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">
                {activePrompt.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6C786B] italic">
                "{activePrompt.prompt}"
              </p>
            </div>

            <textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Begin typing freely. Let thoughts flow without editing or self-criticism..."
              rows={8}
              className="w-full p-4 bg-[#F4EFE6] border border-[#DEDCCF] rounded-2xl text-sm leading-relaxed text-[#35463A] focus:outline-none focus:ring-2 focus:ring-[#588157]/20 focus:border-[#588157] transition"
              aria-label="Reflective journal thoughts"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-3 text-xs text-[#6C786B]">
                <span>{wordCount} words written</span>
                <span>·</span>
                <span className="flex items-center space-x-1 text-[#588157]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>AES-256 Encrypted</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerateReflection}
                disabled={!entryText.trim() || loadingReflection}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] disabled:bg-[#EDE9DF] disabled:text-[#6C786B] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center justify-center space-x-2"
              >
                {loadingReflection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#E2E8D7]" />
                    <span>Mental Bot is reflecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E2E8D7]" />
                    <span>Generate Empathetic Reflection & Takeaways</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Empathetic Reflection & Micro-Actions Display */}
          {currentReflection && (
            <div className="bg-[#EDE9DF]/80 rounded-3xl p-6 sm:p-8 border border-[#A3B18A] shadow-diffused-organic space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#588157] text-[#FBF9F3] flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-[#F4EFE6]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#3A5A40] text-lg tracking-[-0.01em]">
                      Empathetic Reflection
                    </h4>
                    <span className="text-xs text-[#6C786B]">
                      Emotional Tone: {currentReflection.sentimentLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-[#3A5A40] font-semibold bg-[#E2E8D7] px-3 py-1.5 rounded-full border border-[#DEDCCF] self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#588157]" />
                  <span>Saved to Archive</span>
                </div>
              </div>

              {/* Compassionate Validation */}
              <div className="bg-[#FBF9F3] rounded-2xl p-5 border border-[#DEDCCF] shadow-2xs">
                <p className="text-sm sm:text-base font-serif italic text-[#35463A] leading-relaxed">
                  "{currentReflection.empatheticReflection}"
                </p>
              </div>

              {/* 3 Micro-Action Takeaways */}
              <div className="space-y-2.5">
                <h5 className="text-xs uppercase font-bold tracking-wider text-[#3A5A40] flex items-center space-x-1.5">
                  <ListChecks className="w-4 h-4 text-[#588157]" />
                  <span>Microscopic Action Takeaways (Next 15 Minutes):</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentReflection.positiveActionTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FBF9F3] p-4 rounded-2xl border border-[#DEDCCF] shadow-2xs flex items-start space-x-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#588157] text-[#FBF9F3] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#35463A] leading-relaxed">{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick option to transition to breathing */}
              {onOpenBreathingTool && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onOpenBreathingTool}
                    className="text-xs text-[#3A5A40] hover:text-[#588157] font-semibold flex items-center space-x-1 transition"
                  >
                    <span>Anchor with a 2-minute breathing cycle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
