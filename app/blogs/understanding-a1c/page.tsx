export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1516822003754-cca485356ecb?w=800&auto=format&fit=crop&q=60" alt="Lab report concept" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Understanding A1C: Beyond a Single Number</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-10</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `A1C estimates average glucose over ~3 months, but it hides variability. Pair it with Time in Range (TIR) to understand daily swings.

Improving A1C gently comes from small, consistent steps: balanced breakfasts, short post‑meal walks, and earlier bedtime routines to reduce late-night highs.`;
                return content.split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>);
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
