// src/app/dashboard/my-prompts/page.tsx
'use client';

import React, { useEffect, useState, useContext } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import PromptCard, { PromptCardData } from '@/components/prompts/PromptCard';
import { AuthContext } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/Loading';

export default function MyPromptsPage() {
  const [myPrompts, setMyPrompts] = useState<PromptCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const loadingAuth = authContext?.loading;

  // Estado para forzar la recarga de prompts, por ejemplo, después de una acción en PromptCard
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePromptAction = () => {
    // Incrementa el trigger para forzar la recarga de los prompts
    setRefreshTrigger(prev => prev + 1);
  };


  useEffect(() => {
    if (loadingAuth) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setError("Debes iniciar sesión para ver tus prompts.");
      setMyPrompts([]);
      return;
    }

    const fetchMyPrompts = async () => {
      setIsLoading(true);
      setError(null);
      // No limpiar myPrompts aquí para evitar parpadeo si solo se refresca por refreshTrigger
      // setMyPrompts([]); // Considera si quieres limpiar aquí o no

      try {
        const promptsCollectionRef = collection(db, 'prompts');
        
        // --- INICIO DE CAMBIO EN LA CONSULTA ---
        // Ahora ordenamos por 'score' (descendente) y luego por 'fechaCreacion' (descendente)
        const q = query(
          promptsCollectionRef,
          where('userId', '==', user.uid),
          orderBy('score', 'desc'), 
          orderBy('fechaCreacion', 'desc') 
        );
        // --- FIN DE CAMBIO EN LA CONSULTA ---
        
        const querySnapshot = await getDocs(q);

        const promptsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const fechaCreacionSerializable = data.fechaCreacion instanceof FirestoreTimestamp
            ? data.fechaCreacion.toDate().toISOString()
            : (data.fechaCreacion && data.fechaCreacion.seconds ? new FirestoreTimestamp(data.fechaCreacion.seconds, data.fechaCreacion.nanoseconds).toDate().toISOString() : FirestoreTimestamp.now().toDate().toISOString());
          const fechaActualizacionSerializable = data.fechaActualizacion instanceof FirestoreTimestamp
            ? data.fechaActualizacion.toDate().toISOString()
            : (data.fechaActualizacion && data.fechaActualizacion.seconds ? new FirestoreTimestamp(data.fechaActualizacion.seconds, data.fechaActualizacion.nanoseconds).toDate().toISOString() : FirestoreTimestamp.now().toDate().toISOString());

          return {
            id: doc.id,
            userId: data.userId || '',
            autorNombre: data.autorNombre || 'Anónimo',
            titulo: data.titulo || 'Sin título',
            contenido: data.contenido || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            fechaCreacion: fechaCreacionSerializable,
            fechaActualizacion: fechaActualizacionSerializable,
            upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
            downvotes: typeof data.downvotes === 'number' ? data.downvotes : 0,
            score: typeof data.score === 'number' ? data.score : 0,
            votosUsuarios: data.votosUsuarios || {},
          } as PromptCardData;
        });
        setMyPrompts(promptsData);
      } catch (err: any) {
        console.error("Error fetching user's prompts: ", err);
        setError('Error al cargar tus prompts. Intenta de nuevo más tarde.');
        if (err.code === 'failed-precondition') {
            console.warn("ALERTA DE ÍNDICE (MyPromptsPage): La consulta a Firestore podría requerir un índice. Mensaje:", err.message);
            // Firestore suele dar un enlace para crear el índice faltante en este mensaje.
            // El índice necesario sería para la colección 'prompts':
            // userId (ASC/DESC) , score (DESC), fechaCreacion (DESC)
            setError(prevError => `${prevError || ''} Es posible que falte un índice en Firestore. Revisa la consola del navegador para más detalles o un enlace para crearlo.`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPrompts();

  }, [user, loadingAuth, refreshTrigger]); // Añadido refreshTrigger a las dependencias

  if (loadingAuth || isLoading) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center p-4">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600">Cargando tus prompts...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center p-4 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Oops! Algo salió mal.</h2>
            <p className="text-lg text-gray-700">{error}</p>
        </div>
    );
  }
  
  if (!user) {
      return (
        <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center p-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Acceso Restringido</h2>
            <p className="text-lg text-gray-600">Por favor, inicia sesión para ver tus prompts.</p>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-black">
      <header className="mb-10 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">
          Mis Prompts Creados
        </h1>
        <p className="mt-3 text-md sm:text-lg text-[#9A9A9A] max-w-2xl mx-auto">
          Aquí puedes ver, editar y gestionar todos los prompts que has compartido.
        </p>
      </header>

      {myPrompts.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h2 className="mt-2 text-xl font-semibold text-gray-800">Aún no has creado prompts</h2>
          <p className="mt-1 text-md text-gray-600">
            ¡Anímate a compartir tu primero!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {myPrompts.map((prompt) => (
            <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onPromptAction={handlePromptAction} // Para refrescar la lista si se vota o elimina
                onPromptDeleted={handlePromptAction} // También refresca si se elimina
            />
          ))}
        </div>
      )}
    </div>
  );
}