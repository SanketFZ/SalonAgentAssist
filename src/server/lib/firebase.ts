// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Use environment variables prefixed with NEXT_PUBLIC_ for client-side exposure
// Use non-prefixed variables for server-side only access if needed (but these are likely needed client-side too for auth etc.)
const firebaseConfig = {
  apiKey: "AIzaSyCE9rSp3DrARhVX5H8PxViExZyxjmrpbvs",
  authDomain: "agent-assist-99cf4.firebaseapp.com",
  projectId: "agent-assist-99cf4",
  storageBucket: "agent-assist-99cf4.firebasestorage.app",
  messagingSenderId: "212798567401",
  appId: "1:212798567401:web:98d83ad97a8515a4a09178",
  measurementId: "G-CSZM7CEWPN"
};


// Initialize Firebase
// Ensure initialization happens only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { app, db };