import React, { useEffect, useState } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { useSelector } from "react-redux";
import { APIConfig } from "../../../../apiConfig";
import CustomButton from "../../../../components/Button/CustomButton";
import { useAppSelector } from "@/store/hooks";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
interface LoadSuccessParameters {
  numPages: number;
  // Add other properties from the event if necessary
}

const RoutineReportsPA = () => {
  const [file, setFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const userInfo = useAppSelector((state) => state.auth);
  const token = userInfo.token!;

  const loadPdf = async () => {
    try {
      const url = `${APIConfig.patientAdministrationURL}RegistrationReport/ListOfRegistration`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      if (response.data) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(blob);
        setFile(fileURL);
      }
    } catch (error) {
      console.error("Error loading PDF: ", error);
    }
  };

  const downloadExcel = async () => {
    try {
      const url = `${APIConfig.patientAdministrationURL}RegistrationReport/ListOfRegistrationExcel`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important to handle binary data
      });
      if (response.data) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileURL = URL.createObjectURL(blob);
        triggerDownload(fileURL, "PatientInfo.xlsx");
      }
    } catch (error) {
      console.error("Error downloading Excel file: ", error);
    }
  };

  const triggerDownload = (fileURL: string, filename: string) => {
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadPdf();
  }, []);

  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file);
      }
    };
  }, [file]);

  // Document load success handler
  const onDocumentLoadSuccess = ({ numPages }: LoadSuccessParameters) => {
    setNumPages(numPages);
    setCurrentPage(1); // Reset to first page whenever a new document is loaded
  };
  const downloadPdf = () => {
    if (file) {
      // Create a temporary anchor element and trigger a download
      const link = document.createElement("a");
      link.href = file;
      link.download = "download.pdf"; // You can specify a filename here
      document.body.appendChild(link); // Append to the body
      link.click(); // Simulate click to trigger download
      document.body.removeChild(link); // Remove the link when done
    }
  };

  return (
    <>
      <CustomButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} text="Previous Page" />
      <CustomButton onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= numPages} text="Next Page" />
      <CustomButton onClick={downloadPdf} text="Download PDF" />
      <CustomButton onClick={downloadExcel} text="Export to Excel" />

      {/* Add this line */}
      {file && (
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            console.error("Error while loading document!", error.message);
            // Implement more sophisticated error handling
          }}
        >
          <Page
            pageNumber={currentPage}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={<div>Loading...</div>} // Consider replacing this with a spinner or a skeleton screen
          />
        </Document>
      )}
    </>
  );
};

export default RoutineReportsPA;
