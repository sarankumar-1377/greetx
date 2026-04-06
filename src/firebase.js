import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 🔥 important

const firebaseConfig = {
  apiKey: "AIzaSyABa_R1jW6zT4DPIktjM6YRSrM8e79safI",
  authDomain: "greetx-6d6f7.firebaseapp.com",
  projectId: "greetx-6d6f7",
  storageBucket: "greetx-6d6f7.appspot.com",
  messagingSenderId: "548073440439",
  appId: "1:548073440439:web:ffc891057b107ba07e3932"
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// 🔥 Firestore
export const db = getFirestore(app);

// 🖼️ Storage (image upload ku)
export const storage = getStorage(app);