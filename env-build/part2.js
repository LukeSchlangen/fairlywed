; 

// import * as config from '../../env.json'
// import { firebase } from 'firebase-admin'
// Initialize Firebase
  const firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    databaseURL: config.FIREBASE_DATABASE_URL,
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID
  };
firebase.initializeApp(firebaseConfig);