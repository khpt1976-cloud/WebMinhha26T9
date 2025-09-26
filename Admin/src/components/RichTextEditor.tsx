import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  height = '300px',
  disabled = false
}) => {
  return (
    <div className="rich-text-editor" style={{ minHeight: height }}>
      <CKEditor
        editor={ClassicEditor as any}
        data={value}
        disabled={disabled}
        config={{
          placeholder,
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'link',
            'insertTable',
            'blockQuote',
            'undo',
            'redo'
          ]
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        onReady={(editor: any) => {
          // Editor is ready to use
          console.log('CKEditor is ready', editor);
        }}
        onError={(error: any, { willEditorRestart }: any) => {
          // There was a problem during the editor initialization
          console.error('CKEditor error:', error);
          
          if (willEditorRestart) {
            console.log('Editor will restart');
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;