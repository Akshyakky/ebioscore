import { Box, FormControl, FormHelperText, FormLabel } from "@mui/material";
import { useEffect, useRef, useState } from "react";

// Rich Text Editor Component
export const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}> = ({ value, onChange, disabled = false, error = false, helperText }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const toolbarButtons = [
    { icon: "𝐁", command: "bold", title: "Bold" },
    { icon: "𝐼", command: "italic", title: "Italic" },
    { icon: "U̲", command: "underline", title: "Underline" },
    { icon: "—", command: "insertHorizontalRule", title: "Horizontal Line" },
    { icon: "•", command: "insertUnorderedList", title: "Bullet List" },
    { icon: "1.", command: "insertOrderedList", title: "Numbered List" },
    { icon: "↶", command: "undo", title: "Undo" },
    { icon: "↷", command: "redo", title: "Redo" },
  ];

  return (
    <FormControl fullWidth error={error}>
      <FormLabel required sx={{ mb: 1 }}>
        Template Description
      </FormLabel>
      <Box
        sx={{
          border: `1px solid ${error ? "#d32f2f" : isFocused ? "#1976d2" : "#c4c4c4"}`,
          borderRadius: 1,
          backgroundColor: disabled ? "#f5f5f5" : "white",
          transition: "border-color 0.2s",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            p: 1,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f5f5f5",
            flexWrap: "wrap",
          }}
        >
          {toolbarButtons.map((btn, index) => (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => execCommand(btn.command)}
              title={btn.title}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: btn.command === "bold" ? "bold" : "normal",
                fontStyle: btn.command === "italic" ? "italic" : "normal",
                textDecoration: btn.command === "underline" ? "underline" : "none",
                opacity: disabled ? 0.5 : 1,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {btn.icon}
            </button>
          ))}
          <select
            disabled={disabled}
            onChange={(e) => execCommand("formatBlock", e.target.value)}
            style={{
              padding: "4px 8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
        </Box>
        <Box
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{
            minHeight: "120px",
            p: 2,
            outline: "none",
            "&:empty:before": {
              content: '"Enter a detailed description of the template"',
              color: "#999",
            },
            "& h1": { fontSize: "2em", margin: "0.67em 0", fontWeight: "bold" },
            "& h2": { fontSize: "1.5em", margin: "0.83em 0", fontWeight: "bold" },
            "& h3": { fontSize: "1.17em", margin: "1em 0", fontWeight: "bold" },
            "& h4": { fontSize: "1em", margin: "1.33em 0", fontWeight: "bold" },
            "& p": { margin: "1em 0" },
            "& ul, & ol": { paddingLeft: "2em", margin: "1em 0" },
          }}
          suppressContentEditableWarning
        />
      </Box>
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </FormControl>
  );
};
