/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  MARKDOWN RENDERER COMPONENT                                  ║
 * ║  Renders Markdown content with syntax highlighting              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Custom code block renderer with syntax highlighting
 */
function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: string;
}) {
  const isInline = !language && !children?.includes("\n");

  if (isInline) {
    return (
      <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-sm text-[#E11D48]">
        {children}
      </code>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[#E9ECEF]">
      {/* Language badge */}
      {language && (
        <div className="border-b border-[#2D2D2D] bg-[#1E1E1E] px-4 py-2">
          <span className="text-xs font-medium uppercase text-[#9CA3AF]">
            {language}
          </span>
        </div>
      )}
      
      {/* Code content */}
      <SyntaxHighlighter
        style={oneDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#1E1E1E",
          fontSize: "0.875rem",
          lineHeight: "1.7",
        }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Custom heading with anchor links
 */
function Heading({
  level,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const text = typeof children === "string" ? children : "";
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const className = {
    1: "text-3xl font-bold text-[#1A1A1A] mb-4 mt-8 scroll-mt-20",
    2: "text-2xl font-bold text-[#1A1A1A] mb-3 mt-8 scroll-mt-20",
    3: "text-xl font-semibold text-[#1A1A1A] mb-2 mt-6 scroll-mt-20",
    4: "text-lg font-semibold text-[#1A1A1A] mb-2 mt-4 scroll-mt-20",
    5: "text-base font-semibold text-[#1A1A1A] mb-2 mt-4 scroll-mt-20",
    6: "text-sm font-semibold text-[#1A1A1A] mb-2 mt-4 scroll-mt-20",
  }[level];

  return (
    <Tag id={id} className={className}>
      {children}
      {level <= 3 && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
          aria-hidden="true"
        >
          #
        </a>
      )}
    </Tag>
  );
}

/**
 * Custom link renderer
 */
function CustomLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const isExternal = href?.startsWith("http");
  
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text-[#4CAF50] underline decoration-[#4CAF50]/30 underline-offset-2 transition-colors hover:text-[#2F8E36] hover:decoration-[#2F8E36]"
    >
      {children}
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const components = useMemo(
    () => ({
      h1: ({ children }: { children: React.ReactNode }) => <Heading level={1}>{children}</Heading>,
      h2: ({ children }: { children: React.ReactNode }) => <Heading level={2}>{children}</Heading>,
      h3: ({ children }: { children: React.ReactNode }) => <Heading level={3}>{children}</Heading>,
      h4: ({ children }: { children: React.ReactNode }) => <Heading level={4}>{children}</Heading>,
      h5: ({ children }: { children: React.ReactNode }) => <Heading level={5}>{children}</Heading>,
      h6: ({ children }: { children: React.ReactNode }) => <Heading level={6}>{children}</Heading>,
      
      p: ({ children }: { children: React.ReactNode }) => (
        <p className="mb-4 leading-relaxed text-[#3D4852]">{children}</p>
      ),
      
      a: CustomLink,
      
      ul: ({ children }: { children: React.ReactNode }) => (
        <ul className="mb-4 list-disc space-y-2 pl-6 text-[#3D4852]">{children}</ul>
      ),
      ol: ({ children }: { children: React.ReactNode }) => (
        <ol className="mb-4 list-decimal space-y-2 pl-6 text-[#3D4852]">{children}</ol>
      ),
      li: ({ children }: { children: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
      ),
      
      blockquote: ({ children }: { children: React.ReactNode }) => (
        <blockquote className="my-6 border-l-4 border-[#4CAF50] bg-[#F3FAF3] py-4 pl-6 italic text-[#5F6B7A]">
          {children}
        </blockquote>
      ),
      
      code: CodeBlock as any,
      
      pre: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      
      hr: () => <hr className="my-8 border-[#E9ECEF]" />,
      
      table: ({ children }: { children: React.ReactNode }) => (
        <div className="my-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E9ECEF] border border-[#E9ECEF]">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }: { children: React.ReactNode }) => (
        <thead className="bg-[#F8FAFC]">{children}</thead>
      ),
      tbody: ({ children }: { children: React.ReactNode }) => (
        <tbody className="divide-y divide-[#E9ECEF]">{children}</tbody>
      ),
      tr: ({ children }: { children: React.ReactNode }) => (
        <tr className="hover:bg-[#F8FAFC]">{children}</tr>
      ),
      th: ({ children }: { children: React.ReactNode }) => (
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5F6B7A]">
          {children}
        </th>
      ),
      td: ({ children }: { children: React.ReactNode }) => (
        <td className="whitespace-nowrap px-4 py-3 text-sm text-[#3D4852]">
          {children}
        </td>
      ),
      
      img: ({ src, alt }: { src?: string; alt?: string }) => (
        <figure className="my-6">
          <img
            src={src}
            alt={alt || ""}
            className="w-full rounded-xl"
            loading="lazy"
          />
          {alt && (
            <figcaption className="mt-2 text-center text-sm text-[#7B8794]">
              {alt}
            </figcaption>
          )}
        </figure>
      ),
      
      // Video embed (YouTube, Vimeo)
      iframe: ({ src }: { src?: string }) => {
        if (!src) return null;
        return (
          <div className="my-6 aspect-video overflow-hidden rounded-xl border border-[#E9ECEF]">
            <iframe
              src={src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      },
    }),
    []
  );

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
