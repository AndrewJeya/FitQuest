// firebaseConfig.js
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';

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

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.database();
export const app = firebase.app();

export default firebase;