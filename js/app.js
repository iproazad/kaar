// استدعاء العناصر من DOM
const profileCardsContainer = document.getElementById('profileCards');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryLinks = document.querySelectorAll('.dropdown a');

// المتغير الحالي للتصفية
let currentFilter = 'all';

// دالة لإنشاء بطاقات الملفات الشخصية
function createProfileCards(profilesData) {
    // تفريغ الحاوية
    profileCardsContainer.innerHTML = '';
    
    // التحقق من وجود بيانات
    if (profilesData.length === 0) {
        profileCardsContainer.innerHTML = '<p class="no-results">لا توجد نتائج مطابقة للبحث</p>';
        return;
    }
    
    // إنشاء بطاقة لكل ملف شخصي
    profilesData.forEach(profile => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-category', profile.category);
        
        // تحديد مصدر الصورة - إذا كان رابط خارجي أو محلي
        let imagePath = profile.image || 'images/default-profile.jpg';
        if (imagePath.startsWith('http')) {
            // استخدام الرابط الخارجي كما هو
        } else {
            // إضافة المسار النسبي للصور المحلية
            imagePath = imagePath;
        }
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${imagePath}" alt="${profile.name}" onerror="this.src='images/default-profile.jpg'; this.onerror=null;">
            </div>
            <div class="card-content">
                <span class="category">${getCategoryName(profile.category)}</span>
                <h3>${profile.name}</h3>
                <p>${profile.job}</p>
                ${profile.contact ? `<a href="${profile.contact}" class="contact-link" target="_blank">تواصل</a>` : ''}
            </div>
        `;
        
        profileCardsContainer.appendChild(card);
    });
}

// دالة للحصول على اسم القسم من معرفه
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
}

// دالة لتصفية الملفات الشخصية حسب القسم
function filterProfiles(category) {
    currentFilter = category;
    
    // تحديث حالة أزرار التصفية
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // تصفية البيانات
    let filteredProfiles;
    if (category === 'all') {
        filteredProfiles = profiles;
    } else {
        filteredProfiles = profiles.filter(profile => profile.category === category);
    }
    
    // إعادة إنشاء البطاقات بالبيانات المصفاة
    createProfileCards(filteredProfiles);
}

// دالة للبحث في الملفات الشخصية
function searchProfiles(query) {
    query = query.trim().toLowerCase();
    
    // إذا كان البحث فارغًا، عرض البطاقات حسب التصفية الحالية
    if (query === '') {
        filterProfiles(currentFilter);
        return;
    }
    
    // تصفية البيانات حسب البحث والتصفية الحالية
    let searchResults;
    if (currentFilter === 'all') {
        searchResults = profiles.filter(profile => 
            profile.name.toLowerCase().includes(query) || 
            profile.job.toLowerCase().includes(query)
        );
    } else {
        searchResults = profiles.filter(profile => 
            profile.category === currentFilter && (
                profile.name.toLowerCase().includes(query) || 
                profile.job.toLowerCase().includes(query)
            )
        );
    }
    
    // إنشاء البطاقات بنتائج البحث
    createProfileCards(searchResults);
}

// إضافة مستمعي الأحداث

// أزرار التصفية
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        filterProfiles(category);
    });
});

// روابط القائمة المنسدلة
categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        filterProfiles(category);
    });
});

// مربع البحث
searchInput.addEventListener('input', () => {
    searchProfiles(searchInput.value);
});

// تهيئة الصفحة بعرض جميع الملفات الشخصية
document.addEventListener('DOMContentLoaded', () => {
    // تحميل البيانات من localStorage
    if (localStorage.getItem('profiles')) {
        profiles = JSON.parse(localStorage.getItem('profiles'));
    }
    
    if (localStorage.getItem('categories')) {
        categories = JSON.parse(localStorage.getItem('categories'));
    }
    
    createProfileCards(profiles);
});