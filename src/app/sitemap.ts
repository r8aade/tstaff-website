import type { MetadataRoute } from "next";
import { resources } from "@/content/resources";

const baseUrl = "https://talntstaffing.com";

const routes = [
  "",
  "/services",
  "/about",
  "/contact",
  "/faq",
  "/industries",
  "/industries/print-shops",
  "/industries/ecommerce",
  "/industries/real-estate",
  "/industries/professional-services",
  "/industries/healthcare",
  "/industries/construction",
  "/industries/marketing-agencies",
  "/industries/insurance",
  "/industries/back-office",
  "/resources"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7
  }));

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((post) => ({
    url: `${baseUrl}/resources/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6
  }));

  return [...staticRoutes, ...resourceRoutes];
}
