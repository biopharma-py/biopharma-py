// ============================================================
//  auth.js — BIOPHARMA-PY
// ============================================================
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword,
         createUserWithEmailAndPassword, signOut,
         onAuthStateChanged, sendPasswordResetEmail, updateProfile }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey:            "AIzaSyDU7fviEY4CyE68Ew-WMs-u0thtAdxvyIc",
  authDomain:        "biopharmapy.firebaseapp.com",
  projectId:         "biopharmapy",
  storageBucket:     "biopharmapy.firebasestorage.app",
  messagingSenderId: "1077565620422",
  appId:             "1:1077565620422:web:a61fa958c74894f00817c7"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

const ADMIN_UID   = "b2VM6KKhy2QG7PT1o4YV3fu2iVn1";
const ADMIN_EMAIL = "walef20111@hotmail.com";

export const isAdmin = user => {
  if (!user) return false;
  return user.uid === ADMIN_UID ||
         (user.email||'').toLowerCase().trim() === ADMIN_EMAIL;
};

export const authHelpers = {
  customerLogin: (email, pass) =>
    signInWithEmailAndPassword(auth, email.trim(), pass),

  adminLogin: (email, pass) =>
    signInWithEmailAndPassword(auth, email.trim(), pass),

  customerRegister: async (name, whatsapp, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db,'customers', cred.user.uid), {
      name, email: email.trim(), whatsapp,
      createdAt: new Date().toISOString()
    });
    return cred;
  },

  logout: () => signOut(auth),

  resetPassword: email => sendPasswordResetEmail(auth, email.trim()),

  loadProfile: async uid => {
    try {
      const snap = await getDoc(doc(db,'customers', uid));
      return snap.exists() ? snap.data() : null;
    } catch(e) { return null; }
  },

  errorMsg: code => ({
    'auth/user-not-found':      'Usuário não encontrado.',
    'auth/wrong-password':      'Senha incorreta.',
    'auth/invalid-credential':  'E-mail ou senha incorretos.',
    'auth/invalid-email':       'E-mail inválido.',
    'auth/too-many-requests':   'Muitas tentativas. Aguarde.',
    'auth/email-already-in-use':'E-mail já cadastrado.',
    'auth/weak-password':       'Senha muito fraca (mín. 6 caracteres).'
  }[code] || 'Erro de autenticação. Tente novamente.'),

  onStateChanged: cb => onAuthStateChanged(auth, cb)
};
