// auth.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// ✅ هنا ضع إعدادات Firebase الخاصة بك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBSRzKEx4PM_ZWgMfGhZ8FVDihcKxixPa4",
  authDomain: "azad-7d659.firebaseapp.com",
  projectId: "azad-7d659",
  storageBucket: "azad-7d659.firebasestorage.app",
  messagingSenderId: "886046920572",
  appId: "1:886046920572:web:432e829a19fcd9819fdef9"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ دالة جلب الدور
export async function getUserRole() {
  const user = auth.currentUser;
  if (!user) return null;

  // superadmin: موجود داخل مجموعة admins
  const adminDoc = await getDoc(doc(db, "admins", user.uid));
  if (adminDoc.exists() && adminDoc.data().role === "superadmin") {
    return "superadmin";
  }

  // admin: موجود داخل مجموعة persons
  const personDoc = await getDoc(doc(db, "persons", user.uid));
  if (personDoc.exists()) {
    return "admin";
  }

  // user: موجود داخل مجموعة people
  const peopleDoc = await getDoc(doc(db, "people", user.uid));
  if (peopleDoc.exists()) {
    return "user";
  }

  // إذا ما موجود في أي مجموعة
  return "unknown";
}

export { auth, db };
