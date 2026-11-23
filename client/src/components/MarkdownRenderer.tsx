import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Custom components for rendering markdown with LaunchLens styling.
 * Uses semantic tokens and the project's color palette.
 */
const components: Components = {
  h1: ({ children, className, ...rest }) => (
    <h1
      className={cn(
        'mb-4 mt-6 text-2xl font-bold text-[#171717] first:mt-0',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_309b"
      {...rest}>
      {children}
    </h1>
  ),
  h2: ({ children, className, ...rest }) => (
    <h2
      className={cn(
        'mb-3 mt-5 text-xl font-semibold text-[#171717] first:mt-0',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_f27e"
      {...rest}>
      {children}
    </h2>
  ),
  h3: ({ children, className, ...rest }) => (
    <h3
      className={cn(
        'mb-2 mt-4 text-lg font-semibold text-[#171717] first:mt-0',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_5890"
      {...rest}>
      {children}
    </h3>
  ),
  h4: ({ children, className, ...rest }) => (
    <h4
      className={cn(
        'mb-2 mt-3 text-base font-semibold text-[#171717] first:mt-0',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_9a0f"
      {...rest}>
      {children}
    </h4>
  ),
  p: ({ children, className, ...rest }) => (
    <p
      className={cn('mb-3 leading-relaxed text-foreground last:mb-0', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_310f"
      {...rest}>
      {children}
    </p>
  ),
  strong: ({ children, className, ...rest }) => (
    <strong
      className={cn('font-semibold text-[#171717]', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_26ee"
      {...rest}>
      {children}
    </strong>
  ),
  em: ({ children, className, ...rest }) => (
    <em
      className={cn('italic text-muted-foreground', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_84e8"
      {...rest}>{children}</em>
  ),
  ul: ({ children, className, ...rest }) => (
    <ul
      className={cn('mb-3 ml-5 list-disc space-y-1 text-foreground', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_65d5"
      {...rest}>
      {children}
    </ul>
  ),
  ol: ({ children, className, ...rest }) => (
    <ol
      className={cn('mb-3 ml-5 list-decimal space-y-1 text-foreground', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_1713"
      {...rest}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...rest }) => (
    <li
      className={cn('leading-relaxed', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_caad"
      {...rest}>{children}</li>
  ),
  blockquote: ({ children, className, ...rest }) => (
    <blockquote
      className={cn(
        'my-4 border-l-4 border-[#C9D0FC] bg-[#F6F6F6] py-2 pl-4 pr-3 italic text-muted-foreground',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_51dc"
      {...rest}>
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...rest }) => {
    const inline = (rest as Record<string, unknown>).inline as boolean | undefined;
    return (
      <code
        className={cn(
          inline
            ? 'rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-[#C9D0FC]'
            : 'block rounded-lg bg-muted p-4 text-sm font-mono text-foreground',
          className as string
        )}
        data-icod-id="src_components_markdownrenderer_tsx_2bd7"
        {...rest}>
        {children}
      </code>
    );
  },
  pre: ({ children, className, ...rest }) => (
    <pre
      className={cn('mb-4 overflow-x-auto rounded-lg', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_7e70"
      {...rest}>
      {children}
    </pre>
  ),
  table: ({ children, className, ...rest }) => (
    <div
      className="mb-4 overflow-x-auto"
      data-icod-id="src_components_markdownrenderer_tsx_1aa0">
      <table
        className={cn(
          'w-full border-collapse border border-border text-sm',
          className as string
        )}
        data-icod-id="src_components_markdownrenderer_tsx_4e6d"
        {...rest}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...rest }) => (
    <thead
      className={cn('bg-[#F6F6F6]', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_d7c3"
      {...rest}>{children}</thead>
  ),
  tbody: ({ children, className, ...rest }) => (
    <tbody
      className={cn('divide-y divide-border', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_38b3"
      {...rest}>{children}</tbody>
  ),
  tr: ({ children, className, ...rest }) => (
    <tr
      className={cn('hover:bg-muted/50', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_6b67"
      {...rest}>{children}</tr>
  ),
  th: ({ children, className, ...rest }) => (
    <th
      className={cn(
        'border border-border px-4 py-2 text-left font-semibold text-[#171717]',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_fed5"
      {...rest}>
      {children}
    </th>
  ),
  td: ({ children, className, ...rest }) => (
    <td
      className={cn('border border-border px-4 py-2 text-foreground', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_39f2"
      {...rest}>
      {children}
    </td>
  ),
  a: ({ children, href, className, ...rest }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-[#C9D0FC] underline decoration-[#C9D0FC]/30 hover:decoration-[#C9D0FC]',
        className as string
      )}
      data-icod-id="src_components_markdownrenderer_tsx_d968"
      {...rest}>
      {children}
    </a>
  ),
  hr: ({ className, ...rest }) => (
    <hr
      className={cn('my-6 border-border', className as string)}
      data-icod-id="src_components_markdownrenderer_tsx_1ae7"
      {...rest} />
  ),
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn('markdown-content', className)}
      data-icod-id="src_components_markdownrenderer_tsx_ee16">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        // Disable raw HTML to prevent XSS
        skipHtml
        data-icod-id="src_components_markdownrenderer_tsx_8642">
        {content}
      </ReactMarkdown>
    </div>
  );
}
