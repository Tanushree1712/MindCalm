import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Compass, Eye, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

interface PrivacyModeOverlayProps {
  isOpen: boolean;
  onExit: () => void;
}

export const PrivacyModeOverlay: React.FC<PrivacyModeOverlayProps> = ({ isOpen, onExit }) => {
  const [city, setCity] = useState('San Francisco, CA');
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 font-sans overflow-y-auto">
      {/* Neutral top bar pretending to be a generic utility weather application */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-3.5 backdrop-blur flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <Cloud className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-200">MetroWeather Live</h1>
            <p className="text-xs text-slate-400">National Meteorological Service Feed • Updated just now</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-800 rounded-lg p-1 text-xs flex items-center">
            <button
              onClick={() => setUnit('F')}
              className={`px-2 py-0.5 rounded ${unit === 'F' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              °F
            </button>
            <button
              onClick={() => setUnit('C')}
              className={`px-2 py-0.5 rounded ${unit === 'C' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              °C
            </button>
          </div>

          {/* Discreet Exit Button */}
          <button
            onClick={onExit}
            className="flex items-center space-x-1.5 text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition"
            title="Return to MindCalm Sanctuary (or press Esc)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Return to Sanctuary</span>
          </button>
        </div>
      </header>

      {/* Weather Dashboard Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Current Conditions Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm mb-1">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>{city}</span>
                <span className="text-slate-600">•</span>
                <span>Thursday, 11:49 AM</span>
              </div>
              <div className="flex items-baseline space-x-4">
                <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white">
                  {unit === 'F' ? '68°' : '20°'}
                </span>
                <div>
                  <div className="text-xl font-medium text-slate-200">Partly Cloudy</div>
                  <div className="text-xs text-slate-400">Feels like {unit === 'F' ? '67°' : '19°'} • H: {unit === 'F' ? '71°' : '22°'} L: {unit === 'F' ? '54°' : '12°'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 sm:border-l sm:border-slate-800/80 sm:pl-8 text-slate-300">
              <Sun className="w-16 h-16 text-amber-400/90 animate-pulse" />
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Wind className="w-3.5 h-3.5 text-blue-300" />
                  <span>Wind: 8 mph WNW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Humidity: 54%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Visibility: 10.0 mi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hourly Forecast */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-4">Hourly Forecast</h3>
            <div className="grid grid-cols-6 gap-3">
              {[
                { time: 'Now', temp: '68°', icon: Sun },
                { time: '12 PM', temp: '70°', icon: Sun },
                { time: '1 PM', temp: '71°', icon: Cloud },
                { time: '2 PM', temp: '69°', icon: Cloud },
                { time: '3 PM', temp: '67°', icon: CloudRain },
                { time: '4 PM', temp: '64°', icon: Sun },
              ].map((h, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 text-center flex flex-col items-center">
                  <span className="text-xs text-slate-400">{h.time}</span>
                  <h.icon className="w-5 h-5 text-amber-300 my-2" />
                  <span className="text-sm font-semibold text-slate-200">{h.temp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Day Outlook & Radar Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>5-Day Outlook</span>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </h3>
            <div className="space-y-3">
              {[
                { day: 'Friday', cond: 'Mostly Sunny', high: '72°', low: '55°' },
                { day: 'Saturday', cond: 'Clear Sky', high: '74°', low: '57°' },
                { day: 'Sunday', cond: 'Passing Showers', high: '65°', low: '52°' },
                { day: 'Monday', cond: 'Partly Cloudy', high: '67°', low: '53°' },
                { day: 'Tuesday', cond: 'Sunny & Crisp', high: '70°', low: '55°' },
              ].map((d, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900">
                  <span className="font-medium text-slate-300 w-24">{d.day}</span>
                  <span className="text-slate-400 flex-1">{d.cond}</span>
                  <div className="flex space-x-2 font-mono">
                    <span className="text-slate-100 font-semibold">{d.high}</span>
                    <span className="text-slate-500">{d.low}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">Precipitation Radar</h3>
              <p className="text-xs text-slate-500 mb-4">Pacific Coastal Radar • Scan interval: 5m</p>
              
              <div className="h-36 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                <div className="w-24 h-24 rounded-full border border-blue-500/20 animate-ping absolute" />
                <div className="w-12 h-12 rounded-full border border-emerald-500/30 absolute" />
                <span className="text-xs text-slate-400 z-10">No severe precipitation detected</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
              <span>Air Quality Index: 32 (Good)</span>
              <span>Barometer: 30.12 inHg</span>
            </div>
          </div>
        </div>

        {/* Discreet safety footnote */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-600">
            Privacy Shield Mode Active. Screen masked. Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">Esc</kbd> or click the button above to safely restore your sanctuary.
          </p>
        </div>
      </main>
    </div>
  );
};
