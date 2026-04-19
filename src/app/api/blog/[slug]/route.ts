import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: params.slug },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!blog) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(blog);
  } catch (error) {
    console.error("[BLOG_SLUG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
