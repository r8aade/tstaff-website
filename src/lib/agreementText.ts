// Agreement body format, safe to use in the browser (no database imports).

/** Splits a body into blocks for display: headings, bullet lists, paragraphs. */
export type Block = { kind: "h"; text: string } | { kind: "p"; text: string } | { kind: "ul"; items: string[] };

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    if (list.length) blocks.push({ kind: "ul", items: list });
    para = [];
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) flush();
    else if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "h", text: line.slice(3).trim() });
    } else if (/^[-*] /.test(line)) {
      if (para.length) {
        blocks.push({ kind: "p", text: para.join(" ") });
        para = [];
      }
      list.push(line.slice(2).trim());
    } else {
      if (list.length) {
        blocks.push({ kind: "ul", items: list });
        list = [];
      }
      para.push(line);
    }
  }
  flush();
  return blocks;
}
