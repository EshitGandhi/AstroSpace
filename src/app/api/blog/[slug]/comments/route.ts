import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { text, authorName } = await req.json();

    if (!text || !authorName) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { slug: params.slug },
    });

    if (!blog) {
      return new NextResponse("Blog not found", { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        authorName,
        blogId: blog.id,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
