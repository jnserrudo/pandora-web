function stripMd(text) {
  return String(text || '')
    .replace(/<(think|thinking)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(think|thinking)[^>]*>[\s\S]*/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/g, '');
}

export function parseAssistantBlocks(text) {
  const cleaned = String(text || '')
    .replace(/<(think|thinking)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(think|thinking)[^>]*>[\s\S]*/gi, '')
    .replace(/\r/g, '');
  const lines = cleaned.split('\n');
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: 'p', text: stripMd(paragraph.join(' ').trim()) });
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-•]\s+(.+)/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (bullet || numbered) {
      flushParagraph();
      const item = stripMd(bullet?.[1] || numbered[1]);
      if (!list || list.type !== (numbered ? 'ol' : 'ul')) {
        flushList();
        list = { type: numbered ? 'ol' : 'ul', items: [] };
      }
      list.items.push(item);
      return;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return blocks.filter((block) => (block.text || block.items?.length));
}

const AssistantMessage = ({ text }) => {
  const blocks = parseAssistantBlocks(text);
  if (!blocks.length) return null;

  return (
    <div className="assistant-rich">
      {blocks.map((block, index) => {
        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type;
          return (
            <List key={index} className="assistant-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </List>
          );
        }
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
};

export default AssistantMessage;
