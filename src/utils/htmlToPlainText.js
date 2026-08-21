/**
 * Strip HTML tags and collapse whitespace for card previews.
 */
export function htmlToPlainText(html, maxLength = 0) {
  if (!html || typeof html !== 'string') return '';
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function articleCardBlurb(article, maxLength = 80) {
  if (!article) return '';
  if (article.subtitle?.trim()) return article.subtitle.trim();
  if (article.excerpt?.trim()) return htmlToPlainText(article.excerpt, maxLength);
  return htmlToPlainText(article.content, maxLength);
}
