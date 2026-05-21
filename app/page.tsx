import fs from 'fs';
import path from 'path';

export default async function LeaderboardPage() {
  // 1. Set up paths to read our local data
  const rootPath = process.cwd();
  const configPath = path.join(rootPath, 'models_config.json');
  const resultsDir = path.join(rootPath, 'benchmark-results');

  // 2. Server-Side Diagnostics (This tells us what Vercel is actually seeing)
  let debugLogs: string[] = [];
  debugLogs.push(`Server CWD: ${rootPath}`);
  
  let modelsConfig: Record<string, string> = {};
  try {
    if (fs.existsSync(configPath)) {
      debugLogs.push(`✅ Config Found: models_config.json`);
      const configContent = fs.readFileSync(configPath, 'utf8');
      modelsConfig = JSON.parse(configContent).models;
    } else {
      debugLogs.push(`❌ Config MISSING: Expected at ${configPath}`);
    }
  } catch (e: any) {
    debugLogs.push(`❌ Config Read Error: ${e.message}`);
  }

  const leaderboardMap: Record<string, { score: number; status: string; label: string }> = {};

  try {
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir);
      debugLogs.push(`✅ Results Folder Found! Detected ${files.length} files.`);
    } else {
      debugLogs.push(`❌ Results Folder MISSING: Vercel bundler may have stripped ${resultsDir}`);
    }
  } catch (e: any) {
    debugLogs.push(`❌ Results Read Error: ${e.message}`);
  }

  // 3. Process the results and calculate scores
  Object.keys(modelsConfig).forEach((modelName) => {
    leaderboardMap[modelName] = { score: 0, status: 'untested', label: 'Pending Setup ⏳' };
    const filename = modelsConfig[modelName];
    const filePath = path.join(resultsDir, filename);

    if (fs.existsSync(filePath)) {
      try {
        const runData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const hasError = runData.error || runData.status === 'error' || runData.failed;

        if (hasError) {
          leaderboardMap[modelName] = { score: 0, status: 'error', label: `ERROR: ${runData.error || 'Pipeline Crash'}` };
        } else {
          const history = runData.history || runData.results || [];
          let score = history.length > 0 
            ? parseFloat(history[history.length - 1].score || history[history.length - 1].correct || 0)
            : parseFloat(runData.score || 0);

          if (score > 1.0) score = score / 100.0;
          const isPipeline = modelName === 'Gemini 3 Flash Preview' || modelName === 'Gemini 3.5 Flash';
          
          leaderboardMap[modelName] = { score, status: isPipeline ? 'pipeline' : 'success', label: score.toFixed(2) };
        }
      } catch (e) {}
    }
  });

  // 4. Sort the models
  const sortedModels = Object.entries(leaderboardMap).sort((a, b) => {
    const order: Record<string, number> = { pipeline: 0, success: 1, error: 2, untested: 3 };
    if (order[a[1].status] !== order[b[1].status]) return order[a[1].status] - order[b[1].status];
    return b[1].score - a[1].score;
  });

  // 5. Render the UI
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#1e1e1e', color: '#cccccc', minHeight: '100vh', padding: '40px', margin: 0 }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#ffffff', margin: '0 0 8px 0' }}>
          Pencil Physics: Mechanical Constraint Benchmark
        </h1>
        <p style={{ color: '#969696', fontSize: '14px', margin: '0 0 24px 0' }}>
          Evaluating state-of-the-art Large Language Models on their spatial reasoning, kinetic consistency, and mechanical logic.
        </p>

        {/* --- LIVE SERVER DEBUG PANEL --- */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: '16px', borderRadius: '6px', marginBottom: '32px', fontSize: '12px', fontFamily: 'monospace' }}>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Vercel Build Diagnostics:</strong>
          {debugLogs.map((log, i) => (
            <div key={i} style={{ color: log.includes('❌') ? '#f44336' : log.includes('✅') ? '#4CAF50' : '#ccc', marginBottom: '4px' }}>
              {log}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedModels.map(([model, meta]) => {
            const widthPct = meta.status === 'untested' || meta.status === 'error' ? 10 : (meta.score * 100);
            
            let borderColor = '#A0A0A0'; let barColor = '#1f77b4'; let bgOpacity = 'rgba(255, 255, 255, 0.05)'; let textColor = '#cccccc'; let labelColor = '#cccccc';
            if (meta.status === 'success') { borderColor = '#1f77b4'; } 
            else if (meta.status === 'pipeline') { borderColor = '#FFD700'; barColor = '#FFD700'; bgOpacity = 'rgba(255, 215, 0, 0.05)'; textColor = '#FFD700'; } 
            else if (meta.status === 'error') { borderColor = '#D32F2F'; barColor = '#D32F2F'; bgOpacity = 'rgba(211, 47, 47, 0.05)'; textColor = '#f44336'; labelColor = '#f44336'; } 
            else if (meta.status === 'untested') { borderColor = '#555555'; barColor = '#444444'; textColor = 'rgba(204, 204, 204, 0.5)'; labelColor = 'rgba(204, 204, 204, 0.5)'; }

            return (
              <div key={model} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', alignItems: 'center', background: bgOpacity, padding: '8px 16px', borderRadius: '4px', borderLeft: `4px solid ${borderColor}` }}>
                <div style={{ fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '14px', borderRadius: '2px' }}>
                    <div style={{ width: `${widthPct}%`, backgroundColor: barColor, height: '100%', borderRadius: '2px', transition: 'width 0.4s ease-in-out', opacity: meta.status === 'error' ? 0.3 : 1 }} />
                  </div>
                  <span style={{ fontSize: '12px', color: labelColor, minWidth: '120px', fontWeight: meta.status === 'error' ? 'bold' : 'normal' }}>{meta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}