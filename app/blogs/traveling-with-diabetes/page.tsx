export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop&q=60" alt="Travel essentials flat lay" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Traveling with Diabetes: Packing and Planning</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-10</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Use a checklist: meter/CGM supplies, medications, snacks, glucose tabs, prescriptions, and a doctor's note. Pack extras in carry‑on.

Crossing time zones? For insulin, adjust basal timing gradually with guidance. Keep snacks handy for delays, and hydrate more than usual while flying.`;
                return content.split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>);
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
