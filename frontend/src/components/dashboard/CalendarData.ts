// Här sparar vi testdata för kalenderhändelser

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'reminder' | 'delivery';
  projectId?: number;
  description?: string;
}

// Skapa några händelser för denna månad och nästa månad
export const generateCalendarEvents = (): CalendarEvent[] => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Denna månads händelser
  const thisMonthEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Projektmöte - Solna Kontor',
      date: new Date(currentYear, currentMonth, today.getDate() + 2),
      type: 'meeting',
      projectId: 1,
      description: 'Genomgång av nya ritningar och tidsplan.'
    },
    {
      id: 2,
      title: 'Deadline - Planritningar',
      date: new Date(currentYear, currentMonth, today.getDate() + 5),
      type: 'deadline',
      projectId: 2,
      description: 'Slutgiltig version av planritningar ska levereras.'
    },
    {
      id: 3,
      title: 'Kundpresentation',
      date: new Date(currentYear, currentMonth, today.getDate() - 1),
      type: 'meeting',
      projectId: 3,
      description: 'Presentation av förslag för kunden.'
    },
    {
      id: 4,
      title: 'Leverans - Bygglovshandlingar',
      date: new Date(currentYear, currentMonth, today.getDate() + 8),
      type: 'delivery',
      projectId: 1,
      description: 'Alla dokument för bygglovsansökan.'
    }
  ];
  
  // Nästa månads händelser
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  const nextMonthEvents: CalendarEvent[] = [
    {
      id: 5,
      title: 'Projektstart - Villaprojekt',
      date: new Date(nextMonthYear, nextMonth, 3),
      type: 'meeting',
      projectId: 4,
      description: 'Kickoff för nytt villaprojekt i Täby.'
    },
    {
      id: 6,
      title: 'Påminnelse - Fakturera',
      date: new Date(nextMonthYear, nextMonth, 5),
      type: 'reminder',
      description: 'Slutfaktura för Projekt Kista Galleria'
    },
    {
      id: 7,
      title: 'Byggmöte på plats',
      date: new Date(nextMonthYear, nextMonth, 10),
      type: 'meeting',
      projectId: 1,
      description: 'Avstämning av byggprocess med entreprenör.'
    }
  ];
  
  // Föregående månads händelser
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const prevMonthEvents: CalendarEvent[] = [
    {
      id: 8,
      title: 'Avslutat projekt',
      date: new Date(prevMonthYear, prevMonth, 25),
      type: 'delivery',
      projectId: 5,
      description: 'Slutgranskning och leverans av slutritningar.'
    },
    {
      id: 9,
      title: 'Studiebesök',
      date: new Date(prevMonthYear, prevMonth, 28),
      type: 'meeting',
      projectId: 2,
      description: 'Studiebesök på referensprojekt.'
    }
  ];
  
  return [...prevMonthEvents, ...thisMonthEvents, ...nextMonthEvents];
};

// Exportera händelserna
export const calendarEvents = generateCalendarEvents();

// Funktion för att få dagens datum med framhävd styling
export const getTodayHighlight = (): string => {
  const today = new Date();
  return `${today.getDate()} ${today.toLocaleString('sv-SE', { month: 'long' })}`;
};

// Funktion för att hämta datum för markeringar i kalendern
export const getMarkedDates = (): Date[] => {
  return calendarEvents.map(event => event.date);
};

// Funktion för att hämta kommande händelser baserat på inloggad användare
export const getUpcomingEvents = (userId: number = 1, limit: number = 5): CalendarEvent[] => {
  const today = new Date();
  
  // Filtrera händelser som är från dagens datum och framåt, och sortera dem efter datum
  return calendarEvents
    .filter(event => event.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
};

// Funktion för att få händelser för ett specifikt datum
export const getEventsForDate = (date: Date): CalendarEvent[] => {
  return calendarEvents.filter(event => 
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
};

// Funktion för att få händelser för en specifik månad
export const getEventsForMonth = (year: number, month: number): CalendarEvent[] => {
  return calendarEvents.filter(event => 
    event.date.getMonth() === month &&
    event.date.getFullYear() === year
  );
};

// Funktion för att få händelser för en specifik vecka
export const getEventsForWeek = (date: Date): CalendarEvent[] => {
  const startOfWeek = new Date(date);
  const dayOfWeek = startOfWeek.getDay() || 7; // 0 = söndag, 1 = måndag, ... 7 = söndag i vår kod
  startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1)); // Måndag i den veckan
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Söndag i den veckan
  
  return calendarEvents.filter(event => 
    event.date >= startOfWeek && 
    event.date <= endOfWeek
  );
};

// Funktion för att formatera datum till läsbart format
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Funktion för att formatera datum till kort format
export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short'
  });
};