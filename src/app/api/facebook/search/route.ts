import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchScaledAds } from "@/lib/facebook";
import { db } from "@/lib/db";
import { PLAN_LIMITS, PlanKey } from "@/lib/plans";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const plan = (session.user.plan ?? "FREE") as PlanKey;
  const limit = PLAN_LIMITS[plan];

  // Check daily limit
  const todayStart = startOfDay(new Date());
  const todayCount = await db.search.count({
    where: { userId: session.user.id, createdAt: { gte: todayStart } },
  });
  if (todayCount >= limit.searchesPerDay) {
    return NextResponse.json(
      { error: `Limite diário de ${limit.searchesPerDay} buscas atingido. Faça upgrade do plano.` },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term");
  if (!term) return NextResponse.json({ error: "Parâmetro 'term' obrigatório" }, { status: 400 });

  const country = searchParams.get("country") ?? "BR";
  const minDays = parseInt(searchParams.get("minDays") ?? "30");

  const ads = await searchScaledAds({ term, country, minDays });

  await db.search.create({
    data: {
      userId: session.user.id,
      term,
      country,
      minDays,
      resultsJson: ads as unknown as object[],
      totalFound: ads.length,
    },
  });

  return NextResponse.json({ ads, total: ads.length });
}
