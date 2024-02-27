// import { initializeApp } from 'firebase/app'
// import { getAuth } from 'firebase/auth';
// import dotenv from 'dotenv';
// dotenv.config();

// console.log()

// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_WEB_API_KEY,
//     authDomain: "garage-wonder.firebaseapp.com",
//     projectId: "garage-wonder",
//     storageBucket: "garage-wonder.appspot.com",
//     messagingSenderId: "175381225617",
//     appId: "1:175381225617:web:2475faaa1971c91bf45f30",
//     measurementId: "G-RESHK9ZTFJ"
// };

// let firebaseApp;


// export const initializeAppFirebase = () => {
//     try {
//         firebaseApp = initializeApp(firebaseConfig);
//         console.log("Connect to firebase Successfully")
//         return firebaseApp;
//     } catch (error) {
//         console.log("Connect to firebase failed")
//     }
// };

// export const auth = getAuth(initializeAppFirebase());

// // export const auth = getAuth(firebaseApp);

// export const getFirebaseApp = () => firebaseApp;

import admin from 'firebase-admin'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./garage-wonder-firebase-adminsdk-tx6wt-7c639d7617.json");


const connectFireBase = async () => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Connect to firebase admin successfully!!');
    } catch (error) {
        console.log(error);
    }
};

export const firebaseAdmin = admin; 

export default connectFireBase;