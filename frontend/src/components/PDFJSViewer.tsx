import React from "react";
import { Box, Typography, CircularProgress } from "@mui/joy";
import { useProject } from "../contexts/ProjectContext"; // Import ProjectContext
import SimplePDFViewer from "./SimplePDFViewer";

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
  projectId?: number | string | null;
  folderId?: number | string | null;
}

// Hjälpfunktion för att konstruera korrekt PDF-URL
const constructPdfUrl = (url: string) => {
  // Om URL:en redan är fullständig, behåll den
  if (url.startsWith("http")) return url;

  // Ta bort eventuella query-parametrar
  url = url.split("?")[0];

  // Lägg till auth token om det behövs
  const token = localStorage.getItem("access_token");
  if (token) {
    url = `${url}${url.includes("?") ? "&" : "?"}token=${token}`;
  }

  return url;
};

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({
  pdfUrl,
  filename,
  projectId,
  folderId,
}) => {
  const { currentProject } = useProject(); // Hämta aktuellt projekt från context

  // Använd projektID från props om det finns, annars från context
  const activeProjectId =
    projectId?.toString() || currentProject?.id?.toString() || null;

  console.log("PDF Debug:", {
    providedProjectId: projectId,
    contextProjectId: currentProject?.id,
    activeProjectId: activeProjectId,
    currentProject: currentProject,
  });

  // Logg för diagnostik
  console.log("PDF original URL:", pdfUrl);
  
  // Använd den direkta URL:en istället för att försöka ändra den
  const finalUrl = constructPdfUrl(pdfUrl);
  
  console.log("Using direct PDF URL:", finalUrl);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
        bgcolor: "background.surface",
      }}
    >
      <SimplePDFViewer
        pdfUrl={finalUrl}
        fileName={filename}
        projectId={activeProjectId}
      />
    </Box>
  );
};

export default PDFJSViewer;