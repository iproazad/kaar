// تحديث البيانات الإحصائية في لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    // تحديث إجمالي المستخدمين
    const totalUsersElement = document.getElementById('totalUsers');
    if (totalUsersElement) {
        totalUsersElement.textContent = profiles.length;
    }
    
    // تحديث إجمالي الأقسام
    const totalCategoriesElement = document.getElementById('totalCategories');
    if (totalCategoriesElement) {
        totalCategoriesElement.textContent = categories.length;
    }
    
    // عرض آخر المستخدمين المضافين
    const recentUsersTable = document.getElementById('recentUsersTable');
    if (recentUsersTable) {
        // الحصول على آخر 5 مستخدمين
        const recentUsers = profiles.slice(-5).reverse();
        
        // إضافة المستخدمين إلى الجدول
        recentUsers.forEach(user => {
            const categoryName = getCategoryName(user.category);
            
            const row = createTableRow({
                image: `<img src="../${user.image}" alt="${user.name}" class="profile-img">`,
                name: user.name,
                job: user.job,
                category: categoryName,
                actions: `
                    <button class="edit-btn" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                `
            });
            
            recentUsersTable.appendChild(row);
        });
    }
    
    // عرض الأقسام
    const categoriesTable = document.getElementById('categoriesTable');
    if (categoriesTable) {
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
});

// دالة للحصول على اسم القسم من معرفه
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
}

// دالة لتحرير بيانات المستخدم
function editUser(userId) {
    // توجيه المستخدم إلى صفحة تحرير المستخدم مع تمرير معرف المستخدم
    window.location.href = `edit-user.html?id=${userId}`;
}

// دالة لحذف المستخدم
function deleteUser(userId) {
    showConfirmDialog('هل أنت متأكد من حذف هذا المستخدم؟', function() {
        // في التطبيق الحقيقي، سيتم إرسال طلب للخادم لحذف المستخدم
        alert('تم حذف المستخدم بنجاح');
        // إعادة تحميل الصفحة لتحديث البيانات
        window.location.reload();
    });
}

// دالة لتحرير بيانات القسم
function editCategory(categoryId) {
    // توجيه المستخدم إلى صفحة تحرير القسم مع تمرير معرف القسم
    window.location.href = `edit-category.html?id=${categoryId}`;
}

// دالة لحذف القسم
function deleteCategory(categoryId) {
    showConfirmDialog('هل أنت متأكد من حذف هذا القسم؟', function() {
        // في التطبيق الحقيقي، سيتم إرسال طلب للخادم لحذف القسم
        alert('تم حذف القسم بنجاح');
        // إعادة تحميل الصفحة لتحديث البيانات
        window.location.reload();
    });
}