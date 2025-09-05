// تهيئة المتغيرات العامة
let categories = [];
let profiles = [];

// دالة لتحميل الأقسام من الخادم
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error('فشل في تحميل الأقسام');
        }
        categories = await response.json();
        return categories;
    } catch (error) {
        console.error('خطأ في تحميل الأقسام:', error);
        return [];
    }
}

// دالة لتحميل الأشخاص من الخادم
async function loadProfiles() {
    try {
        const response = await fetch('/api/profiles');
        if (!response.ok) {
            throw new Error('فشل في تحميل الأشخاص');
        }
        profiles = await response.json();
        return profiles;
    } catch (error) {
        console.error('خطأ في تحميل الأشخاص:', error);
        return [];
    }
}

// دالة لإضافة شخص جديد
async function addProfile(profile) {
    try {
        const response = await fetch('/api/profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });
        
        if (!response.ok) {
            throw new Error('فشل في إضافة الشخص');
        }
        
        const newProfile = await response.json();
        profiles.push(newProfile);
        return newProfile;
    } catch (error) {
        console.error('خطأ في إضافة الشخص:', error);
        return null;
    }
}

// دالة لتحديث بيانات شخص
async function updateProfile(id, updatedData) {
    try {
        const response = await fetch(`/api/profiles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error('فشل في تحديث بيانات الشخص');
        }
        
        const updatedProfile = await response.json();
        const index = profiles.findIndex(p => p.id === id);
        if (index !== -1) {
            profiles[index] = updatedProfile;
        }
        return updatedProfile;
    } catch (error) {
        console.error('خطأ في تحديث بيانات الشخص:', error);
        return null;
    }
}

// دالة لحذف شخص
async function deleteProfile(id) {
    try {
        const response = await fetch(`/api/profiles/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('فشل في حذف الشخص');
        }
        
        const index = profiles.findIndex(p => p.id === id);
        if (index !== -1) {
            profiles.splice(index, 1);
        }
        return true;
    } catch (error) {
        console.error('خطأ في حذف الشخص:', error);
        return false;
    }
}

// دالة لإضافة قسم جديد
async function addCategory(category) {
    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        });
        
        if (!response.ok) {
            throw new Error('فشل في إضافة القسم');
        }
        
        const newCategory = await response.json();
        categories.push(newCategory);
        return newCategory;
    } catch (error) {
        console.error('خطأ في إضافة القسم:', error);
        return null;
    }
}

// دالة لتحديث بيانات قسم
async function updateCategory(id, updatedData) {
    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error('فشل في تحديث بيانات القسم');
        }
        
        const updatedCategory = await response.json();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = updatedCategory;
        }
        return updatedCategory;
    } catch (error) {
        console.error('خطأ في تحديث بيانات القسم:', error);
        return null;
    }
}

// دالة لحذف قسم
async function deleteCategory(id) {
    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('فشل في حذف القسم');
        }
        
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories.splice(index, 1);
        }
        return true;
    } catch (error) {
        console.error('خطأ في حذف القسم:', error);
        return false;
    }
}

// تحميل البيانات عند تهيئة الصفحة
async function initData() {
    await Promise.all([loadCategories(), loadProfiles()]);
    return { categories, profiles };
}

// تصدير الدوال للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        profiles, 
        categories, 
        loadCategories, 
        loadProfiles, 
        addProfile, 
        updateProfile, 
        deleteProfile, 
        addCategory, 
        updateCategory, 
        deleteCategory,
        initData
    };
}