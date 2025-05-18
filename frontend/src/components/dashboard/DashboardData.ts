/**
 * Dashboard Data
 * 
 * Mockdata för alla dashboard-komponenter
 * Detta gör det enkelt att arbeta med konsistenta data i dashboard
 */

// SimpleBarChart Data - Timmar per månad
export const projectHoursData = [
  { name: 'Jan', planerat: 150, faktiskt: 165 },
  { name: 'Feb', planerat: 190, faktiskt: 175 },
  { name: 'Mar', planerat: 220, faktiskt: 210 },
  { name: 'Apr', planerat: 200, faktiskt: 185 },
  { name: 'Maj', planerat: 230, faktiskt: 245 },
  { name: 'Jun', planerat: 210, faktiskt: 205 },
  { name: 'Jul', planerat: 110, faktiskt: 90 },
  { name: 'Aug', planerat: 150, faktiskt: 145 },
  { name: 'Sep', planerat: 220, faktiskt: 235 },
  { name: 'Okt', planerat: 210, faktiskt: 195 },
  { name: 'Nov', planerat: 180, faktiskt: 175 },
  { name: 'Dec', planerat: 140, faktiskt: 120 },
];

// SimplePieChart Data - Dokumenttyper
export const documentTypesData = [
  { name: 'Ritningar', value: 42, color: '#007934' },
  { name: 'Kontrakt', value: 28, color: '#43a047' },
  { name: 'Specifikationer', value: 18, color: '#66bb6a' },
  { name: 'Rapporter', value: 12, color: '#81c784' },
  { name: 'Foton', value: 8, color: '#a5d6a7' },
  { name: 'Övrigt', value: 5, color: '#c8e6c9' },
];

// SimplePieChart Data - Projektstatus
export const projectStatusData = [
  { name: 'Pågående', value: 65, color: '#2196f3' },
  { name: 'Slutfas', value: 15, color: '#4caf50' },
  { name: 'Planering', value: 12, color: '#ffeb3b' },
  { name: 'Försenad', value: 8, color: '#f44336' },
];

// SimplePieChart Data - Budget fördelning
export const budgetAllocationData = [
  { name: 'Material', value: 42, color: '#9c27b0' },
  { name: 'Personal', value: 30, color: '#673ab7' },
  { name: 'Konsulter', value: 18, color: '#3f51b5' },
  { name: 'Utrustning', value: 10, color: '#2196f3' },
];

// TopProjectsTable Data - Aktiva projekt
export const activeProjectsData = [
  { 
    id: 1, 
    name: 'Nybyggnation Kv. Björken', 
    progress: 78, 
    status: 'Pågående', 
    budget: '24,5 Mkr' 
  },
  { 
    id: 2, 
    name: 'Renovering Storgatan 45', 
    progress: 92, 
    status: 'Slutfas', 
    budget: '12,2 Mkr' 
  },
  { 
    id: 3, 
    name: 'Infrastruktur Södra Området', 
    progress: 45, 
    status: 'Pågående', 
    budget: '32,8 Mkr' 
  },
  { 
    id: 4, 
    name: 'Ombyggnad Centrumtorget', 
    progress: 28, 
    status: 'Försenad', 
    budget: '8,7 Mkr' 
  },
  { 
    id: 5, 
    name: 'Parkprojekt Norra Staden', 
    progress: 64, 
    status: 'Pågående', 
    budget: '5,3 Mkr' 
  },
  { 
    id: 6, 
    name: 'Energieffektivisering Kommunhuset', 
    progress: 85, 
    status: 'Slutfas', 
    budget: '3,9 Mkr' 
  },
  { 
    id: 7, 
    name: 'Renovering Skolan Ljungbacken', 
    progress: 15, 
    status: 'Försenad', 
    budget: '18,1 Mkr' 
  },
  { 
    id: 8, 
    name: 'Ombyggnad Vårdcentralen', 
    progress: 37, 
    status: 'Pågående', 
    budget: '9,4 Mkr' 
  },
];

