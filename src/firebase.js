import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove } from 'firebase/database';

// Tu configuración real del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBB5XflJeLGuwItG5LCeCYirhtnFc5jwvM",
  authDomain: "myfinanceapp-489cf.firebaseapp.com",
  databaseURL: "https://myfinanceapp-489cf-default-rtdb.firebaseio.com",
  projectId: "myfinanceapp-489cf",
  storageBucket: "myfinanceapp-489cf.firebasestorage.app",
  messagingSenderId: "417925197944",
  appId: "1:417925197944:web:5be6f1e2014d477cc57d8d"
};

// Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar la instancia de Realtime Database
export const db = getDatabase(app);

// Exportar las funciones que usas para leer, escribir y escuchar datos
export { ref, set, onValue, remove };