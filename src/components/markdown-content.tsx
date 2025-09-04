'use client';

import ReactMarkdown from 'react-markdown';

export default function MarkdownContent({ children }: { children: string }) {
  return <ReactMarkdown>{children}</ReactMarkdown>;
}
