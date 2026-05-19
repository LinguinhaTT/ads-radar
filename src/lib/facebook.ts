const FB_API = "https://graph.facebook.com/v19.0/ads_archive";

const FIELDS = [
  "id",
  "page_name",
  "page_id",
  "ad_creative_body",
  "ad_creative_link_title",
  "ad_creative_link_description",
  "ad_snapshot_url",
  "ad_delivery_start_time",
  "ad_delivery_stop_time",
  "impressions",
  "spend",
  "currency",
].join(",");

function daysRunning(startTime?: string): number {
  if (!startTime) return 0;
  try {
    const start = new Date(startTime);
    return Math.floor((Date.now() - start.getTime()) / 86_400_000);
  } catch {
    return 0;
  }
}

export interface FbAd {
  id: string;
  pagina: string;
  pageId: string;
  titulo?: string;
  descricao?: string;
  texto?: string;
  ativoHaDias: number;
  inicio: string;
  impressoes?: { lower_bound: string; upper_bound?: string };
  gasto?: { lower_bound: string; upper_bound?: string };
  moeda?: string;
  snapshotUrl: string;
}

export async function searchScaledAds(params: {
  term: string;
  country?: string;
  minDays?: number;
  limit?: number;
}): Promise<FbAd[]> {
  const token = process.env.FB_ACCESS_TOKEN;
  if (!token) throw new Error("FB_ACCESS_TOKEN não configurado");

  const qs = new URLSearchParams({
    search_terms: params.term,
    ad_reached_countries: `['${params.country ?? "BR"}']`,
    ad_active_status: "ACTIVE",
    fields: FIELDS,
    limit: String(params.limit ?? 50),
    access_token: token,
  });

  const res = await fetch(`${FB_API}?${qs}`, { next: { revalidate: 0 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API error: ${err}`);
  }

  const data = await res.json();
  const ads: FbAd[] = [];

  for (const ad of data.data ?? []) {
    const dias = daysRunning(ad.ad_delivery_start_time);
    if (dias < (params.minDays ?? 30)) continue;
    ads.push({
      id: ad.id,
      pagina: ad.page_name ?? "—",
      pageId: ad.page_id ?? "",
      titulo: ad.ad_creative_link_title,
      descricao: ad.ad_creative_link_description,
      texto: ad.ad_creative_body,
      ativoHaDias: dias,
      inicio: ad.ad_delivery_start_time ?? "",
      impressoes: ad.impressions,
      gasto: ad.spend,
      moeda: ad.currency,
      snapshotUrl: ad.ad_snapshot_url ?? "",
    });
  }

  return ads.sort((a, b) => b.ativoHaDias - a.ativoHaDias);
}

export async function getPageAds(pageId: string): Promise<FbAd[]> {
  const token = process.env.FB_ACCESS_TOKEN;
  if (!token) throw new Error("FB_ACCESS_TOKEN não configurado");

  const qs = new URLSearchParams({
    search_page_ids: pageId,
    ad_active_status: "ACTIVE",
    fields: FIELDS,
    limit: "20",
    access_token: token,
  });

  const res = await fetch(`${FB_API}?${qs}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Facebook API error: ${await res.text()}`);

  const data = await res.json();
  return (data.data ?? []).map((ad: Record<string, unknown>) => ({
    id: ad.id,
    pagina: ad.page_name ?? "—",
    pageId: ad.page_id ?? pageId,
    titulo: ad.ad_creative_link_title,
    descricao: ad.ad_creative_link_description,
    texto: ad.ad_creative_body,
    ativoHaDias: daysRunning(ad.ad_delivery_start_time as string),
    inicio: ad.ad_delivery_start_time ?? "",
    impressoes: ad.impressions,
    snapshotUrl: ad.ad_snapshot_url ?? "",
  }));
}
