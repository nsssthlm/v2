import React from 'react';
import { Box, Button } from '@mui/joy';

interface PDFLinkProps {
  file: {
    id: string | number;
    name: string;
    file: string;
    content_type?: string;
    uploaded_at?: string;
  };
  onShowPdf: (file: any) => void;
}

const PDFLink: React.FC<PDFLinkProps> = ({ file, onShowPdf }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Öppnar PDF:", file);
    onShowPdf(file);
  };

  return (
    <Button
      size="sm"
      variant="plain"
      color="primary"
      onClick={handleClick}
      sx={{ p: 0.5 }}
    >
      {file.name}
    </Button>
  );
};

export default PDFLink;