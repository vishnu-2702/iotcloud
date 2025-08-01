
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFmwrhRs1jClRtoX6IUxR_SoSFghv4Frc",
  authDomain: "iot-test-39bd6.firebaseapp.com",
  projectId: "iot-test-39bd6",
  storageBucket: "iot-test-39bd6.firebasestorage.app",
  messagingSenderId: "366169098953",
  appId: "1:366169098953:web:fb6c1d6ad15a6bcb249b18",
  measurementId: "G-QJLR8TRK0X"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export { app, firestore };
