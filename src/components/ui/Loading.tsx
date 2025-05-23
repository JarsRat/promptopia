// src/components/ui/Loading.tsx

export default function LoadingSpinner() {
    return (
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-gray-900">
        {/* 
          Puedes personalizar este spinner:
          - Tamaño: cambia h-10 w-10 (ej. h-12 w-12)
          - Color del borde: cambia border-gray-900 (ej. border-blue-500, o cualquier color de Tailwind)
          - Grosor del borde: cambia border-b-2 border-t-2 (ej. border-b-4 border-t-4)
        */}
      </div>
    );
  }