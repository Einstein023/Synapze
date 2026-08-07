/**
 * Formatting and stripping utilities for Synapze Rich Text Editor
 */

/**
 * Strips all HTML tags and markdown decorations to produce an ultra-clean plain text preview snippet.
 */
export const stripFormatting = (content: string | undefined | null): string => {
  if (!content) return "";
  
  // 1. Remove HTML tags
  let text = content.replace(/<[^>]*>/g, " ");
  
  // 2. Remove Markdown headers
  text = text.replace(/#+\s+(.*?)/g, "$1");
  
  // 3. Remove Markdown checklists and bold markers
  text = text.replace(/-\s+\[[ xbXB]\]\s+/g, "");
  text = text.replace(/-\s+/g, "");
  text = text.replace(/[\*_~`]+/g, "");
  
  // 4. Decode common html entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // 5. Clean whitespace transitions
  return text.trim().replace(/\s+/g, " ");
};

/**
 * Safe conversion of original raw markdown files to pristine initial HTML state.
 */
export const convertMarkdownToHtml = (markdown: string | undefined | null): string => {
  if (!markdown) return "<p><br></p>";
  
  const trimmed = markdown.trim();
  
  // If it already contains HTML signature tags, treat as HTML directly
  if (
    trimmed.startsWith("<") || 
    trimmed.includes("</p>") || 
    trimmed.includes("</div>") || 
    trimmed.includes("</h1>") ||
    trimmed.includes("</h2>") ||
    trimmed.includes("</h3>")
  ) {
    return markdown;
  }

  // Convert Markdown syntax to basic HTML tags
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings mapping
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Checklists mapping
  html = html.replace(/^-\s+\[x\]\s+(.*?)$/gmi, "<p><span class=\"task-checkbox cursor-pointer select-none text-emerald-600 font-mono inline-block mr-1\" contenteditable=\"false\">✅</span> <span style=\"text-decoration: line-through; color: #94a3b8;\">$1</span></p>");
  html = html.replace(/^-\s+\[\s*\]\s+(.*?)$/gmi, "<p><span class=\"task-checkbox cursor-pointer select-none text-emerald-600 font-mono inline-block mr-1\" contenteditable=\"false\">⬜</span> <span>$1</span></p>");

  // Lists mapping
  html = html.replace(/^-\s+(?!\[.\])(.*?)$/gm, "<li>$1</li>");
  
  // Bold and italic replacements
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Split lines and wrap untagged blocks into paragraphs
  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return "<p><br></p>";
    if (
      trimmedLine.startsWith("<h") || 
      trimmedLine.startsWith("<ul") || 
      trimmedLine.startsWith("<ol") || 
      trimmedLine.startsWith("<li") || 
      trimmedLine.startsWith("<p") || 
      trimmedLine.startsWith("<blockquote") ||
      trimmedLine.startsWith("<div")
    ) {
      return line; // already tagged
    }
    return `<p>${line}</p>`;
  });

  return processedLines.join("");
};
