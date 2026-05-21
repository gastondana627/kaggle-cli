import Link from "next/link";

export default function PublicLeaderboard() {
  return (
    <main className="max-w-4xl mx-auto p-8 font-sans">
      <header className="mb-12 border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pencil Physics: Mechanical Constraint Benchmark
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Evaluating state-of-the-art Large Language Models on their spatial reasoning, 
          kinetic consistency, and mechanical logic. 
        </p>

        {/* The fully wired Next.js Link Button */}
        <Link href="#leaderboard" passHref>
          <button 
            data-slot="button" 
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 rounded-md px-6 has-[>svg]:px-4 gap-2 bg-gray-900 text-white hover:bg-gray-800"
          >
            View Leaderboard
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </Link>
      </header>

      <section className="mb-12 bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-3">What is this test?</h2>
        <p className="text-gray-700 leading-relaxed">
          The Pencil Physics benchmark pushes AI models beyond standard text generation. 
          Models are given complex, multi-step physical scenarios (e.g., "If a 5kg weight 
          is dropped on a lever, what happens to the attached gear?") and must calculate 
          the correct mechanical constraints without relying on visual inputs. 
        </p>
      </section>

      {/* Added the id="leaderboard" anchor so the button knows where to jump */}
      <section id="leaderboard">
        <h2 className="text-2xl font-semibold mb-6">Current Leaderboard</h2>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center p-3 border-b bg-gray-50 font-semibold">
            <span>Model Name</span>
            <span>Accuracy Score</span>
          </div>
          {/* Example Row */}
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-blue-600">DeepSeek-R1</span>
            <span className="text-green-600 font-bold">0.86</span>
          </div>
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium">Gemma 4 26B A4B</span>
            <span className="text-gray-800">0.72</span>
          </div>
          <div className="p-3 text-sm text-gray-500 italic">
            * Final 4 models pending execution. Matrix updates daily.
          </div>
        </div>
      </section>
    </main>
  );
}