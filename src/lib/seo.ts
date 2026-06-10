import type { Metadata } from "next";

const SITE_URL = "https://www.zynd.ai";
const SITE_NAME = "ZyndAI";
const OG_IMAGE = "/assets/images/zyndai-og.png";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  imageAlt?: string;
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const url = `${SITE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const alt = input.imageAlt ?? `${input.title} — ${SITE_NAME}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE_NAME,
      type: input.type ?? "website",
      locale: "en_US",
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [OG_IMAGE],
      creator: "@ZyndAI",
      site: "@ZyndAI",
    },
  };
}
