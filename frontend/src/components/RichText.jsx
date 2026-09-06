import { useMemo } from "react";
import DOMPurify from "dompurify";

/**
 * RichText — render stored WYSIWYG HTML safely. The content is sanitised with
 * DOMPurify (scripts/event handlers stripped) and rendered inside a `.blog-content`
 * wrapper so the site's typography CSS applies to the semantic HTML tags.
 */
export default function RichText({ html = "", className = "" }) {
  const clean = useMemo(() => DOMPurify.sanitize(html || ""), [html]);
  return <div className={`blog-content ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
