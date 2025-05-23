// src/components/prompts/PromptCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp, Timestamp as FirestoreTimestamp, deleteDoc } from 'firebase/firestore';
import { HandThumbUpIcon, HandThumbDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import { useRouter } from 'next/navigation'; // No es necesario si usamos onPromptAction
import Link from 'next/link';
import toast from 'react-hot-toast';

// --- Helper: Formateador de Fecha ---
const formatDate = (dateInput: string | FirestoreTimestamp | undefined): string => {
  if (!dateInput) return 'Fecha desconocida';
  let date: Date;
  if (dateInput instanceof FirestoreTimestamp) { date = dateInput.toDate(); }
  else if (typeof dateInput === 'string') { date = new Date(dateInput); }
  else { return 'Fecha inválida'; }
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};
// --- Fin Helper ---

export interface PromptCardData {
  id: string;
  userId: string;
  autorNombre: string;
  titulo: string;
  contenido: string;
  tags: string[];
  fechaCreacion: string | FirestoreTimestamp;
  fechaActualizacion: string | FirestoreTimestamp;
  upvotes: number;
  downvotes: number;
  score?: number;
  votosUsuarios?: { [key: string]: 'up' | 'down' };
}

interface PromptCardProps {
  prompt: PromptCardData;
  onPromptDeleted?: (promptId: string) => void;
  onPromptAction?: () => void; // <--- AÑADIDA ESTA PROP
}

export default function PromptCard({ prompt, onPromptDeleted, onPromptAction }: PromptCardProps) { // <--- USAR onPromptAction
  // const router = useRouter(); // Ya no es necesario si onPromptAction se encarga
  const { user: currentUser } = useAuth();
  const promptId = prompt.id;

  const [currentUpvotes, setCurrentUpvotes] = useState(prompt.upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(prompt.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentUser && prompt.votosUsuarios && prompt.votosUsuarios[currentUser.uid]) {
      setUserVote(prompt.votosUsuarios[currentUser.uid]);
    } else {
      setUserVote(null);
    }
  }, [currentUser, prompt.votosUsuarios]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentUser) { toast.error("Debes iniciar sesión para votar."); return; }
    if (isVoting || isDeleting) return;

    setIsVoting(true);
    const promptRef = doc(db, 'prompts', promptId);
    const originalUpvotes = currentUpvotes;
    const originalDownvotes = currentDownvotes;
    const originalUserVote = userVote;

    // ... (UI Optimista como antes) ...
    let optimisticUpvotes = currentUpvotes;
    let optimisticDownvotes = currentDownvotes;
    let optimisticUserVote: 'up' | 'down' | null = userVote;

    if (voteType === 'up') {
      if (userVote === 'up') { optimisticUpvotes--; optimisticUserVote = null; }
      else { optimisticUpvotes++; if (userVote === 'down') optimisticDownvotes--; optimisticUserVote = 'up'; }
    } else { 
      if (userVote === 'down') { optimisticDownvotes--; optimisticUserVote = null; }
      else { optimisticDownvotes++; if (userVote === 'up') optimisticUpvotes--; optimisticUserVote = 'down'; }
    }
    setCurrentUpvotes(Math.max(0, optimisticUpvotes));
    setCurrentDownvotes(Math.max(0, optimisticDownvotes));
    setUserVote(optimisticUserVote);

    try {
      await runTransaction(db, async (transaction) => {
        // ... (Lógica de transacción y cálculo/actualización de score como antes) ...
        const promptDoc = await transaction.get(promptRef);
        if (!promptDoc.exists()) throw new Error("El prompt no existe.");
        const data = promptDoc.data();
        let newUpvotes = data.upvotes || 0; let newDownvotes = data.downvotes || 0;
        const votosUsuarios = data.votosUsuarios || {}; const userPreviousVote = votosUsuarios[currentUser.uid];
        if (voteType === 'up') {
          if (userPreviousVote === 'up') { delete votosUsuarios[currentUser.uid]; newUpvotes--; }
          else { if (userPreviousVote === 'down') newDownvotes--; votosUsuarios[currentUser.uid] = 'up'; newUpvotes++; }
        } else { 
          if (userPreviousVote === 'down') { delete votosUsuarios[currentUser.uid]; newDownvotes--; }
          else { if (userPreviousVote === 'up') newUpvotes--; votosUsuarios[currentUser.uid] = 'down'; newDownvotes++; }
        }
        newUpvotes = Math.max(0, newUpvotes); newDownvotes = Math.max(0, newDownvotes);
        const newScore = newUpvotes - newDownvotes;
        transaction.update(promptRef, {
          upvotes: newUpvotes, downvotes: newDownvotes, score: newScore,
          votosUsuarios: votosUsuarios, fechaActualizacion: serverTimestamp()
        });
      });
      toast.success('¡Voto registrado!');
      if (onPromptAction) { // <--- LLAMAR AL CALLBACK
        onPromptAction();
      }
      // router.refresh(); // ELIMINADO
    } catch (error) {
      // ... (Manejo de error y rollback como antes) ...
      console.error(`Error al procesar ${voteType}vote: `, error);
      toast.error('Error al registrar el voto.');
      setCurrentUpvotes(originalUpvotes); setCurrentDownvotes(originalDownvotes); setUserVote(originalUserVote);
    } finally {
      setIsVoting(false);
    }
  };

  const isAuthor = currentUser && currentUser.uid === prompt.userId;

  const handleDeletePrompt = async () => {
    if (!isAuthor) { toast.error("No tienes permiso para eliminar."); return; }
    if (isDeleting || isVoting) return;

    toast((t) => (
        <span className="flex flex-col items-center">
        <p className="mb-2 text-center">¿Eliminar "{prompt.titulo}"?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id); setIsDeleting(true);
              try {
                await deleteDoc(doc(db, 'prompts', promptId));
                toast.success(`"${prompt.titulo}" eliminado con éxito.`);
                if (onPromptDeleted) onPromptDeleted(promptId);
                if (onPromptAction) { // <--- LLAMAR AL CALLBACK
                  onPromptAction();
                }
                // router.refresh(); // ELIMINADO
              } catch (error) {
                console.error("Error eliminando prompt: ", error);
                toast.error("Error al eliminar el prompt.");
              } finally { setIsDeleting(false); }
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
          >Sí, eliminar</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm">Cancelar</button>
        </div>
      </span>
    ), { duration: Infinity, id: `confirm-delete-${promptId}` });
  };

  // ... (formattedDate, previewContent y JSX de retorno sin cambios) ...
  const formattedDate = formatDate(prompt.fechaCreacion);
  const previewContent = prompt.contenido.length > 150 
    ? `${prompt.contenido.substring(0, 147)}...` 
    : prompt.contenido;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-shadow hover:shadow-xl flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-black hover:text-[#0063FF] transition-colors">
            {prompt.titulo}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Por {prompt.autorNombre} - {formattedDate}</p>
        </div>
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">{previewContent}</p>
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="mb-4">
            {prompt.tags.map((tag, index) => (<span key={index} className="inline-block bg-[#E3E3E3] text-gray-700 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full">#{tag}</span>))}
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 mt-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <button onClick={() => handleVote('up')} disabled={isVoting || isDeleting } title="Me gusta" className={`flex items-center transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${userVote === 'up' ? 'text-green-500' : 'text-gray-600 hover:text-green-500'}`}> <HandThumbUpIcon className="w-5 h-5" /> <span className={`ml-1.5 text-sm font-medium ${userVote === 'up' ? '' : 'group-hover:text-green-500'}`}>{currentUpvotes}</span> </button>
             <button onClick={() => handleVote('down')} disabled={isVoting || isDeleting } title="No me gusta" className={`flex items-center transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${userVote === 'down' ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}> <HandThumbDownIcon className="w-5 h-5" /> <span className={`ml-1.5 text-sm font-medium ${userVote === 'down' ? '' : 'group-hover:text-red-500'}`}>{currentDownvotes}</span> </button>
          </div>
          {isAuthor && (
            <div className="flex items-center space-x-2">
              <Link href={`/dashboard/edit-prompt/${promptId}`} className="text-blue-600 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors" title="Editar Prompt"><PencilIcon className="w-4 h-4" /></Link>
              <button onClick={handleDeletePrompt} disabled={isDeleting || isVoting} title="Eliminar Prompt" className="text-red-600 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}