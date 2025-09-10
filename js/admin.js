// إدارة المستخدمين والصلاحيات في Firebase

// التحقق من صلاحيات المستخدم الحالي
async function checkAdminStatus() {
  const user = auth.currentUser;
  if (!user) {
    console.log('لا يوجد مستخدم مسجل الدخول');
    return false;
  }
  
  try {
    console.log('التحقق من صلاحيات المستخدم:', user.uid, 'البريد الإلكتروني:', user.email);
    
    // محاولة الوصول إلى مجموعة المسؤولين
    try {
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
      
      if (!adminDoc.exists) {
        console.log('المستخدم غير موجود في مجموعة المسؤولين');
        
        // التحقق من وجود المستخدم في مجموعة المستخدمين العاديين
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          console.log('هل المستخدم موجود في مجموعة المستخدمين العاديين:', userDoc.exists);
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('بيانات المستخدم العادي:', userData);
            console.log('دور المستخدم العادي:', userData.role || 'غير محدد');
            
            // التحقق إذا كان المستخدم العادي لديه دور admin
            if (userData.role === 'admin' || userData.role === 'superadmin') {
              console.log('المستخدم العادي لديه دور مسؤول');
              return true;
            }
          }
        } catch (userError) {
          console.error('خطأ في التحقق من مجموعة المستخدمين العاديين:', userError);
        }
        
        return false;
      }
      
      // التحقق من دور المستخدم (superadmin له جميع الصلاحيات)
      const adminData = adminDoc.data();
      console.log('بيانات المسؤول:', adminData);
      console.log('دور المسؤول:', adminData.role || 'غير محدد');
      
      // التحقق من دور المستخدم بشكل أكثر تفصيلاً
      if (adminData.role === 'superadmin') {
        console.log('المستخدم هو سوبر أدمين (له كامل الصلاحيات بدون قيود)');
        return true;
      } else if (adminData.role === 'admin') {
        console.log('المستخدم هو مسؤول عادي');
        return true;
      } else {
        console.log('المستخدم ليس لديه دور مسؤول صالح');
        return false;
      }
      
    } catch (adminError) {
      console.error('خطأ في الوصول إلى مجموعة المسؤولين:', adminError);
      console.log('رمز الخطأ:', adminError.code);
      console.log('رسالة الخطأ:', adminError.message);
      
      // إذا كان الخطأ بسبب عدم وجود صلاحيات، نحاول تسجيل الخروج وإعادة تحميل الصفحة
      if (adminError.code === 'permission-denied') {
        console.log('خطأ في الصلاحيات عند محاولة الوصول إلى مجموعة المسؤولين');
        alert('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين. سيتم تسجيل الخروج وإعادة تحميل الصفحة.');
        
        // تسجيل الخروج وإعادة تحميل الصفحة
        auth.signOut().then(() => {
          window.location.reload();
        });
      }
      
      return false;
    }
  } catch (error) {
    console.error('خطأ عام في التحقق من صلاحيات المستخدم:', error);
    console.log('خطأ عام في التحقق من صلاحيات المستخدم:', error.message);
    return false;
  }
}

