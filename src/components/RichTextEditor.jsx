import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import FontFamily from '@tiptap/extension-font-family';
import { Box, Stack, IconButton, Tooltip, Divider, Menu, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import FontDownloadIcon from '@mui/icons-material/FontDownload';

export default function RichTextEditor({ value, onChange, minHeight = 200 }){
  const colorInputRef = useRef(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const isEmojiOpen = Boolean(emojiAnchor);
  const handleOpenEmoji = (e) => setEmojiAnchor(e.currentTarget);
  const handleCloseEmoji = () => setEmojiAnchor(null);

  const fonts = useMemo(() => ([
    { label: 'Varsayılan', value: '' },
    { label: 'Inter', value: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  ]), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: true, blockquote: true }),
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true } ),
      Underline,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      FontFamily,
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => { if (editor && value != null && value !== editor.getHTML()) editor.commands.setContent(value, false); }, [value, editor]);
  useEffect(() => () => { editor?.destroy?.(); }, [editor]);

  const isActive = (name, attrs) => editor?.isActive?.(name, attrs);
  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link')?.href || '';
    const url = window.prompt('Bağlantı URL', prev);
    if (url === null) return; // cancel
    if (url === '') return editor.chain().focus().extendMarkRange('link').unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  const addImage = () => {
    if (!editor) return;
    const url = window.prompt('Görsel URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };
  const insertEmoji = (emoji) => {
    editor?.chain().focus().insertContent(emoji).run();
    handleCloseEmoji();
  };
  const changeColor = (e) => {
    const color = e.target.value;
    if (!editor) return;
    if (!color) editor.chain().focus().unsetColor().run();
    else editor.chain().focus().setColor(color).run();
  };
  const adjustFontSize = (delta) => {
    if (!editor) return;
    const cur = editor.getAttributes('textStyle')?.fontSize || '';
    const base = cur.endsWith('px') ? parseInt(cur, 10) : 14;
    let next = Math.min(40, Math.max(10, base + delta));
    if (Number.isNaN(next)) next = 14;
    editor.chain().focus().setMark('textStyle', { fontSize: `${next}px` }).run();
  };
  const setFont = (v) => {
    if (!editor) return;
    if (!v) editor.chain().focus().unsetFontFamily().run();
    else editor.chain().focus().setFontFamily(v).run();
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      {/* Toolbar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
        {/* Font family */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="rte-font-label"><FontDownloadIcon sx={{ mr: 0.5 }} />Yazı Tipi</InputLabel>
          <Select
            labelId="rte-font-label"
            label="Yazı Tipi"
            value={editor?.getAttributes('textStyle')?.fontFamily || ''}
            onChange={(e)=> setFont(e.target.value)}
          >
            {fonts.map(f => (
              <MenuItem key={f.label} value={f.value} sx={{ fontFamily: f.value || 'inherit' }}>{f.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Font size -/+ */}
        <Tooltip title="Yazı Boyutu Azalt">
          <span>
            <IconButton size="small" color={isActive('textStyle') ? 'primary' : 'default'} onClick={()=> adjustFontSize(-1)}>
              <TextDecreaseIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Yazı Boyutu Artır">
          <span>
            <IconButton size="small" color={isActive('textStyle') ? 'primary' : 'default'} onClick={()=> adjustFontSize(1)}>
              <TextIncreaseIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Inline formatting */}
        <Tooltip title="Kalın">
          <span>
            <IconButton size="small" color={isActive('bold') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleBold().run()} disabled={!editor?.can().chain().focus().toggleBold().run()}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="İtalik">
          <span>
            <IconButton size="small" color={isActive('italic') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleItalic().run()} disabled={!editor?.can().chain().focus().toggleItalic().run()}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Altı Çizili">
          <IconButton size="small" color={isActive('underline') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleUnderline().run()}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Üstü Çizili">
          <IconButton size="small" color={isActive('strike') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleStrike().run()}>
            <StrikethroughSIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Metin Rengi">
          <span>
            <IconButton size="small" color={isActive('textStyle') && editor?.getAttributes('textStyle')?.color ? 'primary' : 'default'} onClick={()=> colorInputRef.current?.click()}>
              <FormatColorTextIcon fontSize="small" />
            </IconButton>
            <input ref={colorInputRef} type="color" style={{ display: 'none' }} onChange={changeColor} />
          </span>
        </Tooltip>

        <Tooltip title="Biçimi Temizle">
          <IconButton size="small" onClick={()=> editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
            <FormatClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Link & Image & Emoji */}
        <Tooltip title="Bağlantı Ekle/Düzenle">
          <IconButton size="small" color={isActive('link') ? 'primary' : 'default'} onClick={setLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Görsel Ekle">
          <IconButton size="small" onClick={addImage}>
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Emoji Ekle">
          <IconButton size="small" onClick={handleOpenEmoji}>
            <EmojiEmotionsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={emojiAnchor} open={isEmojiOpen} onClose={handleCloseEmoji} keepMounted>
          {['😀','😁','😂','😊','😍','😎','🤔','👍','🙏','🎉','🔥','✅','❗'].map(em => (
            <MenuItem key={em} onClick={()=> insertEmoji(em)}>{em}</MenuItem>
          ))}
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Block formatting */}
        <Tooltip title="Alıntı">
          <IconButton size="small" color={isActive('blockquote') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleBlockquote().run()}>
            <FormatQuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sola Hizala">
          <IconButton size="small" color={isActive({ textAlign: 'left' }) ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().setTextAlign('left').run()}>
            <FormatAlignLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ortala">
          <IconButton size="small" color={isActive({ textAlign: 'center' }) ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().setTextAlign('center').run()}>
            <FormatAlignCenterIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sağa Hizala">
          <IconButton size="small" color={isActive({ textAlign: 'right' }) ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().setTextAlign('right').run()}>
            <FormatAlignRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="İki Yana Yasla">
          <IconButton size="small" color={isActive({ textAlign: 'justify' }) ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().setTextAlign('justify').run()}>
            <FormatAlignJustifyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Madde İşaretli Liste">
          <IconButton size="small" color={isActive('bulletList') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleBulletList().run()}>
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numaralı Liste">
          <IconButton size="small" color={isActive('orderedList') ? 'primary' : 'default'} onClick={()=> editor?.chain().focus().toggleOrderedList().run()}>
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Editor */}
      <Box sx={{ p: 1.5 }}>
        <EditorContent editor={editor} style={{ minHeight }} />
      </Box>
    </Box>
  );
}
