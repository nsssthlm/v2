import React from "react";
import { Box } from "@mui/joy";
import { useProject } from "../contexts/ProjectContext";
import DirectPDFViewer from "./DirectPDFViewer";

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
  projectId?: number | string | null;
  folderId?: number | string | null;
}

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({
  pdfUrl,
  filename,
  projectId,
  folderId,
}) => {
  const { currentProject } = useProject();
  
  // Use project ID from props or context
  const activeProjectId = 
    projectId?.toString() || currentProject?.id?.toString() || null;

  console.log("PDF Debug:", {
    providedProjectId: projectId,
    contextProjectId: currentProject?.id,
    activeProjectId: activeProjectId,
    currentProject: currentProject,
  });

  // Log the original URL for debugging
  console.log("PDF original URL:", pdfUrl);

  return (
    <Box sx={{ 
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <DirectPDFViewer
        pdfUrl={pdfUrl}
        fileName={filename}
        projectId={activeProjectId}
      />
    </Box>
  );
};

export default PDFJSViewer;