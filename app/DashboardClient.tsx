'use client';

import React, { useState, useEffect } from 'react';
// Pointing directly to your new live telemetry pipeline
import telemetryDataRaw from '../telemetry/benchmark_results.json';

interface ModelData {
  name: string;
  score: number;
  status: string;
  label: string;
  input_tokens?: string;
  output_tokens?: string;
  time_seconds?: string;
  assertions?: boolean[];
  cost?: number;
}

const parsedTelemetryData: ModelData[] = (telemetryDataRaw as any[]).map(raw => {
  const rawScore = String(raw.score || '0').trim();

  // Catch Kaggle "Error" states and route them properly
  if (rawScore.toLowerCase().includes('error')) {
    return {
      name: raw.model || "Unknown Model",
      score: 0,
      status: 'error',
      label: 'Error',
      input_tokens: raw.input_tokens || "-",
      output_tokens: raw.output_tokens || "-",
      time_seconds: raw.time_seconds || "-"
    };
  }

  // Normal numeric parsing
  const numericScore = parseFloat(rawScore.replace(/[^0-9.]/g, '')) || 0;
  
  return {
    name: raw.model || "Unknown Model",
    score: numericScore,
    status: 'success', 
    label: numericScore.toFixed(2),
    input_tokens: raw.input_tokens || "-",
    output_tokens: raw.output_tokens || "-",
    time_seconds: raw.time_seconds || "-"
  };
});

const ARTWORK_CAROUSEL = [
  '/Month_1/June1.jpeg',
  '/Month_1/June2.jpeg',
  '/Month_1/June3.jpeg',
  '/Month_1/June4.jpeg',
  '/Month_1/June5.jpeg',
  '/Month_1/June6.jpeg',
  '/Month_1/June7.jpeg',
  '/Month_1/June8.jpeg',
  '/Month_1/June9.jpeg',
  '/Month_1/June10.jpeg',
  '/Month_1/June11.jpeg'
];

const MODEL_COST_DB: Record<string, number> = {
  "Claude Haiku 4.5": 0.50,
  "Claude Opus 4.5": 15.00,
  "Claude Opus 4.6": 20.00,
  "Claude Opus 4.7": 25.00,
  "Claude Sonnet 4.5": 3.00,
  "Claude Sonnet 4.6": 4.00,
  "DeepSeek-R1": 2.50,
  "Deepseek V3.1": 1.00,
  "DeepSeek V3.2": 1.20,
  "Gemini 2.0 Flash Lite": 0.15,
  "Gemini 2.0 Flash": 0.30,
  "Gemini 2.5 Flash": 0.50,
  "Gemini 2.5 Pro": 5.00,
  "Gemini 3.1 Flash-Lite Preview": 0.20,
  "Gemini 3.1 Pro Preview": 7.00,
  "Gemini 3 Flash Preview": 0.60,
  "Gemma 4 26B A4B": 0.80,
  "Gemma 4 31B": 1.00,
  "GLM-5": 2.00,
  "GPT-5.4 mini": 0.50,
  "GPT-5.4 nano": 0.20,
  "GPT-5.4": 10.00,
  "GPT-5.5": 15.00,
  "gpt-oss-120b": 3.00
};

// FIX: Normalize strings to ensure proper matching between raw Kaggle IDs and clean DB names
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const getModelCost = (modelName: string) => {
  const normalizedModel = normalize(modelName);
  
  // Sort by length descending so "gpt-5.4-mini" is checked BEFORE "gpt-5.4"
  const sortedKeys = Object.keys(MODEL_COST_DB).sort((a, b) => b.length - a.length);
  
  const matchedKey = sortedKeys.find(key => normalizedModel.includes(normalize(key)));
  
  return matchedKey ? MODEL_COST_DB[matchedKey] : 2.50;
};

const AssertionGrid = ({ assertions }: { assertions?: boolean[] }) => (
  <div className="grid grid-cols-10 gap-[2px] p-1 bg-[#0a0a0a] border border-[#262626] rounded-sm mt-2 max-w-[200px]">
    {(assertions || []).slice(0, 50).map((passed, idx) => (
      <div 
        key={idx}
        title={`Case ${idx + 1}: ${passed ? 'PASSED' : 'FAILED'}`}
        className={`w-3 h-3 flex items-center justify-center text-[8px] font-bold ${
          passed ? 'bg-green-900/40 text-green-500' : 'bg-red-900/40 text-red-500'
        }`}
      >
        {passed ? '✓' : '×'}
      </div>
    ))}
  </div>
);

