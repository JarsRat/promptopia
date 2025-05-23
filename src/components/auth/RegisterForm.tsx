// src/components/auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase'; // Asegúrate que la ruta a firebase.ts sea correcta
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // Para la redirección

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Hook para la navegación

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Actualizar perfil de Firebase Auth con el nombre
      await updateProfile(user, { displayName: name });

      // 3. Guardar datos adicionales del usuario en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: name,
        email: user.email,
        fechaCreacion: serverTimestamp(),
        uid: user.uid
      });

      // 4. Redirigir al usuario
      router.push('/');

    } catch (err: any) {
      console.error("Error en el registro:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado. Intenta iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Intenta con una más segura.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError(err.message || 'Ocurrió un error al registrar. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black"
        >
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          // AQUÍ EL CAMBIO: añadido text-black
          className="mt-1 block w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md shadow-sm text-black placeholder-[#9A9A9A] focus:outline-none focus:ring-[#0063FF] focus:border-[#0063FF] sm:text-sm"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-black"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // AQUÍ EL CAMBIO: añadido text-black
          className="mt-1 block w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md shadow-sm text-black placeholder-[#9A9A9A] focus:outline-none focus:ring-[#0063FF] focus:border-[#0063FF] sm:text-sm"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-black"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // AQUÍ EL CAMBIO: añadido text-black
          className="mt-1 block w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md shadow-sm text-black placeholder-[#9A9A9A] focus:outline-none focus:ring-[#0063FF] focus:border-[#0063FF] sm:text-sm"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300"
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  );
}