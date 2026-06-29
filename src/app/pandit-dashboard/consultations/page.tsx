import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ConsultationsClient from "./ConsultationsClient";

export default async function PanditConsultationsPage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  return <ConsultationsClient />;
}
