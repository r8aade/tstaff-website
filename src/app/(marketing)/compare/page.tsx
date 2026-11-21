import type { Metadata } from "next";
import Link from "next/link";
import ArticleBlock from "@/components/ArticleBlock";
import HomeScripts from "@/components/HomeScripts";
import { compareHub } from "@/content/comparisons";

export const metadata: Metadata = {
  title: compareHub.seoTitle,
  description: compareHub.description,
  alternates: { canonical: "/compare" }
};

export default function ComparePage() {
  return (
    <>
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">Compare</p>
        <h1>
          Virtual assistant companies, <span className="accent">side by side</span>
        </h1>
        <p className="page-hero__lead">{compareHub.description}</p>
      </section>

      <article className="article reveal">
        <div className="article__body">
          {compareHub.body.map((block, i) => (
            <ArticleBlock key={i} block={block} />
          ))}
        </div>
      </article>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Ready for your exact rate?</h2>
          <p>Tell us what you need staffed and we&apos;ll reply with a number and next step.</p>
          <Link href="/contact" className="btn btn--primary">
            Get your exact rate
          </Link>
        </div>
      </section>
    </>
  );
}
