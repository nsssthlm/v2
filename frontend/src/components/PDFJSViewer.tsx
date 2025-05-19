import React from "react";
import { Box } from "@mui/joy";
import { useProject } from "../contexts/ProjectContext";
import BasicEmbeddedPDFViewer from "./BasicEmbeddedPDFViewer";

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

  // For Replit preview environment, keep the original URL which contains /proxy/3000/
  // This is the URL that actually works in the preview environment
  const finalUrl = pdfUrl;

  return (
    <Box sx={{ 
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <BasicEmbeddedPDFViewer
        pdfUrl={finalUrl}
        fileName={filename}
        onClose={() => {}} // Empty function since we're not using the close button in this context
      />
    </Box>
  );
};

export default PDFJSViewer;