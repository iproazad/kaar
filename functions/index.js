const functions = require('firebase-functions');
const admin = require('firebase-admin');

// تهيئة Firebase Admin SDK
admin.initializeApp();

// إنشاء مستخدم جديد وتعيينه كمسؤول
exports.createAdminUser = functions.https.onCall(async (data, context) => {
  // التحقق من أن المستخدم الحالي مسجل الدخول
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'يجب تسجيل الدخول لاستخدام هذه الوظيفة'
    );
  }
  
  // التحقق من أن المستخدم الحالي هو مسؤول
  const callerUid = context.auth.uid;
  const callerAdminDoc = await admin.firestore().collection('admins').doc(callerUid).get();
  
  if (!callerAdminDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'يجب أن تكون مسؤولاً لإنشاء مستخدمين جدد'
    );
  }
  
  // التحقق من دور المستخدم
  const callerData = callerAdminDoc.data();
  console.log('بيانات المسؤول المتصل:', callerData);
  
  // التحقق من البيانات المطلوبة
  const { email, password, name, role } = data;
  if (!email || !password || !name || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'يجب توفير البريد الإلكتروني وكلمة المرور والاسم والدور'
    );
  }
  
  try {
    // إنشاء المستخدم في Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });
    
    // إضافة المستخدم إلى مجموعة المسؤولين في Firestore
    await admin.firestore().collection('admins').doc(userRecord.uid).set({
      email: email,
      name: name,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: callerUid
    });
    
    // تسجيل العملية
    await admin.firestore().collection('logs').add({
      action: 'create_admin',
      adminId: userRecord.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      performedBy: callerUid
    });
    
    return { uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// حذف مستخدم
exports.deleteAdminUser = functions.https.onCall(async (data, context) => {
  // التحقق من أن المستخدم الحالي مسجل الدخول
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'يجب تسجيل الدخول لاستخدام هذه الوظيفة'
    );
  }
  
  // التحقق من أن المستخدم الحالي هو مسؤول
  const callerUid = context.auth.uid;
  const callerAdminDoc = await admin.firestore().collection('admins').doc(callerUid).get();
  
  if (!callerAdminDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'يجب أن تكون مسؤولاً لحذف المستخدمين'
    );
  }
  
  // التحقق من دور المستخدم
  const callerData = callerAdminDoc.data();
  console.log('بيانات المسؤول المتصل:', callerData);
  
  // التحقق من البيانات المطلوبة
  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'يجب توفير معرف المستخدم'
    );
  }
  
  // التحقق من أن المستخدم لا يحاول حذف نفسه
  if (uid === callerUid) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'لا يمكنك حذف حسابك الخاص'
    );
  }
  
  try {
    // حذف المستخدم من Firebase Authentication
    await admin.auth().deleteUser(uid);
    
    // حذف المستخدم من مجموعة المسؤولين في Firestore
    await admin.firestore().collection('admins').doc(uid).delete();
    
    // تسجيل العملية
    await admin.firestore().collection('logs').add({
      action: 'delete_admin',
      adminId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      performedBy: callerUid
    });
    
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// تسجيل التغييرات في قاعدة البيانات
exports.logDatabaseChanges = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    const { collection, docId } = context.params;
    
    // تجاهل التغييرات في مجموعة السجلات نفسها لتجنب التكرار اللانهائي
    if (collection === 'logs') {
      return null;
    }
    
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    
    let action;
    if (!beforeData && afterData) {
      action = 'create';
    } else if (beforeData && afterData) {
      action = 'update';
    } else if (beforeData && !afterData) {
      action = 'delete';
    }
    
    // الحصول على معرف المستخدم الذي قام بالتغيير (إذا كان متاحًا)
    let userId = 'system';
    if (afterData && afterData.updatedBy) {
      userId = afterData.updatedBy;
    } else if (afterData && afterData.createdBy) {
      userId = afterData.createdBy;
    }
    
    // تسجيل التغيير
    return admin.firestore().collection('logs').add({
      action: `${action}_${collection}`,
      documentId: docId,
      collection: collection,
      beforeData: beforeData,
      afterData: afterData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      performedBy: userId
    });
  });