// تهيئة صفحة المستخدمين
document.addEventListener('DOMContentLoaded', function() {
    // تأكد من تهيئة المتغيرات العالمية
    let categoriesLoaded = false;
    let profilesLoaded = false;
    
    // التحقق من وجود المتغيرات العالمية
    if (typeof categories !== 'undefined' && categories.length > 0) {
        categoriesLoaded = true;
    } else {
        // محاولة تحميل الأقسام من localStorage
        try {
            const storedCategories = localStorage.getItem('categories');
            if (storedCategories) {
                window.categories = JSON.parse(storedCategories);
                categoriesLoaded = true;
            }
        } catch (e) {
            console.error('خطأ في تحميل الأقسام:', e);
        }
    }
    
    // تحميل المستخدمين من Firebase مباشرة
    window.profiles = [];
    profilesLoaded = true;
    
    // سيتم تحميل البيانات من Firebase في وظيفة loadUsersTable
    
    // إذا لم يتم تحميل البيانات، قم بتهيئة مصفوفات فارغة
    if (!categoriesLoaded) {
        window.categories = [];
    }
    
    if (!profilesLoaded) {
        window.profiles = [];
    }
    
    // التحقق من حالة تسجيل الدخول
    const currentUser = firebase.auth().currentUser;
    console.log('حالة المستخدم الحالي:', currentUser);
    
    // إضافة مستمع لحالة المصادقة
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('المستخدم مسجل الدخول:', user.email);
            // تحديث اسم المستخدم في الواجهة
            const adminUsernameElement = document.getElementById('adminUsername');
            if (adminUsernameElement) {
                adminUsernameElement.textContent = user.email || 'مدير النظام';
            }
            
            // التحقق من صلاحيات المستخدم
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    console.log('المستخدم لديه صلاحيات أدمين');
                    // تهيئة الصفحة بعد التأكد من الصلاحيات
                    initializePage();
                } else {
                    console.warn('المستخدم ليس لديه صلاحيات أدمين');
                    alert('ليس لديك صلاحيات كافية للوصول إلى هذه الصفحة');
                    window.location.href = 'login.html';
                }
            }).catch(error => {
                console.error('خطأ في التحقق من صلاحيات المستخدم:', error);
                // في حالة حدوث خطأ، نتحقق من نوع الخطأ
                if (error.code === 'permission-denied') {
                    console.error('خطأ في الصلاحيات:', error.message);
                    // نفترض أن المستخدم مسجل الدخول ونستمر في تهيئة الصفحة
                    console.log('الاستمرار في تهيئة الصفحة رغم خطأ الصلاحيات...');
                    initializePage();
                } else {
                    // في حالة أخطاء أخرى، نفترض أن المستخدم مسجل الدخول ونستمر في تهيئة الصفحة
                    console.log('الاستمرار في تهيئة الصفحة رغم الخطأ...');
                    initializePage();
                }
            });
        } else {
            console.warn('المستخدم غير مسجل الدخول');
            window.location.href = 'login.html';
        }
    });
    
    // دالة تهيئة الصفحة
    function initializePage() {
        console.log('جاري تهيئة الصفحة...');
        
        // تهيئة قائمة الأقسام في النموذج
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            // تفريغ القائمة أولاً
            categorySelect.innerHTML = '';
            
            // إضافة الأقسام إلى القائمة المنسدلة
            if (categories && categories.length > 0) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
                console.log('تم تهيئة قائمة الأقسام بنجاح');
            } else {
                console.warn('لا توجد أقسام متاحة');
                // إضافة خيار افتراضي
                const option = document.createElement('option');
                option.value = 'default';
                option.textContent = 'قسم افتراضي';
                categorySelect.appendChild(option);
            }
        }
        
        // تهيئة حقل رابط الصورة
        const imageUrlInput = document.getElementById('imageUrl');
        const imagePreview = document.getElementById('imagePreview');
    
        if (imageUrlInput) {
            // إنشاء معاينة للصورة عند إدخال الرابط
            imageUrlInput.addEventListener('input', function() {
                const imageUrl = imageUrlInput.value.trim();
                
                // تحويل رابط ibb.co إلى رابط مباشر للصورة إذا لزم الأمر
                let directImageUrl = imageUrl;
                
                // إذا كان الرابط من ibb.co، حاول استخراج الرابط المباشر
                if (imageUrl && imageUrl.includes('ibb.co/')) {
                    // استخدام الرابط كما هو، سيتم معالجته في وظيفة العرض
                }
                
                // عرض معاينة الصورة
                if (imageUrl) {
                    imagePreview.innerHTML = `<img src="${directImageUrl}" alt="معاينة الصورة" onerror="this.src='../images/placeholder.svg'; this.onerror=null;">`;
                } else {
                    imagePreview.innerHTML = '';
                }
            });
        }
        
        // تهيئة نموذج إضافة مستخدم
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // الحصول على بيانات النموذج
                const formData = getFormData(addUserForm);
                
                // التحقق من صحة البيانات
                const validationRules = {
                    name: { required: true, minLength: 3 },
                    job: { required: true },
                    category: { required: true }
                };
                
                const errors = validateForm(formData, validationRules);
                
                if (errors) {
                    // عرض رسائل الخطأ
                    displayFormErrors(errors, addUserForm);
                    return;
                }
            
                // إنشاء كائن المستخدم الجديد
                const userId = 'user_' + Date.now(); // إنشاء معرف فريد للمستخدم
                const newUser = {
                    id: userId,
                    name: formData.name,
                    job: formData.job,
                    category: formData.category,
                    contact: formData.contact || '',
                    image: formData.imageUrl || '../images/placeholder.svg', // استخدام رابط الصورة المدخل أو الصورة الافتراضية
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // حفظ البيانات في Firebase
                try {
                    console.log('جاري حفظ المستخدم في Firebase...');
                    console.log('بيانات المستخدم:', newUser);
                    
                    // التحقق من اتصال Firebase
                    if (!firebase.apps.length) {
                        throw new Error('لم يتم تهيئة Firebase بشكل صحيح');
                    }
                    
                    // التحقق من حالة المصادقة قبل محاولة الكتابة
                    const currentUser = firebase.auth().currentUser;
                    if (!currentUser) {
                        throw new Error('يجب تسجيل الدخول لإضافة مستخدمين');
                    }
                    
                    // إضافة معرف المستخدم المنشئ للتوثيق
                    newUser.createdBy = currentUser.uid;
                    console.log('معرف المستخدم المنشئ:', currentUser.uid);
                    
                    db.collection('profiles').doc(userId).set(newUser, { merge: true })
                        .then(() => {
                            console.log('تم حفظ المستخدم في Firebase بنجاح');
                            
                            // إضافة المستخدم إلى الجدول مباشرة من Firebase
                            addUserToTable(newUser);
                            
                            // إعادة تعيين النموذج
                            addUserForm.reset();
                            imagePreview.innerHTML = '';
                            
                            // عرض رسالة نجاح
                            alert('تم إضافة المستخدم بنجاح');
                        })
                        .catch(error => {
                            console.error('خطأ في حفظ المستخدم في Firebase:', error);
                            console.error('رمز الخطأ:', error.code);
                            console.error('رسالة الخطأ:', error.message);
                            
                            // تحليل نوع الخطأ
                            let errorMessage = 'حدث خطأ أثناء حفظ المستخدم. ';
                            
                            if (error.code === 'permission-denied') {
                                errorMessage += 'ليس لديك صلاحيات كافية لإضافة مستخدمين. يرجى التحقق من حساب الأدمين الخاص بك.';
                            } else if (error.code === 'unauthenticated') {
                                errorMessage += 'انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.';
                                // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد فترة قصيرة
                                setTimeout(() => {
                                    window.location.href = 'login.html';
                                }, 2000);
                            } else {
                                errorMessage += 'يرجى المحاولة مرة أخرى. (الخطأ: ' + error.message + ')';
                            }
                            
                            // عرض رسالة خطأ مناسبة بدون حفظ محلي
                            addUserForm.reset();
                            imagePreview.innerHTML = '';
                            
                            if (error.code === 'permission-denied') {
                                alert('فشل حفظ المستخدم: ليس لديك صلاحيات كافية للكتابة في قاعدة البيانات. يرجى التحقق من حساب الأدمين الخاص بك.');
                            } else {
                                alert('فشل حفظ المستخدم: ' + errorMessage);
                            }
                        });
                } catch (error) {
                    console.error('خطأ غير متوقع:', error);
                    
                    // تحليل نوع الخطأ
                    let errorMessage = 'حدث خطأ أثناء حفظ المستخدم. ';
                    
                    // إعادة تعيين النموذج بدون حفظ محلي
                    addUserForm.reset();
                    imagePreview.innerHTML = '';
                    
                    if (error.message.includes('تسجيل الدخول') || error.message.includes('المصادقة')) {
                        errorMessage += 'يرجى التأكد من تسجيل الدخول كمدير.';
                        alert(errorMessage);
                        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد فترة قصيرة
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 3000);
                    } else if (error.message.includes('Firebase')) {
                        errorMessage += 'يوجد مشكلة في الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت.';
                        alert(errorMessage);
                    } else {
                        errorMessage += 'يرجى المحاولة مرة أخرى. (الخطأ: ' + error.message + ')';
                        alert(errorMessage);
                    }
                    
                    // تم إزالة رسالة الخطأ الأصلية واستبدالها برسائل أكثر فائدة
                 }
        });
    }
    
    // تهيئة حقل البحث
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            filterUsers(query);
        });
    }
    
    // تهيئة زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('تسجيل الخروج...');
            
            firebase.auth().signOut().then(() => {
                console.log('تم تسجيل الخروج بنجاح');
                // مسح بيانات المستخدم من التخزين المحلي
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminUsername');
                localStorage.removeItem('adminUid');
                localStorage.removeItem('adminData');
                
                // توجيه المستخدم إلى صفحة تسجيل الدخول
                window.location.href = 'login.html';
            }).catch(error => {
                console.error('خطأ في تسجيل الخروج:', error);
                alert('حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.');
            });
        });
    }
    
    // عرض جميع المستخدمين في الجدول
    loadUsersTable();
}
});

