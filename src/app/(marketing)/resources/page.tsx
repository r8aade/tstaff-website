import type { Metadata } from "next";
import Link from "next/link";
import HomeScripts from "@/components/HomeScripts";
import { resources } from "@/content/resources";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides on hiring, pricing, and managing outsourced staff — hourly rates, staffing agencies vs. freelance marketplaces, sourcing regions, and industry-specific playbooks."
};

export default function ResourcesPage() {
  const sorted = [...resources].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <>
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">Resources</p>
        <h1>
          Straight answers on hiring and <span className="accent">outsourcing</span>
        </h1>
        <p className="page-hero__lead">
          Practical guides on pricing, sourcing, and managing outsourced staff — written for
          small business owners doing this for the first time, not for BPO industry insiders.
        </p>
      </section>

      <section className="resources-grid reveal">
        {sorted.map((post) => (
          <Link key={post.slug} href={`/resources/${post.slug}`} className="resource-card">
            <div className="resource-card__meta">
              <span>{post.category}</span>
              <span>&bull;</span>
              <span>{post.readMinutes} min read</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
