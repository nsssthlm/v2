// Mockdata för kalenderhändelser

// Dagens datum för att skapa relativa datum
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// Hjälpfunktion för att skapa datum
function createDate(day: number, monthOffset = 0): Date {
  return new Date(currentYear, currentMonth + monthOffset, day);
}

// Viktiga datum för markering i kalendern
export const markedDates: Date[] = [
  // Denna månad
  createDate(8),
  createDate(12),
  createDate(15),
  createDate(22),
  createDate(28),
  
  // Nästa månad
  createDate(3, 1),
  createDate(10, 1),
  createDate(17, 1),
  
  // Föregående månad
  createDate(25, -1),
  createDate(28, -1),
];

// Händelser för specifika datum
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'möte' | 'deadline' | 'presentation' | 'annat';
  description?: string;
  participants?: string[];
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Projektstart Renovering Stadshuset',
    date: createDate(8),
    type: 'möte',
    description: 'Uppstartsmöte för renoveringsprojektet av Stadshuset.',
    participants: ['Anna Svensson', 'Johan Johansson', 'Maria Ek']
  },
  {
    id: '2',
    title: 'Deadline tillståndshandlingar',
    date: createDate(12),
    type: 'deadline',
    description: 'Sista dag att skicka in handlingar för bygglovstillstånd.'
  },
  {
    id: '3',
    title: 'Presentation nya avdelningskontoret',
    date: createDate(15),
    type: 'presentation',
    description: 'Presentation av ritningar för det nya avdelningskontoret.',
    participants: ['Anna Svensson', 'Per Nilsson', 'Johanna Berg']
  },
  {
    id: '4',
    title: 'Leverans konstruktionsritningar',
    date: createDate(22),
    type: 'deadline',
    description: 'Leverans av konstruktionsritningar för granskning.'
  },
  {
    id: '5',
    title: 'Uppföljningsmöte Biblioteket',
    date: createDate(28),
    type: 'möte',
    description: 'Uppföljning av pågående arbeten med biblioteksprojektet.',
    participants: ['Johan Johansson', 'Maria Ek', 'Lars Holmberg']
  },
  {
    id: '6',
    title: 'Projektavslut Kontorslandskap',
    date: createDate(3, 1),
    type: 'möte',
    description: 'Avslutande möte för kontorslandskapsprojektet.',
    participants: ['Anna Svensson', 'Per Nilsson', 'Maria Ek']
  },
  {
    id: '7',
    title: 'Budgetpresentation Q3',
    date: createDate(10, 1),
    type: 'presentation',
    description: 'Presentation av budget för tredje kvartalet.',
    participants: ['Johan Johansson', 'Per Nilsson', 'Lars Holmberg']
  },
  {
    id: '8',
    title: 'Inlämning miljökonsekvensbeskrivning',
    date: createDate(17, 1),
    type: 'deadline',
    description: 'Inlämning av miljökonsekvensbeskrivning för nya projekt.'
  },
  {
    id: '9',
    title: 'Styrelsemöte',
    date: createDate(25, -1),
    type: 'möte',
    description: 'Ordinarie styrelsemöte.',
    participants: ['Anna Svensson', 'Johan Johansson', 'Lars Holmberg']
  },
  {
    id: '10',
    title: 'Leverans visualiseringar',
    date: createDate(28, -1),
    type: 'deadline',
    description: 'Leverans av visualiseringar för kommande projekt.'
  }
];