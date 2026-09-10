import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";
import { resources, type ContentBlock } from "@/content/resources";

export function generateStaticParams() {
  return resources.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = resources.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description
  };
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "p":
      return <p>{block.text}</p>;
    case "quote":
      return <blockquote>{block.text}</blockquote>;
    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
  }
}

export default function ResourcePostPage({ params }: { params: { slug: string } }) {
  const post = resources.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Talnt Staffing" },
    publisher: { "@type": "Organization", name: "Talnt Staffing" }
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <div className="article__meta">
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
          <span>&bull;</span>
          <span>{post.readMinutes} min read</span>
        </div>
      </section>

      <article className="article reveal">
        <div className="article__body">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
        {post.relatedIndustry && (
          <p className="mt-2">
            <Link href={post.relatedIndustry.href} className="accent font-semibold">
              {post.relatedIndustry.label} &rarr;
            </Link>
          </p>
        )}
      </article>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Ready to talk specifics?</h2>
          <p>Tell us what you need staffed and we&apos;ll follow up with a rate and next step.</p>
          <Link href="/contact" className="btn btn--primary">
            Get your rate
          </Link>
        </div>
      </section>
    </>
  );
}
