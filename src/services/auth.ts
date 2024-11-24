interface User {
  id: string;
  email: string;
}

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export const authService = {
  register: async (email: string, password: string): Promise<User> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _, ...user } = newUser;
    return user;
  },

  login: async (email: string, password: string): Promise<User> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userData } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    return userData;
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  resetPassword: async (email: string): Promise<void> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // In a real implementation, this would send an email
    console.log('Password reset requested for:', email);
  }
};