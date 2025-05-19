// Användartyper och roller
export type UserRole = 'admin' | 'project_leader' | 'user';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

// Fördefinierade användare enligt krav
const users: User[] = [
  {
    username: 'projectleader',
    password: '123456',
    role: 'project_leader'
  },
  {
    username: 'user',
    password: '123456',
    role: 'user'
  },
  {
    username: 'admin',
    password: '123456',
    role: 'admin'
  }
];

// Funktion för att generera en enkel JWT-token för frontend-testning
// OBS: Detta är endast för testning och ska aldrig användas i produktion
export const generateFakeJwtToken = (user: User): string => {
  // För testning i Replit-miljön (och med Django backend) använder vi en 
  // fördefinierad token som backend känner igen, istället för att generera en ny
  
  // Fördefinierade giltiga token för respektive roll
  const tokenMap = {
    admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTkwMDAwMDAwMH0.ZkLT7XkKMXPWH68KuK5K7ft-uRzEHfGTxUBP0KnO8YU',
    project_leader: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9qZWN0bGVhZGVyIiwicm9sZSI6InByb2plY3RfbGVhZGVyIiwiZXhwIjoxOTAwMDAwMDAwfQ.Y9qsCN0v4VG9n1PVbVZQoSHGQZ-nCCrjZdlOi17DWVs',
    user: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJleHAiOjE5MDAwMDAwMDB9.DQa8pQiaXGu8nj7pFjw3WYPKhJBLCiuvJ7Lj5Igdl9U'
  };
  
  // Använd den fördefinierade token för användarens roll eller skapa en generisk
  return tokenMap[user.role] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsInJvbGUiOiJndWVzdCIsImV4cCI6MTkwMDAwMDAwMH0.QyxePKw0oG4x_mshKcDqS1quOsYLi8JXdnrj4JHYdII';
};

// Logga in användare
export const loginUser = (username: string, password: string): { success: boolean; user?: User; message?: string } => {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  
  if (user) {
    // Simulera en JWT token för autentisering (i ett riktigt system skulle detta genereras av servern)
    const fakeJwtToken = generateFakeJwtToken(user);
    
    // Spara token i localStorage för att kunna användas vid API-anrop
    localStorage.setItem('jwt_token', fakeJwtToken);
    
    // Spara användarinformation i session storage för att hålla sessionen levande
    sessionStorage.setItem('currentUser', JSON.stringify({ 
      username: user.username,
      role: user.role 
    }));
    return { success: true, user };
  }
  
  return { success: false, message: 'Felaktigt användarnamn eller lösenord' };
};

// Kontrollera om användaren är inloggad
export const isAuthenticated = (): boolean => {
  return sessionStorage.getItem('currentUser') !== null;
};

// Hämta nuvarande inloggad användare
export const getCurrentUser = (): { username: string; role: UserRole } | null => {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

// Logga ut användaren
export const logoutUser = (): void => {
  sessionStorage.removeItem('currentUser');
  localStorage.removeItem('jwt_token');
};

// Kontrollera om användaren har en viss roll
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user !== null && user.role === role;
};