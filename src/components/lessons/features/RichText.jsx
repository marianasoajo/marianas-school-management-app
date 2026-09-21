import DOMPurify from 'dompurify'

export default function RichText({ html, className = '', inline = false }) {
    if (!html) return null

    const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 's', 'strike', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
    })

    const Tag = inline ? 'span' : 'div'

    return (
        <Tag className={`lesson-rich-text ${className}`.trim()} dangerouslySetInnerHTML={{ __html: sanitized }} />
    )
}