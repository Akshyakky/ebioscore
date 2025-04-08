// RichTextEditor.tsx
import React, { useRef, useEffect, useState } from "react";
import { Box, IconButton, Divider, Tooltip, Select, MenuItem, Paper } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import CodeIcon from "@mui/icons-material/Code";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import SuperscriptIcon from "@mui/icons-material/Superscript";
import SubscriptIcon from "@mui/icons-material/Subscript";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const FONT_FAMILIES = ["Arial", "Times New Roman", "Courier New", "Georgia", "Trebuchet MS", "Verdana"];

const FONT_SIZES = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "22", "24", "26", "28", "36", "48", "72"];

const COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value: string = "") => {
    const selection = document.getSelection();
    const range = selection?.getRangeAt(0);
    if (editorRef.current) {
      editorRef.current.focus();
      if (range) {
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      document.execCommand(command, false, value);
      updateContent();
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      onChange(htmlContent);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const ColorPicker = ({ command }: { command: string }) => (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 1000,
        width: 200,
        p: 1,
        boxShadow: 3,
        borderRadius: 1,
        display: showColorPicker ? "grid" : "none",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: 0.5,
        height: "100%",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {COLORS.map((color) => (
        <Box
          key={color}
          onClick={() => {
            execCommand(command, color);
            setShowColorPicker(false);
          }}
          sx={{
            width: 24,
            height: 4,
            backgroundColor: color,
            cursor: "pointer",
            border: "1px solid #ccc",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ border: "1px solidrgb(161, 43, 43)", borderRadius: 2, overflow: "hidden", height: "100%" }}>
      <Box sx={{ borderBottom: "1px solid #e0e0e0" }}>
        <Box
          sx={{
            p: 1,
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Select size="small" defaultValue="Arial" onChange={(e) => execCommand("fontName", e.target.value)} sx={{ minWidth: 120, height: 30 }}>
            {FONT_FAMILIES.map((font) => (
              <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" defaultValue="3" onChange={(e) => execCommand("fontSize", e.target.value)} sx={{ minWidth: 70, height: 30 }}>
            {FONT_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => execCommand("bold")}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => execCommand("italic")}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => execCommand("underline")}>
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton size="small" onClick={() => execCommand("strikeThrough")}>
              <StrikethroughSIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Text Color" placement="top">
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <IconButton size="small" onClick={() => setShowColorPicker(!showColorPicker)} onBlur={() => setTimeout(() => setShowColorPicker(false), 200)}>
                <FormatColorTextIcon fontSize="small" />
              </IconButton>
              <ColorPicker command="foreColor" />
            </Box>
          </Tooltip>
        </Box>
        <Box
          sx={{
            p: 1,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={() => execCommand("insertUnorderedList")}>
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Number List">
            <IconButton size="small" onClick={() => execCommand("insertOrderedList")}>
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Align Left">
            <IconButton size="small" onClick={() => execCommand("justifyLeft")}>
              <FormatAlignLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton size="small" onClick={() => execCommand("justifyCenter")}>
              <FormatAlignCenterIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton size="small" onClick={() => execCommand("justifyRight")}>
              <FormatAlignRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Insert Link">
            <IconButton
              size="small"
              onClick={() => {
                const url = prompt("Enter URL:");
                if (url) execCommand("createLink", url);
              }}
            >
              <InsertLinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code">
            <IconButton size="small" onClick={() => execCommand("formatBlock", "pre")}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quote">
            <IconButton size="small" onClick={() => execCommand("formatBlock", "blockquote")}>
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Superscript">
            <IconButton size="small" onClick={() => execCommand("superscript")}>
              <SuperscriptIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Subscript">
            <IconButton size="small" onClick={() => execCommand("subscript")}>
              <SubscriptIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Clear Formatting">
            <IconButton size="small" onClick={() => execCommand("removeFormat")}>
              <FormatClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={updateContent}
        onPaste={handlePaste}
        onKeyUp={updateContent}
        sx={{
          p: 2,
          minHeight: "300px",
          maxHeight: "700px",
          overflowY: "auto",
          // backgroundColor: "#ffffff",
          "&:focus": {
            outline: "none",
            boxShadow: "inset 0 0 0 2px #2196f3",
          },
          fontFamily: "inherit",
          fontSize: "14px",
          lineHeight: 1.5,
          "& blockquote": {
            borderLeft: "3px solid #ccc",
            margin: "1em 0",
            paddingLeft: "1em",
          },
          "& pre": {
            // backgroundColor: "#f5f5f5",
            padding: "1em",
            borderRadius: "4px",
            fontFamily: "monospace",
          },
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          "& *": {
            maxWidth: "100%",
          },
        }}
      />
    </Paper>
  );
};

export default RichTextEditor;
