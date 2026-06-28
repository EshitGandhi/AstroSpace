import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/services/notification";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.user.id, 30),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Get notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await markAllAsRead(session.user.id);
    } else if (notificationId) {
      await markAsRead(notificationId, session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mark notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
