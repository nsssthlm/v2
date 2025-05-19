import React, { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import { useProject } from "../contexts/ProjectContext";
import PDFEmbedViewer from "./PDFEmbedViewer";

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
  const [optimizedUrl, setOptimizedUrl] = useState<string>(pdfUrl);
  
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

  useEffect(() => {
    // Försök att optimera PDF URL för bättre kompatibilitet
    if (pdfUrl) {
      // Extract actual filename for direct access
      const fileName = pdfUrl.split('/').pop();
      
      if (fileName && fileName.endsWith('.pdf')) {
        // Try the direct API first for better compatibility
        const directPdfUrl = `/api/pdf-direct/${fileName}`;
        setOptimizedUrl(directPdfUrl);
      } else {
        // Fallback to original URL
        setOptimizedUrl(pdfUrl);
      }
    }
  }, [pdfUrl]);

  // For Replit preview environment, we need the full URL with proxy
  // Check if we're in a Replit environment
  const isReplitEnv = window.location.hostname.includes('replit');
  
  // Adjust URL for Replit environment
  let finalUrl = optimizedUrl;
  if (isReplitEnv && !optimizedUrl.includes('/proxy/')) {
    // Keep original URL since it might already have the proxy path
    finalUrl = pdfUrl;
  }

  return (
    <Box sx={{ 
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <PDFEmbedViewer
        pdfUrl={finalUrl}
        fileName={filename}
        onClose={() => {}} // Empty function since we're not using the close button in this context
      />
    </Box>
  );
};

export default PDFJSViewer;