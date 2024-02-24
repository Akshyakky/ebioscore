// components/PdfViewer/PdfViewer.tsx
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import CustomButton from "../Button/CustomButton";
import CancelIcon from "@mui/icons-material/Cancel";

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
  open: boolean;
  reportName: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  onClose,
  open,
  reportName,
}) => {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6">{`Viewing PDF: ${reportName}`}</Typography>
        <iframe src={pdfUrl} width="100%" height="100%"></iframe>
      </DialogContent>
      <DialogActions>
        <CustomButton
          text="Close"
          onClick={onClose}
          icon={CancelIcon}
          color="error"
        />
      </DialogActions>
    </Dialog>
  );
};

export default PdfViewer;
