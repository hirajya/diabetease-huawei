import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { posts, getPost } from "../posts";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) return { title: "Blog Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : [],
      type: "article",
    },
  };
}

export default function BlogDetail({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blogs" className="text-sm text-blue-600 hover:underline">← Back to Blogs</Link>
        <article className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          {post.image && (
            <div className="relative w-full h-72 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = "true";
                    target.src = "/placeholder.svg";
                  }
                }}
              />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{post.date}</p>
            {post.imageCredit && (
              <div className="mt-2 text-[11px] text-gray-500">{post.imageCredit}</div>
            )}
            <div className="prose prose-gray max-w-none mt-6">
              {post.content.split(/\n\n+/).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between">
              <Link href="/blogs" className="text-sm font-medium text-blue-600 hover:underline">Back to list</Link>
              {post.sourceUrl && (
                <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700">Image source</a>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