export default function DashboardClient({ initialModels = [] }: { initialModels?: ModelData[] }) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'leaderboard' | 'about'>('comparison');
  const [autoBrawl, setAutoBrawl] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [artIndex, setArtIndex] = useState(0);
  const [clashPosition, setClashPosition] = useState(50);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  
  // STRICT MODE: Only use the live telemetry dataset, ignore legacy hardcoded props
  const data = [...parsedTelemetryData];

  const uniqueModels = Array.from(data.reduce((map, m) => {
    if (!map.has(m.name) || m.score > map.get(m.name)!.score) map.set(m.name, m);
    return map;
  }, new Map<string, ModelData>()).values());

  const sortedModels = [...uniqueModels].sort((a, b) => {
    if (a.status === 'error' && b.status !== 'error') return 1;
    if (b.status === 'error' && a.status !== 'error') return -1;
    return b.score - a.score; 
  });

  const successfulModels = sortedModels.filter(m => m.status === 'success' || m.status === 'pipeline');
  const [contenderA, setContenderA] = useState<ModelData>(successfulModels[0] || sortedModels[0]);
  const [contenderB, setContenderB] = useState<ModelData>(successfulModels[1] || sortedModels[1]);

  useEffect(() => {
    if (!autoBrawl || activeTab !== 'comparison' || successfulModels.length < 2) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const randomA = successfulModels[Math.floor(Math.random() * successfulModels.length)];
          let randomB = successfulModels[Math.floor(Math.random() * successfulModels.length)];
          while (randomA.name === randomB.name) { randomB = successfulModels[Math.floor(Math.random() * successfulModels.length)]; }
          setContenderA(randomA);
          setContenderB(randomB);
          return 30; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoBrawl, activeTab, successfulModels]);

  useEffect(() => {
    if (activeTab !== 'comparison' && activeTab !== 'about') return;
    const artTimer = setInterval(() => { setArtIndex((prev) => (prev + 1) % ARTWORK_CAROUSEL.length); }, 10000);
    return () => clearInterval(artTimer);
  }, [activeTab]);

  useEffect(() => {
    setClashPosition(50); 
    const timeout = setTimeout(() => {
      const total = (contenderA?.score || 0) + (contenderB?.score || 1);
      const aRatio = ((contenderA?.score || 0) / total) * 100;
      setClashPosition(aRatio);
    }, 100);
    return () => clearTimeout(timeout);
  }, [contenderA, contenderB]);

  const topScore = sortedModels[0]?.score || 0;
  const totalTested = sortedModels.length;
  const pipelineCount = sortedModels.filter(m => m.status === 'pipeline').length;
  const champion = sortedModels[0];

  return (
    <div className="bg-[#050505] text-[#ededed] min-h-screen font-sans selection:bg-[#e9c400] selection:text-black pb-20">
      
      <header className="w-full px-6 flex items-center justify-between border-b border-[#e9c400]/10 bg-black/80 backdrop-blur-md sticky top-0 z-50 h-16">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center border-2 border-[#e9c400] rounded-sm text-[#e9c400] font-bold text-sm">P</div>
          <div className="leading-tight hidden sm:block">
             <span className="block font-bold text-sm text-white tracking-tight">Pencil</span>
             <span className="block font-light text-[10px] text-white -mt-1 tracking-widest">Physics</span>
          </div>
        </div>
        <nav className="flex items-center gap-8 text-sm font-medium h-full">
          <button 
            onClick={() => setActiveTab('comparison')} 
            className={`h-full relative flex items-center cursor-pointer transition-colors ${activeTab === 'comparison' ? 'text-[#e9c400]' : 'text-gray-500 hover:text-white'}`}
          >
            Head-to-Head Arena
            {activeTab === 'comparison' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e9c400]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')} 
            className={`h-full relative flex items-center cursor-pointer transition-colors ${activeTab === 'leaderboard' ? 'text-[#e9c400]' : 'text-gray-500 hover:text-white'}`}
          >
            Leaderboard Matrix
            {activeTab === 'leaderboard' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e9c400]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('about')} 
            className={`h-full relative flex items-center cursor-pointer transition-colors ${activeTab === 'about' ? 'text-[#e9c400]' : 'text-gray-500 hover:text-white'}`}
          >
            Project Origins
            {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e9c400]"></div>}
          </button>
        </nav>
        <div className="w-20 hidden md:block"></div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        
        {activeTab === 'about' && (
          <div className="animate-in fade-in duration-500">
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
              <div className="lg:col-span-5 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-[500px] aspect-square bg-zinc-900/50 rounded-2xl border border-[#e9c400]/20 overflow-hidden shadow-[0_0_40px_rgba(233,196,0,0.15)] flex items-center justify-center">
                  <img key={ARTWORK_CAROUSEL[artIndex]} src={ARTWORK_CAROUSEL[artIndex]} className="w-full h-full object-cover opacity-90" alt="Pencil Man Visual" />
                  <div className="absolute left-0 bottom-1/4 w-[1px] h-12 bg-[#e9c400]/40"></div>
                  <div className="absolute bottom-6 left-6">
                    <p className="text-[#e9c400] font-mono text-[10px] tracking-widest uppercase mb-1">Visual Telemetry</p>
                    <p className="text-white text-lg font-bold tracking-tight">Generation #{artIndex + 1}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <div className="mb-8">
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-[#e9c400] tracking-tighter mb-4">Project Origins</h1>
                  <p className="text-gray-400 text-sm tracking-widest uppercase font-mono flex items-center gap-4">
                    The Pencil Physics Anomaly <span className="h-px flex-grow bg-gray-800"></span>
                  </p>
                </div>
                
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#e9c400]"></div>
                  <h3 className="text-white font-bold text-sm tracking-widest uppercase mb-3">
                    01. The Creative Spark
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    "Pencil Man" began as an adversarial creative prompt. It challenges state-of-the-art AI to map a chaotic, minimalist entity into highly rendered, photorealistic environments. This tests a model's ability to retain conceptual identity while hallucinating atmospheric beauty, pushing the absolute boundaries of style transfer and literal interpretation.
                  </p>
                </div>

                <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#e9c400]"></div>
                  <h3 className="text-white font-bold text-sm tracking-widest uppercase mb-3">
                    02. The Mechanical Logic
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Beyond aesthetics, this serves as a rigid physics engine test for multimodal AI. We evaluate spatial reasoning, structural integrity, and strict logic adherence. Can the model accurately depict the mechanical laws of balancing a pencil? It separates basic "pretty picture generators" from spatially aware reasoning engines.
                  </p>
                </div>

                <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#e9c400]"></div>
                  <h3 className="text-white font-bold text-sm tracking-widest uppercase mb-3">
                    03. R&D Impact
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This project generates a high-fidelity dataset tracking failure states versus success rates across different architectures. By mapping this cost-to-performance matrix, we provide AI engineers with the exact boundaries of current capabilities, accelerating the development of more logical, constraint-aware generative models.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'comparison' && contenderA && contenderB && (
          <div className="animate-in fade-in duration-500">
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
              <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-[#e9c400] tracking-tighter truncate" title={contenderA.name}>{contenderA.name}</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-mono text-sm tracking-widest">VS</span>
                    <div className="h-px flex-grow bg-gray-800"></div>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-[#e9c400] tracking-tighter truncate" title={contenderB.name}>{contenderB.name}</h1>
                </div>
                <div className="flex gap-16">
                  <div>
                    <p className="text-gray-500 text-xs font-bold tracking-widest mb-2 uppercase">Model A Score</p>
                    <p className="text-5xl font-extrabold text-[#e9c400]">{contenderA.score.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-bold tracking-widest mb-2 uppercase">Model B Score</p>
                    <p className="text-5xl font-extrabold text-[#e9c400]">{contenderB.score.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setAutoBrawl(!autoBrawl)} className="px-6 py-2 border border-[#e9c400] text-[#e9c400] font-bold text-xs tracking-widest hover:bg-[#e9c400] hover:text-black transition-all duration-300 rounded-sm">
                    {autoBrawl ? 'HALT MATCHUP' : 'RESUME BRAWL'}
                  </button>
                  <span className="text-xs font-mono text-gray-500 tracking-widest">
                    {autoBrawl ? `00:${countdown.toString().padStart(2, '0')}` : 'PAUSED'}
                  </span>
                </div>
              </div>
              <div className="lg:col-span-7 flex justify-end">
                <div className="relative w-full max-w-[500px] aspect-square bg-zinc-900/50 rounded-2xl border border-[#e9c400]/20 overflow-hidden shadow-[0_0_40px_rgba(233,196,0,0.15)] flex items-center justify-center">
                  <img key={ARTWORK_CAROUSEL[artIndex]} src={ARTWORK_CAROUSEL[artIndex]} className="w-full h-full object-cover opacity-90" alt="Arena Visual" />
                  <div className="absolute left-0 bottom-1/4 w-[1px] h-12 bg-[#e9c400]/40"></div>
                </div>
              </div>
            </section>

            <section className="w-full">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-[#e9c400] font-bold text-xs tracking-[0.2em] uppercase">Live Physics Sandbox // 30s Simulation Matrix</h2>
                <div className="h-px flex-grow bg-[#e9c400]/10"></div>
              </div>
              <div className="relative w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden aspect-[21/9] lg:aspect-[2.5/1]">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, rgba(233,196,0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(233,196,0, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-0 bottom-0 w-0.5 bg-[#525252] transition-all duration-1000" style={{ left: `${clashPosition}%` }} />
                    <div className="absolute flex items-center justify-end transition-all duration-1000 z-10" style={{ width: `${clashPosition}%` }}>
                        <div className="w-10 h-28 bg-[#2D333D] rounded-sm flex flex-col gap-1 p-1 shadow-[0_0_20px_rgba(0,0,0,0.8)]"><div className="flex-1 bg-[#525252]" /></div>
                    </div>
                    <div className="absolute right-0 flex items-center justify-start transition-all duration-1000 z-10" style={{ width: `${100 - clashPosition}%` }}>
                        <div className="w-10 h-28 bg-[#705d00] rounded-sm flex flex-col gap-1 p-1 shadow-[0_0_20px_rgba(233,196,0,0.2)]"><div className="flex-1 bg-[#e9c400]" /></div>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20">
                  <div className="flex flex-col gap-1">
                    <div className="w-12 h-px bg-[#e9c400]/40"></div>
                    <div className="w-8 h-px bg-[#e9c400]/20"></div>
                  </div>
                  <div className="absolute right-6 top-6 bottom-6 w-48 hidden md:flex flex-col gap-4 text-[10px] font-mono text-zinc-400">
                    <div className="space-y-1">
                      <div className="flex justify-between items-end"><span>DOMINANCE (Δ)</span><span className="text-zinc-600">{(contenderA.score - contenderB.score).toFixed(3)}</span></div>
                      <div className="h-10 border-l border-b border-zinc-800 flex items-end"><svg className="w-full h-full stroke-[#e9c400]/40 fill-none" viewBox="0 0 100 40"><path d="M0,35 Q25,10 50,25 T100,5" strokeWidth="1"></path></svg></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-end"><span>ENERGY (Max)</span><span className="text-zinc-600">{Math.max(contenderA.score, contenderB.score).toFixed(3)}</span></div>
                      <div className="h-10 border-l border-b border-zinc-800 flex items-end"><svg className="w-full h-full stroke-[#e9c400]/40 fill-none" viewBox="0 0 100 40"><path d="M0,38 L100,2" strokeWidth="1"></path></svg></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 shadow-md flex flex-col">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight w-max border-b-[1.5px] border-[#e9c400] pb-[2px] mb-2">Evaluated Models</p>
                <p className="text-3xl font-semibold">{totalTested}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 shadow-md flex flex-col">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight w-max border-b-[1.5px] border-[#e9c400] pb-[2px] mb-2">SOTA Score</p>
                <p className="text-3xl font-semibold tracking-tighter">{topScore.toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 shadow-md flex flex-col">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight w-max border-b-[1.5px] border-[#e9c400] pb-[2px] mb-2">Active Pipelines</p>
                <p className="text-3xl font-semibold">{pipelineCount}</p>
              </div>
            </section>

            {champion && (
            <section className="mb-3">
              <div className="border border-[#333333] rounded-2xl p-6 shadow-md" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #062010 100%)' }}>
                <h2 className="text-lg font-semibold mb-1 text-white">State of the Art</h2>
                <p className="text-[10px] font-bold text-[#e9c400] tracking-widest uppercase mb-2">Current Champion</p>
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <p className="text-3xl md:text-4xl font-bold tracking-tight mt-1 text-white truncate max-w-full">{champion.name}</p>
                    <p className="text-4xl font-mono font-bold text-[#10b981]">{champion.label}</p>
                </div>
              </div>
            </section>
            )}

            <section className="bg-[#141414] rounded-xl border border-[#262626] p-6 hidden md:block mb-3">
              <h2 className="text-lg font-semibold mb-8">Analytics View: Model Distribution</h2>
              <div className="relative w-full h-[400px] border-l border-b border-[#262626] ml-10 mb-10">
                <div className="absolute -left-12 h-full flex flex-col justify-between text-[10px] text-neutral-500 py-1"><span>1.0</span><span>0.8</span><span>0.6</span><span>0.4</span><span>0.2</span><span>0</span></div>
                <div className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] text-neutral-400 whitespace-nowrap">Performance Score</div>
                
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[...Array(6)].map((_, i) => <div key={i} className="border-t border-[#262626] w-full opacity-30"></div>)}
                </div>

                <div className="relative w-full h-full overflow-visible">
                  {uniqueModels.slice(0, 25).map((model) => {
                    const actualCost = getModelCost(model.name);
                    const leftPos = Math.min((actualCost / 30) * 100, 95); 
                    const bottomPos = Math.max(2, Math.min(98, model.score * 100));
                    
                    const isHovered = hoveredModel === model.name;
                    const size = model.status === 'pipeline' ? 60 : 40 + (model.score * 20);
                    const bgColor = model.status === 'pipeline' ? 'bg-[#e9c400]/50 border-[#e9c400]' : 'bg-blue-500/40 border-blue-400';

                    return (
                      <div 
                        key={model.name}
                        onMouseEnter={() => setHoveredModel(model.name)}
                        onMouseLeave={() => setHoveredModel(null)}
                        className={`absolute rounded-full flex items-center justify-center text-[9px] font-medium transition-all duration-300 cursor-pointer border ${bgColor} ${isHovered ? 'z-50 scale-125 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'z-10'}`} 
                        style={{ width: size, height: size, left: `calc(${leftPos}% - ${size/2}px)`, bottom: `calc(${bottomPos}% - ${size/2}px)` }}
                      >
                        {size > 45 && <span className="text-white drop-shadow-md text-center px-1 truncate w-full">{model.name}</span>}
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#171717] border border-[#404040] p-3 rounded-md shadow-xl w-48 pointer-events-none">
                            <p className="font-bold text-white mb-1 truncate">{model.name}</p>
                            <div className="flex justify-between text-xs text-neutral-300 mb-1">
                                <span>Score:</span>
                                <span className="font-mono text-[#10b981]">{model.score.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-300">
                                <span>Est. Cost:</span>
                                <span className="font-mono">${actualCost.toFixed(2)}/1M</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="absolute -bottom-8 w-full flex justify-between text-[10px] text-neutral-500">
                  <span>$0</span><span>$6</span><span>$12</span><span>$18</span><span>$24</span><span>$30+</span>
                </div>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[11px] text-neutral-400">Est. Compute Cost (Tokens / $)</div>
              </div>
            </section>

            <section className="bg-[#141414] border border-[#262626] rounded-2xl pt-5 pb-2 shadow-md overflow-hidden">
              <h3 className="text-lg font-medium px-5 mb-4">Compact Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#262626]">
                      <th className="pb-3 px-5 font-bold">Rank</th>
                      <th className="pb-3 px-5 font-bold">Model Name</th>
                      <th className="pb-3 px-5 font-bold">Input Tokens</th>
                      <th className="pb-3 px-5 font-bold">Output Tokens</th>
                      <th className="pb-3 px-5 font-bold">Time (s)</th>
                      <th className="pb-3 px-5 font-bold text-right text-[#e9c400]">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]/50">
                    {sortedModels.map((model, i) => (
                      <tr key={`${model.name}-${i}`} className={`hover:bg-neutral-800/30 transition-colors ${i < 3 ? 'bg-neutral-900/10' : ''}`}>
                        <td className="py-4 px-5 text-gray-400">{i + 1}</td>
                        <td className="py-4 px-5">
                          <div className="font-medium text-white">{model.name}</div>
                          <AssertionGrid assertions={model.assertions} />
                        </td>
                        <td className="py-4 px-5 font-mono text-gray-400">{model.input_tokens}</td>
                        <td className="py-4 px-5 font-mono text-gray-400">{model.output_tokens}</td>
                        <td className="py-4 px-5 font-mono text-gray-400">{model.time_seconds}</td>
                        <td className="py-4 px-5 text-right font-mono font-bold text-[#e9c400]">{model.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}