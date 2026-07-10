// Firebase configuration for Afia Clinic App
// Note: the Firebase Web apiKey is a public identifier (not a secret).
// Security is enforced by Firebase Security Rules, not by hiding this key.

const firebaseConfig = {
  apiKey: "AIzaSyC0TRcE1cjbihgjov3ugJRGoO6E_Hm2a60",
  authDomain: "afiaclinicapp.firebaseapp.com",
  projectId: "afiaclinicapp",
  storageBucket: "afiaclinicapp.firebasestorage.app",
  messagingSenderId: "782966598557",
  appId: "1:782966598557:web:76d71235671d61db8d5d74",
  measurementId: "G-PPBNGYCQ6D"
};

// Initialize Firebase (compat SDK — works with plain <script> tags, no bundler needed)
firebase.initializeApp(firebaseConfig);

// Expose services globally so every page can use them
const auth = firebase.auth();
const db   = firebase.firestore();

// Helper: save a booking to Firestore (collection: "bookings")
async function fbSaveBooking(booking) {
  const ref = await db.collection("bookings").add({
    ...booking,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

// Helper: load all bookings (ordered by date)
async function fbLoadBookings() {
  const snap = await db.collection("bookings").orderBy("date", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Helper: update a booking by id
async function fbUpdateBooking(id, data) {
  await db.collection("bookings").doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Helper: delete a booking by id
async function fbDeleteBooking(id) {
  await db.collection("bookings").doc(id).delete();
}
