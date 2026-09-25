import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'

export default function RichTextEditor({
    value,
    onChange,
    minHeight = '150px',
    className = '',
    readOnly = false
}) {
    const containerRef = useRef(null)
    const quillRef = useRef(null)
    const isInternalChange = useRef(false)

    useEffect(() => {
        if (!containerRef.current) return

        const editorContainer = containerRef.current.appendChild(
            containerRef.current.ownerDocument.createElement('div')
        )

        const quill = new Quill(editorContainer, {
            theme: 'snow',
            readOnly,
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link']
                ]
            }
        })

        quillRef.current = quill

        if (value) {
            quill.clipboard.dangerouslyPasteHTML(value)
        }

        quill.on(Quill.events.TEXT_CHANGE, () => {
            if (isInternalChange.current) return
            const html = quill.root.innerHTML
            onChange?.(html === '<p><br></p>' ? '' : html)
        })

        return () => {
            quillRef.current = null
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [])

    // Sync external value changes without infinite re-render loops
    useEffect(() => {
        if (!quillRef.current) return
        const currentHTML = quillRef.current.root.innerHTML
        if (value !== currentHTML && !(value === '' && currentHTML === '<p><br></p>')) {
            isInternalChange.current = true
            quillRef.current.clipboard.dangerouslyPasteHTML(value || '')
            isInternalChange.current = false
        }
    }, [value])

    return (
        <div
            className={`rounded-md overflow-hidden [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:dark:bg-gray-800 [&_.ql-toolbar]:dark:border-gray-700 [&_.ql-container]:dark:bg-gray-900 [&_.ql-container]:dark:border-gray-700 [&_.ql-editor]:dark:text-gray-100 [&_.ql-stroke]:dark:stroke-gray-300 [&_.ql-fill]:dark:fill-gray-300 [&_.ql-picker]:dark:text-gray-300 [&_.ql-editor]:min-h-[var(--editor-min-height)] ${className}`}
            style={{ '--editor-min-height': minHeight }}
        >
            <div ref={containerRef} />
        </div>
    )
}