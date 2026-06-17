import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public site settings (no secrets). Used by the footer, disclosure, and
// affiliate redirect logic. Returns only non-sensitive fields.
export async function GET() {
  const s = await db.siteSetting.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    settings: {
      amazonAssociateTag: s?.amazonAssociateTag ?? "",
      amazonBaseUrl: s?.amazonBaseUrl ?? "https://www.amazon.com",
      siteName: s?.siteName ?? "ShopAffiliate",
      contactEmail: s?.contactEmail ?? "",
      disclosureOverride: s?.disclosureOverride ?? "",
      socialTwitter: s?.socialTwitter ?? null,
      socialInstagram: s?.socialInstagram ?? null,
      socialYoutube: s?.socialYoutube ?? null,
      socialGithub: s?.socialGithub ?? null,
    },
  });
}
