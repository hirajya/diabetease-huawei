export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60" alt="Budget-Friendly Meal Planning for Stable Glucose" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Budget-Friendly Meal Planning for Stable Glucose</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-10</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Healthy doesn't have to be pricey. Build meals around budget-friendly staples like brown rice, monggo, tofu, itlog, and seasonal gulay.

Use the plate method: half non-starchy vegetables, a quarter lean protein, a quarter smart carbs. Compare per-serving cost, not sticker price—bulk sacks often win.

Batch-cook proteins and freeze single portions. Pre-cook rice and cool it for lower glycemic impact (resistant starch), then reheat. Read labels: aim for more fiber, less added sugar, and moderate sodium.`;
                return content.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>);
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
