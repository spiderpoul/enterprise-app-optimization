import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  username: string;
  displayName: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticating: boolean;
};

const AUTH_STORAGE_KEY = 'shell-auth-user';

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.username) {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
};

const writeStoredUser = (user: AuthUser | null) => {
  try {
    if (!user) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    // Fallback to in-memory session when storage is unavailable.
  }
};

const buildUser = (username: string): AuthUser => ({
  username,
  displayName: username.replace(/\b\w/g, (char) => char.toUpperCase()),
});

const VALID_PASSWORD = 'optimize';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return readStoredUser();
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    writeStoredUser(user);
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      throw new Error('Please enter your username.');
    }

    setIsAuthenticating(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (password !== VALID_PASSWORD) {
      setIsAuthenticating(false);
      throw new Error('Invalid credentials. Please verify your password.');
    }

    const authenticatedUser = buildUser(trimmedUsername);
    setUser(authenticatedUser);
    setIsAuthenticating(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      isAuthenticating,
    }),
    [isAuthenticating, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
