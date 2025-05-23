// src/app/dashboard/create-prompt/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WithAuth from "@/components/auth/withAuth";
import PromptForm, { PromptFormData } from "@/components/prompts/PromptForm";
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

function CreatePromptPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreatePrompt = async (data: PromptFormData) => {
    if (!user) {
      toast.error("Debes iniciar sesión para crear un prompt.");
      setFormError("Debes estar autenticado para crear un prompt.");
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const newPromptData = {
        ...data, // Contiene titulo, contenido, tags del formulario
        userId: user.uid,
        autorNombre: user.displayName || user.email || "Anónimo",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        votosUsuarios: {},
        score: 0,
      };

      // La línea de console.log("[DEBUG CreatePromptPage]...") ha sido eliminada.

      const docRef = await addDoc(collection(db, "prompts"), newPromptData);
      
      toast.success(`Prompt "${data.titulo}" creado exitosamente!`);
      
      router.push('/dashboard/my-prompts'); 

    } catch (err: any) {
      console.error("Error al crear el prompt:", err);
      const errorMessage = err.message || "Ocurrió un error al crear el prompt. Inténtalo de nuevo.";
      toast.error(errorMessage);
      setFormError(errorMessage);
      setIsLoading(false); 
    }
  };

  return (
    <div className="bg-white text-black">
      <h1 className="text-3xl font-bold text-black mb-8 text-center">Crear Nuevo Prompt</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">
        <PromptForm
          onSubmit={handleCreatePrompt}
          submitButtonText="Publicar Prompt"
          isLoading={isLoading}
          error={formError}
        />
      </div>
    </div>
  );
}

export default function CreatePromptPage() {
  return (
    <WithAuth>
      <CreatePromptPageContent />
    </WithAuth>
  );
}