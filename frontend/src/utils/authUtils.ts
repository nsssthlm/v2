// Förenklade användartyper
export type UserRole = 'admin' | 'project_leader' | 'user';

export interface User {
  username: string;
  role: UserRole;
}

// Förenklade hjälpfunktioner utan säkerhet
export const generateFakeJwtToken = (user: User): string => {
  // Returnerar bara användarnamnet
  return user.username;
};

// Enkel inloggning utan autentisering
export const loginUser = (username: string, password: string): { success: boolean; user?: User; message?: string } => {
  // Alltid framgångsrik inloggning
  const user = { username, role: 'admin' as UserRole };
  return { success: true, user };
};

// Alltid autentiserad
export const isAuthenticated = (): boolean => {
  return true;
};

// Förenklad användarfunktion
export const getCurrentUser = (): { username: string; role: UserRole } => {
  return { username: 'admin', role: 'admin' };
};

// Förenklad utloggning
export const logoutUser = (): void => {
  console.log('Utloggad (förenklad)');
};

// Alla har alltid alla roller
export const hasRole = (role: UserRole): boolean => {
  return true;
};