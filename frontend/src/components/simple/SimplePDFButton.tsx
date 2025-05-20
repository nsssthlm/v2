import React from 'react';
import { Button } from '@mui/joy';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface SimplePDFButtonProps {
  fileUrl: string;
  fileName: string;
}

/**
 * En extremt enkel knapp för att öppna PDF-filer
 * Denna använder inga externa beroenden och öppnar filen direkt i en ny flik
 */
const SimplePDFButton: React.FC<SimplePDFButtonProps> = ({ fileUrl, fileName }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Öppna filen direkt i en ny flik
    window.open(fileUrl, '_blank');
    
    console.log(`Öppnar PDF: ${fileName} på URL: ${fileUrl}`);
  };
  
  return (
    <Button
      size="sm"
      variant="solid"
      color="primary"
      startDecorator={<VisibilityIcon />}
      onClick={handleClick}
      sx={{ 
        fontSize: '0.8rem', 
        py: 0.5,
        bgcolor: '#1976d2', 
        color: 'white',
        '&:hover': {
          bgcolor: '#1565c0'
        }
      }}
    >
      Visa PDF
    </Button>
  );
};

export default SimplePDFButton;