// دالة لتحميل جدول المستخدمين
function loadUsersTable() {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    // تفريغ الجدول
    usersTable.innerHTML = '';
    
    // تحميل المستخدمين من Firebase مباشرة
    db.collection('profiles').get()
        .then(snapshot => {
            // تفريغ المصفوفة المحلية
            window.profiles = [];
            
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    // إضافة المستخدم إلى المصفوفة المحلية مؤقتًا للعرض فقط
                    window.profiles.push(userData);
                    // إضافة المستخدم إلى الجدول
                    addUserToTable(userData);
                });
                console.log('تم تحميل المستخدمين من Firebase بنجاح');
            } else {
                console.log('لا يوجد مستخدمين في Firebase');
            }
        })
        .catch(error => {
            console.error('خطأ في تحميل المستخدمين من Firebase:', error);
            alert('حدث خطأ أثناء تحميل المستخدمين من قاعدة البيانات');
        });
}

// دالة لإضافة مستخدم إلى الجدول
function addUserToTable(user) {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    const categoryName = getCategoryName(user.category);
    
    // تحديد مصدر الصورة - إذا كان رابط خارجي أو محلي
    const imgSrc = user.image.startsWith('http') ? user.image : `../${user.image}`;
    
    const row = createTableRow({
        image: `<img src="${imgSrc}" alt="${user.name}" class="profile-img" onerror="this.src='../images/placeholder.svg'; this.onerror=null;">`,
        name: user.name,
        job: user.job,
        category: categoryName,
        actions: `
            <button class="edit-btn" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
        `
    });
    
    usersTable.appendChild(row);
}

