import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, name } = await req.json();

    if (!title || !content || !name) {
      return new NextResponse("Missing title, content or name", { status: 400 });
    }

    // simplistic slug generation
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        slug,
        authorId: userId,
        authorName: name,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("[BLOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
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
