import React from 'react';
import { Button } from '@mui/joy';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface SimpleClickableFileProps {
  name: string;
  fileUrl: string;
}

const SimpleClickableFile: React.FC<SimpleClickableFileProps> = ({ name, fileUrl }) => {
  const isPdf = name.toLowerCase().endsWith('.pdf');
  
  const handleClick = () => {
    // Öppna filen i ny flik
    window.open(fileUrl, '_blank');
  };
  
  return (
    <Button
      size="sm"
      variant="solid"
      color="primary"
      startDecorator={<VisibilityIcon />}
      onClick={handleClick}
      sx={{ fontSize: '0.8rem', py: 0.5 }}
    >
      Visa {isPdf ? 'PDF' : 'fil'}
    </Button>
  );
};

export default SimpleClickableFile;