import Markdown from 'react-markdown';

export default function MarkdownRender({ content }: { content: string }) {
  return <Markdown>{content}</Markdown>;
}
