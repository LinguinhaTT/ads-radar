import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPageAds } from "@/lib/facebook";
import { PLAN_LIMITS, PlanKey } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const monitors = await db.monitor.findMany({
    where: { userId: session.user.id },
    include: { alerts: { where: { seen: false }, orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ monitors });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const plan = (session.user.plan ?? "FREE") as PlanKey;
  const maxMonitors = PLAN_LIMITS[plan].monitors;

  const count = await db.monitor.count({ where: { userId: session.user.id } });
  if (count >= maxMonitors) {
    return NextResponse.json(
      { error: `Limite de ${maxMonitors} monitores no plano ${plan}. Faça upgrade.` },
      { status: 429 }
    );
  }

  const { pageId, pageName } = await req.json();
  if (!pageId) return NextResponse.json({ error: "pageId obrigatório" }, { status: 400 });

  const monitor = await db.monitor.upsert({
    where: { userId_pageId: { userId: session.user.id, pageId } },
    create: { userId: session.user.id, pageId, pageName: pageName ?? pageId },
    update: { active: true },
  });

  // Fetch current ads as baseline
  try {
    const ads = await getPageAds(pageId);
    await db.monitor.update({ where: { id: monitor.id }, data: { lastCheck: new Date() } });

    for (const ad of ads) {
      await db.monitorAlert.upsert({
        where: { id: `${monitor.id}-${ad.id}` },
        create: { id: `${monitor.id}-${ad.id}`, monitorId: monitor.id, adId: ad.id, adDataJson: ad as unknown as object },
        update: {},
      }).catch(() => {
        // ignore unique constraint on re-add
      });
    }
  } catch {
    // non-fatal
  }

  return NextResponse.json({ monitor });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await req.json();
  await db.monitor.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
