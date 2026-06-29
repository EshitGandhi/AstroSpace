import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const [consultations, pendingPandits, stats] = await Promise.all([
    prisma.consultation.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        pandit: { select: { displayName: true } },
      },
    }),
    prisma.astrologerProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      take: 20,
    }),
    prisma.consultation.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  return (
    <AdminClient
      consultations={JSON.parse(JSON.stringify(consultations))}
      pendingPandits={JSON.parse(JSON.stringify(pendingPandits))}
      stats={stats.map((s) => ({ status: s.status, count: s._count.id }))}
    />
  );
}
