// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Descomenta si usas Analytics

// Leer las variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// Validar que todas las variables de entorno necesarias estén presentes
// (especialmente útil en desarrollo para detectar errores de configuración)
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  // En un entorno de producción, podrías querer manejar esto de forma diferente,
  // pero para desarrollo, un error claro es útil.
  console.error("Error: Faltan variables de entorno de Firebase. Asegúrate de que tu archivo .env.local esté configurado correctamente.");
  // Podrías incluso lanzar un error para detener la inicialización si es crítico:
  // throw new Error("Faltan variables de entorno de Firebase.");
}


// Inicializar Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// let analytics;
// if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
//   analytics = getAnalytics(app);
// }

export { app, auth, db }; // , analytics }; // Añade analytics si lo usas