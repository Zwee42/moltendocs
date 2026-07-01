import dynamic from 'next/dynamic';
import { useTheme } from '@/lib/theme';

const ReactMarkdownContent = dynamic(
  () => import('./MarkdownContent'),
  { ssr: false }
);

export function MarkdownRenderer({ content }: { content: string }) {
  return <ReactMarkdownContent content={content} />;
}
