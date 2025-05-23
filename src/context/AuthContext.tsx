// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Asegúrate que la ruta a tu firebase.ts sea correcta

// 1. MODIFICACIÓN: Exportar la interfaz AuthContextType
export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

// AuthContext ya está correctamente exportado
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider ya está correctamente exportada
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentFirebaseUser) => {
      setUser(currentFirebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth ya está correctamente exportada
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Considera hacer este mensaje más específico si es para el usuario final,
    // o mantenerlo así si es principalmente para el desarrollador.
    throw new Error('useAuth debe ser usado dentro de un AuthProvider. Asegúrate de que tu componente esté envuelto en AuthProvider.');
  }
  return context;
}