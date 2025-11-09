export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60" alt="Stress and Blood Glucose: Practical Ways to Cope" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Stress and Blood Glucose: Practical Ways to Cope</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-10</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Stress hormones like cortisol can push glucose up even without food. Track your readings during busy days to see patterns.

Try short, practical tools: 3-minute box breathing, a 10-minute walk after meals, or a quick stretch break each hour. Protect sleep—consistent bedtimes and a dark, cool room improve insulin sensitivity.

When stress is chronic, discuss adjustments with your care team rather than chasing readings day-to-day.`;
                return content.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>);
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
