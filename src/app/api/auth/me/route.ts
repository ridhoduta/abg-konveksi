import { getSession } from "@/lib/session";

// GET /api/auth/me — Get current user info
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return Response.json(
        { message: "Belum login", data: null },
        { status: 401 }
      );
    }

    return Response.json({
      data: {
        userId: session.userId,
        username: session.username,
        role: session.role,
      },
    });
  } catch {
    return Response.json(
      { message: "Session tidak valid", data: null },
      { status: 401 }
    );
  }
}
