import React, { useState, useEffect } from 'react';
import { Heart, Plus, Sparkles, Filter, Shield, Smile, RefreshCw, MessageSquare } from 'lucide-react';
import { GratitudePost } from '../types';
import confetti from 'canvas-confetti';

interface CommunityGratitudeFeedProps {
  onGratitudeShared?: () => void;
}

const CATEGORIES = [
  'All',
  'Nature & Senses',
  'Human Kindness',
  'Small Victories',
  'Healing & Rest',
  'Overcoming Obstacles'
];

export const CommunityGratitudeFeed: React.FC<CommunityGratitudeFeedProps> = ({ onGratitudeShared }) => {
  const [posts, setPosts] = useState<GratitudePost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<GratitudePost['category']>('Nature & Senses');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reactedIds, setReactedIds] = useState<Set<string>>(new Set());

  const fetchPosts = async (cat?: string) => {
    try {
      const url = cat && cat !== 'All' ? `/api/gratitude?category=${encodeURIComponent(cat)}` : '/api/gratitude';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(json.data);
      }
    } catch (e) {
      console.warn('Could not fetch gratitude feed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeCategory);
  }, [activeCategory]);

  const handleHeart = async (id: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 15,
      spread: 40,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#A75D43', '#588157', '#A3B18A', '#F4EFE6']
    });

    setReactedIds(prev => new Set(prev).add(id));
    setPosts(prev => prev.map(p => p._id === id ? { ...p, hearts: p.hearts + 1 } : p));

    try {
      await fetch(`/api/gratitude/${id}/heart`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || submitting) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/gratitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory, text: newText.trim() })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(prev => [json.data, ...prev]);
        setNewText('');
        setShowShareModal(false);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
        if (onGratitudeShared) onGratitudeShared();
      } else {
        setErrorMessage(json.error || 'Could not post gratitude');
      }
    } catch (err) {
      setErrorMessage('Network error while posting gratitude.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center space-x-2 text-xs text-[#6C786B] font-medium">
            <Heart className="w-3.5 h-3.5 text-[#A75D43] fill-[#A75D43]" />
            <span>Anonymous Sanctuary Community</span>
            <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
            <span>Uplifting Collective Presence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">
            Community Gratitude Wall
          </h2>
          <p className="text-[#35463A]/85 text-xs sm:text-sm leading-relaxed">
            A gentle, quiet space where souls from across the world leave small glimmers of appreciation. Browse by theme, absorb the collective warmth, or leave your own note.
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="self-start md:self-center min-h-[48px] px-5 py-3 rounded-2xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-diffused-sm transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4 text-[#E2E8D7]" />
          <span>Share a Moment of Gratitude</span>
        </button>
      </div>

      {/* Category Filter Controls */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs text-[#6C786B] font-medium shrink-0 flex items-center space-x-1 mr-1">
          <Filter className="w-3.5 h-3.5 text-[#6C786B]" />
          <span>Filter:</span>
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`min-h-[38px] text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-[#588157] text-[#FBF9F3] font-semibold shadow-xs'
                : 'bg-[#EDE9DF] text-[#35463A] border border-[#DEDCCF] hover:bg-[#E2E8D7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#6C786B] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#588157]" />
          <p className="text-xs">Gathering community moments of gratitude...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#FBF9F3] rounded-3xl p-12 text-center border border-[#DEDCCF] shadow-diffused-organic space-y-3">
          <Heart className="w-10 h-10 text-[#6C786B]/40 mx-auto" />
          <p className="text-[#35463A] text-sm">No gratitude moments found in this theme yet.</p>
          <button
            onClick={() => setShowShareModal(true)}
            className="text-xs text-[#588157] font-semibold underline hover:text-[#3A5A40]"
          >
            Be the first to share one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => {
            const hasReacted = reactedIds.has(post._id);
            return (
              <div
                key={post._id}
                className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] shadow-diffused-organic hover:border-[#A3B18A] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#6C786B]">
                    <span className="font-semibold text-[#3A5A40]">
                      {post.category}
                    </span>
                    <span className="text-[11px] font-mono">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-serif italic text-[#35463A] text-sm sm:text-base leading-relaxed pt-1">
                    "{post.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#DEDCCF]">
                  <span className="text-[11px] text-[#6C786B]">Anonymous Sanctuary Visitor</span>

                  <button
                    onClick={(e) => handleHeart(post._id, e)}
                    className={`min-h-[36px] inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      hasReacted
                        ? 'bg-[#E2E8D7] text-[#3A5A40] border border-[#A3B18A]'
                        : 'bg-[#EDE9DF] hover:bg-[#E2E8D7] text-[#35463A] border border-[#DEDCCF]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 text-[#A75D43] ${hasReacted ? 'fill-[#A75D43]' : ''}`} />
                    <span>{post.hearts}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Gratitude Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#35463A]/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FBF9F3] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-diffused-organic border border-[#DEDCCF] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#3A5A40] tracking-[-0.01em]">Share Anonymous Gratitude</h3>
                <p className="text-xs text-[#6C786B] mt-1">
                  Your words will be shared anonymously to bring light to someone else's day.
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[#6C786B] hover:text-[#35463A] p-2 rounded-xl hover:bg-[#EDE9DF] transition"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#EDE9DF] border border-[#A75D43]/40 text-xs text-[#A75D43]">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#35463A] block mb-1.5">
                  Select a Theme:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as GratitudePost['category'])}
                  className="w-full px-4 py-2.5 bg-[#F4EFE6] border border-[#DEDCCF] rounded-2xl text-xs text-[#35463A] focus:outline-none focus:ring-2 focus:ring-[#588157]/20 min-h-[44px]"
                >
                  <option value="Nature & Senses">Nature & Senses</option>
                  <option value="Human Kindness">Human Kindness</option>
                  <option value="Small Victories">Small Victories</option>
                  <option value="Healing & Rest">Healing & Rest</option>
                  <option value="Overcoming Obstacles">Overcoming Obstacles</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#35463A] block mb-1.5">
                  Your Reflection of Gratitude:
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Today I felt grateful for the quiet rustle of morning leaves..."
                  rows={4}
                  className="w-full p-4 bg-[#F4EFE6] border border-[#DEDCCF] rounded-2xl text-sm leading-relaxed text-[#35463A] focus:outline-none focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DEDCCF] text-xs font-medium text-[#6C786B] hover:bg-[#EDE9DF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newText.trim() || submitting}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#588157] hover:bg-[#3A5A40] disabled:bg-[#EDE9DF] disabled:text-[#6C786B] text-[#FBF9F3] text-xs font-semibold transition"
                >
                  {submitting ? 'Sharing...' : 'Post Anonymously'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
