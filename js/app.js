// استدعاء العناصر من DOM
const profileCardsContainer = document.getElementById('profileCards');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const filterButtonsContainer = document.getElementById('filterButtonsContainer');
const dropdownContainer = document.getElementById('categoriesDropdown');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mainNav = document.getElementById('mainNav');
const menuOverlay = document.getElementById('menuOverlay');

// التحقق من وجود تفضيل للوضع الداكن في localStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // تحديث أيقونة زر التبديل
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// المتغير الحالي للتصفية
let currentFilter = 'all';

// وظيفة تبديل الوضع الداكن
themeToggle.addEventListener('click', function() {
    // التحقق من الوضع الحالي
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = '';
    
    // تبديل الوضع
    if (currentTheme === 'dark') {
        newTheme = '';
        this.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        newTheme = 'dark';
        this.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // تطبيق الوضع الجديد
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // حفظ التفضيل في localStorage
    localStorage.setItem('theme', newTheme);
});

// تفعيل القائمة المتنقلة
mobileMenuToggle.addEventListener('click', function() {
    mainNav.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    
    // تغيير أيقونة زر القائمة
    const icon = this.querySelector('i');
    if (mainNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        this.setAttribute('aria-label', 'إغلاق القائمة');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        this.setAttribute('aria-label', 'فتح القائمة');
    }
});

// إغلاق القائمة عند النقر على الطبقة الخلفية
menuOverlay.addEventListener('click', function() {
    closeMenu();
});

// دالة لإغلاق القائمة
function closeMenu() {
    mainNav.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
    const icon = mobileMenuToggle.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
    mobileMenuToggle.setAttribute('aria-label', 'فتح القائمة');
}

// إغلاق القائمة عند النقر على رابط
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            closeMenu();
        }
    });
});

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
        // التحقق من وجود رابط صورة
        if (!imagePath || imagePath === '') {
            imagePath = 'images/default-profile.jpg';
        }
        
        // تحويل روابط ibb.co إلى روابط مباشرة للصور
        if (imagePath && imagePath.includes('ibb.co/')) {
            // تحويل رابط صفحة العرض إلى رابط مباشر
            // تحويل https://ibb.co/5xRNMm5J إلى https://i.ibb.co/5xRNMm5J/image.png
            if (imagePath.startsWith('https://ibb.co/') || imagePath.startsWith('http://ibb.co/')) {
                imagePath = imagePath.replace('ibb.co/', 'i.ibb.co/') + '/image.png';
            } else {
                // استخراج معرف الصورة من الرابط في حالة عدم وجود بروتوكول
                const ibbMatch = imagePath.match(/ibb\.co\/([\w\d]+)/);
                if (ibbMatch && ibbMatch[1]) {
                    const imageId = ibbMatch[1];
                    imagePath = `https://i.ibb.co/${imageId}/image.png`;
                }
            }
            // في حالة فشل تحميل الصورة بامتداد png، سيتم تجربة امتدادات أخرى في وظيفة onerror
        }
        
        // إضافة معلومات إضافية للبطاقة
        const availability = profile.available ? 
            '<span class="availability available">متاح للعمل</span>' : 
            '';
        
        // إنشاء محتوى البطاقة
        card.innerHTML = `
            <div class="card-image">
                <img src="${imagePath}" alt="${profile.name}" onerror="if(this.src.includes('image.png')){this.src=this.src.replace('image.png','image.jpg');}else if(this.src.includes('image.jpg')){this.src=this.src.replace('image.jpg','image.jpeg');}else if(this.src.includes('image.jpeg')){this.src=this.src.replace('image.jpeg','image.gif');}else{this.src='images/default-profile.jpg';} this.onerror=null;">
            </div>
            <div class="card-content">
                <div class="card-header">
                    <span class="category">${getCategoryName(profile.category)}</span>
                    ${availability}
                </div>
                <h3>${profile.name}</h3>
                <p class="job-title">${profile.job || 'محترف'}</p>
                ${profile.description ? `<p class="description">${profile.description}</p>` : ''}
                <div class="card-footer">
                    ${profile.contact ? `<a href="${profile.contact}" class="contact-link" target="_blank"><i class="fas fa-envelope"></i> تواصل</a>` : ''}
                </div>
            </div>
        `;
        
        profileCardsContainer.appendChild(card);
    });
}

// دالة لتحديث واجهة المستخدم للأقسام (أزرار التصفية والقائمة المنسدلة)
function updateCategoryUI() {
    // تفريغ الحاويات
    filterButtonsContainer.innerHTML = '';
    dropdownContainer.innerHTML = '';
    
    // إضافة زر "الكل"
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn' + (currentFilter === 'all' ? ' active' : '');
    allButton.setAttribute('data-category', 'all');
    allButton.textContent = 'الكل';
    filterButtonsContainer.appendChild(allButton);
    
    // إضافة رابط "الكل" للقائمة المنسدلة
    const allLink = document.createElement('li');
    allLink.innerHTML = `<a href="#" data-category="all">جميع الأقسام</a>`;
    dropdownContainer.appendChild(allLink);
    
    // إضافة أزرار وروابط لكل قسم
    categories.forEach(category => {
        // إضافة زر التصفية
        const button = document.createElement('button');
        button.className = 'filter-btn' + (currentFilter === category.id ? ' active' : '');
        button.setAttribute('data-category', category.id);
        button.textContent = category.name;
        filterButtonsContainer.appendChild(button);
        
        // إضافة رابط للقائمة المنسدلة
        const link = document.createElement('li');
        link.innerHTML = `<a href="#" data-category="${category.id}">${category.name}</a>`;
        dropdownContainer.appendChild(link);
    });
    
    // إضافة مستمعي الأحداث لأزرار التصفية
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            // تحديث المتغير الحالي للتصفية
            currentFilter = this.getAttribute('data-category');
            
            // تصفية البطاقات
            filterProfiles();
        });
    });
    
    // إضافة مستمعي الأحداث لروابط القائمة المنسدلة
    const categoryLinks = document.querySelectorAll('.dropdown a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // تحديث المتغير الحالي للتصفية
            currentFilter = this.getAttribute('data-category');
            
            // تحديث الزر النشط
            filterBtns.forEach(btn => {
                if (btn.getAttribute('data-category') === currentFilter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // تصفية البطاقات
            filterProfiles();
        });
    });
}

