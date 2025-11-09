export default function Page(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</a>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative w-full h-72 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" alt="Nutrition for Better Control" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-700">Nutrition for Better Control</h1>
            <p className="text-sm text-gray-500 mt-1">2025-10-28</p>
            <div className="mt-6 prose max-w-none text-gray-800 leading-relaxed">
              {(() => {
                const content = `Nutrition is one of the most direct levers you can adjust to improve glucose stability. Instead of chasing perfection, focus on a repeatable framework you can adapt to real life.

1. Build a Balanced Plate: Aim for half non‑starchy vegetables (fiber + micronutrients), a quarter lean protein (slows glucose absorption), and a quarter smart carbohydrates (whole grains, legumes, root crops). Healthy fats (olive oil, avocado, nuts) in small amounts support satiety.

2. Understand Carbohydrate Quality: Highly refined carbs digest quickly and may spike glucose. Favor oats, brown rice, monggo, lentils, camote, saba, and whole fruit over juices and sugary drinks.

3. Fiber & Pairing: Adding soluble fiber (chia, oats) and protein/fat to carb sources moderates post‑meal rises. A banana alone digests faster than a banana with peanut butter.

4. Practical Label Reading: Check per serving—not per package. Focus on: (a) Added sugars (lower is better), (b) Fiber (≥3g per serving is helpful), (c) Sodium (especially if you have hypertension), (d) Total carbs relative to serving size.

5. Portion Calibration: Start by observing usual portions; do not slash everything at once. Adjust one meal at a time (e.g., reduce white rice by 25% and replace volume with vegetables or legumes).

6. Meal Timing & Consistency: Large gaps then oversized meals can create rollercoasters. Regularly spaced meals or planned snacks can smooth curves—especially if using insulin or prone to lows.

7. Simple Breakfast Wins: Protein + fiber early can flatten the rest of the day's responses (e.g., boiled eggs + high‑fiber oats + fruit).

8. Hydration: Mild dehydration can falsely elevate glucose readings. Prefer water; limit sweetened beverages.

9. Weekend Strategy: Batch‑prep proteins and chop vegetables. Pre‑cooked portions reduce takeout reliance when busy.

10. Iterate with Data: Use 2‑hour post‑meal checks (or CGM trends) to see which meals push you out of target; then adjust ingredients, sequence (veggies first), or portion size—one tweak per cycle.

Consistency beats intensity. Small, sustained improvements in meal structure and carb quality compound into better overall control.`;
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
