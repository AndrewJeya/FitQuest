// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBHm1A2UGAOJSsUqFo5cSOMECcoXDWEHHA",
  authDomain: "fitquest-4d05a.firebaseapp.com",
  databaseURL: "https://fitquest-4d05a-default-rtdb.firebaseio.com",
  projectId: "fitquest-4d05a",
  storageBucket: "fitquest-4d05a.appspot.com",
  messagingSenderId: "712612085342",
  appId: "1:712612085342:web:abffc484a1cc58da16fecf",
  measurementId: "G-ZEFYFWGRZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
