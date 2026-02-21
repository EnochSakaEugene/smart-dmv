// app/api/application/submit/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const META_KEY = "__META__";

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

function mergeStepData(steps: Array<{ stepKey: string; payload: any }>) {
  const merged: Record<string, any> = {};
  for (const s of steps) {
    if (s.stepKey === META_KEY) continue;
    const payload = s.payload as any;
    if (payload?.data && typeof payload.data === "object") {
      Object.assign(merged, payload.data);
    }
  }
  return merged;
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Optional: allow client to submit a specific draft id
    const body = await req.json().catch(() => ({} as any));
    const requestedApplicationId =
      typeof body?.applicationId === "string" && body.applicationId.trim()
        ? body.applicationId.trim()
        : null;

    const result = await prisma.$transaction(async (tx) => {
      // Pick a draft to submit:
      // - if applicationId provided, use it (must belong to user and be DRAFT)
      // - otherwise, submit the latest DRAFT
      const app = requestedApplicationId
        ? await tx.application.findFirst({
            where: { id: requestedApplicationId, userId, status: "DRAFT" },
            include: { steps: true },
          })
        : await tx.application.findFirst({
            where: { userId, status: "DRAFT" },
            orderBy: { updatedAt: "desc" },
            include: { steps: true },
          });

      if (!app) {
        return { ok: false as const, status: 404 as const, payload: { error: "No draft found" } };
      }

      // If already submitted somehow, block
      if (app.status !== "DRAFT") {
        return {
          ok: false as const,
          status: 409 as const,
          payload: { error: "Application is not a draft" },
        };
      }

      // Basic sanity: must have at least one saved step payload (non-meta)
      const nonMetaSteps = app.steps.filter((s) => s.stepKey !== META_KEY);
      if (nonMetaSteps.length === 0) {
        return {
          ok: false as const,
          status: 400 as const,
          payload: { error: "Draft has no saved data" },
        };
      }

      // Merge all saved step snapshots (handy for validation/logging/return)
      const mergedData = mergeStepData(app.steps);

      // Optional minimal validation (edit as you like)
      const required = ["email", "firstName", "lastName", "phone"] as const;
      const missing = required.filter((k) => !mergedData?.[k]);
      if (missing.length) {
        return {
          ok: false as const,
          status: 400 as const,
          payload: { error: "Missing required fields", missing },
        };
      }

      // Mark the application submitted
      await tx.application.update({
        where: { id: app.id },
        data: { status: "SUBMITTED" },
      });

      // Store submit meta (optional, but helpful)
      await tx.applicationStep.upsert({
        where: { applicationId_stepKey: { applicationId: app.id, stepKey: META_KEY } },
        create: {
          applicationId: app.id,
          stepKey: META_KEY,
          payload: { submittedAt: new Date().toISOString(), submittedBy: userId },
        },
        update: {
          payload: { submittedAt: new Date().toISOString(), submittedBy: userId },
        },
      });

      return {
        ok: true as const,
        status: 200 as const,
        payload: { ok: true, applicationId: app.id },
      };
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}