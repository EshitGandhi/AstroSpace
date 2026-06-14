"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { PenSquare, Calendar as CalendarIcon, User as UserIcon } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Badge from "@/components/ui/Badge";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export default function BlogListing() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .catch((err) => console.error("Failed to load blogs", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-7xl mx-auto text-ink">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div>
          <Badge>Cosmic Insights</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 mt-4">
            Cosmic Insights
          </h1>
          <p className="text-xl text-ink-muted">Read and share profound astrological revelations.</p>
        </div>
        <Link href="/blog/create">
          <AnimatedButton variant="primary">
            <PenSquare className="w-5 h-5 mr-2" /> Write a Post
          </AnimatedButton>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-cream-tint rounded-2xl h-80 border border-ink/10" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink/10">
          <p className="text-ink-muted text-lg">
            No cosmic insights have been shared yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link href={`/blog/${blog.slug}`}>
                <GlassCard className="h-full hover:border-bhagva/30 transition-colors flex flex-col group cursor-pointer bg-white">
                  <h2 className="text-2xl font-bold mb-4 group-hover:text-bhagva transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-ink-muted mb-6 line-clamp-3 flex-1">{blog.content}</p>
                  <div className="flex justify-between items-center text-sm text-ink-muted pt-4 border-t border-ink/10 mt-auto">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" /> {blog.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />{" "}
                      {format(new Date(blog.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
