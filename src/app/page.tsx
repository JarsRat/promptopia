// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp as FirestoreTimestamp, QueryConstraint } from 'firebase/firestore';
import PromptCard, { PromptCardData } from '@/components/prompts/PromptCard';
import LoadingSpinner from '@/components/ui/Loading';

async function fetchPromptsFromFirestore(): Promise<PromptCardData[]> {
  try {
    const promptsCollectionRef = collection(db, 'prompts');
    
    const q = query(
      promptsCollectionRef,
      orderBy('score', 'desc'), 
      orderBy('fechaCreacion', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    // --- INICIO DE CAMBIOS PARA DEBUG ---
    console.log(`[DEBUG HomePage] fetchPromptsFromFirestore: Número de documentos obtenidos: ${querySnapshot.docs.length}`);
    querySnapshot.docs.forEach(doc => {
      // Usamos JSON.stringify para asegurar que todos los campos, incluidos los Timestamps, se muestren de forma legible
      // y para evitar problemas con objetos complejos en console.log directamente.
      const rawData = doc.data();
      // Convertimos los Timestamps a strings ISO para una mejor legibilidad en la consola si existen
      const displayData: any = { ...rawData };
      if (rawData.fechaCreacion && rawData.fechaCreacion.toDate) {
        displayData.fechaCreacion = rawData.fechaCreacion.toDate().toISOString();
      }
      if (rawData.fechaActualizacion && rawData.fechaActualizacion.toDate) {
        displayData.fechaActualizacion = rawData.fechaActualizacion.toDate().toISOString();
      }
      console.log(`[DEBUG HomePage] fetchPromptsFromFirestore: Doc ID: ${doc.id}, Data:`, JSON.stringify(displayData, null, 2));
    });
    // --- FIN DE CAMBIOS PARA DEBUG ---

    const prompts = querySnapshot.docs.map(doc => {
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
        score: typeof data.score === 'number' ? data.score : 0, // Asegura que score sea un número, defecto a 0
        votosUsuarios: data.votosUsuarios || {},
      } as PromptCardData;
    });
    
    return prompts;
  } catch (error) {
    console.error("Error fetching prompts (page.tsx): ", error);
    if ((error as any).code === 'failed-precondition') {
        const firestoreError = error as any;
        console.warn("ALERTA DE ÍNDICE (page.tsx): La consulta a Firestore podría requerir un índice. Mensaje:", firestoreError.message);
        // Si ves este mensaje, Firestore mismo te está dando un enlace para crear el índice. ¡Haz clic en él!
    }
    return [];
  }
}

export default function HomePage() {
  const [allFetchedPrompts, setAllFetchedPrompts] = useState<PromptCardData[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    console.log("HomePage: triggerRefresh llamado, incrementando refreshTrigger.");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => { 
      setDebouncedSearchTerm(searchTerm.toLowerCase());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const loadAllPrompts = async () => {
      setLoading(true);
      console.log(`HomePage: useEffect[refreshTrigger] - Cargando TODOS los prompts (ordenados por score). Trigger: ${refreshTrigger}`);
      const fetchedPrompts = await fetchPromptsFromFirestore();
      setAllFetchedPrompts(fetchedPrompts);
      setLoading(false);
    };
    loadAllPrompts();
  }, [refreshTrigger]);

  useEffect(() => {
    console.log(`HomePage: useEffect[allFetchedPrompts, debouncedSearchTerm] - Filtrando prompts. Término: "${debouncedSearchTerm}"`);
    if (!debouncedSearchTerm) {
      setFilteredPrompts(allFetchedPrompts);
    } else {
      const filtered = allFetchedPrompts.filter(prompt =>
        prompt.titulo.toLowerCase().includes(debouncedSearchTerm)
      );
      setFilteredPrompts(filtered);
    }
  }, [allFetchedPrompts, debouncedSearchTerm]);


  return (
    <div className="min-h-screen bg-white text-black">
      <header className="mb-8 pt-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-black">Explora Prompts Increíbles</h1>
        <p className="mt-3 text-lg text-[#9A9A9A]">Descubre, crea y comparte los mejores prompts para tus proyectos de IA.</p>
        <div className="mt-6 max-w-xl mx-auto px-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar prompts por título..."
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </header>

      {loading && filteredPrompts.length === 0 ? (
        <div className="flex justify-center items-center py-10"><LoadingSpinner /></div>
      ) : filteredPrompts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {debouncedSearchTerm ? `No se encontraron prompts para "${debouncedSearchTerm}".` : "Aún no hay prompts disponibles."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 px-4 sm:px-6 lg:px-8 pb-12">
          {filteredPrompts.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              onPromptAction={triggerRefresh}
              onPromptDeleted={triggerRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}