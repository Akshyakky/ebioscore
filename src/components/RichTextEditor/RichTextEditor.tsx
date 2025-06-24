import { Box, FormControl, FormHelperText, FormLabel } from "@mui/material";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonStrikethrough,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";
import { useEffect } from "react";

// Rich Text Editor Component with mui-tiptap
export const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}> = ({ value, onChange, disabled = false, error = false, helperText }) => {
  // Configure Tiptap extensions
  const extensions = [
    StarterKit.configure({
      codeBlock: false,
      code: false,
    }),
    Underline,
  ];

  // Initialize the editor
  const editor = useEditor({
    extensions,
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <FormControl fullWidth error={error}>
      <FormLabel required sx={{ mb: 1 }}>
        Template Description
      </FormLabel>
      <Box>
        <RichTextEditorProvider editor={editor}>
          <RichTextField
            controls={
              <MenuControlsContainer>
                <MenuSelectHeading />
                <MenuDivider />
                <MenuButtonBold />
                <MenuButtonItalic />
                <MenuButtonUnderline />
                <MenuButtonStrikethrough />
                <MenuDivider />
                <MenuButtonBulletedList />
                <MenuButtonOrderedList />
                <MenuDivider />
                <MenuButtonHorizontalRule />
                <MenuDivider />
                <MenuButtonUndo />
                <MenuButtonRedo />
              </MenuControlsContainer>
            }
          />
        </RichTextEditorProvider>
      </Box>
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </FormControl>
  );
};