// دالة لتصفية المستخدمين حسب البحث
function filterUsers(query) {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    // تفريغ الجدول
    usersTable.innerHTML = '';
    
    // إذا كان البحث فارغًا، عرض جميع المستخدمين
    if (query === '') {
        loadUsersTable();
        return;
    }
    
    // تصفية المستخدمين من المصفوفة المؤقتة (تم تحميلها من Firebase في loadUsersTable)
    const filteredUsers = profiles.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.job.toLowerCase().includes(query) ||
        getCategoryName(user.category).toLowerCase().includes(query)
    );
    
    // إضافة المستخدمين المصفاة إلى الجدول
    filteredUsers.forEach(user => {
        addUserToTable(user);
    });
}

// دالة للحصول على اسم القسم من معرفه
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
}

// جمع بيانات النموذج
function getFormData(form) {
    return {
        name: form.elements['name'].value,
        job: form.elements['job'].value,
        category: form.elements['category'].value,
        contact: form.elements['contact'].value,
        imageUrl: form.elements['imageUrl'].value
    };
}

// دالة لتحرير بيانات المستخدم
function editUser(userId) {
    // البحث عن المستخدم
    const user = profiles.find(u => u.id === userId);
    if (!user) {
        alert('المستخدم غير موجود');
        return;
    }
    
    // طلب البيانات الجديدة من المستخدم
    const newName = prompt('الاسم الجديد:', user.name);
    if (newName === null) return;
    
    const newJob = prompt('العمل الجديد:', user.job);
    if (newJob === null) return;
    
    const newImageUrl = prompt('رابط الصورة الجديد:', user.image);
    if (newImageUrl === null) return;
    
    // تحديث بيانات المستخدم
    user.name = newName;
    user.job = newJob;
    user.image = newImageUrl || '../images/placeholder.svg';
    user.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    // تحديث البيانات في Firebase
    db.collection('profiles').doc(userId).update({
        name: newName,
        job: newJob,
        image: newImageUrl || '../images/placeholder.svg',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('تم تحديث المستخدم في Firebase بنجاح');
        
        // إعادة تحميل الجدول من Firebase
        loadUsersTable();
        
        // عرض رسالة نجاح
        alert('تم تحديث بيانات المستخدم بنجاح');
    })
    .catch(error => {
        console.error('خطأ في تحديث المستخدم:', error);
        alert('حدث خطأ أثناء تحديث المستخدم. يرجى المحاولة مرة أخرى.');
    });
}

// دالة لحذف المستخدم
function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        return;
    }
    
    // حذف المستخدم من Firebase
    db.collection('profiles').doc(userId).delete()
    .then(() => {
        console.log('تم حذف المستخدم من Firebase بنجاح');
        
        // إعادة تحميل الجدول من Firebase
        loadUsersTable();
        
        // عرض رسالة نجاح
        alert('تم حذف المستخدم بنجاح');
    })
    .catch(error => {
        console.error('خطأ في حذف المستخدم:', error);
        alert('حدث خطأ أثناء حذف المستخدم. يرجى المحاولة مرة أخرى.');
    });
}