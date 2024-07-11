import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  //apiKey: "AIzaSyBeTpeUy0vsR302cbrhEAphcK8zQ_291Ms",
  //authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://quoridor-79bf6-default-rtdb.firebaseio.com/",
  projectId: "quoridor-79bf6",
  //storageBucket: "YOUR_STORAGE_BUCKET",
  //messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  //appId: "1:944442338814:android:730be2bcb39242c1b9a4af",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };