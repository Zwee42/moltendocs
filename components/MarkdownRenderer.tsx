import dynamic from 'next/dynamic';

const ReactMarkdownContent = dynamic(
  () => import('./MarkdownContent'),
  { ssr: false }
);

export function MarkdownRenderer({ content }: { content: string }) {
  return <ReactMarkdownContent content={content} />;
}
