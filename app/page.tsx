import fs from 'fs';
import path from 'path';

// 1. DIRECT IMPORT: This forces Vercel's bundler to include the config file!
import configData from '../models_config.json';

// Force Next.js to evaluate this file statically at build time
export const dynamic = 'force-static';

export default function LeaderboardPage() {
  // 2. LITERAL TRACING: Vercel requires process.cwd() to be used directly inside path.join 
  // so its static analyzer knows not to delete the benchmark-results folder.
  const resultsDir = path.join(process.cwd(), 'benchmark-results');

  const modelsConfig = configData.models as Record<string, string>;
  const leaderboardMap: Record<string, { score: number; status: string; label: string }> = {};

  Object.keys(modelsConfig).forEach((modelName) => {
    leaderboardMap[modelName] = { score: 0, status: 'untested', label: 'Pending Setup ⏳' };
    const filename = modelsConfig[modelName];
    
    // Literal path.join requirement for Vercel
    const filePath = path.join(process.cwd(), 'benchmark-results', filename);

    if (fs.existsSync(filePath)) {
      try {
        const runData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const hasError = runData.error || runData.status === 'error' || runData.failed;

        if (hasError) {
          leaderboardMap[modelName] = {
            score: 0,
            status: 'error',
            label: `ERROR: ${runData.error || 'Pipeline Crash'}`,
          };
        } else {
          const history = runData.history || runData.results || [];
          let score = 0;
          if (history.length > 0) {
            score = parseFloat(history[history.length - 1].score || history[history.length - 1].correct || 0);
          } else {
            score = parseFloat(runData.score || 0);
          }

          if (score > 1.0) score = score / 100.0;

          const isPipeline = modelName === 'Gemini 3 Flash Preview' || modelName === 'Gemini 3.5 Flash';
          leaderboardMap[modelName] = {
            score,
            status: isPipeline ? 'pipeline' : 'success',
            label: score.toFixed(2),
          };
        }
      } catch (e) {
        // Ignore JSON parse errors for individual files
      }
    }
  });

  // 3. Sort the models: Pipeline -> Success -> Error -> Untested
  const sortedModels = Object.entries(leaderboardMap).sort((a, b) => {
    const order: Record<string, number> = { pipeline: 0, success: 1, error: 2, untested: 3 };
    if (order[a[1].status] !== order[b[1].status]) {
      return order[a[1].status] - order[b[1].status];
    }
    return b[1].score - a[1].score;
  });

  // 4. Render the UI
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#1e1e1e', // VS Code dark background
      color: '#cccccc',
      minHeight: '100vh',
      padding: '40px',
      margin: 0
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#ffffff', margin: '0 0 8px 0' }}>
          Pencil Physics: Mechanical Constraint Benchmark
        </h1>
        <p style={{ color: '#969696', fontSize: '14px', margin: '0 0 32px 0' }}>
          Evaluating state-of-the-art Large Language Models on their spatial reasoning, kinetic consistency, and mechanical logic.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedModels.map(([model, meta]) => {
            const widthPct = meta.status === 'untested' || meta.status === 'error' ? 10 : (meta.score * 100);
            
            // Determine colors based on status
            let borderColor = '#A0A0A0';
            let barColor = '#1f77b4';
            let bgOpacity = 'rgba(255, 255, 255, 0.05)';
            let textColor = '#cccccc';
            let labelColor = '#cccccc';

            if (meta.status === 'success') {
              borderColor = '#1f77b4';
            } else if (meta.status === 'pipeline') {
              borderColor = '#FFD700';
              barColor = '#FFD700';
              bgOpacity = 'rgba(255, 215, 0, 0.05)';
              textColor = '#FFD700';
            } else if (meta.status === 'error') {
              borderColor = '#D32F2F';
              barColor = '#D32F2F';
              bgOpacity = 'rgba(211, 47, 47, 0.05)';
              textColor = '#f44336';
              labelColor = '#f44336';
            } else if (meta.status === 'untested') {
              borderColor = '#555555';
              barColor = '#444444';
              textColor = 'rgba(204, 204, 204, 0.5)';
              labelColor = 'rgba(204, 204, 204, 0.5)';
            }

            return (
              <div 
                key={model} 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '240px 1fr',
                  alignItems: 'center',
                  background: bgOpacity,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${borderColor}`,
                }}
              >
                <div style={{ fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {model}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '14px', borderRadius: '2px' }}>
                    <div 
                      style={{ 
                        width: `${widthPct}%`, 
                        backgroundColor: barColor, 
                        height: '100%', 
                        borderRadius: '2px',
                        transition: 'width 0.4s ease-in-out',
                        opacity: meta.status === 'error' ? 0.3 : 1
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: labelColor, minWidth: '120px', fontWeight: meta.status === 'error' ? 'bold' : 'normal' }}>
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}