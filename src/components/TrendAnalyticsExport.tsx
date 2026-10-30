import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, Activity, Shield, FileText, CheckCircle2, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { StatsData, MoodCheckIn } from '../types';
import { apiFetch } from '../utils/api';

interface TrendAnalyticsExportProps {
  onCheckInNow?: () => void;
}

export const TrendAnalyticsExport: React.FC<TrendAnalyticsExportProps> = ({ onCheckInNow }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [checkins, setCheckins] = useState<MoodCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, checkinsRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/checkins')
      ]);
      const statsJson = await statsRes.json();
      const checkinsJson = await checkinsRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (checkinsJson.success) setCheckins(checkinsJson.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const response = await apiFetch('/api/checkins/export/csv');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MindCalm_Clinical_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Could not download clinical export:', error);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-[#6C786B]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#588157]" />
        <p className="text-sm">Calculating your 7-day emotional flow & somatic patterns...</p>
      </div>
    );
  }

  // Calculate SVG chart coordinates for 7 days
  const chartHeight = 180;
  const chartWidth = 550;
  const paddingX = 40;
  const paddingY = 25;
  const points = stats.trend.map((d, index) => {
    const x = paddingX + (index * (chartWidth - 2 * paddingX)) / Math.max(stats.trend.length - 1, 1);
    // Score is 1 to 10
    const normalizedScore = (d.score - 1) / 9; // 0 to 1
    const y = chartHeight - paddingY - normalizedScore * (chartHeight - 2 * paddingY);
    return { ...d, x, y };
  });

  const svgPath = points.length > 1
    ? points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '')
    : '';

  // Calculate total hotspots for percentage breakdown
  const totalHotspotHits = Object.values(stats.hotspotCounts).reduce((a, b) => a + b, 0) || 1;
  const hotspotLabels: Record<string, { label: string; desc: string }> = {
    head: { label: 'Head & Mind', desc: 'Racing thoughts, mental fog' },
    shoulders: { label: 'Neck & Shoulders', desc: 'Carrying muscle tension' },
    chest: { label: 'Chest & Breath', desc: 'Shallow breath, heart rate' },
    gut: { label: 'Gut & Stomach', desc: 'Unease, butterfly sensation' },
    limbs: { label: 'Hands & Limbs', desc: 'Restlessness, heaviness' }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner with One-Click CSV Export */}
      <div className="bg-[#3A5A40] text-[#FBF9F3] rounded-3xl p-6 sm:p-8 shadow-diffused-organic relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#A3B18A]">
            <Shield className="w-3.5 h-3.5" />
            <span>Healthcare Professional Ready</span>
            <span aria-hidden="true" className="text-[#A3B18A]/60">·</span>
            <span>AES-256 Encrypted</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-[-0.01em]">
            7-Day Emotional Flow & Clinical Export
          </h2>
          <p className="text-[#E2E8D7]/85 text-xs sm:text-sm leading-relaxed">
            Consolidated somatic patterns, mood volatility scores, and stress trigger distributions prepared for personal reflection or your next therapy consultation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2C4430] hover:bg-[#1E2E21] text-[#E2E8D7] border border-[#588157]/40 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Clinical Log</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#588157] hover:bg-[#476C46] text-[#FBF9F3] shadow-xs text-xs font-bold flex items-center justify-center space-x-2 transition"
          >
            <Download className="w-4 h-4 text-[#E2E8D7]" />
            <span>One-Click Clinical CSV Export</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FBF9F3] p-5 rounded-3xl border border-[#DEDCCF] shadow-diffused-organic flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E2E8D7] text-[#3A5A40] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6C786B] font-medium">7-Day Average Mood</div>
            <div className="text-2xl font-bold font-serif text-[#3A5A40] mt-0.5 tracking-[-0.01em]">
              {stats.averageMood} <span className="text-sm font-sans font-normal text-[#6C786B]">/ 10</span>
            </div>
            <span className="text-[11px] text-[#588157] font-semibold">
              {stats.averageMood >= 7 ? 'Steady & Grounded' : stats.averageMood >= 5 ? 'Balanced Neutral' : 'Holding Gentle Care'}
            </span>
          </div>
        </div>

        <div className="bg-[#FBF9F3] p-5 rounded-3xl border border-[#DEDCCF] shadow-diffused-organic flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9DF] text-[#A75D43] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6C786B] font-medium">Mindful Streak</div>
            <div className="text-2xl font-bold font-serif text-[#3A5A40] mt-0.5 tracking-[-0.01em]">
              {stats.streakDays} <span className="text-sm font-sans font-normal text-[#6C786B]">days</span>
            </div>
            <span className="text-[11px] text-[#A75D43] font-semibold">Consistency in self-listening</span>
          </div>
        </div>

        <div className="bg-[#FBF9F3] p-5 rounded-3xl border border-[#DEDCCF] shadow-diffused-organic flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E2E8D7] text-[#588157] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#6C786B] font-medium">Encrypted Check-Ins</div>
            <div className="text-2xl font-bold font-serif text-[#3A5A40] mt-0.5 tracking-[-0.01em]">
              {stats.checkinCount} <span className="text-sm font-sans font-normal text-[#6C786B]">records</span>
            </div>
            <span className="text-[11px] text-[#588157] font-semibold">AES-256 authenticated</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Line Chart */}
      <div className="bg-[#FBF9F3] rounded-3xl p-6 sm:p-8 border border-[#DEDCCF] shadow-diffused-organic space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-[#3A5A40] text-lg sm:text-xl tracking-[-0.01em]">
              7-Day Emotional Trajectory
            </h3>
            <p className="text-xs text-[#6C786B]">
              Daily mood scores (1-10) showing emotional recovery and grounding trends.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-[#6C786B]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#588157] inline-block" />
              <span>Daily Mood Score</span>
            </span>
          </div>
        </div>

        {/* SVG Responsive Line Chart */}
        <div className="w-full overflow-x-auto py-2">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#588157" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#588157" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Lines */}
              {[2, 5, 8].map(score => {
                const norm = (score - 1) / 9;
                const y = chartHeight - paddingY - norm * (chartHeight - 2 * paddingY);
                return (
                  <g key={score}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#DEDCCF"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text x={paddingX - 10} y={y + 3} textAnchor="end" fontSize="10" fill="#6C786B">
                      {score}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area Under Line */}
              {points.length > 1 && (
                <path
                  d={`${svgPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`}
                  fill="url(#chartGradient)"
                />
              )}

              {/* The Trend Line */}
              <path
                d={svgPath}
                fill="none"
                stroke="#3A5A40"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    className="fill-[#FBF9F3] stroke-[#588157] stroke-[3px] group-hover:r-7 transition-all"
                  />
                  {/* Point tooltip score */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#3A5A40"
                  >
                    {p.score}
                  </text>
                  {/* Day label */}
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#6C786B"
                  >
                    {p.dayName}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Somatic Hotspots & Top Stress Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Somatic Hotspots Breakdown */}
        <div className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] shadow-diffused-organic space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#588157]" />
            <h3 className="font-serif font-bold text-[#3A5A40] text-lg tracking-[-0.01em]">
              Somatic Hotspot Distribution
            </h3>
          </div>
          <p className="text-xs text-[#6C786B]">
            Physical areas where emotional tension or somatic sensations were identified most frequently this week.
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.hotspotCounts).map(([key, count]) => {
              const meta = hotspotLabels[key] || { label: key, desc: '' };
              const percent = Math.round((count / totalHotspotHits) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#35463A]">{meta.label}</span>
                    <span className="text-[#6C786B]">{count} notes ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#EDE9DF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#588157] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#6C786B]">{meta.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Stress Triggers Breakdown */}
        <div className="bg-[#FBF9F3] rounded-3xl p-6 border border-[#DEDCCF] shadow-diffused-organic space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#3A5A40]" />
            <h3 className="font-serif font-bold text-[#3A5A40] text-lg tracking-[-0.01em]">
              Primary Stress Triggers
            </h3>
          </div>
          <p className="text-xs text-[#6C786B]">
            External and environmental factors that contributed most to emotional fluctuations.
          </p>

          <div className="space-y-3 pt-2">
            {stats.topTriggers.length === 0 ? (
              <p className="text-xs text-[#6C786B] italic py-6 text-center">
                No acute stress triggers recorded this week.
              </p>
            ) : (
              stats.topTriggers.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EDE9DF]/60 border border-[#DEDCCF]">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#E2E8D7] text-[#3A5A40] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#35463A]">{t.name}</span>
                  </div>
                  <span className="text-xs font-medium text-[#6C786B] bg-[#FBF9F3] px-2.5 py-1 rounded-lg border border-[#DEDCCF]">
                    {t.count} instances
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clinical Summary Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#35463A]/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FBF9F3] rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-diffused-organic border border-[#DEDCCF] overflow-hidden">
            <div className="p-6 bg-[#EDE9DF]/70 border-b border-[#DEDCCF] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">Clinical Data Log Preview</h3>
                <p className="text-xs text-[#6C786B] mt-0.5">
                  Standardized psychiatric/therapeutic somatic check-in history.
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs px-3.5 py-2 rounded-xl border border-[#DEDCCF] text-[#35463A] hover:bg-[#EDE9DF] transition"
              >
                Close Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="overflow-x-auto border border-[#DEDCCF] rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EDE9DF]/80 text-[#3A5A40] font-semibold border-b border-[#DEDCCF]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">State</th>
                      <th className="p-3">Somatic Areas</th>
                      <th className="p-3">Triggers</th>
                      <th className="p-3">Gratitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDCCF] text-[#35463A]">
                    {checkins.map(c => (
                      <tr key={c._id} className="hover:bg-[#EDE9DF]/40 transition">
                        <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-bold text-[#3A5A40]">
                          {c.moodScore}/10
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-[#35463A]">{c.moodLabel}</span>
                          <div className="text-[10px] text-[#6C786B]">{c.emotions.join(', ')}</div>
                        </td>
                        <td className="p-3 text-[11px]">
                          {c.bodyRegions.join(', ') || 'None noted'}
                        </td>
                        <td className="p-3 text-[11px]">
                          {c.stressTriggers.join(', ') || 'None'}
                        </td>
                        <td className="p-3 italic text-[#6C786B] max-w-[180px] truncate">
                          {c.gratitudeNote || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-[#EDE9DF]/70 border-t border-[#DEDCCF] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <span className="text-[#6C786B]">File: MindCalm_Clinical_Export_{new Date().toISOString().slice(0, 10)}.csv</span>
              <button
                onClick={handleDownloadCsv}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#588157] hover:bg-[#3A5A40] text-[#FBF9F3] font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
