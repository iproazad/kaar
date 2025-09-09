// بيانات الأقسام الافتراضية
let defaultCategories = [
    { id: 'developers', name: 'المطورين' },
    { id: 'designers', name: 'المصممين' },
    { id: 'companies', name: 'الشركات' }
];

// تحميل الأقسام من localStorage إذا كانت موجودة
let categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;

// حفظ الأقسام الافتراضية إذا لم تكن موجودة في localStorage
if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(defaultCategories));
}

// مصفوفة فارغة للمستخدمين (سيتم إضافتهم من لوحة التحكم فقط)
let defaultProfiles = [];


// تحميل بيانات المستخدمين من localStorage إذا كانت موجودة
let profiles = JSON.parse(localStorage.getItem('profiles')) || defaultProfiles;

// حفظ بيانات المستخدمين الافتراضية إذا لم تكن موجودة في localStorage
if (!localStorage.getItem('profiles')) {
    localStorage.setItem('profiles', JSON.stringify(defaultProfiles));
}

// تصدير البيانات للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { profiles, categories };
}