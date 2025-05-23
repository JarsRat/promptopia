// src/app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm"; // Ajusta la ruta si es necesario

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black">
            Inicia Sesión
          </h1>
          {/* Podríamos añadir un subtitulo como "Bienvenido de nuevo."
              con un color gris medio: text-[#9A9A9A]
          */}
        </header>
        <LoginForm />
        <footer className="mt-8 text-center">
          <p className="text-sm text-[#9A9A9A]">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="font-medium text-black hover:underline">
              Regístrate
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}