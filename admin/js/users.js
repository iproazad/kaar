// تهيئة صفحة المستخدمين
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // تحميل البيانات من الخادم
        await Promise.all([
            loadCategories(),
            loadProfiles()
        ]);
        
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
    } catch (error) {
        console.error('خطأ في تهيئة صفحة المستخدمين:', error);
        alert('حدث خطأ أثناء تحميل البيانات');
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
        addUserForm.addEventListener('submit', async function(e) {
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
            
            try {
                // إنشاء كائن المستخدم الجديد
                const newUser = {
                    name: formData.name,
                    job: formData.job,
                    category: formData.category,
                    contact: formData.contact || '',
                    image: formData.imageUrl || '../images/placeholder.svg' // استخدام رابط الصورة المدخل أو الصورة الافتراضية
                };
                
                // إضافة المستخدم إلى الخادم
                const addedUser = await addProfile(newUser);
                
                if (addedUser) {
                    // إضافة المستخدم إلى الجدول
                    addUserToTable(addedUser);
                    
                    // إعادة تعيين النموذج
                    addUserForm.reset();
                    imagePreview.innerHTML = '';
                    
                    // عرض رسالة نجاح
                    alert('تم إضافة المستخدم بنجاح');
                } else {
                    alert('حدث خطأ أثناء إضافة المستخدم');
                }
            } catch (error) {
                console.error('خطأ في إضافة المستخدم:', error);
                alert('حدث خطأ أثناء إضافة المستخدم');
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
    
    // عرض جميع المستخدمين في الجدول
    loadUsersTable();
});

// دالة لتحميل الملفات الشخصية من الخادم
async function loadProfiles() {
    try {
        const response = await fetch('http://localhost:3000/api/profiles');
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        const data = await response.json();
        profiles = data;
        return profiles;
    } catch (error) {
        console.error('خطأ في تحميل الملفات الشخصية:', error);
        throw error;
    }
}

// دالة لإضافة ملف شخصي جديد إلى الخادم
async function addProfile(profile) {
    try {
        const response = await fetch('http://localhost:3000/api/profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        
        const addedProfile = await response.json();
        profiles.push(addedProfile);
        return addedProfile;
    } catch (error) {
        console.error('خطأ في إضافة الملف الشخصي:', error);
        throw error;
    }
}

// دالة لتحديث ملف شخصي على الخادم
async function updateProfile(profileId, updatedData) {
    try {
        const response = await fetch(`http://localhost:3000/api/profiles/${profileId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        
        const updatedProfile = await response.json();
        
        // تحديث الملف الشخصي في المصفوفة المحلية
        const index = profiles.findIndex(profile => profile.id === profileId);
        if (index !== -1) {
            profiles[index] = updatedProfile;
        }
        
        return updatedProfile;
    } catch (error) {
        console.error('خطأ في تحديث الملف الشخصي:', error);
        throw error;
    }
}

// دالة لحذف ملف شخصي من الخادم
async function removeProfile(profileId) {
    try {
        const response = await fetch(`http://localhost:3000/api/profiles/${profileId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status}`);
        }
        
        // حذف الملف الشخصي من المصفوفة المحلية
        const index = profiles.findIndex(profile => profile.id === profileId);
        if (index !== -1) {
            profiles.splice(index, 1);
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في حذف الملف الشخصي:', error);
        throw error;
    }
}

// دالة لتحميل جدول المستخدمين
async function loadUsersTable() {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    try {
        // تحميل الملفات الشخصية من الخادم
        await loadProfiles();
        
        // تفريغ الجدول
        usersTable.innerHTML = '';
        
        if (profiles.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">لا يوجد مستخدمين</td>`;
            usersTable.appendChild(row);
            return;
        }
        
        // إضافة المستخدمين إلى الجدول
        profiles.forEach(user => {
            addUserToTable(user);
        });
    } catch (error) {
        console.error('خطأ في تحميل جدول المستخدمين:', error);
        usersTable.innerHTML = `<tr><td colspan="5" class="text-center">حدث خطأ أثناء تحميل البيانات</td></tr>`;
    }
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
async function editUser(userId) {
    try {
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
        
        // تحديث بيانات المستخدم على الخادم
        const updatedUser = await updateProfile(userId, {
            name: newName,
            job: newJob,
            image: newImageUrl || '../images/placeholder.svg'
        });
        
        if (updatedUser) {
            // إعادة تحميل الجدول
            loadUsersTable();
            
            // عرض رسالة نجاح
            alert('تم تحديث بيانات المستخدم بنجاح');
        } else {
            alert('حدث خطأ أثناء تحديث بيانات المستخدم');
        }
    } catch (error) {
        console.error('خطأ في تحرير المستخدم:', error);
        alert('حدث خطأ أثناء تحديث بيانات المستخدم');
    }
}

// دالة لحذف المستخدم
function deleteUser(userId) {
    showConfirmDialog('هل أنت متأكد من حذف هذا المستخدم؟', async function() {
        try {
            // حذف المستخدم من الخادم
            const success = await removeProfile(userId);
            
            if (success) {
                // إعادة تحميل الجدول
                loadUsersTable();
                
                // عرض رسالة نجاح
                alert('تم حذف المستخدم بنجاح');
            } else {
                alert('حدث خطأ أثناء حذف المستخدم');
            }
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            alert('حدث خطأ أثناء حذف المستخدم');
        }
    });
}