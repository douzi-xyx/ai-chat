import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';

// 轻量的 Markdown 渲染组件，带基础美化
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-semibold text-title mb-3 border-b border-bd/40 pb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-title mb-2 border-b border-bd/30 pb-1">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="text-base font-semibold text-title mb-2">{children}</h3>,
  p: ({ children }) => <p className="text-text/90 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-text/90 mb-3">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 text-text/90 mb-3">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary-3/60 bg-surface/70 text-text/90 px-4 py-3 rounded-r-lg my-3 shadow-sm">
      {children}
    </blockquote>
  ),
  code({ inline, className, children, ...props }) {
    const language = className?.match(/language-(\w+)/)?.[1];
    if (inline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-primary-1/15 text-primary-5 font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-[#0f172a] text-[#e2e8f0] rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed shadow-inner border border-white/5">
        <div className="flex items-center gap-2 mb-3 text-xs text-[#94a3b8]">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="ml-2 uppercase">{language || 'code'}</span>
        </div>
        <code className="whitespace-pre-wrap" {...props}>
          {children}
        </code>
      </pre>
    );
  },
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary-4 hover:text-primary-5 underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-bd/40" />,
};

export default function MarkdownRender({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-text">
      <Markdown components={components}>{content || ''}</Markdown>
    </div>
  );
}
