import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, PenTool, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

// Server Component
export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user specific data
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { dateTime: "asc" }
  });

  const blogs = await prisma.blog.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-glow">Your Cosmic Dashboard</h1>
        <p className="text-xl text-gray-300">Manage your astrological journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Bookings Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-accent-blue" />
            <h2 className="text-2xl font-bold">Upcoming Consultations</h2>
          </div>
          
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-gray-400 mb-4">You have no upcoming consultations.</p>
                <Link href="/booking" className="text-accent-pink hover:underline">Book a session &rarr;</Link>
              </GlassCard>
            ) : (
              bookings.map(booking => (
                <GlassCard key={booking.id} className="p-6">
                  <h3 className="font-bold text-lg mb-2">{booking.serviceType}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4 mt-4">
                    <span>{format(booking.dateTime, "MMMM d, yyyy 'at' h:mm a")}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full">Confirmed</span>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </section>

        {/* Blogs Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <PenTool className="w-6 h-6 text-accent-pink" />
              <h2 className="text-2xl font-bold">Your Written Records</h2>
            </div>
            <Link href="/blog/create" className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-1 transition-colors">
              New Post <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {blogs.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-gray-400 mb-4">You haven't chronicled any insights yet.</p>
                <Link href="/blog/create" className="text-accent-blue hover:underline">Start writing &rarr;</Link>
              </GlassCard>
            ) : (
              blogs.map(blog => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="block">
                  <GlassCard className="p-6 hover:border-accent-pink/50 transition-colors">
                    <h3 className="font-bold text-lg mb-2 truncate">{blog.title}</h3>
                    <p className="text-sm text-gray-400 border-t border-white/10 pt-4 mt-4">
                      Published {format(blog.createdAt, "MMM d, yyyy")}
                    </p>
                  </GlassCard>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
