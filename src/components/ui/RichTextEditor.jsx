import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = '',
    readOnly = false,
    className = ''
}) {
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean']
        ]
    }

    return (
        <div className={`rich-text-wrapper ${className}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                modules={modules}
            />
        </div>
    )
}