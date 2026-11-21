import Link from "next/link";
import type { ContentBlock } from "@/content/resources";

export default function ArticleBlock({ block }: { block: ContentBlock }) {
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
    case "table":
      return (
        <figure className="article-table">
          <div className="article-table__scroll" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  {block.head.map((h, i) => (
                    <th key={i} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={c}>{cell}</td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && <figcaption>{block.note}</figcaption>}
        </figure>
      );
    case "links":
      return (
        <ul className="article-links">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="accent font-semibold">
                {item.label} &rarr;
              </Link>
            </li>
          ))}
        </ul>
      );
  }
}
