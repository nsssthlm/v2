import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/joy';

interface DirectPDFEmbedProps {
  url: string;
  width?: string | number;
  height?: string | number;
}

/**
 * Extremt enkel PDF-visare som använder direktinbäddning genom dangerouslySetInnerHTML
 * för att undvika säkerhetsbegränsningar i webbläsare
 */
const DirectPDFEmbed: React.FC<DirectPDFEmbedProps> = ({ 
  url, 
  width = '100%', 
  height = '100%' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && url) {
      containerRef.current.innerHTML = '';
      
      // Skapa embed-element direkt via DOM API
      const embed = document.createElement('embed');
      embed.setAttribute('src', url);
      embed.setAttribute('type', 'application/pdf');
      embed.style.width = '100%';
      embed.style.height = '100%';
      embed.style.border = 'none';
      
      containerRef.current.appendChild(embed);
    }
  }, [url]);

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width, 
        height, 
        overflow: 'hidden',
        '& embed': {
          border: 'none'
        }
      }}
    />
  );
};

export default DirectPDFEmbed;