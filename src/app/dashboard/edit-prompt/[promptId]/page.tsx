// src/app/dashboard/edit-prompt/[promptId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Timestamp no es necesario si no se usa explícitamente aquí
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import PromptForm, { PromptFormData } from '@/components/prompts/PromptForm';
import LoadingSpinner from '@/components/ui/Loading';
import toast from 'react-hot-toast'; // 1. Importar toast

export default function EditPromptPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();

  const promptId = typeof params.promptId === 'string' ? params.promptId : null;

  const [initialPromptData, setInitialPromptData] = useState<PromptFormData | null>(null);
  const [loadingData, setLoadingData] = useState(true); // Renombrado para claridad (carga de datos del prompt)
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Esperar a que la autenticación termine de cargar

    if (!promptId) {
      setPageError("ID de prompt no válido o no encontrado en la URL.");
      setLoadingData(false);
      return;
    }
    
    if (!currentUser) { // Si después de cargar auth, no hay usuario
        toast.error("Debes iniciar sesión para editar un prompt."); // Toast de error si intenta acceder sin sesión
        setPageError("Debes iniciar sesión para editar un prompt.");
        setLoadingData(false);
        // Considera redirigir: router.push(`/login?redirect=/dashboard/edit-prompt/${promptId}`);
        return;
    }

    const fetchPrompt = async () => {
      setLoadingData(true);
      setPageError(null);
      try {
        const promptRef = doc(db, 'prompts', promptId);
        const docSnap = await getDoc(promptRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (currentUser.uid === data.userId) { // currentUser ya está verificado arriba
            setIsAuthor(true);
            setInitialPromptData({
              titulo: data.titulo || '',
              contenido: data.contenido || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
            });
          } else {
            setIsAuthor(false);
            toast.error("No tienes permiso para editar este prompt.");
            setPageError("No tienes permiso para editar este prompt.");
          }
        } else {
          toast.error("El prompt que intentas editar no fue encontrado.");
          setPageError("Prompt no encontrado.");
        }
      } catch (err) {
        console.error("Error fetching prompt for edit: ", err);
        toast.error("Error al cargar el prompt para editar.");
        setPageError("Error al cargar el prompt para editar. Inténtalo de nuevo más tarde.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchPrompt();
  }, [promptId, currentUser, authLoading, router]); // router no es estrictamente necesario como dependencia aquí

  const handleUpdatePrompt = async (formData: PromptFormData) => {
    if (!promptId || !isAuthor) {
      const errorMsg = "No se puede actualizar: faltan permisos o el ID del prompt.";
      toast.error(errorMsg);
      setFormError(errorMsg);
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const promptRef = doc(db, 'prompts', promptId);
    try {
      await updateDoc(promptRef, {
        titulo: formData.titulo,
        contenido: formData.contenido,
        tags: formData.tags,
        fechaActualizacion: serverTimestamp(),
      });

      // 2. Mostrar toast de éxito
      toast.success(`"${formData.titulo}" actualizado exitosamente!`);
      
      // Opcional: Delay antes de redirigir para asegurar que el toast se vea
      // await new Promise(resolve => setTimeout(resolve, 500));

      router.push(`/dashboard/my-prompts`);
      
    } catch (updateError: any) {
      console.error("Error actualizando prompt:", updateError);
      const errorMessage = updateError.message || "Error al actualizar el prompt. Inténtalo de nuevo.";
      toast.error(errorMessage); // 3. Mostrar toast de error
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-600 text-lg bg-red-50 p-4 rounded-md border border-red-200">{pageError}</p>
        <button 
          onClick={() => router.back()} 
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  // Este caso ya está cubierto por pageError si setIsAuthor(false) y setPageError("No tienes permiso...")
  // if (!isAuthor) { ... } 
  
  if (!initialPromptData && isAuthor) { // Si es autor pero los datos aún no cargan (o hubo un problema no capturado por pageError)
    return (
        <div className="text-center py-10 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <p>Cargando datos del prompt para edición...</p>
            <LoadingSpinner />
        </div>
    );
  }

  // Solo mostrar el formulario si es el autor y los datos iniciales están listos
  if (isAuthor && initialPromptData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl bg-white"> {/* Tema claro */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Editar Prompt</h1>
          <p className="text-lg text-gray-600 mt-1">Modifica los detalles de: <span className="font-semibold">{initialPromptData.titulo}</span></p>
        </header>
        
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200"> {/* Contenedor del formulario con más realce */}
          <PromptForm
            initialData={initialPromptData} // Asegúrate que PromptForm acepte y use initialData
            onSubmit={handleUpdatePrompt}
            submitButtonText="Guardar Cambios"
            isLoading={isSubmitting}
            error={formError} // El error específico del envío del formulario
          />
        </div>
      </div>
    );
  }

  // Fallback por si alguna condición no se cumple (no debería llegar aquí si la lógica es correcta)
  return (
    <div className="text-center py-10 max-w-md mx-auto">
      <p className="text-gray-700">No se pudo cargar el contenido para edición.</p>
      <button 
          onClick={() => router.push('/dashboard')} 
          className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition-colors"
        >
          Ir al Dashboard
        </button>
    </div>
  );
}