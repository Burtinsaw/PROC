import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

export default function RichTextEditor({ value, onChange, minHeight = 200 }){
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: true,
        blockquote: true,
      }),
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => { if (editor && value != null && value !== editor.getHTML()) editor.commands.setContent(value, false); }, [value, editor]);
  useEffect(() => () => { editor?.destroy?.(); }, [editor]);

  return (
    <div style={{ border: '1px solid var(--mui-palette-divider)', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid var(--mui-palette-divider)' }}>
        <button type="button" onClick={()=> editor?.chain().focus().toggleBold().run()} disabled={!editor?.can().chain().focus().toggleBold().run()} style={{ fontWeight: 'bold' }}>B</button>
        <button type="button" onClick={()=> editor?.chain().focus().toggleItalic().run()} disabled={!editor?.can().chain().focus().toggleItalic().run()} style={{ fontStyle: 'italic' }}>I</button>
        <button type="button" onClick={()=> editor?.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" onClick={()=> editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" onClick={()=> editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" onClick={()=> {
          const url = window.prompt('Bağlantı URL');
          if (url === null) return; // cancel
          if (url === '') return editor?.chain().focus().extendMarkRange('link').unsetLink().run();
          editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}>Link</button>
        <button type="button" onClick={()=> editor?.chain().focus().toggleBlockquote().run()}>Blockquote</button>
        <button type="button" onClick={()=> editor?.chain().focus().toggleCodeBlock().run()}>Code</button>
        <button type="button" onClick={()=> editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Temizle</button>
      </div>
      <div style={{ padding: 8 }}>
        <EditorContent editor={editor} style={{ minHeight }} />
      </div>
    </div>
  );
}
