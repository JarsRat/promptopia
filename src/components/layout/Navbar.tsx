// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Ajusta la ruta si es necesario
import { auth } from '@/lib/firebase'; // Ajusta la ruta si es necesario
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirige a la página de inicio después de cerrar sesión
      // Opcionalmente, podrías redirigir a /login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aquí podrías mostrar una notificación de error al usuario
    }
  };

  // Inspiración Uber: Fondo negro, texto blanco/gris claro.
  // Logo placeholder o nombre de la app a la izquierda.
  // Enlaces de navegación y usuario a la derecha.
  return (
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo o Nombre de la App */}
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          Prompt<span className="text-[#0063FF]">Topia</span> {/* Ejemplo con acento azul */}
        </Link>

        {/* Enlaces de Navegación y Estado de Usuario */}
        <div className="space-x-4 flex items-center">
          {loading ? (
            <span className="text-sm text-gray-400">Cargando...</span>
          ) : user ? (
            // Usuario Logueado
            <>
              <span className="text-sm hidden sm:block"> {/* Ocultar en móviles pequeños si es muy largo */}
                Hola, {user.displayName || user.email}
              </span>
              <Link
                href="/dashboard/my-prompts"
                className="hover:text-gray-300 text-sm"
              >
                Mis Prompts
              </Link>
              <Link
                href="/dashboard/create-prompt"
                className="bg-[#0063FF] hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md text-sm"
              >
                Crear Prompt
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-gray-300 text-sm border border-gray-500 hover:border-gray-300 py-1.5 px-3 rounded-md"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            // Usuario No Logueado
            <>
              <Link
                href="/login"
                className="hover:text-gray-300 text-sm"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-[#0063FF] hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md text-sm"
              >
                Regístrate
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}