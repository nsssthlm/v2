import React from 'react';
import { Box, Typography } from '@mui/joy';

interface PDFClickableItemProps {
  file: {
    id: string | number;
    name: string;
    file: string;
    content_type?: string;
    uploaded_at?: string;
  };
  onClick: (file: any) => void;
}

const PDFClickableItem: React.FC<PDFClickableItemProps> = ({ file, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(file);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
          color: 'primary.600'
        }
      }}
      onClick={handleClick}
    >
      <span style={{ color: '#3182ce' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
        </svg>
      </span>
      <Typography sx={{ color: 'inherit' }}>{file.name}</Typography>
    </Box>
  );
};

export default PDFClickableItem;