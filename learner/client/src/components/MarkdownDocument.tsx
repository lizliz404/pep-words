import { Fragment, useMemo } from "react";

type MarkdownBlock =
  | {
      type: "heading-1" | "heading-2";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "ordered-list";
      start: number;
      items: string[];
    }
  | {
      type: "table";
      header: string[];
      rows: string[][];
    };

interface MarkdownDocumentProps {
  badge: string;
  title: string;
  description: string;
  markdown: string;
}

function isTableDivider(line: string) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function splitTableRow(line: string) {
  return line
    .trim()
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({
        type: "heading-1",
        text: line.slice(2).trim(),
      });
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({
        type: "heading-2",
        text: line.slice(3).trim(),
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      const start = Number(line.match(/^(\d+)\./)?.[1] ?? "1");
      let cursor = index;

      while (cursor < lines.length) {
        const listLine = lines[cursor].trim();
        const itemMatch = listLine.match(/^\d+\.\s+(.*)$/);

        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1].trim());
        cursor += 1;
      }

      blocks.push({
        type: "ordered-list",
        start,
        items,
      });
      index = cursor - 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      let cursor = index;

      while (cursor < lines.length) {
        const tableLine = lines[cursor].trim();

        if (!tableLine.startsWith("|")) {
          break;
        }

        tableLines.push(tableLine);
        cursor += 1;
      }

      const [headerLine, ...restLines] = tableLines;
      const rows = restLines.filter((tableLine) => !isTableDivider(tableLine));

      blocks.push({
        type: "table",
        header: splitTableRow(headerLine),
        rows: rows.map(splitTableRow),
      });
      index = cursor - 1;
      continue;
    }

    const paragraphLines = [line];
    let cursor = index + 1;

    while (cursor < lines.length) {
      const nextLine = lines[cursor].trim();

      if (
        !nextLine ||
        nextLine.startsWith("# ") ||
        nextLine.startsWith("## ") ||
        nextLine.startsWith("|") ||
        /^\d+\.\s+/.test(nextLine)
      ) {
        break;
      }

      paragraphLines.push(nextLine);
      cursor += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    index = cursor - 1;
  }

  return blocks;
}

function renderInline(text: string) {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((segment, index) => {
      if (segment.startsWith("**") && segment.endsWith("**")) {
        return <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>;
      }

      if (segment.startsWith("`") && segment.endsWith("`")) {
        return <code key={`${segment}-${index}`}>{segment.slice(1, -1)}</code>;
      }

      if (segment.startsWith("*") && segment.endsWith("*")) {
        return <em key={`${segment}-${index}`}>{segment.slice(1, -1)}</em>;
      }

      return <Fragment key={`${segment}-${index}`}>{segment}</Fragment>;
    });
}

export default function MarkdownDocument({
  badge,
  title,
  description,
  markdown,
}: MarkdownDocumentProps) {
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_72px_-52px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
        <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
          {badge}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      </header>

      <article className="markdown-body rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_72px_-56px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8 lg:p-10">
        {blocks.map((block, index) => {
          if (block.type === "heading-1") {
            return (
              <h1 key={`${block.type}-${index}`} className="markdown-h1">
                {block.text}
              </h1>
            );
          }

          if (block.type === "heading-2") {
            return (
              <h2 key={`${block.type}-${index}`} className="markdown-h2">
                {block.text}
              </h2>
            );
          }

          if (block.type === "paragraph") {
            return (
              <p key={`${block.type}-${index}`} className="markdown-paragraph">
                {renderInline(block.text)}
              </p>
            );
          }

          if (block.type === "ordered-list") {
            return (
              <ol
                key={`${block.type}-${index}`}
                start={block.start}
                className="markdown-list"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`} className="markdown-list-item">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          }

          if (block.type === "table") {
            return (
              <div key={`${block.type}-${index}`} className="markdown-table-wrap">
                <table className="markdown-table">
                  <thead>
                    <tr>
                      {block.header.map((cell: string, cellIndex: number) => (
                        <th key={`${cell}-${cellIndex}`}>{renderInline(cell)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row: string[], rowIndex: number) => (
                      <tr key={`${row.join("|")}-${rowIndex}`}>
                        {row.map((cell: string, cellIndex: number) => (
                          <td key={`${cell}-${cellIndex}`}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return null;
        })}
      </article>
    </section>
  );
}
