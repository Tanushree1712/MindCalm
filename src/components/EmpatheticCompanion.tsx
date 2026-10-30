import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Shield, AlertTriangle, RefreshCw, Wind, Compass, ArrowUpRight, CheckCheck } from 'lucide-react';
import { ChatMessage } from '../types';
import { CrisisSafetyBanner } from './CrisisSafetyBanner';
import { apiFetch } from '../utils/api';

interface EmpatheticCompanionProps {
  onNavigateToTools?: (tool: 'breathing' | 'grounding' | 'journal') => void;
  onOpenHelplineModal: () => void;
}

const QUICK_PROMPTS = [
  "I had a peaceful day today",
  "Help me breathe through anxiety",
  "I feel overwhelmed right now",
  "Celebrating a personal win with you",
  "My chest feels tense and tight",
  "What is somatic grounding?"
];

const renderAssistantText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
      : part
  );

export const EmpatheticCompanion: React.FC<EmpatheticCompanionProps> = ({
  onNavigateToTools,
  onOpenHelplineModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial history or set welcoming first message
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiFetch('/api/chat/history');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setMessages(json.data);
          const hasCrisisInHistory = json.data.some((m: ChatMessage) => m.isCrisis);
          if (hasCrisisInHistory) setCrisisAlert(true);
        } else {
          // Default welcoming sanctuary greeting
          setMessages([
            {
              id: 'init_welcome',
              sender: 'assistant',
              text: "Welcome to this quiet space. I am your Mental Bot. Whatever you are carrying today—whether celebrating a win, enjoying a peaceful moment, or navigating heavy stress—you are welcome here. How are you feeling right now?",
              timestamp: new Date().toISOString(),
              quickReplies: [
                "I had a peaceful day today",
                "I feel overwhelmed right now",
                "Celebrating a personal win",
                "My chest feels tense"
              ]
            }
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    };
    fetchHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'assistant',
          text: json.data.reply,
          timestamp: new Date().toISOString(),
          isCrisis: json.data.isCrisis,
          suggestedAction: json.data.suggestedAction,
          quickReplies: json.data.quickReplies
        };

        setMessages(prev => [...prev, assistantMsg]);
        if (json.data.isCrisis) {
          setCrisisAlert(true);
        }
      } else {
        throw new Error(json.error || 'Failed to receive response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: "I am taking a slow breath alongside you. Please take a moment to rest your feet on the floor and exhale. If you are experiencing an emotional emergency, remember help is free and confidential at 988.",
          timestamp: new Date().toISOString(),
          suggestedAction: 'breathing'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Would you like to clear this sanctuary conversation?')) return;
    try {
      await apiFetch('/api/chat/clear', { method: 'POST' });
      setMessages([
        {
          id: 'welcome_fresh',
          sender: 'assistant',
          text: "Fresh canvas. I am listening with an open heart. What is on your mind today?",
          timestamp: new Date().toISOString()
        }
      ]);
      setCrisisAlert(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      {/* Crisis Protocol Alert Banner if detected */}
      {crisisAlert && (
        <CrisisSafetyBanner
          onOpenFullDirectory={onOpenHelplineModal}
          onDismiss={() => setCrisisAlert(false)}
        />
      )}

      {/* Main Sanctuary Chat Window */}
      <div className="bg-[#FBF9F3] overflow-hidden flex flex-col flex-1 min-h-0 relative">
        {/* Companion Header */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#EDE9DF]/80 via-[#FBF9F3] to-[#E2E8D7]/60 border-b border-[#DEDCCF] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-[#588157] text-[#FBF9F3] flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6 text-[#F4EFE6]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#A3B18A] border-2 border-[#FBF9F3] rounded-full" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-[#3A5A40] text-lg sm:text-xl tracking-[-0.01em]">
                  Mental Bot
                </h2>
                <span className="text-[11px] font-semibold text-[#588157]">
                  · Empathetic AI
                </span>
              </div>
              <p className="text-xs text-[#6C786B] flex items-center space-x-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-[#588157]" />
                <span>Clinically Sensitive · Safe Space · AES-256 Encrypted</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="text-[#6C786B] hover:text-[#35463A] p-2.5 rounded-xl hover:bg-[#EDE9DF] transition text-xs flex items-center space-x-1 min-h-[40px] focus-visible:ring-2 focus-visible:ring-[#588157]"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-wallpaper flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-8 sm:py-5 space-y-4">
          <div className="w-fit mx-auto mb-2 px-3.5 py-1 rounded-full bg-white/85 border border-[#DEDCCF]/80 text-[11px] font-semibold text-[#6C786B] shadow-sm">Today</div>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 mb-5 shrink-0 rounded-full bg-[#588157] text-white flex items-center justify-center shadow-sm" aria-hidden="true">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] sm:max-w-[72%] rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#E5F2D8] text-[#26352B] rounded-br-md'
                      : m.isCrisis
                      ? 'bg-white text-[#35463A] border-2 border-[#A75D43]/70 rounded-bl-md'
                      : 'bg-white/95 text-[#26352B] border border-[#DEDCCF]/80 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap !text-inherit">{isUser ? m.text : renderAssistantText(m.text)}</p>

                  {/* Contextual Action Shortcut Buttons */}
                  {m.suggestedAction === 'breathing' && onNavigateToTools && (
                    <button
                      onClick={() => onNavigateToTools('breathing')}
                      className="mt-3 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] text-xs font-semibold shadow-xs transition min-h-[44px]"
                    >
                      <Wind className="w-4 h-4" />
                      <span>Launch 4-7-8 Breathing Reset</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {m.suggestedAction === 'grounding' && onNavigateToTools && (
                    <button
                      onClick={() => onNavigateToTools('grounding')}
                      className="mt-3 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#A3B18A] hover:bg-[#588157] text-[#35463A] hover:text-[#FBF9F3] text-xs font-semibold shadow-xs transition min-h-[44px]"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Start 5-4-3-2-1 Sensory Grounding</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {m.suggestedAction === 'journaling' && onNavigateToTools && (
                    <button
                      onClick={() => onNavigateToTools('journal')}
                      className="mt-3 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#EDE9DF] hover:bg-[#E2E8D7] text-[#3A5A40] border border-[#DEDCCF] text-xs font-semibold shadow-xs transition min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-[#588157]" />
                      <span>Open Sanctuary Reflective Journal</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {m.suggestedAction === 'helpline' && (
                    <button
                      onClick={onOpenHelplineModal}
                      className="mt-3 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#A75D43] hover:bg-[#8F4E37] text-[#FBF9F3] text-xs font-bold shadow-xs transition min-h-[44px]"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>View Emergency Crisis Directory (988)</span>
                    </button>
                  )}

                  {/* Dynamic Action & Reply Pills under Assistant Message */}
                  {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-[#DEDCCF]/80 flex flex-wrap gap-2">
                      {m.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (qr.toLowerCase().includes('breath') && onNavigateToTools) {
                              onNavigateToTools('breathing');
                            } else if ((qr.toLowerCase().includes('ground') || qr.toLowerCase().includes('muscle')) && onNavigateToTools) {
                              onNavigateToTools('grounding');
                            } else {
                              handleSendMessage(qr);
                            }
                          }}
                          className="text-xs px-3 py-1.5 rounded-full bg-[#FBF9F3] hover:bg-[#E2E8D7] text-[#35463A] hover:text-[#3A5A40] border border-[#DEDCCF] font-medium transition shadow-2xs min-h-[38px] flex items-center"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${isUser ? 'text-[#68815E]' : 'text-[#809087]'}`}>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5" aria-label="Sent" />}
                    {m.isCrisis && <span className="text-[#A75D43] font-semibold">· Safety support active</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3 text-[#35463A] text-xs py-2.5 px-4 bg-[#EDE9DF] rounded-2xl w-fit border border-[#DEDCCF] shadow-2xs">
              <div className="flex space-x-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-[#588157] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#588157] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#588157] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-medium text-[#3A5A40]">Mental Bot is responding...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="px-3 pt-3 pb-2 sm:px-5 sm:pt-4 bg-[#FBF9F3] border-t border-[#DEDCCF] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5 rounded-full border border-[#DEDCCF] bg-white pl-4 pr-1.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#588157]/20 focus-within:border-[#588157]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Share what is on your mind, unedited and safe..."
              className="flex-1 min-w-0 py-2.5 bg-transparent border-0 rounded-full text-sm text-[#35463A] placeholder-[#6C786B]/80 focus:outline-none focus:ring-0"
              disabled={loading}
              aria-label="Message to Mental Bot"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="min-h-[44px] min-w-[44px] p-2.5 bg-[#588157] hover:bg-[#3A5A40] active:bg-[#2C4430] disabled:bg-[#EDE9DF] disabled:text-[#6C786B] text-[#FBF9F3] rounded-full shadow-sm transition flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-[#588157]"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" aria-label="Suggested messages">
            <span className="text-[11px] text-[#6C786B] font-medium shrink-0">Try asking</span>
            {QUICK_PROMPTS.slice(0, 4).map((prompt, idx) => (
              <button key={idx} onClick={() => handleSendMessage(prompt)} className="text-[11px] shrink-0 px-3 py-1.5 rounded-full bg-[#F7F5EF] hover:bg-[#E2E8D7] text-[#35463A] border border-[#DEDCCF] transition min-h-[34px]">
                {prompt}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#6C786B] text-center mt-1.5">
            Mental Bot provides compassionate mindfulness grounding. If you are in crisis, please dial 988 or consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};
