// Exempeldata för dashboard-komponenter

// Projektstatistik
export const metricsData = [
  {
    title: 'Kunder',
    value: '36,254',
    trend: {
      value: 5.27,
      isPositive: true,
      text: 'Sedan förra månaden'
    },
    icon: 'people'
  },
  {
    title: 'Projekt',
    value: '5,543',
    trend: {
      value: 1.08,
      isPositive: true,
      text: 'Sedan förra månaden'
    },
    icon: 'orders'
  },
  {
    title: 'Intäkter',
    value: '6 254 kr',
    trend: {
      value: 7.00,
      isPositive: false,
      text: 'Sedan förra månaden'
    },
    icon: 'revenue'
  },
  {
    title: 'Tillväxt',
    value: '30.56%',
    trend: {
      value: 4.87,
      isPositive: true,
      text: 'Sedan förra månaden'
    },
    icon: 'growth'
  }
];

// Diagramdata - Projektioner vs Faktiska timmar
export const projectChartData = [
  { name: 'Jan', projected: 120, actual: 100 },
  { name: 'Feb', projected: 140, actual: 120 },
  { name: 'Mar', projected: 170, actual: 160 },
  { name: 'Apr', projected: 190, actual: 180 },
  { name: 'Maj', projected: 170, actual: 140 },
  { name: 'Jun', projected: 190, actual: 180 },
  { name: 'Jul', projected: 120, actual: 100 },
  { name: 'Aug', projected: 90, actual: 80 },
  { name: 'Sep', projected: 170, actual: 140 },
  { name: 'Okt', projected: 160, actual: 140 },
  { name: 'Nov', projected: 180, actual: 150 },
  { name: 'Dec', projected: 190, actual: 170 }
];

// Cirkeldiagram - Projekttyper
export const projectTypeData = [
  { name: 'Nybyggnation', value: 45, color: '#60cd18' },
  { name: 'Renovering', value: 25, color: '#5ecf3e' },
  { name: 'Tillbyggnad', value: 20, color: '#8ddb5e' },
  { name: 'Planering', value: 10, color: '#a7e582' }
];

// Aktivitetslista
export const recentActivityData = [
  {
    id: 1,
    icon: 'upload',
    text: 'Nytt ritningsunderlag uppladdad för Kontorskomplex Malmö',
    time: 'För 5 minuter sedan',
    user: 'Mikael Björk'
  },
  {
    id: 2,
    icon: 'comment',
    text: 'Kommentar tillagd på Bostadshus Liljeholmen',
    time: 'För 2 timmar sedan',
    user: 'Anna Sundström'
  },
  {
    id: 3,
    icon: 'user',
    text: 'Robert Delaney öppnade Fasadritning Norrtälje',
    time: 'För 3 timmar sedan',
    user: 'Robert Delaney'
  },
  {
    id: 4,
    icon: 'download',
    text: 'Konstruktionsritningar för Kulturhuset hämtade',
    time: 'För 5 timmar sedan',
    user: 'Johanna Berg'
  },
  {
    id: 5,
    icon: 'upload',
    text: 'Ny version av energiutredning uppladdad',
    time: 'För 8 timmar sedan',
    user: 'Peter Nilsson'
  }
];

// Toppsäljande projekt
export const topProjectsData = [
  {
    id: 1,
    name: 'Bostadskvarter Högdalen',
    date: '27 april 2025',
    quantity: 82,
    price: '875 kr',
    amount: '76 518 kr'
  },
  {
    id: 2,
    name: 'Kontorsfastighet Lindhagen',
    date: '25 mars 2025',
    quantity: 37,
    price: '1 128 kr',
    amount: '44 754 kr'
  },
  {
    id: 3,
    name: 'Skolbyggnad Bromma',
    date: '17 mars 2025',
    quantity: 64,
    price: '939 kr',
    amount: '62 559 kr'
  },
  {
    id: 4,
    name: 'Stadsbibliotek Uppsala',
    date: '12 mars 2025',
    quantity: 184,
    price: '920 kr',
    amount: '169 680 kr'
  },
  {
    id: 5,
    name: 'Vårdcentral Skövde',
    date: '05 mars 2025',
    quantity: 69,
    price: '928 kr',
    amount: '64 965 kr'
  }
];