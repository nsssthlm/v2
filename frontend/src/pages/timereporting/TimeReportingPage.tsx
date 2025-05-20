import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  Grid,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
  AspectRatio,
  Button,
  IconButton,
  Stack
} from '@mui/joy';
import { 
  FileUpload as FileUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useProject } from '../../contexts/ProjectContext';
import api from '../../services/api';

// Interface för PDF-dokument
interface PDFDocument {
  id: string;
  fileName: string;
  uploadDate: string;
  description?: string;
  fileUrl: string;
  uploadedBy: string;
  isLocal?: boolean; // Indikerar om filen kommer från lokal uppladdning eller server
}

// Använder vår nya PDFEmbed-komponent istället för en egen implementation

const TimeReportingPage = () => {
  const { currentProject } = useProject();
  const [pdfList, setPdfList] = useState<PDFDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<PDFDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Hämta PDF-filer när komponenten laddas eller projektet ändras
  useEffect(() => {
    if (currentProject?.id) {
      loadPdfDocuments();
    }
  }, [currentProject]);

  // Simulerad funktion för att hämta PDF-dokument
  // I en verklig implementation skulle denna använda API för att hämta dokument från servern
  const loadPdfDocuments = async () => {
    try {
      // Exempel - ersätt med verklig API-anrop i framtiden
      // const response = await api.get(`/api/timereporting/pdfs?projectId=${currentProject.id}`);
      // setPdfList(response.data);

      // Temporär lösning med dummy-data
      const dummyDocs: PDFDocument[] = [
        {
          id: '1',
          fileName: 'Timesheet_April_2025.pdf',
          uploadDate: '2025-05-01',
          description: 'Tidsrapport april 2025',
          fileUrl: '/sample/sample.pdf',
          uploadedBy: 'Anna Svensson'
        },
        {
          id: '2',
          fileName: 'Expenses_Q1_2025.pdf',
          uploadDate: '2025-04-15',
          description: 'Kvartalsrapport utgifter',
          fileUrl: '/sample/sample.pdf',
          uploadedBy: 'Erik Johansson'
        }
      ];
      setPdfList(dummyDocs);
    } catch (error) {
      console.error('Error loading PDF documents:', error);
    }
  };

  // Funktion för att hantera filuppladdning
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadFile = files[0];
      
      // Skapa en FormData för uppladdning
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('projectId', currentProject?.id || '');
      formData.append('description', 'Uppladdad PDF');

      // Simulera API-anrop för uppladdning
      // const response = await api.post('/api/timereporting/pdfs/upload', formData);
      
      // För demo, lägg till i frontend-listan
      const newPdf: PDFDocument = {
        id: Date.now().toString(),
        fileName: uploadFile.name,
        uploadDate: new Date().toISOString().split('T')[0],
        description: 'Uppladdad PDF',
        fileUrl: URL.createObjectURL(uploadFile), // Skapa en temporär URL för filen
        uploadedBy: 'Aktuell användare',
        isLocal: true // Markera att denna fil är lokal och inte på servern
      };
      
      setPdfList(prevList => [...prevList, newPdf]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Funktion för att öppna PDF i visaren - konverterar alltid till blob först
  const openPdfViewer = async (pdf: PDFDocument) => {
    try {
      // Om fileUrl redan är en blob-URL (dvs. startar med 'blob:'), använd direkt
      if (pdf.fileUrl.startsWith('blob:')) {
        console.log('PDF är redan i blob-format, visar direkt');
        setSelectedPdf({...pdf, isLocal: true});
        setIsViewerOpen(true);
        return;
      }
      
      // För lokala uppladdade filer (som redan är blob-URLs), använd dem direkt
      if (pdf.isLocal && pdf.fileUrl.startsWith('blob:')) {
        console.log('Lokal PDF med blob-URL, visar direkt');
        setSelectedPdf(pdf);
        setIsViewerOpen(true);
        return;
      }
      
      // I alla andra fall, konvertera till blob först för att undvika sandbox-restriktioner
      try {
        console.log('Konverterar PDF till blob-URL:', pdf.fileName);
        // Hämta som blob
        const response = await fetch(pdf.fileUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Skapa en kopia av objektet med blob-URL
        const blobPdf: PDFDocument = {
          ...pdf,
          fileUrl: blobUrl,
          isLocal: true
        };

        console.log('PDF konverterad till blob-URL:', blobUrl);
        setSelectedPdf(blobPdf);
        setIsViewerOpen(true);
      } catch (blobError) {
        console.error('Kunde inte ladda PDF som blob, försöker med fallback:', blobError);
        // Visa fallback-meddelande direkt
        // Markera som ej lokal så att fallback-UI visas
        setSelectedPdf({
          ...pdf,
          isLocal: false
        });
        setIsViewerOpen(true);
      }
    } catch (error) {
      console.error('Allvarligt fel vid öppning av PDF-visare:', error);
      // Visa fallback-UI
      setSelectedPdf(pdf);
      setIsViewerOpen(true);
    }
  };

  // Funktion för att stänga PDF-visaren
  const closePdfViewer = () => {
    setSelectedPdf(null);
    setIsViewerOpen(false);
  };

  // Funktion för att ta bort ett PDF-dokument
  const handleDelete = (pdfId: string) => {
    // Simulera en API-anrop för borttagning
    // await api.delete(`/api/timereporting/pdfs/${pdfId}`);
    
    // Ta bort från listan
    setPdfList(prevList => prevList.filter(pdf => pdf.id !== pdfId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography level="h1" component="h1" sx={{ mb: 4 }}>
        Tidsrapportering
      </Typography>

      <Card variant="outlined" sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={8}>
            <Typography level="h3">
              PDF-dokument
            </Typography>
            <Typography level="body-sm" color="neutral">
              Ladda upp och hantera PDF-filer relaterade till tidsrapportering
            </Typography>
          </Grid>
          <Grid xs={12} md={4} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button
              component="label"
              startDecorator={<FileUploadIcon />}
              disabled={isUploading}
              variant="solid"
            >
              Ladda upp PDF
              <input 
                type="file" 
                hidden 
                accept="application/pdf" 
                onChange={handleFileUpload} 
              />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card variant="outlined">
        <List size="lg">
          {pdfList.length > 0 ? (
            pdfList.map((pdf, index) => (
              <React.Fragment key={pdf.id}>
                {index > 0 && <ListDivider />}
                <ListItem
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AspectRatio ratio="1" sx={{ width: 50, borderRadius: 'sm' }}>
                      <PdfIcon sx={{ fontSize: 32, color: 'error.600' }} />
                    </AspectRatio>
                    <Box sx={{ flexGrow: 1 }} onClick={() => openPdfViewer(pdf)}>
                      <Typography level="title-sm">{pdf.fileName}</Typography>
                      <Typography level="body-sm" noWrap>
                        {pdf.description || 'Ingen beskrivning'}
                      </Typography>
                      <Typography level="body-xs" color="neutral">
                        Uppladdad {pdf.uploadDate} av {pdf.uploadedBy}
                      </Typography>
                    </Box>
                    <IconButton 
                      variant="plain" 
                      color="neutral" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pdf.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemContent>
                </ListItem>
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemContent>
                <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: 'neutral.400' }} />
                  <Typography level="body-sm" textAlign="center">
                    Inga PDF-dokument har laddats upp än.
                  </Typography>
                  <Button
                    component="label"
                    size="sm"
                    startDecorator={<FileUploadIcon />}
                  >
                    Ladda upp PDF
                    <input 
                      type="file" 
                      hidden 
                      accept="application/pdf" 
                      onChange={handleFileUpload} 
                    />
                  </Button>
                </Stack>
              </ListItemContent>
            </ListItem>
          )}
        </List>
      </Card>

      {/* Modal för PDF-visare */}
      <Modal open={isViewerOpen} onClose={closePdfViewer}>
        <ModalDialog 
          layout="fullscreen" 
          size="lg"
          sx={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 0, sm: 0 },
            m: { xs: 0, sm: 0 },
            maxWidth: '100vw',
            maxHeight: '100vh',
            borderRadius: { xs: 0, sm: 0 }
          }}
        >
          <ModalClose />
          {selectedPdf && (
            <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
              <Sheet
                variant="solid"
                color="neutral"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography level="title-lg">{selectedPdf.fileName}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="sm" 
                    variant="soft" 
                    color="primary" 
                    startDecorator={<DownloadIcon />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedPdf.fileUrl;
                      link.download = selectedPdf.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Ladda ner
                  </Button>
                  <Button
                    size="sm"
                    variant="solid"
                    color="primary"
                    onClick={() => window.open(selectedPdf.fileUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Öppna i ny flik
                  </Button>
                </Stack>
              </Sheet>
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'hidden', 
                bgcolor: 'background.level1',
                height: 'calc(80vh - 64px)'
              }}>
                {/* Använd BlobPDFViewer när URL är i blob-format, annars visa felmeddelande */}
                {selectedPdf.fileUrl.startsWith('blob:') ? (
                  <BlobPDFViewer 
                    pdfUrl={selectedPdf.fileUrl}
                    filename={selectedPdf.fileName}
                  />
                ) : (
                  <EmbeddedPDFViewer 
                    pdfUrl={selectedPdf.fileUrl}
                    filename={selectedPdf.fileName}
                    fileId={selectedPdf.id}
                    isLocal={selectedPdf.isLocal}
                  />
                )}
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Container>
  );
};

export default TimeReportingPage;