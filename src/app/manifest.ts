import type { MetadataRoute } from "next";

// Lets employees add the time clock to their phone's home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Talnt Staffing Team",
    short_name: "Talnt Team",
    description: "Clock in, track your hours, and request time off.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#c15b2b",
    icons: [
      { src: "/app-icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
