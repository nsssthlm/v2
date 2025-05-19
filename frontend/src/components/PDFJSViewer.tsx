import React, { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import { useProject } from "../contexts/ProjectContext";
import StraightPDFViewer from "./StraightPDFViewer";

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
      // Extract filename and date pattern from URL
      const fileName = pdfUrl.split('/').pop();
      const dateMatch = pdfUrl.match(/(\d{4})\/(\d{2})\/(\d{2})/);
      
      if (fileName && fileName.endsWith('.pdf') && dateMatch) {
        // Convert to direct media URL for better compatibility
        const mediaUrl = `/media/project_files/${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}/${fileName}`;
        console.log("PDF URL direkt från media:", mediaUrl);
        setOptimizedUrl(mediaUrl);
      } else if (fileName && fileName.endsWith('.pdf')) {
        // Fallback to direct API
        const directPdfUrl = `/media/project_files/${fileName}`;
        setOptimizedUrl(directPdfUrl);
      } else {
        // Fallback to original URL as last resort
        setOptimizedUrl(pdfUrl);
      }
    }
  }, [pdfUrl]);

  // Use optimized URL directly since we're now preferring media URLs which work in both environments
  // Media URLs are properly configured in Django settings to serve files directly
  const finalUrl = optimizedUrl;

  return (
    <Box sx={{ 
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <StraightPDFViewer
        pdfUrl={finalUrl}
        fileName={filename}
        onClose={() => {}} // Empty function since we're not using the close button in this context
      />
    </Box>
  );
};

export default PDFJSViewer;