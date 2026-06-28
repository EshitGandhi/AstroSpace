import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function ChatMenuPage() {
  const session = await getSession();
  if (session?.user?.role === "ASTROLOGER") {
    redirect("/pandit-dashboard/consultations");
  } else {
    redirect("/dashboard/consultations");
  }
}
