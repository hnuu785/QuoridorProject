import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyALOFuKIZLkJF3PMSNi_t8tDQf1llTMw-w",
  authDomain: "quoridor-79bf6.firebaseapp.com",
  databaseURL: "https://quoridor-79bf6-default-rtdb.firebaseio.com/",
  projectId: "quoridor-79bf6",
  storageBucket: "quoridor-79bf6.appspot.com",
  messagingSenderId: "944442338814",
  appId: "1:944442338814:web:56f928eadd97efb7b9a4af",
  measurementId: "G-VTRZTPPPKF"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };