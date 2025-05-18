// Denna wrapper-komponent hjälper till att lösa typkompatibilitetsproblem med Recharts
import React, { ReactElement } from 'react';

// Generisk wrapper för Recharts-komponenter för att hantera TypeScript-kompatibilitet
export const ChartWrapper = ({ 
  children 
}: { 
  children: React.ReactNode 
}): ReactElement => {
  return <>{children}</>;
};

export default ChartWrapper;