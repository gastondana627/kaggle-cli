'use client';

import React, { useState, useEffect } from 'react';

// --- MOCK DATA (In a real setup, this would be passed from a Server Component) ---
const MOCK_MODELS = [
  { name: 'gpt-oss-120b', score: 0.99, status: 'success' },
  { name: 'DeepSeek-R1', score: 0.86, status: 'success' },
  { name: 'Claude 3.5 Sonnet', score: 0.79, status: 'success' },
  { name: 'Gemini 3.5 Flash', score: 0.72, status: 'pipeline' },
  { name: 'Llama 3 70B', score: 0.65, status: 'success' },
  { name: 'Grok 4', score: 0.46, status: 'error' },
];

export default function PencilPhysicsDashboard() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'leaderboard'>('comparison');
  const [contenderA, setContenderA] = useState(MOCK_MODELS[0]);
  const [contenderB, setContenderB] = useState(MOCK_MODELS[1]);
  const [autoBrawl, setAutoBrawl] = useState(true);

  // --- Auto-Brawl Timer (Updates every 10 seconds) ---
  useEffect(() => {
    if (!autoBrawl || activeTab !== 'comparison') return;

    const interval = setInterval(() => {
      const successful = MOCK_MODELS.filter(m => m.status === 'success');
      const randomA = successful[Math.floor(Math.random() * successful.length)];
      let randomB = successful[Math.floor(Math.random() * successful.length)];
      
      while (randomA.name === randomB.name) {
        randomB = successful[Math.floor(Math.random() * successful.length)];
      }

      setContenderA(randomA);
      setContenderB(randomB);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoBrawl, activeTab]);

  return (
    <div className="bg-[#111319] min-h-screen text-[#e2e2eb] font-sans selection:bg-primary-container selection:text-black">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="bg-[#0c0e14] border-b border-[#2D333D] sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-8 h-16 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-12">
            <span className="text-xl font-bold text-[#ffd700] tracking-tighter">Pencil Physics</span>
            <nav className="flex gap-8 items-center h-16">
              <button 
                onClick={() => setActiveTab('comparison')}
                className={`text-sm font-medium transition-all h-full border-b-2 px-2 ${activeTab === 'comparison' ? 'border-[#ffd700] text-[#ffd700]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Comparison
              </button>
              <button 
                onClick={() => setActiveTab('leaderboard')}
                className={`text-sm font-medium transition-all h-full border-b-2 px-2 ${activeTab === 'leaderboard' ? 'border-[#ffd700] text-[#ffd700]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Leaderboard
              </button>
            </nav>
          </div>
          
          <div className="relative hidden sm:block">
             <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             <input className="bg-[#191b22] border border-[#2D333D] rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-[#ffd700] w-64 transition-all" placeholder="Search models..." />
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 py-10">
        
        {/* --- VIEW 1: COMPARISON (HEAD-TO-HEAD) --- */}
        {activeTab === 'comparison' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Hero Versus Arena */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffd700]/10 border border-[#ffd700]/20 rounded-full">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-[#ffd700] uppercase tracking-widest">
                    {autoBrawl ? 'Auto-Brawl Active' : 'Manual Selection'}
                  </span>
                </div>
                <h1 className="text-5xl font-bold leading-tight">
                  {contenderA.name} <br/>
                  <span className="text-gray-600 text-3xl">vs</span> <br/>
                  <span className="text-[#ffd700]">{contenderB.name}</span>
                </h1>
                <div className="p-6 bg-[#191b22] border border-[#2D333D] rounded-xl">
                   <p className="text-gray-400 text-sm mb-2 uppercase tracking-tighter font-semibold">The Verdict</p>
                   <p className="text-xl">
                     {contenderA.score > contenderB.score 
                       ? `${contenderA.name} dominates with a ${(contenderA.score - contenderB.score).toFixed(2)} lead in mechanical logic.` 
                       : `${contenderB.name} takes the lead in spatial reasoning.`}
                   </p>
                </div>
              </div>

              {/* Artwork Container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#2D333D] bg-black group">
                {/* Note: In production, place your June10.png in the /public folder */}
                <img 
                  src="/june10.png" 
                  alt="Pencil Man Referee" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  onError={(e) => {
                    // Fallback if image isn't in public folder yet
                    e.currentTarget.src = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1000";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[#ffd700] font-mono text-xs">MATCHUP_REF_0610</p>
                </div>
              </div>
            </section>

            {/* Matchup Controls */}
            <div className="flex gap-4 p-2 bg-[#0c0e14] border border-[#2D333D] rounded-xl w-fit">
              <button 
                onClick={() => setAutoBrawl(!autoBrawl)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${autoBrawl ? 'bg-[#ffd700] text-black' : 'text-gray-500 hover:text-white'}`}
              >
                {autoBrawl ? 'Stop Auto-Brawl' : 'Start Auto-Brawl'}
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW 2: LEADERBOARD (THE GRID) --- */}
        {activeTab === 'leaderboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12">
              <h2 className="text-3xl font-bold mb-2">Global Ranking</h2>
              <p className="text-gray-500">Live evaluation results from the Pencil Physics repository.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_MODELS.sort((a,b) => b.score - a.score).map((model) => (
                <div key={model.name} className="bg-[#0a0a0a] border border-[#262626] p-6 flex flex-col justify-between h-40 hover:border-[#ffd700]/50 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-lg">{model.name}</span>
                    <span className={`text-sm font-mono ${model.status === 'success' ? 'text-[#ffd700]' : 'text-orange-500'}`}>
                      {model.status === 'success' ? model.score.toFixed(2) : 'PIPE'}
                    </span>
                  </div>

                  {/* Segmented Blocks Visualizer */}
                  <div className="flex gap-1 w-full">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 h-2 bg-[#1f1f22]"
                      >
                        <div 
                          className={`h-full bg-[#ffd700] transition-all duration-1000`}
                          style={{ width: i/10 < model.score ? '100%' : '0%' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}