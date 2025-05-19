import { useState } from 'react';
import PDFDialog from '../../components/PDFDialog';

const FolderPageNew: React.FC = () => {
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);

  const handlePdfClick = (file: { name: string; url: string }) => {
    setSelectedPdf({ url: file.url, name: file.name });
    setPdfDialogOpen(true);
  };

  const files = [
    { id: 1, name: 'BEAst-PDF-Guidelines-2_1r4W7o4.0_1.pdf', url: 'http://0.0.0.0:8001/media/project_files/2025/05/19/BEAst-PDF-Guidelines-2_1r4W7o4.0_1.pdf' },
  ];

  return (
    <div>
      <h2>Mappvy</h2>
      <ul>
        {files.map(file => (
          <li key={file.id} onClick={() => handlePdfClick(file)} style={{ cursor: 'pointer' }}>
            {file.name}
          </li>
        ))}
      </ul>
      {selectedPdf && (
        <PDFDialog
          open={pdfDialogOpen}
          onClose={() => setPdfDialogOpen(false)}
          pdfUrl={selectedPdf.url}
          filename={selectedPdf.name}
        />
      )}
    </div>
  );
};

export default FolderPageNew;