// إنشاء مستخدم جديد وتعيينه كمسؤول
async function createAdminUser(email, password, name, role) {
  try {
    // التحقق من أن المستخدم الحالي هو مسجل الدخول
    const user = auth.currentUser;
    if (!user) {
      console.log('لا يوجد مستخدم مسجل الدخول');
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    
    console.log('محاولة إنشاء مستخدم جديد بواسطة:', user.uid, 'البريد الإلكتروني:', user.email);
    
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    console.log('نتيجة التحقق من صلاحيات المستخدم لإنشاء مستخدم جديد:', isAdmin);
    
    if (!isAdmin) {
      console.log('المستخدم ليس لديه صلاحيات كافية لإنشاء مستخدمين جدد');
      throw new Error('ليس لديك صلاحية لإنشاء مستخدمين جدد');
    }
    
    // إنشاء المستخدم باستخدام Firebase Admin SDK (يجب تنفيذه على الخادم)
    // هنا نستخدم Cloud Functions لإنشاء المستخدم
    console.log('استدعاء دالة Cloud Function لإنشاء المستخدم');
    try {
      const createUserFunction = firebase.functions().httpsCallable('createAdminUser');
      const result = await createUserFunction({ email, password, name, role });
      console.log('تم إنشاء المستخدم بنجاح عبر Cloud Function:', result.data);
      
      // إضافة المستخدم إلى مجموعة المسؤولين في Firestore
      console.log('إضافة المستخدم إلى مجموعة المسؤولين في Firestore');
      try {
        await db.collection('admins').doc(result.data.uid).set({
          email: email,
          name: name,
          role: role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: auth.currentUser.uid
        });
        console.log('تم إضافة المستخدم إلى مجموعة المسؤولين بنجاح');
      } catch (firestoreError) {
        console.error('خطأ في إضافة المستخدم إلى مجموعة المسؤولين:', firestoreError);
        console.log('رمز الخطأ:', firestoreError.code);
        console.log('رسالة الخطأ:', firestoreError.message);
        
        // إذا كان الخطأ بسبب عدم وجود صلاحيات
        if (firestoreError.code === 'permission-denied') {
          console.log('خطأ في الصلاحيات عند محاولة إضافة المستخدم إلى مجموعة المسؤولين');
          alert('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين. سيتم تسجيل الخروج وإعادة تحميل الصفحة.');
          
          // تسجيل الخروج وإعادة تحميل الصفحة
          auth.signOut().then(() => {
            window.location.reload();
          });
          
          throw new Error('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين');
        }
        
        throw firestoreError;
      }
      
      return { success: true, message: 'تم إنشاء المستخدم بنجاح', uid: result.data.uid };
    } catch (functionError) {
      console.error('خطأ في استدعاء دالة Cloud Function:', functionError);
      throw functionError;
    }
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
    return { success: false, message: error.message };
  }
}

// حذف مستخدم
async function deleteAdminUser(uid) {
  try {
    // التحقق من أن المستخدم الحالي هو مسجل الدخول
    const user = auth.currentUser;
    if (!user) {
      console.log('لا يوجد مستخدم مسجل الدخول');
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    
    console.log('محاولة حذف مستخدم بواسطة:', user.uid, 'البريد الإلكتروني:', user.email);
    console.log('معرف المستخدم المراد حذفه:', uid);
    
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    console.log('نتيجة التحقق من صلاحيات المستخدم لحذف مستخدم:', isAdmin);
    
    if (!isAdmin) {
      console.log('المستخدم ليس لديه صلاحيات كافية لحذف المستخدمين');
      throw new Error('ليس لديك صلاحية لحذف المستخدمين');
    }
    
    // حذف المستخدم باستخدام Firebase Admin SDK (يجب تنفيذه على الخادم)
    console.log('استدعاء دالة Cloud Function لحذف المستخدم');
    try {
      const deleteUserFunction = firebase.functions().httpsCallable('deleteAdminUser');
      await deleteUserFunction({ uid });
      console.log('تم حذف المستخدم بنجاح عبر Cloud Function');
      
      // حذف المستخدم من مجموعة المسؤولين في Firestore
      console.log('حذف المستخدم من مجموعة المسؤولين في Firestore');
      try {
        await db.collection('admins').doc(uid).delete();
        console.log('تم حذف المستخدم من مجموعة المسؤولين بنجاح');
        
        // تسجيل عملية الحذف
        try {
          await db.collection('logs').add({
            action: 'delete_admin',
            adminId: uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            performedBy: auth.currentUser.uid
          });
          console.log('تم تسجيل عملية الحذف بنجاح');
        } catch (logError) {
          console.error('خطأ في تسجيل عملية الحذف:', logError);
          // نتجاهل هذا الخطأ لأنه غير حرج
        }
      } catch (firestoreError) {
        console.error('خطأ في حذف المستخدم من مجموعة المسؤولين:', firestoreError);
        console.log('رمز الخطأ:', firestoreError.code);
        console.log('رسالة الخطأ:', firestoreError.message);
        
        // إذا كان الخطأ بسبب عدم وجود صلاحيات
        if (firestoreError.code === 'permission-denied') {
          console.log('خطأ في الصلاحيات عند محاولة حذف المستخدم من مجموعة المسؤولين');
          alert('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين. سيتم تسجيل الخروج وإعادة تحميل الصفحة.');
          
          // تسجيل الخروج وإعادة تحميل الصفحة
          auth.signOut().then(() => {
            window.location.reload();
          });
          
          throw new Error('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين');
        }
        
        throw firestoreError;
      }
      
      return { success: true, message: 'تم حذف المستخدم بنجاح' };
    } catch (functionError) {
      console.error('خطأ في استدعاء دالة Cloud Function:', functionError);
      throw functionError;
    }
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    return { success: false, message: error.message };
  }
}

// تحديث صلاحيات المستخدم
async function updateAdminRole(uid, newRole) {
  try {
    // التحقق من أن المستخدم الحالي هو مسجل الدخول
    const user = auth.currentUser;
    if (!user) {
      console.log('لا يوجد مستخدم مسجل الدخول');
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    
    console.log('محاولة تحديث صلاحيات مستخدم بواسطة:', user.uid, 'البريد الإلكتروني:', user.email);
    console.log('معرف المستخدم المراد تحديث صلاحياته:', uid, 'الدور الجديد:', newRole);
    
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    console.log('نتيجة التحقق من صلاحيات المستخدم لتعديل صلاحيات مستخدم آخر:', isAdmin);
    
    if (!isAdmin) {
      console.log('المستخدم ليس لديه صلاحيات كافية لتعديل صلاحيات المستخدمين');
      throw new Error('ليس لديك صلاحية لتعديل صلاحيات المستخدمين');
    }
    
    // تحديث دور المستخدم في Firestore
    console.log('تحديث دور المستخدم في Firestore');
    try {
      await db.collection('admins').doc(uid).update({
        role: newRole,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: auth.currentUser.uid
      });
      console.log('تم تحديث دور المستخدم بنجاح');
      
      // تسجيل عملية التحديث
      try {
        await db.collection('logs').add({
          action: 'update_admin_role',
          adminId: uid,
          newRole: newRole,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          performedBy: auth.currentUser.uid
        });
        console.log('تم تسجيل عملية التحديث بنجاح');
      } catch (logError) {
        console.error('خطأ في تسجيل عملية التحديث:', logError);
        // نتجاهل هذا الخطأ لأنه غير حرج
      }
      
      return { success: true, message: 'تم تحديث صلاحيات المستخدم بنجاح' };
    } catch (firestoreError) {
      console.error('خطأ في تحديث دور المستخدم في Firestore:', firestoreError);
      console.log('رمز الخطأ:', firestoreError.code);
      console.log('رسالة الخطأ:', firestoreError.message);
      
      // إذا كان الخطأ بسبب عدم وجود صلاحيات
      if (firestoreError.code === 'permission-denied') {
        console.log('خطأ في الصلاحيات عند محاولة تحديث دور المستخدم');
        alert('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين. سيتم تسجيل الخروج وإعادة تحميل الصفحة.');
        
        // تسجيل الخروج وإعادة تحميل الصفحة
        auth.signOut().then(() => {
          window.location.reload();
        });
        
        throw new Error('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين');
      }
      
      throw firestoreError;
    }
  } catch (error) {
    console.error('خطأ في تحديث صلاحيات المستخدم:', error);
    return { success: false, message: error.message };
  }
}

// الحصول على قائمة المسؤولين
async function getAdminsList() {
  try {
    // التحقق من أن المستخدم الحالي هو مسجل الدخول
    const user = auth.currentUser;
    if (!user) {
      console.log('لا يوجد مستخدم مسجل الدخول');
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    
    console.log('محاولة الحصول على قائمة المسؤولين بواسطة:', user.uid, 'البريد الإلكتروني:', user.email);
    
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    console.log('نتيجة التحقق من صلاحيات المستخدم لعرض قائمة المسؤولين:', isAdmin);
    
    if (!isAdmin) {
      console.log('المستخدم ليس لديه صلاحيات كافية لعرض قائمة المسؤولين');
      throw new Error('ليس لديك صلاحية لعرض قائمة المسؤولين');
    }
    
    console.log('جلب قائمة المسؤولين من Firestore');
    try {
      const adminsSnapshot = await db.collection('admins').get();
      console.log('تم جلب قائمة المسؤولين بنجاح، عدد المسؤولين:', adminsSnapshot.size);
      
      const adminsList = [];
      
      adminsSnapshot.forEach(doc => {
        adminsList.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      
      return adminsList;
    } catch (firestoreError) {
      console.error('خطأ في جلب قائمة المسؤولين من Firestore:', firestoreError);
      console.log('رمز الخطأ:', firestoreError.code);
      console.log('رسالة الخطأ:', firestoreError.message);
      
      // إذا كان الخطأ بسبب عدم وجود صلاحيات
      if (firestoreError.code === 'permission-denied') {
        console.log('خطأ في الصلاحيات عند محاولة جلب قائمة المسؤولين');
        alert('ليس لديك صلاحيات كافية للوصول إلى بيانات المسؤولين. سيتم تسجيل الخروج وإعادة تحميل الصفحة.');
        
        // تسجيل الخروج وإعادة تحميل الصفحة
        auth.signOut().then(() => {
          window.location.reload();
        });
      }
      
      throw firestoreError;
    }
  } catch (error) {
    console.error('خطأ في الحصول على قائمة المسؤولين:', error);
    throw error;
  }
}

// تصدير الدوال للاستخدام في ملفات أخرى
window.adminFunctions = {
  checkAdminStatus,
  createAdminUser,
  deleteAdminUser,
  updateAdminRole,
  getAdminsList
};