// دالة للحصول على اسم القسم من معرفه
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
}

// دالة لتحديث أزرار التصفية وقائمة الأقسام المنسدلة
function updateCategoryUI() {
    // تحديث أزرار التصفية
    filterButtonsContainer.innerHTML = `
        <button class="filter-btn active" data-category="all">الكل</button>
    `;
    
    // تحديث القائمة المنسدلة
    dropdownContainer.innerHTML = `
        <li><a href="#" data-category="all">جميع الأقسام</a></li>
    `;
    
    // إضافة كل قسم إلى أزرار التصفية والقائمة المنسدلة
    categories.forEach(category => {
        // إضافة زر تصفية
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.setAttribute('data-category', category.id);
        filterBtn.textContent = category.name;
        filterButtonsContainer.appendChild(filterBtn);
        
        // إضافة عنصر للقائمة المنسدلة
        const dropdownItem = document.createElement('li');
        dropdownItem.innerHTML = `<a href="#" data-category="${category.id}">${category.name}</a>`;
        dropdownContainer.appendChild(dropdownItem);
    });
    
    // إعادة تعيين مستمعي الأحداث
    const newFilterButtons = document.querySelectorAll('.filter-btn');
    newFilterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterProfiles(category);
        });
    });
    
    const newCategoryLinks = document.querySelectorAll('.dropdown a');
    newCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterProfiles(category);
        });
    });
}

// دالة لتصفية الملفات الشخصية حسب القسم
function filterProfiles(category) {
    currentFilter = category;
    
    // تحديث حالة أزرار التصفية
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
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
            profile.job.toLowerCase().includes(query) || 
            (profile.description && profile.description.toLowerCase().includes(query))
        );
    } else {
        searchResults = profiles.filter(profile => 
            profile.category === currentFilter && (
                profile.name.toLowerCase().includes(query) || 
                profile.job.toLowerCase().includes(query) || 
                (profile.description && profile.description.toLowerCase().includes(query))
            )
        );
    }
    
    // إنشاء البطاقات بنتائج البحث
    createProfileCards(searchResults);
}

// إضافة مستمعي الأحداث لمربع البحث

// مربع البحث
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        // إذا كان حقل البحث فارغًا، عرض البطاقات حسب التصفية الحالية
        const filteredProfiles = currentFilter === 'all' ? 
            profiles : 
            profiles.filter(profile => profile.category === currentFilter);
        createProfileCards(filteredProfiles);
    } else {
        // تصفية البطاقات حسب مصطلح البحث والتصفية الحالية
        const filteredProfiles = profiles.filter(profile => {
            // البحث في الاسم والوظيفة والوصف إذا كان موجودًا
            const nameMatch = profile.name.toLowerCase().includes(searchTerm);
            const jobMatch = profile.job ? profile.job.toLowerCase().includes(searchTerm) : false;
            const descMatch = profile.description ? profile.description.toLowerCase().includes(searchTerm) : false;
            
            const matchesSearch = nameMatch || jobMatch || descMatch;
            const matchesCategory = currentFilter === 'all' || profile.category === currentFilter;
            
            return matchesSearch && matchesCategory;
        });
        createProfileCards(filteredProfiles);
    }
});

// دالة لتحديث واجهة المستخدم من localStorage
function updateUIFromLocalStorage() {
    // تحميل البيانات المحدثة من localStorage
    categories = JSON.parse(localStorage.getItem('categories')) || [];
    profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    
    // تحديث واجهة المستخدم
    updateCategoryUI();
    
    // تحديث البطاقات حسب التصفية الحالية
    const filteredProfiles = currentFilter === 'all' ? 
        profiles : 
        profiles.filter(profile => profile.category === currentFilter);
    createProfileCards(filteredProfiles);
}

// تهيئة الصفحة بعرض جميع الملفات الشخصية
document.addEventListener('DOMContentLoaded', () => {
    // تحميل البيانات من localStorage
    if (localStorage.getItem('profiles')) {
        profiles = JSON.parse(localStorage.getItem('profiles'));
    }
    
    if (localStorage.getItem('categories')) {
        categories = JSON.parse(localStorage.getItem('categories'));
    }
    
    // تحديث واجهة الأقسام
    updateCategoryUI();
    
    // تحميل البيانات وإنشاء البطاقات عند تحميل الصفحة
    createProfileCards(profiles);
    
    // التحقق من التغييرات في localStorage كل 5 ثوانٍ
    setInterval(updateUIFromLocalStorage, 5000);
});