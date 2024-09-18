import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  {
    params: { postId, commentId },
  }: { params: { postId: string; commentId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.commentLike.upsert({
      where: {
        userId_commentId: {
          userId: loggedInUser.id,
          commentId,
        },
      },
      create: {
        userId: loggedInUser.id,
        commentId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params: { postId, commentId },
  }: { params: { postId: string; commentId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.commentLike.deleteMany({
      where: {
        userId: loggedInUser.id,
        commentId,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
