import fs from 'fs';
import path from 'path';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-static';

export default function LeaderboardPage() {
  const resultsDir = path.join(process.cwd(), 'benchmark-results');
  
  // Use a Map to deduplicate models and only keep their highest score
  const modelMap = new Map<string, { name: string; score: number; status: string; label: string }>();

  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir).filter(file => {
      const lower = file.toLowerCase();
      return lower.endsWith('.json') && !lower.includes('task') && !lower.includes('config') && !lower.includes('meta');
    });
    
    files.forEach((filename) => {
      const filePath = path.join(resultsDir, filename);
      const fallbackName = filename.replace('.json', '');

      try {
        const runData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const hasError = runData.error || runData.status === 'error' || runData.failed;
        
        let modelName = runData.model_name || runData.model || fallbackName;
        if (modelName.length > 40) return; // Ignore corrupted massive names

        let score = 0;
        let status = 'error';
        let label = 'ERROR';

        if (!hasError) {
          const history = runData.history || runData.results || [];
          score = history.length > 0 ? parseFloat(history[history.length - 1].score || history[history.length - 1].correct || 0) : parseFloat(runData.score || 0);
          if (score > 1.0) score = score / 100.0; // Normalize 0-100 to 0.00-1.00

          const isPipeline = modelName.toLowerCase().includes('flash') || modelName.toLowerCase().includes('preview');
          status = isPipeline ? 'pipeline' : 'success';
          label = score.toFixed(2);
        }

        // DEDUPLICATION: Only update the map if this run has a better score
        const existing = modelMap.get(modelName);
        if (!existing || score > existing.score) {
          modelMap.set(modelName, { name: modelName, score, status, label });
        }

      } catch (e) {
         // Ignore completely broken files quietly
      }
    });
  }

  // Convert the cleaned Map back to an array for the UI
  const realModelData = Array.from(modelMap.values());

  return <DashboardClient initialModels={realModelData} />;
}