// ── Firebase – Configuración ───────────────────────────────────────────────
// IMPORTANTE: Reemplazá cada "REEMPLAZAR_..." con los valores de tu proyecto.
// Los encontrás en: Firebase Console → ⚙️ Configuración del proyecto → SDK de Firebase
// (Te guío paso a paso más abajo en el chat)

var firebaseConfig = {
  apiKey:            "AIzaSyB7vslGtZ0p36LNiczI2UBgS5E3cByeQIw",
  authDomain:        "donasol-9255f.firebaseapp.com",
  projectId:         "donasol-9255f",
  storageBucket:     "donasol-9255f.firebasestorage.app",
  messagingSenderId: "432744152923",
  appId:             "1:432744152923:web:15a269af35fd4674d4e47e"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
