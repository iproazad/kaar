// تهيئة صفحة الأقسام
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نموذج إضافة قسم
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // الحصول على بيانات النموذج
            const formData = getFormData(addCategoryForm);
            
            // التحقق من صحة البيانات
            const validationRules = {
                categoryName: { required: true },
                categoryId: { 
                    required: true, 
                    pattern: /^[a-z0-9_-]+$/, 
                    message: 'المعرف يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط' 
                }
            };
            
            const errors = validateForm(formData, validationRules);
            
            if (errors) {
                // عرض رسائل الخطأ
                displayFormErrors(errors, addCategoryForm);
                return;
            }
            
            // التحقق من عدم وجود قسم بنفس المعرف
            const existingCategory = categories.find(cat => cat.id === formData.categoryId);
            if (existingCategory) {
                const errors = { categoryId: 'هذا المعرف مستخدم بالفعل' };
                displayFormErrors(errors, addCategoryForm);
                return;
            }
            
            // إنشاء كائن القسم الجديد
            const newCategory = {
                id: formData.categoryId,
                name: formData.categoryName
            };
            
            // إضافة القسم إلى المصفوفة
            categories.push(newCategory);
            
            // حفظ البيانات في localStorage
            localStorage.setItem('categories', JSON.stringify(categories));
            
            // إضافة القسم إلى الجدول
            addCategoryToTable(newCategory);
            
            // إعادة تعيين النموذج
            addCategoryForm.reset();
            
            // عرض رسالة نجاح
            alert('تم إضافة القسم بنجاح');
        });
    }
    
    // عرض جميع الأقسام في الجدول
    loadCategoriesTable();
});

// دالة لتحميل جدول الأقسام
function loadCategoriesTable() {
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
    // تفريغ الجدول
    categoriesTable.innerHTML = '';
    
    // إضافة الأقسام إلى الجدول
    categories.forEach(category => {
        addCategoryToTable(category);
    });
}

// دالة لإضافة قسم إلى الجدول
function addCategoryToTable(category) {
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
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
}

// دالة لتحرير بيانات القسم
function editCategory(categoryId) {
    // البحث عن القسم
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
        alert('القسم غير موجود');
        return;
    }
    
    // طلب البيانات الجديدة من المستخدم
    const newName = prompt('اسم القسم الجديد:', category.name);
    if (newName === null) return;
    
    // تحديث بيانات القسم
    category.name = newName;
    
    // تحديث localStorage
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // إعادة تحميل الجدول
    loadCategoriesTable();
    
    // عرض رسالة نجاح
    alert('تم تحديث بيانات القسم بنجاح');
}

// دالة لحذف القسم
function deleteCategory(categoryId) {
    // التحقق من وجود مستخدمين في القسم
    const usersInCategory = profiles.filter(user => user.category === categoryId).length;
    
    if (usersInCategory > 0) {
        alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${usersInCategory} مستخدم`);
        return;
    }
    
    showConfirmDialog('هل أنت متأكد من حذف هذا القسم؟', function() {
        // البحث عن موقع القسم في المصفوفة
        const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) {
            alert('القسم غير موجود');
            return;
        }
        
        // حذف القسم من المصفوفة
        categories.splice(categoryIndex, 1);
        
        // تحديث localStorage
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // إعادة تحميل الجدول
        loadCategoriesTable();
        
        // عرض رسالة نجاح
        alert('تم حذف القسم بنجاح');
    });
}