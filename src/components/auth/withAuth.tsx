// src/components/auth/withAuth.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Ajusta la ruta si es necesario

interface WithAuthProps {
  children: React.ReactNode;
}

export default function WithAuth({ children }: WithAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Primero, esperamos a que el estado de autenticación termine de cargar.
    if (!loading) {
      // Si no hay usuario después de cargar, redirigimos a login.
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]); // Dependencias del useEffect

  // Si está cargando o si no hay usuario (y está a punto de ser redirigido),
  // podrías mostrar un spinner o null para evitar flasheo de contenido.
  if (loading || !user) {
    // Puedes retornar un componente de carga global aquí si lo tienes
    // o simplemente null para no mostrar nada hasta que se resuelva la autenticación/redirección.
    // Por ejemplo: return <FullScreenLoader />;
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando...</p> {/* Un loader simple */}
      </div>
    );
  }

  // Si el usuario está autenticado y la carga ha finalizado, renderiza los children (el contenido de la página protegida).
  return <>{children}</>;
}