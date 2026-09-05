import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from '../App';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
  it('renders without crashing', () => {
    const mockAuth = {
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
        <AuthContext.Provider value={mockAuth as any}>
          <App />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  });
});
