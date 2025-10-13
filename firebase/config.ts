// firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEHyTJjG8XEhVepIuUZ4xEKzqPo77BmjU",
  authDomain: "zona-creps-app.firebaseapp.com",
  projectId: "zona-creps-app",
  storageBucket: "zona-creps-app.firebasestorage.app",
  messagingSenderId: "849605707573",
  appId: "1:849605707573:web:f0d695f868b601a7306e7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore
export const db = getFirestore(app);