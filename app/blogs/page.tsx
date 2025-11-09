"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { posts as allPosts } from "./posts";

export default function Blogs() {
  // Centralized posts data imported; allow for future filtering/search.
  const posts = allPosts;

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
              <Link href={`/blogs/${post.slug}`} onClick={(e) => e.stopPropagation()} aria-label={`Read ${post.title}`}>
                <div className="h-48 w-full overflow-hidden group">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = "true";
                        target.src = "/placeholder.svg";
                      }
                    }}
                  />
                </div>
              </Link>

              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  <Link href={`/blogs/${post.slug}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500 mt-1">{post.date}</p>

                <p className="mt-4 text-gray-700">{post.excerpt}</p>

                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/blogs/${post.slug}`} className="text-sm font-medium text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                    Read →
                  </Link>
                  {post.imageCredit && (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-gray-500 hover:text-gray-700"
                    >
                      Image source
                    </a>
                  )}
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
              <a
                href={openPost.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-64 w-full overflow-hidden block group"
              >
                <img
                  src={openPost.image || "/placeholder.svg"}
                  alt={openPost.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = "true";
                      target.src = "/placeholder.svg";
                    }
                  }}
                />
              </a>

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

                <div className="mt-6 flex items-center justify-between">
                  {openPost.imageCredit && (
                    <span className="text-[11px] text-gray-500">{openPost.imageCredit}</span>
                  )}
                  <Link
                    href={`/blogs/${openPost.slug}`}
                    className="inline-block text-sm font-medium text-blue-600 hover:underline"
                    onClick={() => setOpenPost(null)}
                  >
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
