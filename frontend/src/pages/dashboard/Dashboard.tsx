import React from 'react';
import ModernDashboard from '../../components/dashboard/ModernDashboard';

// Dashboard Widget typ
export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'barChart' | 'pieChart' | 'topProjects' | 'recentActivity' | 'lineChart' | 'calendar';
  title: string;
  size: 'small' | 'medium' | 'large';
  metricIndex?: number;
  order: number;
  visible: boolean;
}

const Dashboard = () => {
  return <ModernDashboard />;
};

export default Dashboard;