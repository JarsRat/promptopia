// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Si planeas usar Analytics, como en tu código inicial:
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCWwK3cB80BzlVN5GNt7ULtnF1p_UUU5mY", // Reemplaza con tu apiKey
  authDomain: "promtopia-20ce7.firebaseapp.com", // Reemplaza con tu authDomain
  projectId: "promtopia-20ce7", // Reemplaza con tu projectId
  storageBucket: "promtopia-20ce7.firebasestorage.app", // Reemplaza con tu storageBucket
  messagingSenderId: "541414065888", // Reemplaza con tu messagingSenderId
  appId: "1:541414065888:web:0a7db91b3264c4f4893285", // Reemplaza con tu appId
  measurementId: "G-RG6LMDLXJ0" // Este es opcional, pero lo tenías en tu config original
};

// Inicializar Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// Si decides usar Analytics, puedes descomentar esto y exportarlo también.
// let analytics;
// if (typeof window !== 'undefined') { // Analytics solo funciona en el cliente
//   analytics = getAnalytics(app);
// }

export { app, auth, db }; // Si usas analytics, añade 'analytics' aquí.



