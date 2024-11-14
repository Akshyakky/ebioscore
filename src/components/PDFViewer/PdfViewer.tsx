import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, Typography, Box } from "@mui/material";
import CustomButton from "../Button/CustomButton";
import CancelIcon from "@mui/icons-material/Cancel";
import { useLoading } from "../../context/LoadingContext";

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
  open: boolean;
  reportName: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onClose, open, reportName }) => {
  const { setLoading } = useLoading(); // Access the setLoading function from the context
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
    }
    return () => {
      setLoading(false);
    };
  }, [open, setLoading]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose} aria-labelledby="pdf-viewer-title">
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
          <Typography variant="h6" id="pdf-viewer-title">
            {`Viewing PDF: ${reportName}`}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, position: "relative" }}>
          {error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography color="error">Failed to load PDF.</Typography>
            </Box>
          ) : (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              onLoad={handleLoad}
              onError={handleError}
              title={`PDF Viewer: ${reportName}`}
              aria-label={`PDF Viewer: ${reportName}`}
              style={{ border: "none" }}
            ></iframe>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <CustomButton text="Close" onClick={onClose} icon={CancelIcon} color="error" />
      </DialogActions>
    </Dialog>
  );
};

export default PdfViewer;
