// تحديث البيانات الإحصائية في لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة المصفوفات
    window.profiles = [];
    window.categories = [];
    
    // تحميل البيانات من Firebase
    loadDashboardData();
});

// دالة لتحميل بيانات لوحة التحكم من Firebase
function loadDashboardData() {
    // تحميل الأقسام من Firebase
    db.collection('categories').get()
        .then(snapshot => {
            window.categories = [];
            
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const categoryData = doc.data();
                    categoryData.id = doc.id;
                    window.categories.push(categoryData);
                });
                console.log('تم تحميل الأقسام من Firebase بنجاح');
            } else {
                console.log('لا توجد أقسام في Firebase');
            }
            
            // تحديث إجمالي الأقسام
            const totalCategoriesElement = document.getElementById('totalCategories');
            if (totalCategoriesElement) {
                totalCategoriesElement.textContent = categories.length;
            }
            
            // عرض الأقسام في الجدول
            loadCategoriesTable();
            
            // تحميل المستخدمين بعد تحميل الأقسام
            return db.collection('profiles').get();
        })
        .then(snapshot => {
            window.profiles = [];
            
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    userData.id = doc.id;
                    window.profiles.push(userData);
                });
                console.log('تم تحميل المستخدمين من Firebase بنجاح');
            } else {
                console.log('لا يوجد مستخدمين في Firebase');
            }
            
            // تحديث إجمالي المستخدمين
            const totalUsersElement = document.getElementById('totalUsers');
            if (totalUsersElement) {
                totalUsersElement.textContent = profiles.length;
            }
            
            // عرض آخر المستخدمين المضافين
            loadRecentUsersTable();
        })
        .catch(error => {
            console.error('خطأ في تحميل البيانات من Firebase:', error);
            alert('حدث خطأ أثناء تحميل البيانات من قاعدة البيانات');
        });
}

// دالة لعرض آخر المستخدمين المضافين
function loadRecentUsersTable() {
    const recentUsersTable = document.getElementById('recentUsersTable');
    if (!recentUsersTable) return;
    
    // تفريغ الجدول
    recentUsersTable.innerHTML = '';
    
    // الحصول على آخر 5 مستخدمين
    const recentUsers = profiles.slice(-5).reverse();
    
    // إضافة المستخدمين إلى الجدول
    recentUsers.forEach(user => {
        const categoryName = getCategoryName(user.category);
        
        // تحديد مصدر الصورة - إذا كان رابط خارجي أو محلي
        const imgSrc = user.image.startsWith('http') ? user.image : `../${user.image}`;
        
        const row = createTableRow({
            image: `<img src="${imgSrc}" alt="${user.name}" class="profile-img" onerror="this.src='../images/placeholder.svg'; this.onerror=null;">`,
            name: user.name,
            job: user.job,
            category: categoryName,
            actions: `
                <button class="edit-btn" onclick="editUser('${user.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
            `
        });
        
        recentUsersTable.appendChild(row);
    });
}

// دالة لعرض الأقسام
function loadCategoriesTable() {
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
    // تفريغ الجدول
    categoriesTable.innerHTML = '';
    
    // إضافة الأقسام إلى الجدول
    categories.forEach(category => {
        // حساب عدد المستخدمين في القسم
        const usersCount = profiles.filter(user => user.category === category.id).length;
        
        const row = createTableRow({
            name: category.name,
            id: category.id,
            count: usersCount,
            actions: `
                <button class="edit-btn" onclick="editCategory('${category.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteCategory('${category.id}')"><i class="fas fa-trash"></i></button>
            `
        });
        
        categoriesTable.appendChild(row);
    });
}

// دالة للحصول على اسم القسم من معرفه
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
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
    
    // تحديث البيانات في Firebase
    db.collection('profiles').doc(userId).update({
        name: newName,
        job: newJob,
        image: newImageUrl || '../images/placeholder.svg',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('تم تحديث المستخدم في Firebase بنجاح');
        
        // إعادة تحميل البيانات من Firebase
        loadDashboardData();
        
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
        
        // إعادة تحميل البيانات من Firebase
        loadDashboardData();
        
        // عرض رسالة نجاح
        alert('تم حذف المستخدم بنجاح');
    })
    .catch(error => {
        console.error('خطأ في حذف المستخدم:', error);
        alert('حدث خطأ أثناء حذف المستخدم. يرجى المحاولة مرة أخرى.');
    });
}

// دالة لتحرير بيانات القسم
function editCategory(categoryId) {
    // البحث عن القسم
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        alert('القسم غير موجود');
        return;
    }
    
    // طلب البيانات الجديدة من المستخدم
    const newName = prompt('اسم القسم الجديد:', category.name);
    if (newName === null) return;
    
    // تحديث البيانات في Firebase
    db.collection('categories').doc(categoryId).update({
        name: newName,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('تم تحديث القسم في Firebase بنجاح');
        
        // إعادة تحميل البيانات من Firebase
        loadDashboardData();
        
        // عرض رسالة نجاح
        alert('تم تحديث بيانات القسم بنجاح');
    })
    .catch(error => {
        console.error('خطأ في تحديث القسم:', error);
        alert('حدث خطأ أثناء تحديث القسم. يرجى المحاولة مرة أخرى.');
    });
}

// دالة لحذف القسم
function deleteCategory(categoryId) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) {
        return;
    }
    
    // التحقق من وجود مستخدمين في هذا القسم
    const usersInCategory = profiles.filter(user => user.category === categoryId).length;
    if (usersInCategory > 0) {
        alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${usersInCategory} مستخدم. قم بنقل المستخدمين إلى قسم آخر أولاً.`);
        return;
    }
    
    // حذف القسم من Firebase
    db.collection('categories').doc(categoryId).delete()
    .then(() => {
        console.log('تم حذف القسم من Firebase بنجاح');
        
        // إعادة تحميل البيانات من Firebase
        loadDashboardData();
        
        // عرض رسالة نجاح
        alert('تم حذف القسم بنجاح');
    })
    .catch(error => {
        console.error('خطأ في حذف القسم:', error);
        alert('حدث خطأ أثناء حذف القسم. يرجى المحاولة مرة أخرى.');
    });
}