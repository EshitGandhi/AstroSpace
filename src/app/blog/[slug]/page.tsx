"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ArrowLeft, User as UserIcon, Calendar, MessageSquare } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";

type Comment = {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
};

type Blog = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  comments: Comment[];
};

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => setBlog(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return;

    setPostingComment(true);
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: commentName, text: commentText })
      });

      if (!res.ok) throw new Error("Failed to post");

      const newComment = await res.json();
      setBlog(prev => prev ? { ...prev, comments: [newComment, ...prev.comments] } : null);
      setCommentText("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-16 w-3/4 bg-white/10 rounded" />
          <div className="h-8 w-1/2 bg-white/10 rounded" />
          <div className="h-96 w-full bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-24 px-6 max-w-4xl mx-auto min-h-screen text-center">
        <h1 className="text-4xl font-heading font-bold mb-4">Blog Not Found</h1>
        <p className="text-gray-400 mb-8">The cosmic insight you are looking for has drifted into a black hole.</p>
        <Link href="/blog"><AnimatedButton>Return to Blogs</AnimatedButton></Link>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="mb-12">
        <Link href="/blog" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">{blog.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-gray-400 border-b border-white/10 pb-8">
          <span className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-accent-pink" /> {blog.authorName}</span>
          <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-accent-blue" /> {format(new Date(blog.createdAt), "MMMM d, yyyy")}</span>
          <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-accent-gold" /> {blog.comments.length} Comments</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none mb-16">
        <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </p>
      </div>

      <div className="border-t border-white/10 pt-12">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-accent-blue" />
          Comments
        </h2>

        <GlassCard className="mb-12">
          <h3 className="text-lg font-bold mb-4">Leave a Reply</h3>
          <form onSubmit={handleComment} className="space-y-4">
            <div>
              <input 
                type="text" 
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-[#080b14]/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue transition-colors max-w-sm"
              />
            </div>
            <div>
              <textarea 
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-[#080b14]/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <AnimatedButton type="submit" variant="secondary" size="sm" disabled={postingComment}>
              {postingComment ? "Posting..." : "Post Comment"}
            </AnimatedButton>
          </form>
        </GlassCard>

        <div className="space-y-6">
          {blog.comments.length === 0 ? (
            <p className="text-gray-500 italic">No comments yet. Be the first to share your cosmic thoughts.</p>
          ) : (
            blog.comments.map(comment => (
              <div key={comment.id} className="bg-white/5 p-6 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-accent-pink">{comment.authorName}</h4>
                  <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), "MMM d, yyyy")}</span>
                </div>
                <p className="text-gray-300">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
