import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://godspeaks.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/"],   // keep API routes out of search index
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
