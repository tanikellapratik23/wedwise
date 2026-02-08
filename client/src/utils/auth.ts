// Authentication storage utility
// Uses sessionStorage for automatic logout on tab close

export const authStorage = {
  getToken: (): string | null => {
    return sessionStorage.getItem('token');
  },
  
  setToken: (token: string): void => {
    sessionStorage.setItem('token', token);
  },
  
  removeToken: (): void => {
    sessionStorage.removeItem('token');
  },
  
  getUser: (): any => {
    const user = sessionStorage.getItem('user');
    if (user) return JSON.parse(user);
    return null;
  },
  
  setUser: (user: any): void => {
    sessionStorage.setItem('user', JSON.stringify(user));
  },
  

  clearAll: (): void => {
    sessionStorage.clear();
  }
};
