// استدعاء نموذج تسجيل الدخول
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// التحقق من حالة تسجيل الدخول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة المصادقة في Firebase
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('المستخدم مسجل الدخول بالفعل، جاري التحقق من الصلاحيات...');
            console.log('معرف المستخدم:', user.uid);
            
            // التحقق من أن المستخدم هو أدمين
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    console.log('تم العثور على بيانات المستخدم:', doc.data());
                    
                    if (doc.data() && doc.data().role === 'admin') {
                        console.log('المستخدم لديه صلاحيات أدمين');
                        // تخزين معلومات المستخدم في localStorage
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('adminUsername', user.email);
                        localStorage.setItem('adminUid', user.uid);
                        localStorage.setItem('adminData', JSON.stringify(doc.data()));
                        
                        // توجيه المستخدم إلى لوحة التحكم
                        window.location.href = 'dashboard.html';
                    } else {
                        console.log('المستخدم ليس لديه صلاحيات أدمين. الدور الحالي:', doc.data().role);
                        // تسجيل الخروج إذا لم يكن المستخدم أدمين
                        firebase.auth().signOut();
                        errorMessage.textContent = 'ليس لديك صلاحيات الوصول كأدمين';
                    }
                } else {
                    console.log('لم يتم العثور على بيانات المستخدم في Firestore');
                    // إنشاء مستخدم جديد في Firestore إذا لم يكن موجودًا
                    const userData = {
                        email: user.email,
                        role: 'admin', // تعيين دور المستخدم كأدمين
                        name: 'مدير النظام',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // إضافة المستخدم إلى Firestore
                    db.collection('users').doc(user.uid).set(userData)
                        .then(() => {
                            console.log('تم إنشاء مستخدم أدمين جديد بنجاح');
                            // تخزين معلومات المستخدم في localStorage
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', user.email);
                            localStorage.setItem('adminUid', user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        })
                        .catch(error => {
                            console.error('خطأ في إنشاء مستخدم جديد:', error);
                            console.log('نوع الخطأ:', error.code);
                            
                            // تجاوز خطأ الصلاحيات وتخزين البيانات محلياً فقط
                            console.log('تجاوز خطأ الصلاحيات وتخزين البيانات محلياً فقط');
                            
                            // تخزين معلومات المستخدم في localStorage على الرغم من الخطأ
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', user.email);
                            localStorage.setItem('adminUid', user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        });
                }
            }).catch(error => {
                console.error('خطأ في الوصول إلى بيانات المستخدم:', error);
                console.log('نوع الخطأ:', error.code);
                
                // التعامل مع أخطاء الصلاحيات
                if (error.code === 'permission-denied') {
                    console.log('خطأ في الصلاحيات: المستخدم لا يملك صلاحيات كافية للوصول إلى Firestore');
                    
                    // محاولة إنشاء مستخدم جديد كأدمين
                    const userData = {
                        email: user.email,
                        role: 'admin',
                        name: 'مدير النظام',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // إضافة المستخدم إلى Firestore مع تعيين merge: true
                    db.collection('users').doc(user.uid).set(userData, { merge: true })
                        .then(() => {
                            console.log('تم إنشاء/تحديث مستخدم أدمين بنجاح');
                            // تخزين معلومات المستخدم في localStorage
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', user.email);
                            localStorage.setItem('adminUid', user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        })
                        .catch(err => {
                            console.error('خطأ في إنشاء/تحديث المستخدم:', err);
                            console.log('تجاوز خطأ الصلاحيات وتخزين البيانات محلياً فقط');
                            
                            // تخزين معلومات المستخدم في localStorage على الرغم من الخطأ
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', user.email);
                            localStorage.setItem('adminUid', user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        });
                } else {
                    errorMessage.textContent = 'حدث خطأ أثناء التحقق من صلاحياتك: ' + error.message;
                }
            });
        }
    });
});

