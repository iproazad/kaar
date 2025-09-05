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
        
        // معالجة روابط ibb.co لاستخراج الرابط المباشر للصورة
        if (imagePath && imagePath.includes('ibb.co/')) {
            // تحويل رابط ibb.co إلى رابط مباشر للصورة
            // مثال: https://ibb.co/rRn9wqwK -> https://i.ibb.co/[code]/image.jpg
            const ibbCode = imagePath.split('/').pop();
            if (ibbCode) {
                // استخدام رابط الصورة المصغرة من ibb.co
                imagePath = `https://i.ibb.co/${ibbCode}/image.jpg`;
            }
        } else if (imagePath.startsWith('http')) {
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // تحميل البيانات من الخادم
        await initData();
        
        // إنشاء أزرار التصفية للأقسام الديناميكية
        updateCategoryFilters();
        
        // عرض البطاقات
        createProfileCards(profiles);
    } catch (error) {
        console.error('خطأ في تهيئة الصفحة:', error);
        profileCardsContainer.innerHTML = '<p class="error-message">حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة.</p>';
    }
});

// دالة لتحديث أزرار تصفية الأقسام
function updateCategoryFilters() {
    // تحديث القائمة المنسدلة
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        // الاحتفاظ بالعنصر الأول (جميع الأقسام)
        const firstItem = dropdown.querySelector('li:first-child');
        dropdown.innerHTML = '';
        dropdown.appendChild(firstItem);
        
        // إضافة الأقسام الديناميكية
        categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-category="${category.id}">${category.name}</a>`;
            dropdown.appendChild(li);
        });
        
        // إعادة إضافة مستمعي الأحداث
        const categoryLinks = document.querySelectorAll('.dropdown a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('data-category');
                filterProfiles(category);
            });
        });
    }
    
    // تحديث أزرار التصفية
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    if (filterButtonsContainer) {
        // الاحتفاظ بالزر الأول (الكل)
        const firstButton = filterButtonsContainer.querySelector('button:first-child');
        filterButtonsContainer.innerHTML = '';
        filterButtonsContainer.appendChild(firstButton);
        
        // إضافة أزرار الأقسام الديناميكية
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-category', category.id);
            button.textContent = category.name;
            filterButtonsContainer.appendChild(button);
        });
        
        // إعادة تعريف متغير أزرار التصفية
        const newFilterButtons = document.querySelectorAll('.filter-btn');
        
        // إعادة إضافة مستمعي الأحداث
        newFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                filterProfiles(category);
            });
        });
    }
}