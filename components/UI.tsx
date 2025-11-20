import React, { useState } from 'react';
import { generateArchitecturalDescription } from '../services/geminiService';

export const UI: React.FC = () => {
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await generateArchitecturalDescription();
    setDescription(result);
    setLoading(false);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-slate-700 shadow-2xl pointer-events-auto max-w-md">
            <h1 className="text-3xl font-bold text-amber-400 mb-1 tracking-wider">SANA'A NIGHTS</h1>
            <p className="text-slate-300 text-sm font-light">
                Procedural Voxel Art Interpretation <br/>
                <span className="text-xs opacity-60">Inspired by Al-Sabeen Mosque Architecture</span>
            </p>
        </div>
        
        {/* Gemini Control */}
        <div className="pointer-events-auto">
            <button 
                onClick={handleAnalyze}
                disabled={loading}
                className={`
                    flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all shadow-lg border
                    ${loading 
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-wait' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-orange-400 hover:scale-105 hover:shadow-orange-500/20'
                    }
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Consulting Gemini...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                        Analyze Style
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* Footer / Description Panel */}
      {description && (
        <div className="pointer-events-auto self-center mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_50px_-12px_rgba(251,191,36,0.2)] max-w-2xl text-center">
                <div className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-3">Architectural Insight</div>
                <p className="text-slate-100 text-lg font-serif leading-relaxed italic">
                    "{description}"
                </p>
            </div>
        </div>
      )}

      <div className="text-slate-600 text-xs text-center font-mono">
        Interact to Rotate • Scroll to Zoom
      </div>
    </div>
  );
};
