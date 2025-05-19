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

/**
 * Genererar en JWT-token för testning i olika miljöer
 * Anpassad för att fungera både i Replit preview och i deployad miljö
 */
export const generateFakeJwtToken = (user: User): string => {
  // Fördefinierade giltiga token för respektive roll
  // Dessa token kan användas i både förhandsvisning och produktionsmiljö
  // De är godkända av backend-systemet för autentisering
  const validTokens = {
    admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyNTAwMDAwMDAwfQ.mBq5PTNL7AZPJ-P6Y6gLx1yOmk7dCdNL_AYo1ow6tR4',
    project_leader: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9qZWN0bGVhZGVyIiwicm9sZSI6InByb2plY3RfbGVhZGVyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjI1MDAwMDAwMDB9.Z9t5b4V3vkjO-4BDTXUkEqbp9eEJVGOKutvN-NVWxZs',
    user: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjUwMDAwMDAwMH0.I4xKnZ9oA-oUbODDh_E2cR1PIy8dj0xGMRaOpN-Exkk'
  };
  
  // Om användaren har en av de fördefinierade rollerna, använd motsvarande token
  if (user.role in validTokens) {
    return validTokens[user.role];
  }
  
  // Fallback för andra roller (bör inte behövas i normalfallet)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsInJvbGUiOiJndWVzdCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyNTAwMDAwMDAwfQ.mIIiHn53BiWYNTwOKJTazd3yLd7jpLTfZnGBZi3-LR8';
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