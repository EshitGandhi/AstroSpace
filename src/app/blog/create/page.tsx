"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Badge from "@/components/ui/Badge";
import { PenTool, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBlog() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin w-8 h-8 border-4 border-bhagva border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isLoaded && !userId) {
    router.push("/sign-in");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.title || !formData.content) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          content: formData.content,
        }),
      });

      if (!res.ok) throw new Error("Failed to post blog");

      const createdBlog = await res.json();
      toast.success("Blog published successfully!");
      router.push(`/blog/${createdBlog.slug}`);
    } catch {
      toast.error("Failed to publish blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-3xl mx-auto text-ink">
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-ink-muted hover:text-bhagva flex items-center gap-2 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>
      </div>

      <div className="text-center mb-12">
        <Badge>Write</Badge>
        <h1 className="text-4xl font-heading font-bold mb-4 mt-4 flex items-center justify-center gap-3">
          <PenTool className="w-8 h-8 text-bhagva" />
          Write an Entry
        </h1>
        <p className="text-ink-muted">Share your astrological findings with the universe.</p>
      </div>

      <GlassCard className="bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Display Name (Required)
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Author Name"
                className="w-full px-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Blog Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. The Impact of Mercury Retrograde"
              className="w-full px-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Content</label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your cosmic insights here..."
              className="w-full px-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors resize-y"
            />
          </div>

          <AnimatedButton type="submit" disabled={loading} className="w-full">
            {loading ? "Publishing..." : "Publish to the Stars"}
          </AnimatedButton>
        </form>
      </GlassCard>
    </div>
  );
}
