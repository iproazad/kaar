// تهيئة صفحة المستخدمين
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قائمة الأقسام في النموذج
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        // إضافة الأقسام إلى القائمة المنسدلة
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
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
                // تحويل رابط ibb.co إلى رابط مباشر للصورة
                // مثال: https://ibb.co/rRn9wqwK -> https://i.ibb.co/[code]/image.jpg
                const ibbCode = imageUrl.split('/').pop();
                if (ibbCode) {
                    // استخدام رابط الصورة المصغرة من ibb.co
                    directImageUrl = `https://i.ibb.co/${ibbCode}/image.jpg`;
                }
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
            
            // في التطبيق الحقيقي، سيتم إرسال البيانات إلى الخادم
            // هنا نقوم بمحاكاة إضافة المستخدم
            
            // إنشاء كائن المستخدم الجديد
            const newUser = {
                id: profiles.length + 1,
                name: formData.name,
                job: formData.job,
                category: formData.category,
                contact: formData.contact || '',
                image: formData.imageUrl || '../images/placeholder.svg' // استخدام رابط الصورة المدخل أو الصورة الافتراضية
            };
            
            // إضافة المستخدم إلى المصفوفة
            profiles.push(newUser);
            
            // حفظ البيانات في localStorage
            localStorage.setItem('profiles', JSON.stringify(profiles));
            
            // إضافة المستخدم إلى الجدول
            addUserToTable(newUser);
            
            // إعادة تعيين النموذج
            addUserForm.reset();
            imagePreview.innerHTML = '';
            
            // عرض رسالة نجاح
            alert('تم إضافة المستخدم بنجاح');
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
    
    // عرض جميع المستخدمين في الجدول
    loadUsersTable();
});

// دالة لتحميل جدول المستخدمين
function loadUsersTable() {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    // تفريغ الجدول
    usersTable.innerHTML = '';
    
    // إضافة المستخدمين إلى الجدول
    profiles.forEach(user => {
        addUserToTable(user);
    });
}

// دالة لإضافة مستخدم إلى الجدول
function addUserToTable(user) {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    const categoryName = getCategoryName(user.category);
    
    // تحديد مصدر الصورة - إذا كان رابط خارجي أو محلي
    let imgSrc = user.image;
    
    // معالجة روابط ibb.co
    if (imgSrc && imgSrc.includes('ibb.co/')) {
        const ibbCode = imgSrc.split('/').pop();
        if (ibbCode) {
            imgSrc = `https://i.ibb.co/${ibbCode}/image.jpg`;
        }
    } else if (imgSrc.startsWith('http')) {
        // استخدام الرابط الخارجي كما هو
    } else {
        // إضافة المسار النسبي للصور المحلية
        imgSrc = `../${imgSrc}`;
    }
    
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
    
    // تصفية المستخدمين حسب البحث
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
    // في التطبيق الحقيقي، سيتم توجيه المستخدم إلى صفحة تحرير المستخدم
    // هنا نقوم بمحاكاة تحرير المستخدم باستخدام مربع حوار بسيط
    
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
    
    // تحديث localStorage
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    // إعادة تحميل الجدول
    loadUsersTable();
    
    // عرض رسالة نجاح
    alert('تم تحديث بيانات المستخدم بنجاح');
}

// دالة لحذف المستخدم
function deleteUser(userId) {
    showConfirmDialog('هل أنت متأكد من حذف هذا المستخدم؟', function() {
        // البحث عن موقع المستخدم في المصفوفة
        const userIndex = profiles.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            alert('المستخدم غير موجود');
            return;
        }
        
        // حذف المستخدم من المصفوفة
        profiles.splice(userIndex, 1);
        
        // تحديث localStorage
        localStorage.setItem('profiles', JSON.stringify(profiles));
        
        // إعادة تحميل الجدول
        loadUsersTable();
        
        // عرض رسالة نجاح
        alert('تم حذف المستخدم بنجاح');
    });
}