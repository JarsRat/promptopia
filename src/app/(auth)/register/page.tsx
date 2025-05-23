// src/app/(auth)/register/page.tsx
import RegisterForm from "@/components/auth/RegisterForm"; // Ajusta la ruta si es necesario

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Podríamos añadir un logo aquí en el futuro */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black">
            Regístrate
          </h1>
          {/* Podríamos añadir un subtitulo como "Crea tu cuenta para empezar a compartir prompts."
              con un color gris medio: text-[#9A9A9A]
          */}
        </header>
        <RegisterForm />
        <footer className="mt-8 text-center">
          <p className="text-sm text-[#9A9A9A]">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="font-medium text-black hover:underline">
              Inicia sesión
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}