// Testdata för dashboard-widgets

// Metrics-data för statuswidgets
export const metricsData = [
  {
    title: 'Projektledare',
    value: '32',
    trend: {
      value: 8.2,
      isPositive: true,
      text: 'sedan förra månaden'
    },
    icon: 'people'
  },
  {
    title: 'Aktiva projekt',
    value: '84',
    trend: {
      value: 12.5,
      isPositive: true,
      text: 'sedan förra månaden'
    },
    icon: 'orders'
  },
  {
    title: 'Mötande budget',
    value: '92%',
    trend: {
      value: 3.6,
      isPositive: true,
      text: 'sedan förra månaden'
    },
    icon: 'revenue'
  },
  {
    title: 'Ökade intäkter',
    value: '14.2M kr',
    trend: {
      value: 5.8,
      isPositive: true,
      text: 'sedan förra månaden'
    },
    icon: 'growth'
  }
];

// Data för stapeldiagram
export const projectChartData = [
  {
    name: 'Jan',
    planerat: 11,
    faktiskt: 9
  },
  {
    name: 'Feb',
    planerat: 15,
    faktiskt: 17
  },
  {
    name: 'Mar',
    planerat: 18,
    faktiskt: 16
  },
  {
    name: 'Apr',
    planerat: 21,
    faktiskt: 20
  },
  {
    name: 'Maj',
    planerat: 24,
    faktiskt: 22
  },
  {
    name: 'Jun',
    planerat: 22,
    faktiskt: 20
  }
];

// Data för cirkeldiagram
export const projectTypeData = [
  { name: 'Kontorsbyggnader', value: 35 },
  { name: 'Bostäder', value: 25 },
  { name: 'Infrastruktur', value: 20 },
  { name: 'Offentliga byggnader', value: 15 },
  { name: 'Övriga', value: 5 }
];

// Data för topprojekt-tabell
export const topProjectsData = [
  {
    id: 1,
    name: 'Citykvarteret Norrtälje',
    progress: 75,
    status: 'Pågående',
    budget: '32.5M kr'
  },
  {
    id: 2,
    name: 'Södertälje Centrum',
    progress: 48,
    status: 'Pågående',
    budget: '54.2M kr'
  },
  {
    id: 3,
    name: 'Trädgårdsstaden Täby',
    progress: 90,
    status: 'Slutfas',
    budget: '28.7M kr'
  },
  {
    id: 4,
    name: 'Kontorshuset Kista',
    progress: 35,
    status: 'Pågående',
    budget: '63.1M kr'
  },
  {
    id: 5,
    name: 'Nya Pendeltågsstationen',
    progress: 15,
    status: 'Påbörjad',
    budget: '120.3M kr'
  }
];

// Data för senaste aktiviteter
export const recentActivityData = [
  {
    id: 1,
    action: 'Laddat upp ritning',
    project: 'Citykvarteret Norrtälje',
    user: 'Anna Bergman',
    time: '14:32'
  },
  {
    id: 2,
    action: 'Uppdaterat budget',
    project: 'Södertälje Centrum',
    user: 'Erik Johansson',
    time: '13:15'
  },
  {
    id: 3,
    action: 'Skapat nytt möte',
    project: 'Trädgårdsstaden Täby',
    user: 'Maria Andersson',
    time: '11:47'
  },
  {
    id: 4,
    action: 'Godkänt ritning',
    project: 'Kontorshuset Kista',
    user: 'Daniel Nilsson',
    time: '10:28'
  },
  {
    id: 5,
    action: 'Kommenterat dokument',
    project: 'Nya Pendeltågsstationen',
    user: 'Sophia Lindberg',
    time: '09:05'
  }
];