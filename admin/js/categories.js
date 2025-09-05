// تهيئة صفحة الأقسام
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // تحميل البيانات من الخادم
        await loadCategories();
        
        // تهيئة نموذج إضافة قسم
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', async function(e) {
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
                
                try {
                    // إضافة القسم إلى الخادم
                    const addedCategory = await addCategory(newCategory);
                    
                    if (addedCategory) {
                        // إضافة القسم إلى الجدول
                        addCategoryToTable(addedCategory);
                        
                        // إعادة تعيين النموذج
                        addCategoryForm.reset();
                        
                        // عرض رسالة نجاح
                        alert('تم إضافة القسم بنجاح');
                    } else {
                        alert('حدث خطأ أثناء إضافة القسم');
                    }
                } catch (error) {
                    console.error('خطأ في إضافة القسم:', error);
                    alert('حدث خطأ أثناء إضافة القسم');
                }
            });
        }
        
        // عرض جميع الأقسام في الجدول
        loadCategoriesTable();
    } catch (error) {
        console.error('خطأ في تهيئة صفحة الأقسام:', error);
        alert('حدث خطأ أثناء تحميل البيانات');
    }
});

// دالة لتحميل الأقسام من الخادم
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories');
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        const data = await response.json();
        categories = data;
        return categories;
    } catch (error) {
        console.error('خطأ في تحميل الأقسام:', error);
        throw error;
    }
}

// دالة لإضافة قسم جديد إلى الخادم
async function addCategory(category) {
    try {
        const response = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        
        const addedCategory = await response.json();
        categories.push(addedCategory);
        return addedCategory;
    } catch (error) {
        console.error('خطأ في إضافة القسم:', error);
        throw error;
    }
}

// دالة لتحديث قسم على الخادم
async function updateCategory(categoryId, updatedData) {
    try {
        const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        
        const updatedCategory = await response.json();
        
        // تحديث القسم في المصفوفة المحلية
        const index = categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            categories[index] = updatedCategory;
        }
        
        return updatedCategory;
    } catch (error) {
        console.error('خطأ في تحديث القسم:', error);
        throw error;
    }
}

// دالة لحذف قسم من الخادم
async function removeCategory(categoryId) {
    try {
        const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        
        // حذف القسم من المصفوفة المحلية
        const index = categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            categories.splice(index, 1);
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في حذف القسم:', error);
        throw error;
    }
}

// دالة لتحميل جدول الأقسام
async function loadCategoriesTable() {
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
    // تفريغ الجدول
    categoriesTable.innerHTML = '';
    
    try {
        // تحميل الأقسام من الخادم
        await loadCategories();
        
        if (categories.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="text-center">لا توجد أقسام</td>`;
            categoriesTable.appendChild(row);
            return;
        }
        
        // إضافة الأقسام إلى الجدول
        categories.forEach(category => {
            addCategoryToTable(category);
        });
    } catch (error) {
        console.error('خطأ في تحميل جدول الأقسام:', error);
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">حدث خطأ أثناء تحميل البيانات</td>`;
        categoriesTable.appendChild(row);
    }
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
async function editCategory(categoryId) {
    try {
        // البحث عن القسم
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) {
            alert('القسم غير موجود');
            return;
        }
        
        // طلب البيانات الجديدة من المستخدم
        const newName = prompt('اسم القسم الجديد:', category.name);
        if (newName === null) return;
        
        // تحديث بيانات القسم على الخادم
        const updatedCategory = await updateCategory(categoryId, { name: newName });
        
        if (updatedCategory) {
            // إعادة تحميل الجدول
            loadCategoriesTable();
            
            // عرض رسالة نجاح
            alert('تم تحديث بيانات القسم بنجاح');
        } else {
            alert('حدث خطأ أثناء تحديث بيانات القسم');
        }
    } catch (error) {
        console.error('خطأ في تحرير القسم:', error);
        alert('حدث خطأ أثناء تحديث بيانات القسم');
    }
}

// دالة لحذف القسم
function deleteCategory(categoryId) {
    // التحقق من وجود مستخدمين في القسم
    const usersInCategory = profiles.filter(user => user.category === categoryId).length;
    
    if (usersInCategory > 0) {
        alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${usersInCategory} مستخدم`);
        return;
    }
    
    showConfirmDialog('هل أنت متأكد من حذف هذا القسم؟', async function() {
        try {
            // حذف القسم من الخادم
            const success = await removeCategory(categoryId);
            
            if (success) {
                // إعادة تحميل الجدول
                loadCategoriesTable();
                
                // عرض رسالة نجاح
                alert('تم حذف القسم بنجاح');
            } else {
                alert('حدث خطأ أثناء حذف القسم');
            }
        } catch (error) {
            console.error('خطأ في حذف القسم:', error);
            alert('حدث خطأ أثناء حذف القسم');
        }
    });
}