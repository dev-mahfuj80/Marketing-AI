interface Organization {
  id: string;
  name: string;
  website: string;
  category: string;
  location: string;
  description: string;
  established: string;
  size: string;
  employees: string;
  turnover: string | null;
  revenue: string;
  profit: string | null;
  marketArea: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  facebookToken: string;
  linkedInAccessToken: string;
  createdAt: string;
  updatedAt: string;
  organizations: Organization[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  resetError: () => void;
}
