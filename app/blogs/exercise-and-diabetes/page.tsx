export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=60" alt="Exercise and Diabetes" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Exercise and Diabetes: What to Know</h1>
            <p className="text-sm text-gray-500 mt-1">2025-11-02</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Physical activity improves insulin sensitivity, cardiovascular health, and mood—but the glucose response depends on type, intensity, timing, and starting level.

1. Exercise Types: (a) Aerobic (walking, cycling) often lowers glucose during/after. (b) Resistance training may cause a mild rise initially (stress hormones) but improves long‑term sensitivity. (c) HIIT can create short spikes from adrenaline—usually transient.

2. Pre‑Session Check: If using insulin or prone to lows, test before starting. If below target, take fast carbs first; if very high with ketones (if you test), delay intense exercise.

3. Fuel Strategy: For moderate sessions <45 minutes you may not need extra carbs. Longer or more intense activity may require 10–20g carbs per hour (individual variation).

4. Timing Relative to Meals: Light post‑meal walks (10–15 minutes) can blunt glucose spikes. Strength sessions before a higher‑carb meal can improve disposal.

5. Hypoglycemia Prevention: If using rapid insulin, consider modest dose reductions (with professional guidance) when planning unusual activity; carry glucose tabs and ID.

6. Sequence Advantage: Resistance work before aerobic can reduce subsequent lows in some individuals by creating a buffering effect.

7. Recovery & Overnight Trends: Intense afternoon workouts can increase overnight lows (increased insulin sensitivity). Monitor bedtime readings and adjust snacks if needed.

8. Consistency Over Intensity: Three 20‑minute brisk walks across a day can rival a single 60‑minute session for glucose smoothing—find what's sustainable.

9. Logging: Note start glucose, activity type, duration, and end glucose (or CGM trend). Patterns guide future adjustments.

10. Rest & Adaptation: Sleep and rest days are part of the glucose strategy—chronic fatigue elevates stress hormones.

Start with what you can maintain this week. Progression plus mindful monitoring yields safer, more predictable improvements.`;
                const blocks = content.split(/\n\n+/);
                const intro = blocks[0];
                const rest = blocks.slice(1);
                const list = rest.filter(b => /^\d+\.\s/.test(b));
                const tail = rest.filter(b => !/^\d+\.\s/.test(b));
                return (
                  <>
                    <p>{intro}</p>
                    {list.length > 0 && (
                      <ul className="list-disc pl-6 space-y-2">
                        {list.map((item, i) => (
                          <li key={i}>{item.replace(/^\d+\.\s/, "")}</li>
                        ))}
                      </ul>
                    )}
                    {tail.map((p, i) => (
                      <p key={`tail-${i}`}>{p}</p>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
