import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from '../App';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

interface AuthMock {
  isLoggedIn: boolean;
  token: string | null;
  email: string | null;
  userType: string | null;
  userData: Record<string, unknown> | null;
  clubData: Record<string, unknown> | null;
  reservaIds: string[];
  setReservaIds: (ids: string[]) => void;
  login: (token: string) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUserLevel: (level: number) => void;
  updateClubDesc: (desc: string) => Promise<boolean>;
  updateClubInfo: (info: Record<string, unknown>) => Promise<boolean>;
  loading: boolean;
}

describe('App', () => {
  it('renders without crashing', () => {
    const mockAuth: AuthMock = {
      isLoggedIn: false,
      token: null,
      email: null,
      userType: null,
      userData: null,
      clubData: null,
      reservaIds: [],
      setReservaIds: () => {},
      login: () => {},
      logout: () => {},
      refreshUserData: async () => {},
      updateUserLevel: () => {},
      updateClubDesc: async () => true,
      updateClubInfo: async () => true,
      loading: false
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <App />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  });
});
