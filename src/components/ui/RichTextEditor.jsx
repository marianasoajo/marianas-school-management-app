import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { QUILL_FORMATS, QUILL_MODULES } from '../planning/constants/planningConstants'

export function RichTextEditor({
    value,
    onChange,
    placeholder = '',
    minHeight = '220px',
    className = ''
}) {
    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden ${className}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder={placeholder}
                className="quill-compact dark:text-gray-100"
            />
            <style>{`
                .quill-compact .ql-editor {
                    min-height: ${minHeight};
                }
            `}</style>
        </div>
    )
}

export default RichTextEditor