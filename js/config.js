// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSRzKEx4PM_ZWgMfGhZ8FVDihcKxixPa4",
  authDomain: "azad-7d659.firebaseapp.com",
  projectId: "azad-7d659",
  storageBucket: "azad-7d659.appspot.com",
  messagingSenderId: "886046920572",
  appId: "1:886046920572:web:432e829a19fcd9819fdef9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions();

// Set Firestore settings to ensure data is saved to the server
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED  // Use unlimited cache for better offline support
});

// Enable offline persistence explicitly
db.enablePersistence({ synchronizeTabs: true })
  .then(() => {
    console.log('تم تفعيل الحفظ المحلي والتزامن مع الخادم بنجاح');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('يجب فتح التطبيق في نافذة واحدة فقط لتفعيل الحفظ المحلي');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.warn('المتصفح الحالي لا يدعم ميزات الحفظ المحلي');
    }
    console.log('تم تكوين التطبيق للحفظ في الخادم فقط');
  });

// Export Firebase services for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;
window.functions = functions;