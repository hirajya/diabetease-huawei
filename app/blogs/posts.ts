export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO or readable date
  excerpt: string;
  content: string;
  image?: string;
  imageCredit?: string;
  sourceUrl?: string;
}

export const posts: BlogPost[] = [
  {
    slug: "nutrition-for-better-control",
    title: "Nutrition for Better Control",
    date: "2025-10-28",
    excerpt: "Learn how to read food labels, balance carbs, and plan meals to keep blood sugar steady throughout the day.",
    content: "Nutrition plays a huge role in blood sugar control. This post walks through label-reading, portion strategies, practical meal ideas, and how to balance carbohydrates with protein and fiber.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60",
    imageCredit: "Photo: Unsplash - @ellaolsson",
    sourceUrl: "https://unsplash.com/photos/oPBjWBCcAEo",
  },
  {
    slug: "exercise-and-diabetes",
    title: "Exercise and Diabetes: What to Know",
    date: "2025-11-02",
    excerpt: "Simple, safe exercise routines and tips to help you manage glucose and improve overall health.",
    content: "Regular activity can improve insulin sensitivity and overall wellbeing. This article outlines safe routines, how to check glucose around exercise, and practical tips to stay consistent.",
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=60",
    imageCredit: "Photo: Unsplash - @boxedwater",
    sourceUrl: "https://unsplash.com/photos/sWMNrjFiJNA",
  },
  // Replacement blogs
  {
    slug: "budget-meal-planning",
    title: "Budget-Friendly Meal Planning for Stable Glucose",
    date: "2025-11-10",
    excerpt: "Eat well without overspending—simple PH-friendly staples, label tips, and batch-cook ideas.",
    content: "Healthy doesn't have to be pricey. Build meals around budget-friendly staples like brown rice, monggo, tofu, itlog, and seasonal gulay.\n\nUse the plate method: half non-starchy vegetables, a quarter lean protein, a quarter smart carbs. Compare per-serving cost, not sticker price—bulk sacks often win.\n\nBatch-cook proteins and freeze single portions. Pre-cook rice and cool it for lower glycemic impact (resistant starch), then reheat. Read labels: aim for more fiber, less added sugar, and moderate sodium.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
    imageCredit: "Photo: Unsplash - @ellaolsson",
    sourceUrl: "https://unsplash.com/photos/1uW6UjS65tg",
  },
  {
    slug: "foot-care-essentials",
    title: "Foot Care Essentials to Prevent Complications",
    date: "2025-11-10",
    excerpt: "Daily checks, proper footwear, and when to see a professional.",
    content: "Nerve and circulation changes raise foot risk. Check your feet daily for cuts, blisters, redness, or swelling. Wash and dry thoroughly—especially between toes. Moisturize heels (not between toes).\n\nChoose well-fitting shoes with room in the toe box; avoid walking barefoot. Trim nails straight across. If you notice wounds that don't heal, color changes, or numbness, consult your provider or a podiatrist early.",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&auto=format&fit=crop&q=60",
    imageCredit: "Photo: Unsplash - @the_compare",
    sourceUrl: "https://unsplash.com/photos/ZVprbBmT8QA",
  },
  {
    slug: "stress-and-blood-glucose",
    title: "Stress and Blood Glucose: Practical Ways to Cope",
    date: "2025-11-10",
    excerpt: "How stress hormones affect glucose and daily strategies that actually help.",
    content: "Stress hormones like cortisol can push glucose up even without food. Track your readings during busy days to see patterns.\n\nTry short, practical tools: 3-minute box breathing, a 10-minute walk after meals, or a quick stretch break each hour. Protect sleep—consistent bedtimes and a dark, cool room improve insulin sensitivity.\n\nWhen stress is chronic, discuss adjustments with your care team rather than chasing readings day-to-day.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60",
    imageCredit: "Photo: Unsplash - @leslyjuarez",
    sourceUrl: "https://unsplash.com/photos/dDwFfRaYw7I",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug);
}
