import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, name } = await req.json();

    if (!title || !content || !name) {
      return new NextResponse("Missing title, content or name", { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        slug,
        authorId: session.user.id,
        authorName: name,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("[BLOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("[BLOG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
