import type { MetadataRoute } from "next";

const baseUrl = "https://talntstaffing.com";

const routes = ["", "/services", "/about", "/contact", "/faq", "/industries", "/industries/print-shops", "/industries/ecommerce"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
