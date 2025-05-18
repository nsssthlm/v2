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

// Logga in användare
export const loginUser = (username: string, password: string): { success: boolean; user?: User; message?: string } => {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  
  if (user) {
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
};

// Kontrollera om användaren har en viss roll
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user !== null && user.role === role;
};