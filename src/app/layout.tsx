// src/app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Promptopia',
  description: 'Descubre y comparte prompts de IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-100 text-gray-900`}> {/* Ajusta el color de texto base si es necesario */}
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8} // Espacio entre toasts
            toastOptions={{
              // Estilos generales para todas las toasts
              className: 'text-sm', // Clase para tamaño de fuente, etc.
              duration: 5000,
              style: {
                background: '#202020', // Un gris oscuro ligeramente más claro
                color: '#F3F4F6',     // Un blanco hueso / gris muy claro
                border: '1px solid #4B5563', // Borde sutil
                borderRadius: '8px',
                padding: '12px 16px',
              },

              // Opciones específicas para toasts de éxito
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981', // Verde esmeralda para el icono
                  secondary: '#FFFFFF', // Color interno del icono (si aplica)
                },
                // Puedes añadir un estilo específico para success si quieres un fondo diferente
                // style: {
                //   background: '#059669', // Verde más oscuro
                //   color: '#FFFFFF',
                // },
              },

              // Opciones específicas para toasts de error
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444', // Rojo para el icono
                  secondary: '#FFFFFF',
                },
                // style: {
                //   background: '#DC2626', // Rojo más oscuro
                //   color: '#FFFFFF',
                // },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}