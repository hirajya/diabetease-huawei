"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Blogs() {
  const posts = [
    {
      slug: "managing-diabetes-basics",
      title: "Managing Diabetes: The Basics",
      date: "2025-10-20",
      excerpt:
        "Practical tips to help you start monitoring your blood glucose, set goals, and establish routines that stick.",
      content:
        "This article covers the fundamentals of monitoring blood glucose, setting achievable goals, and building daily routines that make tracking sustainable. We'll cover glucometers, logging, and small habit changes that compound over time.",
      // use local image for consistent preview
      image: "/blogs/managing-diabetes-basics.svg",
    },
    {
      slug: "nutrition-for-better-control",
      title: "Nutrition for Better Control",
      date: "2025-10-28",
      excerpt:
        "Learn how to read food labels, balance carbs, and plan meals to keep blood sugar steady throughout the day.",
      content:
        "Nutrition plays a huge role in blood sugar control. This post walks through label-reading, portion strategies, practical meal ideas, and how to balance carbohydrates with protein and fiber.",
      // use local image for consistent preview
      image: "/blogs/nutrition-for-better-control.svg",
    },
    {
      slug: "exercise-and-diabetes",
      title: "Exercise and Diabetes: What to Know",
      date: "2025-11-02",
      excerpt: "Simple, safe exercise routines and tips to help you manage glucose and improve overall health.",
      content:
        "Regular activity can improve insulin sensitivity and overall wellbeing. This article outlines safe routines, how to check glucose around exercise, and practical tips to stay consistent.",
      // use local image for consistent preview
      image: "/blogs/exercise-and-diabetes.svg",
    },
  ];

  const [openPost, setOpenPost] = useState<(typeof posts)[number] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPost(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-2">Articles, tips, and guides to help you manage diabetes confidently.</p>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => setOpenPost(post)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setOpenPost(post)}
            >
              <div className="h-48 w-full overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  <Link href={`/blogs/${post.slug}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500 mt-1">{post.date}</p>

                <p className="mt-4 text-gray-700">{post.excerpt}</p>

                <div className="mt-4">
                  <Link href={`/blogs/${post.slug}`} className="text-sm font-medium text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </main>

        {/* Modal */}
        {openPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpenPost(null)} />

            <div className="relative z-10 max-w-3xl w-full mx-4 bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="h-64 w-full overflow-hidden">
                <img src={openPost.image} alt={openPost.title} className="w-full h-full object-cover" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{openPost.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{openPost.date}</p>
                  </div>
                  <button
                    onClick={() => setOpenPost(null)}
                    className="text-gray-500 hover:text-gray-700 ml-4 text-sm"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 text-gray-700">{openPost.content || openPost.excerpt}</div>

                <div className="mt-6 text-right">
                  <Link href={`/blogs/${openPost.slug}`} className="inline-block text-sm font-medium text-blue-600 hover:underline" onClick={() => setOpenPost(null)}>
                    Read full post →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
