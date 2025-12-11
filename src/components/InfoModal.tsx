import React from 'react';
import { X, Search, Map as MapIcon, BarChart3, Database } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">How to use Shot Engine</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Intro */}
          <div className="prose prose-slate">
            <p className="text-slate-600 text-lg leading-relaxed">
              This is a natural language search engine for NBA shots. It runs entirely in your browser, allowing you to explore NBA shots over the past few seasons.
            </p>
          </div>

          {/* Search Examples */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
              <Search size={20} className="text-nba-blue" />
              Search Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Player & Shot Type</span>
                <code className="text-sm font-mono text-blue-600">Stephen Curry corner 3</code>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Distance</span>
                <code className="text-sm font-mono text-blue-600">Lillard 30ft</code>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Specific Action</span>
                <code className="text-sm font-mono text-blue-600">LeBron James dunk</code>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Zone</span>
                <code className="text-sm font-mono text-blue-600">Tatum restricted area</code>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                <MapIcon size={20} />
              </div>
              <h4 className="font-semibold text-slate-800">Shot Map</h4>
              <p className="text-sm text-slate-500">Visualize shot locations on an interactive half-court overlay.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2">
                <BarChart3 size={20} />
              </div>
              <h4 className="font-semibold text-slate-800">Zone Analysis</h4>
              <p className="text-sm text-slate-500">Compare efficiency across different court zones.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-2">
                <Database size={20} />
              </div>
              <h4 className="font-semibold text-slate-800">Static Data</h4>
              <p className="text-sm text-slate-500">Powered by a compressed index loaded directly into your browser.</p>
            </div>
          </div>

          {/* Searchable Terms */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
              <Database size={20} className="text-nba-blue" />
              Some Searchable Terms
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Shot Types</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Jump Shot, Layup, Dunk, Hook Shot, Fadeaway, Step Back, Pullup, Floater, Alley Oop, Reverse, Bank Shot, Putback, Finger Roll
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Court Zones</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Restricted Area, In The Paint (Non-RA), Mid-Range, Left/Right Corner 3, Above the Break 3, Backcourt
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            NBA Shot Search Engine
          </p>
        </div>
      </div>
    </div>
  );
};

