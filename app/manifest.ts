import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name:             "GodSpeaks",
        short_name:       "GodSpeaks",
        description:      "Generate stunning AI spiritual images from random Bible and Quran verses.",
        start_url:        "/",
        display:          "standalone",
        background_color: "#0C0906",
        theme_color:      "#C8A45A",
        orientation:      "portrait",
        categories:       ["entertainment", "lifestyle", "spirituality"],
        icons: [
            { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
            // TODO: add icon-192.png, icon-512.png, apple-touch-icon.png to public/ for full PWA support
        ],
    };
}
