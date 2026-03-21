import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const payload = verifySession(token);
    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json(
        {
          hasApplication: false,
          hasDraft: false,
          formSubmitted: false,
          applicationId: null,
          status: null,
        },
        { status: 200 }
      );
    }

    const latestApplication = await prisma.application.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        status: true,
      },
    });

    if (!latestApplication) {
      return NextResponse.json(
        {
          hasApplication: false,
          hasDraft: false,
          formSubmitted: false,
          applicationId: null,
          status: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        hasApplication: true,
        hasDraft: latestApplication.status === "DRAFT",
        formSubmitted: latestApplication.status === "SUBMITTED",
        applicationId: latestApplication.id,
        status: latestApplication.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("application status error:", error);
    return NextResponse.json(
      {
        hasApplication: false,
        hasDraft: false,
        formSubmitted: false,
        applicationId: null,
        status: null,
      },
      { status: 200 }
    );
  }
}