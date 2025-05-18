import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid as RechartsCartesianGrid, 
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import { Box, Card, Typography, IconButton } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface ProjectChartProps {
  title: string;
  data: Array<{
    name: string;
    projected: number;
    actual: number;
  }>;
}

const ProjectChart = ({ title, data }: ProjectChartProps) => {
  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-md">{title}</Typography>
        <IconButton variant="plain" color="neutral" size="sm">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ height: 300, width: '100%' }}>
        <RechartsResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <RechartsCartesianGrid strokeDasharray="3 3" vertical={false} />
            <RechartsXAxis dataKey="name" />
            <RechartsYAxis />
            <RechartsTooltip />
            <RechartsLegend />
            <RechartsBar dataKey="projected" name="Planerade timmar" fill="#e0e0e0" />
            <RechartsBar dataKey="actual" name="Faktiska timmar" fill="#60cd18" />
          </RechartsBarChart>
        </RechartsResponsiveContainer>
      </Box>
    </Card>
  );
};

export default ProjectChart;