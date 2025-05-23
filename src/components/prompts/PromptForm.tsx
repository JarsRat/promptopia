// src/components/prompts/PromptForm.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Definimos los tipos para los datos del prompt que manejará este formulario
export interface PromptFormData {
  titulo: string;
  contenido: string;
  tags: string[]; // Los tags se manejarán como un array de strings
}

interface PromptFormProps {
  initialData?: Partial<PromptFormData>; // Datos iniciales para edición (titulo, contenido, tags como array)
  onSubmit: (data: PromptFormData) => Promise<void>; // Función que se llama al enviar
  submitButtonText?: string; // Texto para el botón de envío (ej: "Crear Prompt", "Guardar Cambios")
  isLoading?: boolean; // Para controlar el estado de carga desde el componente padre
  error?: string | null; // Para mostrar errores desde el componente padre
}

export default function PromptForm({
  initialData,
  onSubmit,
  submitButtonText = 'Enviar',
  isLoading = false,
  error,
}: PromptFormProps) {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tagsString, setTagsString] = useState(''); // Los tags se ingresarán como un string separado por comas

  // Efecto para poblar el formulario si se proporcionan datos iniciales (modo edición)
  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo || '');
      setContenido(initialData.contenido || '');
      // Si initialData.tags es un array, lo convertimos a string para el input
      setTagsString(initialData.tags ? initialData.tags.join(', ') : '');
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Convertir el string de tags en un array de strings, eliminando espacios y tags vacíos
    const tagsArray = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    await onSubmit({
      titulo,
      contenido,
      tags: tagsArray,
    });
  };

  // Estilos consistentes con los formularios de autenticación
  const inputClassName = "mt-1 block w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md shadow-sm placeholder-[#9A9A9A] text-black focus:outline-none focus:ring-[#0063FF] focus:border-[#0063FF] sm:text-sm";
  const labelClassName = "block text-sm font-medium text-black";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="titulo" className={labelClassName}>
          Título del Prompt
        </label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className={inputClassName}
          placeholder="Ej: Ideas para posts de blog sobre IA"
        />
      </div>

      <div>
        <label htmlFor="contenido" className={labelClassName}>
          Contenido del Prompt
        </label>
        <textarea
          id="contenido"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          required
          rows={6} // Ajusta según necesidad
          className={inputClassName}
          placeholder="Describe en detalle el prompt que quieres generar o la tarea a realizar..."
        />
      </div>

      <div>
        <label htmlFor="tags" className={labelClassName}>
          Tags (separados por comas)
        </label>
        <input
          id="tags"
          type="text"
          value={tagsString}
          onChange={(e) => setTagsString(e.target.value)}
          className={inputClassName}
          placeholder="Ej: marketing, ia, redacción, ideas"
        />
        <p className="mt-1 text-xs text-gray-500">
          Ayuda a categorizar tu prompt. Separa los tags con comas.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0063FF] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isLoading ? 'Procesando...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}