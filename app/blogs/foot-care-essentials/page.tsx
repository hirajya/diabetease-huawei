export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60" alt="Bare human foot close-up" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Foot Care Essentials to Prevent Complications</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-10</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Nerve and circulation changes raise foot risk. Check your feet daily for cuts, blisters, redness, or swelling. Wash and dry thoroughly—especially between toes. Moisturize heels (not between toes).

Choose well-fitting shoes with room in the toe box; avoid walking barefoot. Trim nails straight across. If you notice wounds that don't heal, color changes, or numbness, consult your provider or a podiatrist early.`;
                return content.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>);
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
