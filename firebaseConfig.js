// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getDatabase(app);

export { app, auth, db };
