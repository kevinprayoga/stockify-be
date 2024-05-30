const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("../path/serviceAccountKey.json");

// Inisialisasi aplikasi Firebase
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "stockify-ef5e0.appspot.com",
});

// Mendapatkan instance Firestore dan Storage
const db = getFirestore(app);
const storage = getStorage().bucket();

module.exports = { db, storage };