// RecentActivityList Data - Senaste aktiviteter
export const recentActivitiesData = [
  { 
    id: 1, 
    action: 'Laddat upp ny ritning', 
    project: 'Nybyggnation Kv. Björken', 
    user: 'Anna Lindberg', 
    time: 'Idag 15:32' 
  },
  { 
    id: 2, 
    action: 'Kommenterat på dokument', 
    project: 'Renovering Storgatan 45', 
    user: 'Erik Svensson', 
    time: 'Idag 14:05' 
  },
  { 
    id: 3, 
    action: 'Uppdaterat budget', 
    project: 'Infrastruktur Södra Området', 
    user: 'Maria Johansson', 
    time: 'Idag 11:47' 
  },
  { 
    id: 4, 
    action: 'Schemalagt möte', 
    project: 'Ombyggnad Centrumtorget', 
    user: 'Johan Berggren', 
    time: 'Igår 16:30' 
  },
  { 
    id: 5, 
    action: 'Ändrat projektdetaljer', 
    project: 'Parkprojekt Norra Staden', 
    user: 'Sofia Ek', 
    time: 'Igår 13:18' 
  },
  { 
    id: 6, 
    action: 'Laddat upp kontrakt', 
    project: 'Energieffektivisering Kommunhuset', 
    user: 'Peter Kvist', 
    time: 'Igår 10:05' 
  },
  { 
    id: 7, 
    action: 'Skapat ny byggritning', 
    project: 'Renovering Skolan Ljungbacken', 
    user: 'Malin Gran', 
    time: '15 maj 09:32' 
  },
  { 
    id: 8, 
    action: 'Uppdaterat tidsplan', 
    project: 'Ombyggnad Vårdcentralen', 
    user: 'Anders Holm', 
    time: '14 maj 14:45' 
  },
  { 
    id: 9, 
    action: 'Godkänt konstruktionsplan', 
    project: 'Nybyggnation Kv. Björken', 
    user: 'Karin Alm', 
    time: '14 maj 11:20' 
  },
  { 
    id: 10, 
    action: 'Kommenterat om materialval', 
    project: 'Renovering Storgatan 45', 
    user: 'Nils Berg', 
    time: '13 maj 16:38' 
  },
];

// Extra detaljerad data för övriga visualiseringar 

// Dokumentstatistik
export const documentStatsData = {
  totalDocuments: 2458,
  uploadedThisMonth: 187,
  reviewsPending: 34,
  documentTypes: {
    drawings: 842,
    contracts: 326,
    specifications: 594,
    reports: 415,
    photos: 203,
    other: 78
  }
};

// Projektstatistik
export const projectStatsData = {
  totalProjects: 28,
  activeProjects: 16,
  completedProjects: 12,
  onSchedule: 11,
  delayed: 5,
  totalBudget: '342,5 Mkr',
  usedBudget: '193,7 Mkr'
};

// Användarstatistik
export const userStatsData = {
  totalUsers: 145,
  activeUsers: 87,
  newUsersThisMonth: 12,
  roleDistribution: {
    projectLeaders: 18,
    architects: 32,
    engineers: 45,
    contractors: 38,
    clients: 12
  }
};

// Trendata för visning i linjegrafer
export const trendData = {
  documents: [42, 55, 47, 62, 68, 73, 80, 95, 87, 92, 101, 110],
  projects: [5, 6, 8, 10, 9, 12, 14, 16, 15, 18, 20, 24],
  users: [34, 38, 42, 50, 55, 68, 74, 85, 90, 95, 110, 120],
  budget: [12.5, 18.2, 22.8, 28.4, 35.2, 42.8, 56.3, 68.1, 79.5, 92.3, 105.8, 118.2]
};

// Kombinerad data för mer komplexa visualiseringar
export const combinedProjectData = activeProjectsData.map(project => ({
  ...project,
  documentsCount: Math.floor(Math.random() * 100) + 20,
  commentsCount: Math.floor(Math.random() * 50) + 5,
  team: Math.floor(Math.random() * 8) + 2,
  startDate: new Date(2025, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toLocaleDateString('sv-SE'),
  endDate: new Date(2025, Math.floor(Math.random() * 5) + 6, Math.floor(Math.random() * 28) + 1).toLocaleDateString('sv-SE'),
}));