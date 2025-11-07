import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASWU0CwwJVxgx9CR9mROFIYukDyv_hUgk",
  authDomain: "tasksync-7d25c.firebaseapp.com",
  projectId: "tasksync-7d25c",
  storageBucket: "tasksync-7d25c.firebasestorage.app",
  messagingSenderId: "671426318683",
  appId: "1:671426318683:web:15d34c956c7cdfcc990a7e",
  measurementId: "G-7JRV51ZVL9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
