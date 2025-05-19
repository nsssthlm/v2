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
  // Skapa ett enkelt header-objekt
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Skapa payload med användardata och utgångstid
  const payload = {
    sub: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 timmar
    iat: Math.floor(Date.now() / 1000)
  };
  
  // Base64-enkoda header och payload
  const headerBase64 = btoa(JSON.stringify(header));
  const payloadBase64 = btoa(JSON.stringify(payload));
  
  // Skapa en signatur (i ett riktigt system skulle detta använda en hemlig nyckel)
  // Här simulerar vi bara en signatur
  const signature = btoa(`${headerBase64}.${payloadBase64}.secret`);
  
  // Returnera den fullständiga token
  return `${headerBase64}.${payloadBase64}.${signature}`;
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
};

// Kontrollera om användaren har en viss roll
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user !== null && user.role === role;
};