// frontend/src/firebaseClient.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7cAN-mrE2PvmlQ11zLKAdHBhN7nUFjHw",
  authDomain: "fir-u-c-students-web.firebaseapp.com",
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com",
  projectId: "fir-u-c-students-web",
  storageBucket: "fir-u-c-students-web.firebasestorage.app",
  messagingSenderId: "113569186739",
  appId: "1:113569186739:web:d8daf21059f43a79e841c6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/**
 * Sign in with Google popup
 */
async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  // result.user contains user info
  return result.user;
}

/**
 * Listen for auth changes
 */
function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

/**
 * Save user profile in Firestore and auto-join group chat on signup
 */
async function upsertUser(user) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    joinedAt: serverTimestamp(),
    autoJoinedGroup: true
  }, { merge: true });
  // Add membership document to group-members collection
  const memberRef = doc(db, "groupMembers", user.uid);
  await setDoc(memberRef, {
    uid: user.uid,
    displayName: user.displayName,
    joinedAt: serverTimestamp(),
    groupId: "university_students_group"
  }, { merge: true });
}

/**
 * Send message to the group
 */
async function sendMessage({ uid, name, text, photoURL }) {
  const messagesCol = collection(db, "groups/university_students_group/messages");
  await addDoc(messagesCol, {
    uid,
    name,
    text,
    photoURL: photoURL || null,
    createdAt: serverTimestamp()
  });
}

/**
 * Listen messages (live)
 */
function subscribeToMessages(onUpdate) {
  const messagesCol = collection(db, "groups/university_students_group/messages");
  const q = query(messagesCol, orderBy("createdAt", "asc"));
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(data);
  });
}

export {
  auth,
  signInWithGoogle,
  onAuthChange,
  upsertUser,
  sendMessage,
  subscribeToMessages
};
