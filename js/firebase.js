import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnYuRiCL-jL3beuSX92UrHCdid8v0OLE8",
  authDomain: "login-form-b134e.firebaseapp.com",
  projectId: "login-form-b134e",
  storageBucket: "login-form-b134e.firebasestorage.app",
  messagingSenderId: "993520376152",
  appId: "1:993520376152:web:8ce9dfa3011f0db3a1ad2d",
  measurementId: "G-FCPHDXZR0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn('Firebase analytics not available:', e);
}

export { app, auth };