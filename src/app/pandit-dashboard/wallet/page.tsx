import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import WalletClient from "./WalletClient";

export default async function AstrologerWalletPage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  return <WalletClient />;
}
