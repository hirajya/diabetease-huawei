export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1580281657521-67d44a8d697b?w=800&auto=format&fit=crop&q=60" alt="Home glucose monitoring" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Home Glucose Monitoring: A Simple Routine</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-10</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Testing at home is most useful when it's consistent and intentional. Pick anchor times: upon waking, before meals, 2 hours after meals, and before bed.

Log context, not just numbers: meal type, activity, unusual stress or illness. Look weekly for patterns (e.g., breakfast spikes) and make one change at a time to isolate effects.`;
                return content.split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>);
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
