import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id, ...(collection ? { collection } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { adId, adData, collection } = await req.json();
  if (!adId || !adData) return NextResponse.json({ error: "adId e adData obrigatórios" }, { status: 400 });

  const fav = await db.favorite.upsert({
    where: { userId_adId: { userId: session.user.id, adId } },
    create: { userId: session.user.id, adId, adDataJson: adData, collection: collection ?? "Geral" },
    update: { collection: collection ?? "Geral" },
  });

  return NextResponse.json({ favorite: fav });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { adId } = await req.json();
  await db.favorite.deleteMany({ where: { userId: session.user.id, adId } });
  return NextResponse.json({ ok: true });
}
