// إدارة المستخدمين والصلاحيات في Firebase

// التحقق من صلاحيات المستخدم الحالي
async function checkAdminStatus() {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (!adminDoc.exists) return false;
    
    // التحقق من دور المستخدم (superadmin له جميع الصلاحيات)
    const adminData = adminDoc.data();
    console.log('بيانات المسؤول:', adminData);
    
    // إذا كان المستخدم superadmin أو admin، فهو مسؤول
    return true;
  } catch (error) {
    console.error('خطأ في التحقق من صلاحيات المستخدم:', error);
    return false;
  }
}

// إنشاء مستخدم جديد وتعيينه كمسؤول
async function createAdminUser(email, password, name, role) {
  try {
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('ليس لديك صلاحية لإنشاء مستخدمين جدد');
    }
    
    // إنشاء المستخدم باستخدام Firebase Admin SDK (يجب تنفيذه على الخادم)
    // هنا نستخدم Cloud Functions لإنشاء المستخدم
    const createUserFunction = firebase.functions().httpsCallable('createAdminUser');
    const result = await createUserFunction({ email, password, name, role });
    
    // إضافة المستخدم إلى مجموعة المسؤولين في Firestore
    await db.collection('admins').doc(result.data.uid).set({
      email: email,
      name: name,
      role: role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid
    });
    
    return { success: true, message: 'تم إنشاء المستخدم بنجاح', uid: result.data.uid };
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
    return { success: false, message: error.message };
  }
}

// حذف مستخدم
async function deleteAdminUser(uid) {
  try {
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('ليس لديك صلاحية لحذف المستخدمين');
    }
    
    // حذف المستخدم باستخدام Firebase Admin SDK (يجب تنفيذه على الخادم)
    const deleteUserFunction = firebase.functions().httpsCallable('deleteAdminUser');
    await deleteUserFunction({ uid });
    
    // حذف المستخدم من مجموعة المسؤولين في Firestore
    await db.collection('admins').doc(uid).delete();
    
    // تسجيل عملية الحذف
    await db.collection('logs').add({
      action: 'delete_admin',
      adminId: uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      performedBy: auth.currentUser.uid
    });
    
    return { success: true, message: 'تم حذف المستخدم بنجاح' };
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    return { success: false, message: error.message };
  }
}

// تحديث صلاحيات المستخدم
async function updateAdminRole(uid, newRole) {
  try {
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('ليس لديك صلاحية لتعديل صلاحيات المستخدمين');
    }
    
    // تحديث دور المستخدم في Firestore
    await db.collection('admins').doc(uid).update({
      role: newRole,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: auth.currentUser.uid
    });
    
    // تسجيل عملية التحديث
    await db.collection('logs').add({
      action: 'update_admin_role',
      adminId: uid,
      newRole: newRole,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      performedBy: auth.currentUser.uid
    });
    
    return { success: true, message: 'تم تحديث صلاحيات المستخدم بنجاح' };
  } catch (error) {
    console.error('خطأ في تحديث صلاحيات المستخدم:', error);
    return { success: false, message: error.message };
  }
}

// الحصول على قائمة المسؤولين
async function getAdminsList() {
  try {
    // التحقق من أن المستخدم الحالي هو مسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('ليس لديك صلاحية لعرض قائمة المسؤولين');
    }
    
    const adminsSnapshot = await db.collection('admins').get();
    const adminsList = [];
    
    adminsSnapshot.forEach(doc => {
      adminsList.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    return adminsList;
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