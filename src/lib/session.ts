import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Shorthand for server components and API routes.
 * Returns the NextAuth session, or null if not authenticated.
 */
export const getSession = () => getServerSession(authOptions);
