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

// بيانات الأشخاص الافتراضية
let defaultProfiles = [
    {
        id: 1,
        name: 'أحمد محمد',
        job: 'مطور واجهات أمامية',
        category: 'developers',
        image: 'images/placeholder.svg',
        contact: 'mailto:ahmed@example.com'
    },
    {
        id: 2,
        name: 'سارة علي',
        job: 'مصممة جرافيك',
        category: 'designers',
        image: 'images/placeholder.svg',
        contact: 'https://portfolio.example.com/sara'
    },
    {
        id: 3,
        name: 'محمد خالد',
        job: 'مطور تطبيقات موبايل',
        category: 'developers',
        image: 'images/placeholder.svg',
        contact: 'tel:+1234567890'
    },
    {
        id: 4,
        name: 'نور حسن',
        job: 'مصممة واجهات مستخدم',
        category: 'designers',
        image: 'images/placeholder.svg',
        contact: 'https://behance.net/noor'
    },
    {
        id: 5,
        name: 'شركة تك سوليوشنز',
        job: 'تطوير برمجيات',
        category: 'companies',
        image: 'images/placeholder.svg',
        contact: 'https://techsolutions.example.com'
    },
    {
        id: 6,
        name: 'عمر فاروق',
        job: 'مطور خلفية',
        category: 'developers',
        image: 'images/placeholder.svg',
        contact: 'mailto:omar@example.com'
    },
    {
        id: 7,
        name: 'ليلى كريم',
        job: 'مصممة موشن جرافيك',
        category: 'designers',
        image: 'images/placeholder.svg',
        contact: 'https://vimeo.com/laila'
    },
    {
        id: 8,
        name: 'شركة ديجيتال ميديا',
        job: 'خدمات التسويق الرقمي',
        category: 'companies',
        image: 'images/placeholder.svg',
        contact: 'https://digitalmedia.example.com'
    },
    {
        id: 9,
        name: 'يوسف أحمد',
        job: 'مطور ألعاب',
        category: 'developers',
        image: 'images/placeholder.svg',
        contact: 'mailto:yousef@example.com'
    }
];

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