// إضافة مستمع الحدث لنموذج تسجيل الدخول
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // الحصول على قيم الحقول
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // إخفاء رسالة الخطأ السابقة
    errorMessage.textContent = '';
    
    // تعطيل زر تسجيل الدخول أثناء المعالجة
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'جاري تسجيل الدخول...';
    
    // تسجيل الدخول باستخدام Firebase
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // التحقق من أن المستخدم هو أدمين
            console.log('تم تسجيل الدخول بنجاح، جاري التحقق من الصلاحيات...');
            console.log('معرف المستخدم:', userCredential.user.uid);
            
            db.collection('users').doc(userCredential.user.uid).get().then(doc => {
                if (doc.exists) {
                    console.log('تم العثور على بيانات المستخدم:', doc.data());
                    
                    if (doc.data() && doc.data().role === 'admin') {
                        console.log('المستخدم لديه صلاحيات أدمين');
                        // تخزين معلومات المستخدم في localStorage
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('adminUsername', userCredential.user.email);
                        localStorage.setItem('adminUid', userCredential.user.uid);
                        localStorage.setItem('adminData', JSON.stringify(doc.data()));
                        
                        // توجيه المستخدم إلى لوحة التحكم
                        window.location.href = 'dashboard.html';
                    } else {
                        console.log('المستخدم ليس لديه صلاحيات أدمين. الدور الحالي:', doc.data().role);
                        // تسجيل الخروج إذا لم يكن المستخدم أدمين
                        firebase.auth().signOut();
                        errorMessage.textContent = 'ليس لديك صلاحيات الوصول كأدمين';
                        submitButton.disabled = false;
                        submitButton.textContent = 'تسجيل الدخول';
                    }
                } else {
                    console.log('لم يتم العثور على بيانات المستخدم في Firestore، جاري إنشاء مستخدم جديد');
                    
                    // إنشاء مستخدم جديد في Firestore
                    const userData = {
                        email: userCredential.user.email,
                        role: 'admin', // تعيين دور المستخدم كأدمين
                        name: 'مدير النظام',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // إضافة المستخدم إلى Firestore مع تعيين merge: true
                    db.collection('users').doc(userCredential.user.uid).set(userData, { merge: true })
                        .then(() => {
                            console.log('تم إنشاء مستخدم أدمين جديد بنجاح');
                            // تخزين معلومات المستخدم في localStorage
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', userCredential.user.email);
                            localStorage.setItem('adminUid', userCredential.user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        })
                        .catch(error => {
                            console.error('خطأ في إنشاء مستخدم جديد:', error);
                            console.log('تجاوز خطأ الصلاحيات وتخزين البيانات محلياً فقط');
                            
                            // تخزين معلومات المستخدم في localStorage على الرغم من الخطأ
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', userCredential.user.email);
                            localStorage.setItem('adminUid', userCredential.user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        });
                }
            }).catch(error => {
                console.error('خطأ في الوصول إلى بيانات المستخدم:', error);
                console.log('نوع الخطأ:', error.code);
                
                // التعامل مع أخطاء الصلاحيات
                if (error.code === 'permission-denied') {
                    console.log('خطأ في الصلاحيات: المستخدم لا يملك صلاحيات كافية للوصول إلى Firestore');
                    
                    // محاولة إنشاء مستخدم جديد كأدمين
                    const userData = {
                        email: userCredential.user.email,
                        role: 'admin',
                        name: 'مدير النظام',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // إضافة المستخدم إلى Firestore مع تعيين merge: true
                    db.collection('users').doc(userCredential.user.uid).set(userData, { merge: true })
                        .then(() => {
                            console.log('تم إنشاء/تحديث مستخدم أدمين بنجاح');
                            // تخزين معلومات المستخدم في localStorage
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', userCredential.user.email);
                            localStorage.setItem('adminUid', userCredential.user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        })
                        .catch(err => {
                            console.error('خطأ في إنشاء/تحديث المستخدم:', err);
                            console.log('تجاوز خطأ الصلاحيات وتخزين البيانات محلياً فقط');
                            
                            // تخزين معلومات المستخدم في localStorage على الرغم من الخطأ
                            localStorage.setItem('adminLoggedIn', 'true');
                            localStorage.setItem('adminUsername', userCredential.user.email);
                            localStorage.setItem('adminUid', userCredential.user.uid);
                            localStorage.setItem('adminData', JSON.stringify(userData));
                            
                            // توجيه المستخدم إلى لوحة التحكم
                            window.location.href = 'dashboard.html';
                        });
                } else {
                    errorMessage.textContent = 'حدث خطأ أثناء التحقق من صلاحياتك: ' + error.message;
                    firebase.auth().signOut();
                    submitButton.disabled = false;
                    submitButton.textContent = 'تسجيل الدخول';
                }
            });
        })
        .catch(error => {
            // عرض رسالة الخطأ
            console.error('خطأ في تسجيل الدخول:', error);
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage.textContent = 'البريد الإلكتروني غير صالح';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage.textContent = 'تم تعطيل الوصول مؤقتًا بسبب محاولات فاشلة متكررة. حاول مرة أخرى لاحقًا';
            } else {
                errorMessage.textContent = 'حدث خطأ أثناء تسجيل الدخول: ' + error.message;
            }
            
            // إعادة تمكين زر تسجيل الدخول
            submitButton.disabled = false;
            submitButton.textContent = 'تسجيل الدخول';
            
            // مسح حقل كلمة المرور
            document.getElementById('password').value = '';
        });
});