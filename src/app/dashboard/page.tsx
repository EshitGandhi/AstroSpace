import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, PenTool, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";

export default async function Dashboard() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { dateTime: "asc" },
  });

  const blogs = await prisma.blog.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-7xl mx-auto text-ink">
      <div className="mb-12">
        <Badge>Your Account</Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 mt-4">
          Your Cosmic Dashboard
        </h1>
        <p className="text-xl text-ink-muted">Welcome back, {session.user.name}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-gold" />
            <h2 className="text-2xl font-bold font-heading">Upcoming Consultations</h2>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-ink-muted mb-4">You have no upcoming consultations.</p>
                <Link href="/consultation" className="text-bhagva hover:underline font-medium">
                  Book a session &rarr;
                </Link>
              </GlassCard>
            ) : (
              bookings.map((booking: { id: string; serviceType: string; dateTime: Date }) => (
                <GlassCard key={booking.id} className="p-6">
                  <h3 className="font-bold text-lg mb-2">{booking.serviceType}</h3>
                  <div className="flex justify-between items-center text-sm text-ink-muted border-t border-ink/10 pt-4 mt-4">
                    <span>{format(booking.dateTime, "MMMM d, yyyy 'at' h:mm a")}</span>
                    <span className="px-3 py-1 bg-cream-tint rounded-full text-bhagva font-medium">
                      Confirmed
                    </span>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <PenTool className="w-6 h-6 text-bhagva" />
              <h2 className="text-2xl font-bold font-heading">Your Written Records</h2>
            </div>
            <Link
              href="/blog/create"
              className="text-sm font-medium text-ink-muted hover:text-bhagva flex items-center gap-1 transition-colors"
            >
              New Post <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {blogs.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-ink-muted mb-4">You haven&apos;t chronicled any insights yet.</p>
                <Link href="/blog/create" className="text-bhagva hover:underline font-medium">
                  Start writing &rarr;
                </Link>
              </GlassCard>
            ) : (
              blogs.map((blog: { id: string; slug: string; title: string; createdAt: Date }) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="block">
                  <GlassCard className="p-6 hover:border-bhagva/30 transition-colors">
                    <h3 className="font-bold text-lg mb-2 truncate">{blog.title}</h3>
                    <p className="text-sm text-ink-muted border-t border-ink/10 pt-4 mt-4">
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
