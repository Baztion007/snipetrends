import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeString, isSafeUrl } from "@/lib/validate";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await db.siteSetting.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    settings: {
      amazonAssociateTag: s?.amazonAssociateTag ?? "",
      amazonBaseUrl: s?.amazonBaseUrl ?? "https://www.amazon.com",
      siteName: s?.siteName ?? "ShopAffiliate",
      contactEmail: s?.contactEmail ?? "",
      disclosureOverride: s?.disclosureOverride ?? "",
      socialTwitter: s?.socialTwitter ?? "",
      socialInstagram: s?.socialInstagram ?? "",
      socialYoutube: s?.socialYoutube ?? "",
      socialGithub: s?.socialGithub ?? "",
    },
  });
}

export async function PUT(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const amazonAssociateTag = sanitizeString(body?.amazonAssociateTag, 50);
    const amazonBaseUrl = isSafeUrl(body?.amazonBaseUrl)
      ? body.amazonBaseUrl
      : "https://www.amazon.com";
    const siteName = sanitizeString(body?.siteName, 100);
    const contactEmail = sanitizeString(body?.contactEmail, 200);
    const disclosureOverride = sanitizeString(body?.disclosureOverride, 2000);
    const socialTwitter = sanitizeString(body?.socialTwitter, 300);
    const socialInstagram = sanitizeString(body?.socialInstagram, 300);
    const socialYoutube = sanitizeString(body?.socialYoutube, 300);
    const socialGithub = sanitizeString(body?.socialGithub, 300);

    const updated = await db.siteSetting.upsert({
      where: { id: "singleton" },
      update: {
        amazonAssociateTag,
        amazonBaseUrl,
        siteName: siteName || "ShopAffiliate",
        contactEmail,
        disclosureOverride: disclosureOverride || null,
        socialTwitter: socialTwitter || null,
        socialInstagram: socialInstagram || null,
        socialYoutube: socialYoutube || null,
        socialGithub: socialGithub || null,
      },
      create: {
        id: "singleton",
        amazonAssociateTag,
        amazonBaseUrl,
        siteName: siteName || "ShopAffiliate",
        contactEmail,
        disclosureOverride: disclosureOverride || null,
        socialTwitter: socialTwitter || null,
        socialInstagram: socialInstagram || null,
        socialYoutube: socialYoutube || null,
        socialGithub: socialGithub || null,
      },
    });

    return NextResponse.json({ ok: true, settings: updated });
  } catch (e) {
    console.error("[admin/settings PUT]", e);
    return NextResponse.json(
      { error: "Failed to save settings." },
      { status: 500 }
    );
  }
}
