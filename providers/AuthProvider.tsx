/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id: number;
  username: string;
  name?: string;
  email: string;
  is_admin?: boolean;
  avatar?: string | null;
  nickname?: string | null;
  preferences?: {
    include_adult?: boolean;
    dark_mode?: boolean;
    language?: string;
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: false, setUser: () => {} });

export const AuthProvider = ({ children, initialUser }: { children: React.ReactNode, initialUser?: User | null }) => {
  const [user, setUser] = useState<User | null>(initialUser || null);

  useEffect(() => {
    if (initialUser !== undefined) setUser(initialUser ?? null);
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, loading: false, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
