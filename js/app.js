// التحقق من صلاحيات المستخدم الحالي
async function checkAdminStatus() {
    console.log('بدء التحقق من صلاحيات المستخدم...');
    const user = auth.currentUser;
    
    if (!user) {
        console.log('لا يوجد مستخدم مسجل الدخول حالياً');
        return false;
    }
    
    console.log('المستخدم الحالي:', user.email, 'UID:', user.uid);
    
    try {
        console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        
        if (!adminDoc.exists) {
            console.log('المستخدم غير موجود في مجموعة المسؤولين');
            return false;
        }
        
        // التحقق من دور المستخدم (superadmin له جميع الصلاحيات)
        const adminData = adminDoc.data();
        console.log('بيانات المسؤول:', adminData);
        console.log('دور المستخدم:', adminData.role || 'غير محدد');
        
        // إذا كان المستخدم superadmin أو admin، فهو مسؤول
        const isAdmin = adminData.role === 'admin' || adminData.role === 'superadmin';
        console.log('نتيجة التحقق من الصلاحيات:', isAdmin ? 'مسؤول' : 'غير مسؤول');
        console.log('تم التحقق بنجاح: المستخدم هو مسؤول');
        return isAdmin;
    } catch (error) {
        console.error('خطأ في التحقق من صلاحيات المستخدم:', error);
        console.error('رمز الخطأ:', error.code);
        console.error('رسالة الخطأ:', error.message);
        return false;
    }
}

// تعريف متغير عام لتحديد حالة المستخدم (زائر أم مسجل)
window.isVisitor = true;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
});

// دالة للتحقق من صحة رابط الصورة
function isValidImageUrl(url) {
    // التحقق من أن الرابط يبدأ بـ http:// أو https://
    if (!url || (!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://'))) {
        return false;
    }
    
    // قبول روابط ImgBB المباشرة وغير المباشرة
    // مثال للرابط المباشر: https://i.ibb.co/AbCdEfG/example-image.jpg
    // مثال للرابط غير المباشر: https://ibb.co/0jsTLgnm
    if (url.includes('ibb.co')) {
        return true;
    }
    
    // التحقق من أن الرابط ينتهي بامتداد صورة معروف للروابط الأخرى
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowercaseUrl = url.toLowerCase();

    return imageExtensions.some(ext => lowercaseUrl.endsWith(ext));
}

// دالة لتحويل رابط صفحة عرض الصورة من ImgBB إلى رابط مباشر للصورة
function convertImgBBUrl(url) {
    // إذا كان الرابط فارغًا أو غير محدد، نعيد رابط الصورة الافتراضية
    if (!url || url.trim() === '') {
        return 'img/default-avatar.png';
    }
    
    // إذا كان الرابط مباشراً بالفعل، نعيده كما هو
    if (url.includes('i.ibb.co')) {
        return url;
    }
    
    // إذا كان الرابط لصفحة عرض الصورة من ImgBB (مثل https://ibb.co/0jsTLgnm)
    if (url.includes('ibb.co/')) {
        // نستخرج معرف الصورة من الرابط
        const imageId = url.split('/').pop();
        // نعيد رابط افتراضي للصورة المباشرة باستخدام معرف الصورة
        // ملاحظة: هذا ليس الرابط الفعلي للصورة، ولكنه يستخدم كحل مؤقت
        return `https://i.ibb.co/${imageId}/image.jpg`;
    }
    
    // التحقق من أن الرابط يبدأ بـ http:// أو https://
    if (!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
        return 'img/default-avatar.png';
    }
    
    // إذا لم يكن الرابط من ImgBB، نعيده كما هو
    return url;
}

// دالة لتطبيق الأنماط على البطاقات بشكل متسق
function applyCardStyles() {
    // تحديد جميع البطاقات
    const cards = document.querySelectorAll('.person-card');
    
    // تطبيق الأنماط على كل بطاقة
    cards.forEach(card => {
        // التأكد من وجود خصائص التحويل والظل
        card.style.transition = 'transform 0.3s, box-shadow 0.3s';
        card.style.backgroundColor = 'var(--light-card)';
        card.style.borderRadius = '12px';
        card.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
        
        // تطبيق الأنماط على الصورة
        const img = card.querySelector('img');
        if (img) {
            img.style.border = '4px solid var(--primary-color)';
            img.style.transition = 'transform 0.3s';
        }
        
        // إضافة مستمع حدث للتحويل عند تمرير المؤشر
        if (!card.hasListener) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                
                // تأثير على الصورة عند التحويم
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.05)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
                
                // إعادة الصورة إلى حجمها الطبيعي
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
            
            // وضع علامة على البطاقة بأنه تم إضافة المستمع
            card.hasListener = true;
        }
    });
    
    // تطبيق الأنماط في الوضع الداكن دائمًا
    cards.forEach(card => {
        card.style.backgroundColor = 'var(--dark-card)';
        card.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
    });
}

// Main application initialization
function initApp() {
    console.log('بدء تهيئة التطبيق...');
    
    // إضافة أنماط CSS للرسوم المتحركة
    if (!document.getElementById('animation-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'animation-styles';
        styleElement.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(10px); }
            }
        `;
        document.head.appendChild(styleElement);
        console.log('تمت إضافة أنماط الرسوم المتحركة');
    }
    
    // إضافة meta viewport tag للتأكد من عرض التطبيق بشكل صحيح على الأجهزة المحمولة
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        const newViewportMeta = document.createElement('meta');
        newViewportMeta.name = 'viewport';
        newViewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(newViewportMeta);
        console.log('تمت إضافة meta viewport tag');
    }
    
    // التحقق من المدينة المختارة وعرضها
    const selectedCity = localStorage.getItem('selectedCity') || 'duhok';
    window.selectedCity = selectedCity; // تهيئة المتغير العام
    updateCityIndicator(selectedCity);
    console.log('المدينة المختارة:', selectedCity);
    // تأكد من تخزين المدينة بأحرف صغيرة في localStorage
    localStorage.setItem('selectedCity', selectedCity.toLowerCase());
    
    // إضافة زر تغيير المدينة
    addChangeCityButton();
    
    // Setup event listeners
    setupEventListeners();
    console.log('تم إعداد مستمعي الأحداث');
    
    // Setup dark mode
    setupDarkMode();
    console.log('تم إعداد الوضع الداكن');
    
    // Check authentication state - سيقوم بتحميل البيانات بعد التحقق من حالة المستخدم
    console.log('جاري التحقق من حالة المستخدم...');
    checkAuthState();
    
    // ملاحظة: تم نقل تحميل البيانات إلى دالة checkAuthState
    // لضمان تحميلها بعد التحقق من صلاحيات المستخدم
    
    console.log('اكتملت تهيئة التطبيق');
}

// دالة تحديث مؤشر المدينة
function updateCityIndicator(city) {
    const cityIndicator = document.getElementById('cityIndicator');
    if (cityIndicator) {
        // تحديث المتغير العام للمدينة المحددة
        window.selectedCity = city || localStorage.getItem('selectedCity') || 'duhok';
        
        // تحويل المدينة إلى أحرف صغيرة للمقارنة
        const normalizedCity = window.selectedCity.toLowerCase();
        
        if (normalizedCity === 'duhok' || normalizedCity === 'دهوك') {
            cityIndicator.textContent = 'مدينة دهوك';
            cityIndicator.className = 'mr-4 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        } else if (normalizedCity === 'zakho' || normalizedCity === 'زاخو') {
            cityIndicator.textContent = 'مدينة زاخو';
            cityIndicator.className = 'mr-4 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
    }
}

// دالة إضافة فلتر المدينة لجميع المستخدمين (الزوار والمسجلين)
function addCityFilterForAll() {
    // التحقق من وجود عنصر فلتر المدينة مسبقًا
    if (document.getElementById('cityFilter')) {
        return; // إذا كان موجودًا بالفعل، لا نضيفه مرة أخرى
    }
    
    // إنشاء عنصر فلتر المدينة
    const cityFilter = document.createElement('div');
    cityFilter.id = 'cityFilter';
    cityFilter.className = 'bg-white dark:bg-gray-800 p-4 mb-6 rounded-lg shadow-md';
    
    // الحصول على المدينة المحددة حاليًا
    const selectedCity = localStorage.getItem('selectedCity') || 'duhok';
    
    // إنشاء محتوى فلتر المدينة
    cityFilter.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">فلتر حسب المدينة</h3>
            ${window.isVisitor ? '<span class="text-sm text-blue-600 dark:text-blue-400"><i class="fas fa-info-circle ml-1"></i>متاح للزوار</span>' : ''}
        </div>
        <div class="flex flex-wrap gap-2">
            <button class="city-filter px-4 py-2 rounded-lg transition duration-300 ${selectedCity.toLowerCase() === 'duhok' || selectedCity.toLowerCase() === 'دهوك' ? 'active bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}" data-city="duhok">دهوك</button>
            <button class="city-filter px-4 py-2 rounded-lg transition duration-300 ${selectedCity.toLowerCase() === 'zakho' || selectedCity.toLowerCase() === 'زاخو' ? 'active bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}" data-city="zakho">زاخو</button>
        </div>
    `;
    
    // إضافة فلتر المدينة قبل شبكة الأشخاص
    const personsGrid = document.getElementById('personsGrid');
    if (personsGrid && personsGrid.parentNode) {
        personsGrid.parentNode.insertBefore(cityFilter, personsGrid);
        
        // إضافة مستمعي الأحداث لأزرار فلتر المدينة
        const cityFilterButtons = document.querySelectorAll('.city-filter');
        cityFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // إزالة الفئة النشطة من جميع الأزرار
                cityFilterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-100', 'dark:bg-blue-900', 'text-blue-800', 'dark:text-blue-200');
                    btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                });
                
                // إضافة الفئة النشطة للزر المحدد
                button.classList.add('active', 'bg-blue-100', 'dark:bg-blue-900', 'text-blue-800', 'dark:text-blue-200');
                button.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                
                // تحديث المدينة المحددة في التخزين المحلي
                const city = button.getAttribute('data-city');
                localStorage.setItem('selectedCity', city);
                window.selectedCity = city; // تحديث المتغير العام
                
                // تحديث مؤشر المدينة
                updateCityIndicator(city);
                
                // إظهار إشعار للزوار
                if (window.isVisitor) {
                    const notification = document.createElement('div');
                    notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
                    notification.style.animation = 'fadeIn 0.5s ease forwards';
                    notification.innerHTML = `
                        <div class="flex items-center">
                            <i class="fas fa-check-circle ml-2"></i>
                            <span>تم تغيير المدينة إلى ${city === 'duhok' ? 'دهوك' : 'زاخو'}</span>
                        </div>
                    `;
                    document.body.appendChild(notification);
                    
                    // إضافة أنماط CSS للرسوم المتحركة إذا لم تكن موجودة
                    if (!document.getElementById('notification-animations')) {
                        const styleElement = document.createElement('style');
                        styleElement.id = 'notification-animations';
                        styleElement.textContent = `
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                            @keyframes fadeOut {
                                from { opacity: 1; transform: translateY(0); }
                                to { opacity: 0; transform: translateY(10px); }
                            }
                        `;
                        document.head.appendChild(styleElement);
                    }
                    
                    // إزالة الإشعار بعد 3 ثوانٍ
                    setTimeout(() => {
                        notification.style.animation = 'fadeOut 0.5s ease forwards';
                        setTimeout(() => notification.remove(), 500);
                    }, 3000);
                }
                
                // إعادة تحميل البيانات مع المدينة الجديدة
                loadPersons();
            });
        });
    }
}

// دالة إضافة زر تغيير المدينة
function addChangeCityButton() {
    const navContainer = document.querySelector('nav .container ul');
    if (navContainer) {
        const changeCityItem = document.createElement('li');
        const changeCityLink = document.createElement('a');
        changeCityLink.href = '#';
        changeCityLink.className = 'block py-4 px-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300';
        changeCityLink.innerHTML = '<i class="fas fa-exchange-alt ml-1"></i>تغيير المدينة';
        changeCityLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'city_select.html';
        });
        changeCityItem.appendChild(changeCityLink);
        navContainer.appendChild(changeCityItem);
    }
    
    // إضافة فلتر المدينة في أعلى الصفحة للزوار والمستخدمين المسجلين
    addCityFilterForAll();
}

// دالة معالجة تغيير حجم الشاشة
function handleScreenResize() {
    const personsGrid = document.getElementById('personsGrid');
    if (personsGrid) {
        if (window.innerWidth <= 480) {
            personsGrid.className = 'grid grid-cols-2 gap-3';
        } else if (window.innerWidth <= 640) {
            personsGrid.className = 'grid grid-cols-2 gap-4';
        } else if (window.innerWidth <= 768) {
            personsGrid.className = 'grid grid-cols-3 gap-4';
        } else {
            personsGrid.className = 'grid grid-cols-4 gap-6';
        }
    }
    
    // التأكد من تطبيق الأنماط بشكل صحيح على جميع الأجهزة
    applyCardStyles();
}

// Check if user is authenticated
function checkAuthState() {
    auth.onAuthStateChanged(async user => {
        // إضافة متغير عام لتحديد ما إذا كان المستخدم زائرًا
        window.isVisitor = !user;
        console.log('تم تحديد حالة المستخدم:', window.isVisitor ? 'زائر' : 'مسجل الدخول');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        
        // التحكم في ظهور فلتر المدينة
        const cityFilterContainer = document.getElementById('cityFilterContainer');
        if (cityFilterContainer) {
            if (user) {
                // إظهار فلتر المدينة للمستخدمين المسجلين فقط
                cityFilterContainer.classList.remove('hidden');
                
                // تعيين المدينة المختارة في الفلتر
                const cityFilter = document.getElementById('cityFilter');
                const selectedCity = localStorage.getItem('selectedCity') || 'duhok';
                if (cityFilter) {
                    cityFilter.value = selectedCity.toLowerCase();
                    
                    // إضافة حدث تغيير المدينة
                    cityFilter.addEventListener('change', function() {
                        const newCity = this.value;
                        localStorage.setItem('selectedCity', newCity);
                        console.log('تم تغيير المدينة إلى:', newCity);
                        // إعادة تحميل البيانات بعد تغيير المدينة
                        loadPersons();
                    });
                }
            } else {
                // إخفاء فلتر المدينة للزوار
                cityFilterContainer.classList.add('hidden');
            }
        }
        
        // التأكد من إخفاء جميع الأزرار ما عدا تسجيل الدخول والتسجيل للزائر
         if (!user) {
             console.log('المستخدم غير مسجل الدخول (زائر)');
             // إظهار فقط أزرار تسجيل الدخول والتسجيل
             loginBtn.classList.remove('hidden');
             registerBtn.classList.remove('hidden');
             // إخفاء جميع الأزرار الأخرى
             logoutBtn.classList.add('hidden');
             dashboardBtn.classList.add('hidden');
             
             // تعيين حالة المستخدم كزائر
             window.isVisitor = true;
             console.log('تأكيد حالة المستخدم كزائر');
             
             // إظهار رسالة ترحيبية للزوار حول فلتر المدينة
             setTimeout(() => {
                 const welcomeMessage = document.createElement('div');
                 welcomeMessage.className = 'fixed top-20 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
                 welcomeMessage.style.animation = 'fadeIn 0.5s ease forwards';
                 welcomeMessage.style.maxWidth = '300px';
                 welcomeMessage.innerHTML = `
                     <div class="flex items-start">
                         <i class="fas fa-info-circle text-xl ml-2 mt-1"></i>
                         <div>
                             <h4 class="font-bold mb-1">مرحبًا بك!</h4>
                             <p>يمكنك الآن استخدام فلتر المدينة لعرض البطاقات حسب المدينة.</p>
                         </div>
                         <button class="text-white hover:text-gray-200 mr-2" onclick="this.parentNode.parentNode.remove()">
                             <i class="fas fa-times"></i>
                         </button>
                     </div>
                 `;
                 document.body.appendChild(welcomeMessage);
                 
                 // إزالة الرسالة بعد 8 ثوانٍ
                 setTimeout(() => {
                     welcomeMessage.style.animation = 'fadeOut 0.5s ease forwards';
                     setTimeout(() => welcomeMessage.remove(), 500);
                 }, 8000);
             }, 1500);
             
             // تم إزالة شريط تنبيه للزائر في أعلى الصفحة
             
             // إخفاء زر الملف الشخصي إذا كان موجودًا
             const userProfileBtn = document.getElementById('userProfileBtn');
             if (userProfileBtn) {
                 userProfileBtn.classList.add('hidden');
             }
             
             // تحميل البيانات للزائر
             console.log('تحميل البيانات للزائر...');
             loadSections();
             loadPersons();
             return;
         }
        
        // إذا وصلنا إلى هنا، فالمستخدم مسجل الدخول
        console.log('User is signed in:', user.email, 'UID:', user.uid);
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        // تعيين حالة المستخدم كمستخدم مسجل
        window.isVisitor = false;
        
        // إزالة شريط تنبيه الزائر إذا كان موجودًا
        const visitorBanner = document.getElementById('visitorBanner');
        if (visitorBanner) {
            visitorBanner.remove();
        }
        
        // Add user profile button
        let userProfileBtn = document.getElementById('userProfileBtn');
        if (!userProfileBtn) {
            userProfileBtn = document.createElement('button');
            userProfileBtn.id = 'userProfileBtn';
            userProfileBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-300 ml-2';
            userProfileBtn.innerHTML = '<i class="fas fa-user ml-2"></i>الملف الشخصي';
            userProfileBtn.addEventListener('click', () => {
                loadUserProfile(user.uid);
                document.getElementById('userProfileModal').classList.remove('hidden');
            });
            
            // Insert before logout button
            logoutBtn.parentNode.insertBefore(userProfileBtn, logoutBtn);
        } else {
            userProfileBtn.classList.remove('hidden');
        }
        
        // Check user role - first check in admins collection
        try {
            console.log('التحقق من صلاحيات المستخدم في مجموعة المسؤولين...');
            const adminDoc = await db.collection('admins').doc(user.uid).get();
            
            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                console.log('بيانات المسؤول:', adminData);
                console.log('دور المستخدم في مجموعة المسؤولين:', adminData.role || 'غير محدد');
                
                if (adminData.role === 'admin' || adminData.role === 'superadmin') {
                    // Admin user - show dashboard button
                    dashboardBtn.classList.remove('hidden');
                    console.log('تم تفعيل زر لوحة التحكم للمسؤول');
                    // Load admin data
                    loadAdmins();
                    
                    // إعادة تحميل البيانات بعد التحقق من الصلاحيات
                    console.log('إعادة تحميل البيانات للمسؤول...');
                    await loadSections();
                    await loadPersons();
                    return; // نخرج من الدالة بعد التعامل مع المسؤول
                }
            }
            
            // إذا لم يكن المستخدم في مجموعة المسؤولين، نتحقق من مجموعة المستخدمين
            console.log('التحقق من صلاحيات المستخدم في مجموعة المستخدمين العاديين...');
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('بيانات المستخدم:', userData);
                console.log('دور المستخدم في مجموعة المستخدمين:', userData.role || 'غير محدد');
                
                if (userData.role === 'admin') {
                    // Admin user - show dashboard button
                    dashboardBtn.classList.remove('hidden');
                    console.log('تم تفعيل زر لوحة التحكم للمستخدم المسؤول');
                    // Load admin data
                    loadAdmins();
                } else {
                    // Regular user - hide dashboard button
                    dashboardBtn.classList.add('hidden');
                    console.log('تم إخفاء زر لوحة التحكم للمستخدم العادي');
                }
            } else {
                console.log('المستخدم غير موجود في مجموعة المستخدمين العاديين');
                dashboardBtn.classList.add('hidden');
            }
                
                // إعادة تحميل البيانات للمستخدم العادي
                console.log('إعادة تحميل البيانات للمستخدم العادي...');
                await loadSections();
                await loadPersons();
                
            } catch (error) {
                console.error('Error checking user role:', error);
                console.log('خطأ في التحقق من صلاحيات المستخدم:', error.message);
                
                // في حالة حدوث خطأ، نحاول تحميل البيانات على أي حال
                try {
                    console.log('محاولة تحميل البيانات بعد حدوث خطأ...');
                    await loadSections();
                    await loadPersons();
                } catch (loadError) {
                    console.error('خطأ في تحميل البيانات بعد فشل التحقق من الصلاحيات:', loadError);
                }
            }

    });
}

// Setup all event listeners
function setupEventListeners() {
    // إضافة استجابة لتغيير حجم الشاشة
    window.addEventListener('resize', handleScreenResize);
    
    // تنفيذ استجابة الشاشة عند بدء التطبيق
    handleScreenResize();
    
    // Dark mode toggle - مخفي لأن الوضع الداكن مفعل بشكل دائم
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.classList.add('hidden');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Login modal
    const loginBtn = document.getElementById('loginBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginModal = document.getElementById('loginModal');
    
    loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });
    
    closeLoginModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // User profile modal
    const closeUserProfileModal = document.getElementById('closeUserProfileModal');
    closeUserProfileModal.addEventListener('click', () => {
        document.getElementById('userProfileModal').classList.add('hidden');
        // Hide edit form if open
        document.getElementById('editUserProfileForm').classList.add('hidden');
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    const registerModal = document.getElementById('registerModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    
    registerBtn.addEventListener('click', () => {
        registerModal.classList.remove('hidden');
        // Load sections for the dropdown
        loadSectionsForRegister();
    });
    
    closeRegisterModal.addEventListener('click', () => {
        registerModal.classList.add('hidden');
    });
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', handleRegister);
    
    // Dashboard button
    const dashboardBtn = document.getElementById('dashboardBtn');
    const adminDashboard = document.getElementById('adminDashboard');
    const closeAdminDashboard = document.getElementById('closeAdminDashboard');
    
    dashboardBtn.addEventListener('click', () => {
        adminDashboard.classList.remove('hidden');
    });
    
    closeAdminDashboard.addEventListener('click', () => {
        adminDashboard.classList.add('hidden');
    });
    
    // Admin tabs
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            adminTabs.forEach(t => {
                t.classList.remove('active', 'border-blue-600', 'text-blue-600');
                t.classList.add('border-transparent');
            });
            
            // Add active class to clicked tab
            tab.classList.add('active', 'border-blue-600', 'text-blue-600');
            tab.classList.remove('border-transparent');
            
            // Hide all tab content
            const tabContents = document.querySelectorAll('.admin-tab-content');
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Show selected tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}Tab`).classList.remove('hidden');
        });
    });
    
    // Add person form
    const addPersonForm = document.getElementById('addPersonForm');
    addPersonForm.addEventListener('submit', handleAddPerson);
    
    // Add section form
    const addSectionForm = document.getElementById('addSectionForm');
    addSectionForm.addEventListener('submit', handleAddSection);
    
    // Add admin form
    const addAdminForm = document.getElementById('addAdminForm');
    addAdminForm.addEventListener('submit', handleAddAdmin);
    
    // Edit person form
    const editPersonForm = document.getElementById('editPersonForm');
    editPersonForm.addEventListener('submit', handleEditPerson);
    
    // Edit section form
    const editSectionForm = document.getElementById('editSectionForm');
    editSectionForm.addEventListener('submit', handleEditSection);
    
    // Close edit person modal
    const closeEditPersonModal = document.getElementById('closeEditPersonModal');
    closeEditPersonModal.addEventListener('click', () => {
        document.getElementById('editPersonModal').classList.add('hidden');
    });
    
    // Close edit section modal
    const closeEditSectionModal = document.getElementById('closeEditSectionModal');
    closeEditSectionModal.addEventListener('click', () => {
        document.getElementById('editSectionModal').classList.add('hidden');
    });
    
    // Confirmation modal
    const closeConfirmationModal = document.getElementById('closeConfirmationModal');
    const cancelDelete = document.getElementById('cancelDelete');
    
    closeConfirmationModal.addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
    });
    
    cancelDelete.addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
}

// Load sections for register form
async function loadSectionsForRegister() {
    const sectionSelect = document.getElementById('registerSection');
    sectionSelect.innerHTML = '<option value="" disabled selected>اختر القسم</option>';
    
    try {
        const sectionsSnapshot = await db.collection('sections').get();
        
        if (sectionsSnapshot.empty) {
            console.log('لا توجد أقسام متاحة');
            return;
        }
        
        sectionsSnapshot.forEach(doc => {
            const section = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = section.name;
            sectionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل الأقسام:', error);
        alert('حدث خطأ أثناء تحميل الأقسام. يرجى المحاولة مرة أخرى.');
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    const job = document.getElementById('registerJob').value;
    const sectionId = document.getElementById('registerSection').value;
    const imageUrl = document.getElementById('registerImageUrl').value;
    
    // Validate image URL
    let processedImageUrl = imageUrl;
    if (imageUrl.includes('ibb.co/') && !imageUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        // Convert ImgBB share URL to direct URL if needed
        try {
            // This is a placeholder. In a real implementation, you might need to
            // use an API or different approach to get the direct URL from ImgBB
            processedImageUrl = await getDirectImageUrl(imageUrl);
        } catch (error) {
            console.error('خطأ في معالجة رابط الصورة:', error);
            alert('حدث خطأ في معالجة رابط الصورة. يرجى التأكد من صحة الرابط.');
            return;
        }
    }
    
    try {
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Add user to Firestore with limited permissions
        await db.collection('users').doc(user.uid).set({
            email: email,
            role: 'user', // Regular user role with limited permissions
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add person information to Firestore
        await db.collection('people').add({
            name: name,
            job: job,
            sectionId: sectionId,
            imageUrl: processedImageUrl,
            userId: user.uid, // Link person to user account
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Hide modal and reset form
        document.getElementById('registerModal').classList.add('hidden');
        document.getElementById('registerForm').reset();
        
        // Show success message
        alert('تم إنشاء الحساب بنجاح!');
        
        // Sign in the user automatically
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        alert(`خطأ في التسجيل: ${error.message}`);
    }
}

// Helper function to get direct image URL from ImgBB share URL
async function getDirectImageUrl(shareUrl) {
    // إذا كان الرابط فارغًا أو غير محدد، نعيد رابط الصورة الافتراضية
    if (!shareUrl || shareUrl.trim() === '') {
        return 'img/default-avatar.png';
    }
    
    // التحقق من أن الرابط يبدأ بـ http:// أو https://
    if (!shareUrl.toLowerCase().startsWith('http://') && !shareUrl.toLowerCase().startsWith('https://')) {
        return 'img/default-avatar.png';
    }
    
    // If it's already a direct URL, return it
    if (shareUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return shareUrl;
    }
    
    // إذا كان الرابط من ImgBB، نحاول تحويله إلى رابط مباشر
    if (shareUrl.includes('ibb.co/')) {
        // تحقق إذا كان الرابط مباشراً بالفعل
        if (shareUrl.includes('i.ibb.co')) {
            return shareUrl;
        }
        
        // نستخرج معرف الصورة من الرابط
        const imageId = shareUrl.split('/').pop();
        // نعيد رابط مباشر للصورة باستخدام معرف الصورة
        return `https://i.ibb.co/${imageId}/image.jpg`;
    }
    
    // For other URLs, we'll append a default extension if needed
    return shareUrl.includes('?') ? shareUrl : `${shareUrl}.jpg`;
}

// Load user profile data
async function loadUserProfile(userId) {
    try {
        // Find the person document linked to this user
        const peopleSnapshot = await db.collection('people')
            .where('userId', '==', userId)
            .limit(1)
            .get();
        
        if (peopleSnapshot.empty) {
            console.log('No profile found for this user');
            return;
        }
        
        // Get the person document
        const personDoc = peopleSnapshot.docs[0];
        const personData = personDoc.data();
        
        // Store the person ID for later use
        document.getElementById('userProfileContent').dataset.personId = personDoc.id;
        
        // Set profile data
        document.getElementById('userProfileImage').src = personData.imageUrl || 'img/default-avatar.png';
        document.getElementById('userProfileName').textContent = personData.name;
        document.getElementById('userProfileJob').textContent = personData.job;
        
        // Get section name
        if (personData.sectionId) {
            const sectionDoc = await db.collection('sections').doc(personData.sectionId).get();
            if (sectionDoc.exists) {
                document.getElementById('userProfileSection').textContent = sectionDoc.data().name;
            }
        }
        
        // Setup edit form
        const editBtn = document.getElementById('editUserProfileBtn');
        const editForm = document.getElementById('editUserProfileForm');
        const cancelBtn = document.getElementById('cancelEditUserProfile');
        
        editBtn.addEventListener('click', async () => {
            // Populate edit form
            document.getElementById('editUserName').value = personData.name;
            document.getElementById('editUserJob').value = personData.job;
            document.getElementById('editUserImageUrl').value = personData.imageUrl;
            
            // Load sections for dropdown
            await loadSectionsForUserEdit();
            
            // Set selected section
            if (personData.sectionId) {
                document.getElementById('editUserSection').value = personData.sectionId;
            }
            
            // Show edit form
            editForm.classList.remove('hidden');
        });
        
        cancelBtn.addEventListener('click', () => {
            editForm.classList.add('hidden');
        });
        
        // Handle form submission
        editForm.addEventListener('submit', handleEditUserProfile);
    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('حدث خطأ أثناء تحميل الملف الشخصي. يرجى المحاولة مرة أخرى.');
    }
}

// Load sections for user profile edit
async function loadSectionsForUserEdit() {
    const sectionSelect = document.getElementById('editUserSection');
    sectionSelect.innerHTML = '<option value="" disabled selected>اختر القسم</option>';
    
    try {
        const sectionsSnapshot = await db.collection('sections').get();
        
        if (sectionsSnapshot.empty) {
            console.log('لا توجد أقسام متاحة');
            return;
        }
        
        sectionsSnapshot.forEach(doc => {
            const section = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = section.name;
            sectionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل الأقسام:', error);
        alert('حدث خطأ أثناء تحميل الأقسام. يرجى المحاولة مرة أخرى.');
    }
}

// Handle edit user profile form submission
async function handleEditUserProfile(e) {
    e.preventDefault();
    
    const personId = document.getElementById('userProfileContent').dataset.personId;
    if (!personId) {
        alert('لم يتم العثور على معرف الشخص');
        return;
    }
    
    const name = document.getElementById('editUserName').value;
    const job = document.getElementById('editUserJob').value;
    const sectionId = document.getElementById('editUserSection').value;
    const imageUrl = document.getElementById('editUserImageUrl').value;
    
    // Validate image URL
    let processedImageUrl = imageUrl;
    if (imageUrl.includes('ibb.co/') && !imageUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        try {
            processedImageUrl = await getDirectImageUrl(imageUrl);
        } catch (error) {
            console.error('خطأ في معالجة رابط الصورة:', error);
            alert('حدث خطأ في معالجة رابط الصورة. يرجى التأكد من صحة الرابط.');
            return;
        }
    }
    
    try {
        // Update person document
        await db.collection('people').doc(personId).update({
            name: name,
            job: job,
            sectionId: sectionId,
            imageUrl: processedImageUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update UI
        document.getElementById('userProfileImage').src = processedImageUrl;
        document.getElementById('userProfileName').textContent = name;
        document.getElementById('userProfileJob').textContent = job;
        
        // Get section name
        if (sectionId) {
            const sectionDoc = await db.collection('sections').doc(sectionId).get();
            if (sectionDoc.exists) {
                document.getElementById('userProfileSection').textContent = sectionDoc.data().name;
            }
        }
        
        // Hide edit form
        document.getElementById('editUserProfileForm').classList.add('hidden');
        
        // Show success message
        alert('تم تحديث البيانات بنجاح!');
    } catch (error) {
        console.error('خطأ في تحديث البيانات:', error);
        alert(`خطأ في تحديث البيانات: ${error.message}`);
    }
}

// عرض تفاصيل الشخص بشكل أنيق
async function showPersonDetails(person, personId, collectionName = 'persons') {
    try {
        // تحضير النافذة المنبثقة
        const modal = document.getElementById('userProfileModal');
        const content = document.getElementById('userProfileContent');
        
        // تخزين معرف الشخص للاستخدام لاحقًا
        content.dataset.personId = personId;
        
        // إخفاء نموذج التعديل إذا كان ظاهرًا
        const editForm = document.getElementById('editUserProfileForm');
        if (editForm) {
            editForm.classList.add('hidden');
        }
        
        // إخفاء زر التعديل للزوار
        const editBtn = document.getElementById('editUserProfileBtn');
        if (editBtn) {
            // إظهار زر التعديل فقط للمستخدمين المسجلين وأصحاب الملف الشخصي
            const currentUser = firebase.auth().currentUser;
            if (currentUser && person.userId === currentUser.uid) {
                editBtn.classList.remove('hidden');
            } else {
                editBtn.classList.add('hidden');
            }
        }
        
        // تعيين بيانات الشخص
        const profileImage = document.getElementById('userProfileImage');
        const profileName = document.getElementById('userProfileName');
        const profileJob = document.getElementById('userProfileJob');
        const profileSection = document.getElementById('userProfileSection');
        
        // تعيين الصورة مع معالجة الروابط
        let imageUrl = person.imageUrl || person.image;
        if (imageUrl) {
            // تحويل روابط imgBB إلى روابط مباشرة إذا لزم الأمر
            if (imageUrl.includes('ibb.co/') && !imageUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
                try {
                    imageUrl = await getDirectImageUrl(imageUrl);
                } catch (error) {
                    console.error('خطأ في معالجة رابط الصورة:', error);
                    imageUrl = 'img/default-avatar.png';
                }
            }
        } else {
            imageUrl = 'img/default-avatar.png';
        }
        
        profileImage.src = imageUrl;
        profileImage.onerror = function() {
            this.src = 'img/default-avatar.png';
            this.onerror = null;
        };
        
        // تعيين الاسم والوظيفة
        profileName.textContent = person.name || 'غير محدد';
        profileJob.textContent = person.job || 'غير محدد';
        
        // تعيين اسم القسم مباشرة من بيانات الشخص
        let sectionName = person.section || 'غير محدد';
        profileSection.textContent = sectionName;
        
        // إضافة معلومات إضافية إذا كانت متوفرة
        let additionalInfo = '';
        
        // إضافة رقم الهاتف إذا كان متوفرًا
        if (person.phone) {
            additionalInfo += `
            <div class="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
                <h4 class="text-lg font-semibold text-blue-400 mb-2">معلومات الاتصال</h4>
                <div class="flex items-center mb-2">
                    <i class="fas fa-phone text-gray-400 mr-3"></i>
                    <p class="text-gray-300">${person.phone}</p>
                </div>
                <button onclick="window.location.href='tel:${person.phone}'" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 w-full mt-2">
                    <i class="fas fa-phone-alt mr-2"></i> اتصال
                </button>
            </div>`;
        }
        
        // إضافة المدينة إذا كانت متوفرة
        if (person.city) {
            const cityName = person.city === 'duhok' || person.city === 'دهوك' ? 'دهوك' : 
                          person.city === 'zakho' || person.city === 'زاخو' ? 'زاخو' : person.city;
            
            additionalInfo += `
            <div class="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
                <h4 class="text-lg font-semibold text-blue-400 mb-2">الموقع</h4>
                <div class="flex items-center">
                    <i class="fas fa-map-marker-alt text-gray-400 mr-3"></i>
                    <p class="text-gray-300">${cityName}</p>
                </div>
            </div>`;
        }
        
        // إضافة المعلومات الإضافية إلى العنصر المناسب
        const additionalInfoContainer = document.querySelector('#userProfileContent .md\\:w-2\\/3');
        if (additionalInfoContainer) {
            additionalInfoContainer.innerHTML = additionalInfo || '<p class="text-gray-400 text-center mt-8">لا توجد معلومات إضافية</p>';
        }
        
        // إظهار النافذة المنبثقة
        modal.classList.remove('hidden');
        
        // إضافة حدث لزر الإغلاق
        const closeBtn = document.getElementById('closeUserProfileModal');
        if (closeBtn) {
            // إزالة أي أحداث سابقة لتجنب تكرار الأحداث
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
        
    } catch (error) {
        console.error('خطأ في عرض تفاصيل الشخص:', error);
        alert('حدث خطأ أثناء عرض تفاصيل الشخص. يرجى المحاولة مرة أخرى.');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('loginForm').reset();
    } catch (error) {
        alert(`خطأ في تسجيل الدخول: ${error.message}`);
    }
}

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
    } catch (error) {
        alert(`خطأ في تسجيل الخروج: ${error.message}`);
    }
}

// Load sections from Firestore
async function loadSections() {
    try {
        console.log('Loading sections from Firestore...');
        
        // Check if window.db is initialized
        if (!window.db) {
            console.error('Firestore is not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات');
            return;
        }
        
        // تحقق من حالة تسجيل الدخول قبل محاولة جلب البيانات
        const user = auth.currentUser;
        console.log('حالة تسجيل الدخول عند تحميل الأقسام:', user ? 'مسجل الدخول' : 'غير مسجل الدخول');
        
        // Try to get sections with error handling
        let snapshot;
        try {
            console.log('Attempting to fetch sections from server...');
            snapshot = await window.db.collection('sections').get();
            console.log('Sections fetched successfully:', snapshot.size, 'sections found');
        } catch (fetchError) {
            console.error('Error fetching sections:', fetchError);
            console.log('رمز الخطأ:', fetchError.code);
            console.log('رسالة الخطأ:', fetchError.message);
            
            // Show specific error message based on error code
            if (fetchError.code === 'unavailable') {
                alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
            } else if (fetchError.code === 'permission-denied') {
                alert('ليس لديك صلاحيات كافية للوصول إلى البيانات. يرجى تسجيل الدخول مرة أخرى.');
                
                // إعادة تسجيل الدخول تلقائيًا إذا كان المستخدم مسجل الدخول بالفعل
                if (auth.currentUser) {
                    console.log('محاولة إعادة تسجيل الدخول تلقائيًا...');
                    auth.signOut().then(() => {
                        // إعادة تحميل الصفحة بعد تسجيل الخروج
                        window.location.reload();
                    });
                }
            } else {
                alert('حدث خطأ أثناء تحميل البيانات: ' + fetchError.message);
            }
            
            // Return empty snapshot if server fetch fails
            return { empty: true, forEach: () => {} };
        }
        
        // Clear existing sections
        const categoryFilters = document.getElementById('categoryFilters');
        const personSection = document.getElementById('personSection');
        const editPersonSection = document.getElementById('editPersonSection');
        
        // Keep the 'All' filter
        categoryFilters.innerHTML = `
            <button class="category-filter active bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg transition duration-300" data-category="all">الكل</button>
        `;
        
        // Clear dropdown options
        personSection.innerHTML = '';
        editPersonSection.innerHTML = '';
        
        // Add sections to filters and dropdowns
        snapshot.forEach(doc => {
            const section = doc.data();
            const sectionId = doc.id;
            
            // Add to category filters
            const filterButton = document.createElement('button');
            filterButton.className = 'category-filter bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200 transition duration-300';
            filterButton.setAttribute('data-category', section.name);
            filterButton.textContent = section.name;
            categoryFilters.appendChild(filterButton);
            
            // Add to person section dropdown
            const option = document.createElement('option');
            option.value = section.name;
            option.textContent = section.name;
            personSection.appendChild(option);
            
            // Add to edit person section dropdown
            const editOption = document.createElement('option');
            editOption.value = section.name;
            editOption.textContent = section.name;
            editPersonSection.appendChild(editOption);
        });
        
        // Add event listeners to category filters
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                // تحقق من حالة تسجيل الدخول للتصفية
                const user = auth.currentUser;
                if (!user) {
                    // إذا كان زائر، نعرض رسالة تشجيع للتسجيل
                    Swal.fire({
                        title: 'ميزة متاحة للمستخدمين المسجلين فقط',
                        text: 'قم بتسجيل الدخول للوصول إلى ميزة تصفية البطاقات حسب القسم',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'تسجيل الدخول',
                        cancelButtonText: 'لاحقاً'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            document.getElementById('loginBtn').click();
                        }
                    });
                    return;
                }
                
                // للمستخدمين المسجلين: تطبيق التصفية
                // Remove active class from all filters
                filters.forEach(f => {
                    f.classList.remove('active', 'bg-blue-100', 'dark:bg-blue-900', 'text-blue-800', 'dark:text-blue-200');
                    f.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                });
                
                // Add active class to clicked filter
                filter.classList.add('active', 'bg-blue-100', 'dark:bg-blue-900', 'text-blue-800', 'dark:text-blue-200');
                filter.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                
                // Filter persons
                const category = filter.getAttribute('data-category');
                filterPersonsByCategory(category);
            });
        });
        
        
        // Also update the sections table in admin dashboard
        updateSectionsTable(snapshot);
        
    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

// Update sections table in admin dashboard
function updateSectionsTable(snapshot) {
    console.log('Updating sections table in admin dashboard...');
    
    const sectionsTableBody = document.getElementById('sectionsTableBody');
    if (!sectionsTableBody) {
        console.error('Sections table body element not found');
        return;
    }
    
    sectionsTableBody.innerHTML = '';
    
    let sectionCount = 0;
    
    snapshot.forEach(doc => {
        const section = doc.data();
        const sectionId = doc.id;
        
        console.log('Adding section to table:', sectionId, section.name);
        sectionCount++;
        
        const row = document.createElement('tr');
        row.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
        row.innerHTML = `
            <td class="px-6 py-4">${section.name}</td>
            <td class="px-6 py-4">${section.description}</td>
            <td class="px-6 py-4">
                <button class="edit-section-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-2" data-id="${sectionId}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-section-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${sectionId}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        sectionsTableBody.appendChild(row);
        
        // Add event listeners to edit and delete buttons
        const editButton = row.querySelector('.edit-section-btn');
        if (editButton) {
            editButton.addEventListener('click', () => {
                console.log('Edit section button clicked for:', sectionId);
                openEditSectionModal(sectionId);
            });
        } else {
            console.error('Edit section button not found for section:', sectionId);
        }
        
        const deleteButton = row.querySelector('.delete-section-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                console.log('Delete section button clicked for:', sectionId);
                openDeleteSectionConfirmation(sectionId);
            });
        } else {
            console.error('Delete section button not found for section:', sectionId);
        }
    });
    
    console.log('Sections table updated with', sectionCount, 'sections');
    
    // Note: Event listeners are now added directly to each row when created
}

// Load persons from Firestore
async function loadPersons() {
    console.log('بدء تحميل قائمة الأشخاص...');
    try {
        // Check if window.db is initialized
        if (!window.db) {
            console.error('Firestore is not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات');
            return;
        }
        
        // الحصول على المدينة المختارة
        window.selectedCity = localStorage.getItem('selectedCity') || 'duhok';
        console.log('تحميل البيانات للمدينة:', window.selectedCity);
        
        // تحقق من حالة تسجيل الدخول
        const user = auth.currentUser;
        console.log('حالة تسجيل الدخول عند تحميل الأشخاص:', user ? `مسجل الدخول (${user.uid})` : 'غير مسجل الدخول');
        
        // عرض رسالة تحميل للزوار مع تشجيعهم على التسجيل
        const personsGrid = document.getElementById('personsGrid');
        if (!user && personsGrid) {
            window.isVisitor = true; // تأكيد حالة الزائر
            personsGrid.innerHTML = `
                <div class="col-span-full flex justify-center items-center p-10">
                    <div class="text-center">
                        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p class="text-lg">جاري تحميل البطاقات في مدينة ${window.selectedCity === 'duhok' ? 'دهوك' : 'زاخو'}...</p>
                        <div class="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 shadow-lg">
                            <p class="text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">قم بتسجيل الدخول للحصول على ميزات إضافية!</p>
                            <p class="text-gray-600 dark:text-gray-300 mt-2">يمكنك تصفية البطاقات حسب المدينة والقسم بعد تسجيل الدخول</p>
                            <button id="loginPromptBtn" class="mt-3 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
                                <i class="fas fa-sign-in-alt mr-2"></i> تسجيل الدخول
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // إضافة مستمع حدث لزر تسجيل الدخول
            setTimeout(() => {
                const loginPromptBtn = document.getElementById('loginPromptBtn');
                if (loginPromptBtn) {
                    loginPromptBtn.addEventListener('click', () => {
                        document.getElementById('loginBtn').click();
                    });
                }
            }, 500);
        }
        
        // متغيرات لتخزين دور المستخدم
        let userRole = 'visitor'; // زائر افتراضيًا
        let userId = null;
        let userPeopleId = null;
        
        // إذا كان المستخدم مسجل الدخول، تحقق من دوره
        if (user) {
            userId = user.uid;
            try {
                // التحقق إذا كان المستخدم مطور (superadmin)
                const adminDoc = await db.collection('admins').doc(user.uid).get();
                if (adminDoc.exists) {
                    const adminData = adminDoc.data();
                    if (adminData.role === 'superadmin') {
                        userRole = 'superadmin';
                        console.log('دور المستخدم: مطور (superadmin)');
                    } else {
                        userRole = 'admin';
                        console.log('دور المستخدم: مشرف (admin)');
                    }
                } else {
                    // التحقق إذا كان المستخدم صاحب أعمال (user عادي)
                    const peopleQuery = await db.collection('people').where('userId', '==', user.uid).get();
                    if (!peopleQuery.empty) {
                        userRole = 'user';
                        userPeopleId = peopleQuery.docs[0].id;
                        console.log('دور المستخدم: صاحب أعمال (user)');
                    }
                }
            } catch (roleError) {
                console.error('خطأ في التحقق من دور المستخدم:', roleError);
            }
        }
        
        // تحديد المجموعة التي سيتم تحميلها بناءً على دور المستخدم
        let collectionToLoad;
        let queryConstraints = [];
        let loadBothCollections = false; // متغير للتحكم في تحميل كلا المجموعتين
        
        // الحصول على المدينة المختارة من فلتر المدينة للمستخدمين المسجلين
        if (user) {
            const cityFilter = document.getElementById('cityFilter');
            if (cityFilter) {
                // استخدام قيمة فلتر المدينة إذا كان المستخدم مسجل الدخول
                window.selectedCity = cityFilter.value;
                localStorage.setItem('selectedCity', window.selectedCity);
                console.log('تم تحديث المدينة المختارة من فلتر المدينة:', window.selectedCity);
            }
        }
        
        // إضافة قيد المدينة للاستعلام
        // تحويل المدينة المختارة إلى الصيغة المناسبة (أحرف صغيرة) لتتطابق مع القيمة المخزنة
        const normalizedCity = selectedCity.toLowerCase();
        console.log('المدينة المختارة بعد التحويل:', normalizedCity);
        
        // تحديد المدن المقابلة للمدينة المختارة
        let cityValues = [];
        console.log('المدينة المختارة قبل التحويل:', selectedCity);
        console.log('المدينة المختارة بعد التحويل:', normalizedCity);
        
        // تحسين التعرف على المدن بإضافة المزيد من الاحتمالات
        if (normalizedCity === 'duhok' || normalizedCity === 'دهوك' || normalizedCity.includes('duhok') || normalizedCity.includes('دهوك')) {
            // إضافة جميع الاحتمالات الممكنة لمدينة دهوك بالعربية والإنجليزية
            cityValues = [
                'duhok', 'Duhok', 'DUHOK', 'duhok ', ' duhok', ' duhok ',
                'دهوك', 'دهوك ', ' دهوك', ' دهوك ', 'دهوك  ', '  دهوك'
            ];
            console.log('تم تحديد مدينة دهوك مع كل الاحتمالات');
        } else if (normalizedCity === 'zakho' || normalizedCity === 'زاخو' || normalizedCity.includes('zakho') || normalizedCity.includes('زاخو')) {
            // إضافة جميع الاحتمالات الممكنة لمدينة زاخو بالعربية والإنجليزية
            cityValues = [
                'zakho', 'Zakho', 'ZAKHO', 'zakho ', ' zakho', ' zakho ',
                'زاخو', 'زاخو ', ' زاخو', ' زاخو ', 'زاخو  ', '  زاخو'
            ];
            console.log('تم تحديد مدينة زاخو مع كل الاحتمالات');
        } else if (normalizedCity) {
            // للمدن الأخرى، نضيف الاسم الأصلي مع بعض الاحتمالات
            cityValues = [normalizedCity, normalizedCity + ' ', ' ' + normalizedCity];
            console.log('تم تحديد مدينة أخرى:', normalizedCity);
        } else {
            console.log('لم يتم تحديد مدينة');
        }
        
        // استخدام where in للبحث عن المدينة بجميع الصيغ المحتملة
        // تأكد من أن قيود المدينة تعمل بشكل صحيح للزوار
        if (cityValues.length > 0) {
            // إضافة قيد المدينة فقط إذا كان المستخدم ليس زائرًا أو إذا كان زائرًا وتم تحديد مدينة
            queryConstraints.push(['city', 'in', cityValues]);
            console.log('تم إضافة قيد المدينة:', normalizedCity, 'مع القيم المقابلة:', cityValues);
        } else {
            console.error('خطأ: لم يتم تحديد قيم المدينة بشكل صحيح');
        }
        
        if (userRole === 'superadmin') {
            // المطور يمكنه الوصول إلى جميع المجموعات
            collectionToLoad = 'persons'; // افتراضيًا نعرض مجموعة persons
        } else if (userRole === 'admin') {
            // المشرف يمكنه الوصول إلى مجموعة persons فقط
            collectionToLoad = 'persons';
        } else if (userRole === 'user') {
            // صاحب الأعمال يمكنه الوصول إلى بياناته الخاصة في مجموعة people
            // وأيضًا يمكنه رؤية بياناته في مجموعة persons (إذا كانت موجودة)
            loadBothCollections = true; // تفعيل تحميل كلا المجموعتين
            collectionToLoad = 'people';
            if (userPeopleId) {
                // استبدال قيد المعرف بقيد المعرف والمدينة
                queryConstraints = [];
                queryConstraints.push(['id', '==', userPeopleId]);
                queryConstraints.push(['city', '==', selectedCity]);
            }
        } else {
            // الزائر يمكنه الوصول إلى جميع بيانات مجموعة persons
            console.log('دخول كزائر: عرض البيانات حسب المدينة المحددة');
            collectionToLoad = 'persons';
            
            // إعادة تعيين قيود الاستعلام للزوار
            queryConstraints = [];
            
            // تفعيل قيود المدينة للزوار لضمان ظهور البطاقات في المدينة الصحيحة
            window.isVisitor = true; // تأكيد حالة الزائر
            
            // تطبيق قيود المدينة للزوار
            if (cityValues && cityValues.length > 0) {
                // لا نضيف قيود المدينة هنا، سنطبقها لاحقاً في استعلام Firestore
                console.log('سيتم تطبيق فلتر المدينة للزائر في استعلام Firestore');
            } else {
                console.log('لم يتم تحديد مدينة للزائر أو القيم غير صالحة - سيتم عرض جميع البطاقات');
            }
            
            console.log('تم تفعيل عرض البطاقات للزوار حسب المدينة المحددة:', selectedCity);
            console.log('قيود الاستعلام للزائر:', JSON.stringify(queryConstraints));
            console.log('حالة الزائر في بداية الاستعلام:', window.isVisitor);
        }
        
        try {
            // Clear existing persons
            const personsGrid = document.getElementById('personsGrid');
            if (!personsGrid) {
                console.error('لم يتم العثور على عنصر personsGrid في الصفحة');
                return;
            }
            personsGrid.innerHTML = '';
            console.log('تم مسح العناصر السابقة من الشبكة');
            
            // تطبيق استجابة الشاشة على شبكة العرض
            handleScreenResize();
            
            // تحقق من حالة تسجيل الدخول قبل محاولة جلب البيانات
            const user = auth.currentUser;
            console.log('حالة تسجيل الدخول:', user ? 'مسجل الدخول' : 'غير مسجل الدخول');
            
            // التأكد من تعيين حالة الزائر بشكل صحيح
            if (!user) {
                window.isVisitor = true;
                console.log('تم تعيين حالة المستخدم كزائر بشكل صريح');
            }
            
            // Load persons based on user role and collection
            console.log(`جاري جلب بيانات الأشخاص من مجموعة ${collectionToLoad}...`);
            let personsSnapshot;
            // تعريف peopleSnapshot كمتغير عام لتجنب التعارض مع التعريفات الأخرى
            window.peopleSnapshot = null; // متغير لتخزين بيانات مجموعة people
            
            try {
                let query = window.db.collection(collectionToLoad);
                
                // تطبيق القيود المحددة للاستعلام إن وجدت
                if (window.isVisitor) {
                    // للزوار: تطبيق فلتر المدينة بناءً على المدينة المحددة في localStorage
                    console.log('تطبيق استعلام خاص للزوار');
                    
                    // الحصول على المدينة المحددة من localStorage
                    window.selectedCity = localStorage.getItem('selectedCity') || 'duhok';
                    console.log('المدينة المحددة للزائر من localStorage:', window.selectedCity);
                    
                    // تحويل المدينة إلى أحرف صغيرة للمقارنة
                    const normalizedCity = window.selectedCity.toLowerCase();
                    
                    // تحديد قيم المدن للفلترة
                    let cityFilter = [];
                    if (normalizedCity === 'duhok' || normalizedCity === 'دهوك') {
                        cityFilter = ['duhok', 'دهوك', 'Duhok', 'DUHOK'];
                    } else if (normalizedCity === 'zakho' || normalizedCity === 'زاخو') {
                        cityFilter = ['zakho', 'زاخو', 'Zakho', 'ZAKHO'];
                    }
                    
                    console.log('قيم المدن المتاحة للفلترة:', JSON.stringify(cityFilter));
                    
                    // للزوار، نعرض البطاقات بناءً على المدينة المحددة
                    if (cityFilter.length > 0) {
                        console.log('تطبيق فلتر المدينة للزائر');
                        // استخدام استعلام مرن باستخدام قيم المدن المحددة
                        // تعليق الفلتر للسماح للزوار برؤية جميع البطاقات
                        // query = query.where('city', 'in', cityFilter);
                    } else {
                        // إذا لم يتم تحديد قيم للمدينة، نعرض جميع البطاقات
                        console.log('لا توجد قيم مدينة محددة للزائر - سيتم عرض جميع البطاقات');
                    }
                    console.log('تم تعطيل فلتر المدينة للزوار للسماح بعرض جميع البطاقات');
                    
                    // تم إزالة رسالة تصفية متقدمة للبطاقات للزوار
                    setTimeout(() => {
                        const personsGrid = document.getElementById('personsGrid');
                        if (personsGrid && window.isVisitor) {
                            // تم إزالة رسالة تشجيع للتسجيل في أعلى الشبكة
                            
                            // إضافة مستمع حدث لزر تسجيل الدخول للتصفية
                            setTimeout(() => {
                                const filterLoginBtn = document.getElementById('filterLoginBtn');
                                if (filterLoginBtn) {
                                    filterLoginBtn.addEventListener('click', () => {
                                        // فتح نافذة تسجيل الدخول
                                        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                                        loginModal.show();
                                    });
                                }
                            }, 100);
                            
                            // تم إضافة العنصر بالفعل في الخطوة السابقة
                            
                            // إضافة مستمع حدث لزر تسجيل الدخول
                            const filterLoginBtn = document.getElementById('filterLoginBtn');
                            if (filterLoginBtn) {
                                filterLoginBtn.addEventListener('click', () => {
                                    document.getElementById('loginBtn').click();
                                });
                            }
                        }
                    }, 1000); // تأخير لضمان تحميل البطاقات أولاً
                } else if (queryConstraints.length > 0) {
                    // للمستخدمين المسجلين: تطبيق القيود العادية
                    for (const [field, operator, value] of queryConstraints) {
                        console.log(`تطبيق قيد: ${field} ${operator} ${value}`);
                        
                        // التحقق من صحة القيم قبل تطبيق القيد
                        if (value !== undefined && value !== null) {
                            query = query.where(field, operator, value);
                        } else {
                            console.error(`قيمة غير صالحة للحقل ${field}: ${value}`);
                        }
                    }
                    // طباعة الاستعلام النهائي للتصحيح
                    console.log('الاستعلام النهائي:', JSON.stringify(queryConstraints));
                } else {
                    console.log('لا توجد قيود استعلام محددة');
                }
                
                // ترتيب البيانات حسب تاريخ الإنشاء للزوار
                if (window.isVisitor) {
                    // إزالة القيد على عدد السجلات للزائر لعرض جميع البطاقات عند التصفية
                    query = query.orderBy('createdAt', 'desc');
                    console.log('تم إزالة القيد على عدد السجلات للزائر لعرض جميع البطاقات');
                    
                    // طباعة الاستعلام النهائي للزوار للتصحيح
                    console.log('الاستعلام النهائي للزوار قبل التنفيذ:', query);
                    
                    // التأكد من أن الزائر يمكنه رؤية البطاقات
                    console.log('حالة الزائر:', window.isVisitor);
                    console.log('المدينة المحددة للزائر:', window.selectedCity);
                }
                
                // تنفيذ الاستعلام وجلب البيانات
                console.log('بدء تنفيذ الاستعلام للمجموعة:', collectionToLoad);
                console.log('حالة الزائر قبل تنفيذ الاستعلام:', window.isVisitor);
                console.log('المدينة المحددة قبل تنفيذ الاستعلام:', window.selectedCity);
                console.log('قيود الاستعلام النهائية:', JSON.stringify(queryConstraints));
                
                try {
                    console.log('جاري تنفيذ الاستعلام...');
                    personsSnapshot = await query.get();
                    console.log(`تم جلب ${personsSnapshot.size} شخص من مجموعة ${collectionToLoad}`);
                    
                    // تسجيل معلومات إضافية للتشخيص
                    if (window.isVisitor) {
                        console.log('نتائج الاستعلام للزائر:', personsSnapshot.size);
                        if (personsSnapshot.size === 0) {
                            console.log('لم يتم العثور على بطاقات للزائر. تحقق من قواعد الأمان وقيود الاستعلام.');
                        }
                    }
                } catch (queryError) {
                    console.error('خطأ في تنفيذ الاستعلام:', queryError);
                    console.error('رمز الخطأ:', queryError.code);
                    console.error('رسالة الخطأ:', queryError.message);
                    throw queryError;
                }
                
                // طباعة معلومات تفصيلية عن البيانات التي تم جلبها
                if (personsSnapshot.size === 0) {
                    console.log('لم يتم العثور على بيانات للمدينة المحددة:', window.selectedCity);
                } else {
                    console.log('تم العثور على بيانات للمدينة المحددة:', window.selectedCity);
                    // طباعة المدن الموجودة في النتائج
                    const cities = new Set();
                    personsSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.city) {
                            cities.add(data.city);
                        }
                    });
                    console.log('المدن الموجودة في النتائج:', Array.from(cities));
                }
                
                // إذا كان المستخدم صاحب أعمال وتم تفعيل خيار تحميل كلا المجموعتين
                if (loadBothCollections && userRole === 'user' && userId) {
                    console.log('جاري جلب بيانات الأشخاص من مجموعة persons لصاحب الأعمال...');
                    // البحث عن بيانات المستخدم في مجموعة persons
                    const personsQuery = window.db.collection('persons').where('userId', '==', userId);
                    window.peopleSnapshot = await personsQuery.get();
                    console.log(`تم جلب ${window.peopleSnapshot.size} شخص من مجموعة persons لصاحب الأعمال`);
                }
            } catch (personsError) {
                console.error(`خطأ في جلب بيانات الأشخاص من مجموعة ${collectionToLoad}:`, personsError);
                console.log('رمز الخطأ:', personsError.code);
                console.log('رسالة الخطأ:', personsError.message);
                
                if (personsError.code === 'permission-denied') {
                    console.log('خطأ في الصلاحيات عند محاولة جلب بيانات الأشخاص');
                    
                    // التعامل مع الخطأ بشكل مختلف للزوار والمستخدمين المسجلين
                    if (auth.currentUser) {
                        // للمستخدمين المسجلين: إعادة تسجيل الدخول
                        console.log('محاولة إعادة تسجيل الدخول تلقائيًا...');
                        alert('ليس لديك صلاحيات كافية للوصول إلى بيانات الأشخاص. سيتم تسجيل خروجك وإعادة تحميل الصفحة.');
                        auth.signOut().then(() => {
                            // إعادة تحميل الصفحة بعد تسجيل الخروج
                            window.location.reload();
                        });
                    } else {
                        // للزوار: عرض رسالة أكثر ودية
                        console.log('زائر يحاول الوصول إلى بيانات محمية');
                        const personsGrid = document.getElementById('personsGrid');
                        personsGrid.innerHTML = `
                            <div class="col-span-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg text-center">
                                <i class="fas fa-lock text-4xl mb-4"></i>
                                <h3 class="text-xl font-bold mb-2">هذه البيانات محمية</h3>
                                <p class="mb-4">يمكنك الوصول إلى بيانات محدودة فقط كزائر. للوصول إلى المزيد من البيانات، يرجى تسجيل الدخول.</p>
                                <button id="loginPromptError" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300">
                                    <i class="fas fa-sign-in-alt ml-2"></i>تسجيل الدخول
                                </button>
                            </div>
                        `;
                        
                        // إضافة حدث النقر على زر تسجيل الدخول
                        document.getElementById('loginPromptError').addEventListener('click', () => {
                            document.getElementById('loginModal').classList.remove('hidden');
                        });
                    }
                    return; // الخروج من الدالة في حالة وجود خطأ في الصلاحيات
                }
                
                // إذا كان هناك خطأ آخر، نستمر بمجموعة فارغة
                personsSnapshot = { empty: true, forEach: () => {}, size: 0 };
            }
            
            // تم إزالة رسالة تنبيه الزوار بناءً على طلب المستخدم
            
            // التحقق من وجود بطاقات للعرض
            if (personsSnapshot.size === 0) {
                // عرض رسالة عندما لا توجد بطاقات للمدينة المحددة
                personsGrid.innerHTML = `
                    <div class="col-span-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg text-center">
                        <i class="fas fa-info-circle text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">لا توجد بطاقات متاحة</h3>
                        <p class="mb-4">لم يتم العثور على بطاقات في مدينة ${window.selectedCity === 'duhok' ? 'دهوك' : 'زاخو'}. يرجى تجربة مدينة أخرى.</p>
                        <div class="flex justify-center space-x-4 space-x-reverse">
                            <button id="tryOtherCityBtn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300">
                                <i class="fas fa-map-marker-alt ml-2"></i>تجربة مدينة أخرى
                            </button>
                        </div>
                    </div>
                `;
                
                // إضافة حدث النقر على زر تجربة مدينة أخرى
                document.getElementById('tryOtherCityBtn').addEventListener('click', () => {
                    // تبديل المدينة المحددة
                    const newCity = window.selectedCity === 'duhok' ? 'zakho' : 'duhok';
                    localStorage.setItem('selectedCity', newCity);
                    window.selectedCity = newCity;
                    // تحديث مؤشر المدينة
                    updateCityIndicator();
                    // إعادة تحميل البيانات
                    loadPersons();
                });
                
                return; // الخروج من الدالة بعد عرض الرسالة
            }
            
            // Add persons to grid
            personsSnapshot.forEach(doc => {
                const person = doc.data();
                const personId = doc.id;
                
                // إذا كان الزائر قد حدد مدينة، نعرض فقط البطاقات المطابقة للمدينة المحددة
                if (window.isVisitor) {
                    const normalizedCity = window.selectedCity.toLowerCase();
                    const personCity = (person.city || '').toLowerCase();
                    
                    // تحقق مما إذا كانت المدينة مطابقة
                    const isDuhokMatch = (normalizedCity === 'duhok' || normalizedCity === 'دهوك') && 
                                       (personCity === 'duhok' || personCity === 'دهوك' || personCity === 'دهوك' || personCity === 'duhok');
                    const isZakhoMatch = (normalizedCity === 'zakho' || normalizedCity === 'زاخو') && 
                                       (personCity === 'zakho' || personCity === 'زاخو' || personCity === 'زاخو' || personCity === 'zakho');
                    
                    // إذا لم تكن المدينة مطابقة، نتخطى هذه البطاقة
                    if (!isDuhokMatch && !isZakhoMatch) {
                        console.log(`تخطي بطاقة لأن المدينة غير مطابقة: ${person.city} != ${window.selectedCity}`);
                        return;
                    }
                }
                
                const card = document.createElement('div');
                card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center person-card';
                card.setAttribute('data-category', person.section);
                
                // تحسين عرض الصور على الأجهزة المحمولة
                const imageUrl = convertImgBBUrl(person.image) || 'img/default-avatar.png';
                
                card.innerHTML = `
                    <div class="image-container mb-4">
                        <img src="${imageUrl}" alt="${person.name}" class="w-32 h-32 object-cover rounded-full" onerror="this.src='img/default-avatar.png'; this.onerror=null;">
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2 text-center">${person.name}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-1 text-center">${person.job}</p>
                    <span class="text-sm text-blue-600 dark:text-blue-400 text-center">${person.section}</span>
                    <div class="city-badge">${person.city === 'zakho' || person.city === 'زاخو' ? 'مدينة زاخو' : 'مدينة دهوك'}</div>
                    <div class="card-actions">
                        <button class="action-btn view-btn" title="عرض التفاصيل"><i class="fas fa-eye"></i></button>
                        ${person.phone ? `<button class="action-btn call-btn" title="اتصال"><i class="fas fa-phone"></i></button>` : ''}
                    </div>
                `;
                
                // إضافة أحداث النقر للبطاقة وأزرار التفاعل
                const viewDetailsHandler = () => {
                    // عرض التفاصيل الكاملة لجميع المستخدمين (بما في ذلك الزوار)
                    showPersonDetails(person, personId, collectionToLoad);
                };
                
                // إضافة حدث النقر للبطاقة نفسها
                card.addEventListener('click', (e) => {
                    // تجاهل النقر إذا كان على الأزرار
                    if (!e.target.closest('.card-actions')) {
                        viewDetailsHandler();
                    }
                });
                
                // إضافة أحداث النقر لأزرار التفاعل
                const viewBtn = card.querySelector('.view-btn');
                const callBtn = card.querySelector('.call-btn');
                
                if (viewBtn) {
                    viewBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // منع انتشار الحدث للبطاقة
                        viewDetailsHandler();
                    });
                }
                
                
                if (callBtn && person.phone) {
                    callBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // منع انتشار الحدث للبطاقة
                        // السماح لجميع المستخدمين (بما في ذلك الزوار) بالاتصال
                        window.location.href = `tel:${person.phone}`;
                    });
                }
                
                personsGrid.appendChild(card);
            });
            
            // تطبيق الأنماط على البطاقات بعد إضافتها
            applyCardStyles();
            
            // Load registered users from 'people' collection
            console.log('جاري جلب بيانات المستخدمين المسجلين من Firestore...');
            // تهيئة peopleSnapshot بقيم افتراضية لتجنب الأخطاء
            if (!window.peopleSnapshot) {
                window.peopleSnapshot = { 
                    empty: true, 
                    forEach: (callback) => {}, 
                    size: 0,
                    docs: []
                };
            }
            try {
                if (window.db && typeof window.db.collection === 'function') {
                    window.peopleSnapshot = await window.db.collection('people').get();
                    console.log(`تم جلب ${window.peopleSnapshot.size} مستخدم مسجل من مجموعة people`);
                } else {
                    console.error('خطأ: window.db غير معرف أو غير مهيأ بشكل صحيح');
                }
            } catch (peopleError) {
                console.error('خطأ في جلب بيانات المستخدمين المسجلين:', peopleError);
                console.log('رمز الخطأ:', peopleError.code);
                console.log('رسالة الخطأ:', peopleError.message);
                
                if (peopleError.code === 'permission-denied') {
                    console.log('خطأ في الصلاحيات عند محاولة جلب بيانات المستخدمين المسجلين');
                    // لا نعرض تنبيه هنا لأننا عرضنا تنبيه سابقًا في حالة خطأ جلب بيانات الأشخاص
                    
                    // إذا لم نقم بتسجيل الخروج سابقًا، نقوم بذلك الآن
                    if (auth.currentUser) {
                        console.log('محاولة إعادة تسجيل الدخول تلقائيًا...');
                        auth.signOut().then(() => {
                            // إعادة تحميل الصفحة بعد تسجيل الخروج
                            window.location.reload();
                        });
                    }
                    return; // الخروج من الدالة في حالة وجود خطأ في الصلاحيات
                }
                
                // إذا كان هناك خطأ آخر، نستمر بمجموعة فارغة
                window.peopleSnapshot = { 
                    empty: true, 
                    forEach: (callback) => {}, 
                    size: 0,
                    docs: [] 
                };
            }
            
            // Add registered users to grid
            const sectionPromises = [];
            
            window.peopleSnapshot.forEach(doc => {
                const person = doc.data();
                const personId = doc.id;
                
                // Skip if no section (incomplete profile)
                if (!person.sectionId) return;
                
                // Get section name - add to promises array to handle all at once
                const promise = (async () => {
                    let sectionName = '';
                    try {
                        const sectionDoc = await db.collection('sections').doc(person.sectionId).get();
                        if (sectionDoc.exists) {
                            sectionName = sectionDoc.data().name;
                        }
                    } catch (error) {
                        console.error('خطأ في جلب اسم القسم:', error);
                        console.log('رمز الخطأ:', error.code);
                        console.log('رسالة الخطأ:', error.message);
                        
                        // إذا كان الخطأ بسبب عدم وجود صلاحيات
                        if (error.code === 'permission-denied') {
                            console.log('خطأ في الصلاحيات عند محاولة جلب اسم القسم');
                            sectionName = 'غير متاح - خطأ في الصلاحيات';
                        }
                    }
                    
                    const card = document.createElement('div');
                    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center person-card';
                    card.setAttribute('data-category', sectionName);
                    
                    // تحسين عرض الصور على الأجهزة المحمولة
                    const imageUrl = await getDirectImageUrl(person.imageUrl);
                    
                    card.innerHTML = `
                        <div class="image-container mb-4">
                            <img src="${imageUrl}" alt="${person.name}" class="w-32 h-32 object-cover rounded-full" onerror="this.src='img/default-avatar.png'; this.onerror=null;">
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2 text-center">${person.name}</h3>
                        <p class="text-gray-600 dark:text-gray-300 mb-1 text-center">${person.job}</p>
                        <span class="text-sm text-blue-600 dark:text-blue-400 text-center">${sectionName}</span>
                    `;
                    
                    personsGrid.appendChild(card);
                })();
                
                sectionPromises.push(promise);
            });
            
            // Wait for all section promises to complete
            await Promise.all(sectionPromises);
            
            console.log('تم إضافة جميع الأشخاص والمستخدمين المسجلين إلى الشبكة بنجاح');
            
            // Also update the persons table in admin dashboard
            try {
                console.log('جاري تحديث جدول الأشخاص في لوحة التحكم...');
                
                // إذا كان لدينا بيانات من مجموعة people أيضًا، نقوم بدمجها مع بيانات persons
                if (window.peopleSnapshot && !window.peopleSnapshot.empty) {
                    console.log('دمج بيانات من مجموعتي persons و people في جدول الأشخاص...');
                    // نقوم بتحديث الجدول بكلا المجموعتين
                    updatePersonsTable(personsSnapshot, window.peopleSnapshot);
                } else {
                    // تحديث الجدول بمجموعة واحدة فقط
                    updatePersonsTable(personsSnapshot);
                }
                
                console.log('تم تحديث جدول الأشخاص بنجاح');
            } catch (tableError) {
                console.error('خطأ في تحديث جدول الأشخاص:', tableError);
                // لا نعرض رسالة خطأ للمستخدم هنا لأن هذا قد يكون بسبب عدم وجود الجدول في الصفحة الحالية
            }
            
            console.log('اكتمل تحميل قائمة الأشخاص بنجاح');
        } catch (fetchError) {
            console.error('Error fetching persons:', fetchError);
            
            // Show specific error message based on error code
            if (fetchError.code === 'unavailable') {
                alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
            } else if (fetchError.code === 'permission-denied') {
                alert('ليس لديك صلاحيات كافية للوصول إلى البيانات. يرجى تسجيل الدخول مرة أخرى.');
                // إعادة تسجيل الدخول تلقائيًا إذا كان المستخدم مسجل الدخول بالفعل
                if (auth.currentUser) {
                    console.log('محاولة إعادة تسجيل الدخول تلقائيًا...');
                    auth.signOut().then(() => {
                        // إعادة تحميل الصفحة بعد تسجيل الخروج
                        window.location.reload();
                    });
                }
            } else {
                alert('حدث خطأ أثناء تحميل البيانات: ' + fetchError.message);
            }
        }
    } catch (error) {
        console.error('Error loading persons:', error);
        alert('حدث خطأ غير متوقع أثناء تحميل البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
    }
}

// Update persons table in admin dashboard
function updatePersonsTable(snapshot, secondSnapshot = null) {
    const personsTableBody = document.getElementById('personsTableBody');
    if (!personsTableBody) {
        console.log('لم يتم العثور على عنصر personsTableBody، قد تكون في صفحة غير صفحة الإدارة');
        return; // لا نقوم بتحديث الجدول إذا لم يكن موجودًا في الصفحة الحالية
    }
    personsTableBody.innerHTML = '';
    console.log('جاري تحديث جدول الأشخاص...');
    
    // الحصول على المدينة المختارة
    const selectedCity = localStorage.getItem('selectedCity') || 'duhok';
    const normalizedCity = selectedCity.toLowerCase();
    
    // تحديد المدن المقابلة للمدينة المختارة
    let cityValues = [];
    if (normalizedCity === 'duhok') {
        cityValues = ['duhok', 'دهوك'];
    } else if (normalizedCity === 'zakho') {
        cityValues = ['zakho', 'زاخو'];
    } else {
        cityValues = [normalizedCity];
    }
    
    console.log('تحديث جدول الأشخاص للمدينة:', normalizedCity, 'مع القيم المقابلة:', cityValues);
    
    // إضافة بيانات من المجموعة الأولى (persons أو people)
    snapshot.forEach(doc => {
        const person = doc.data();
        const personId = doc.id;
        const collectionName = doc.ref.parent.id; // اسم المجموعة التي ينتمي إليها المستند
        
        // تطبيق فلترة المدينة - عرض فقط الأشخاص في المدينة المختارة
        const personCity = (person.city || '');
        // تحويل المدينة إلى أحرف صغيرة للمقارنة
        const personCityLower = personCity.toLowerCase();
        // طباعة معلومات تصحيح الأخطاء
        console.log('مدينة الشخص:', personCity, 'بعد التحويل:', personCityLower);
        // التحقق من وجود المدينة في القائمة (بالأحرف الصغيرة أو العربية)
        if (!cityValues.includes(personCityLower) && !cityValues.includes(personCity)) {
            console.log('تخطي الشخص لأن مدينته غير مطابقة للمدينة المختارة');
            return; // تخطي هذا الشخص إذا لم يكن في المدينة المختارة
        }
        
        const row = document.createElement('tr');
        row.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
        
        // تحسين عرض الصور في جدول الأشخاص
        const imageUrl = convertImgBBUrl(person.image) || 'img/default-avatar.png';
        
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex justify-center">
                    <img src="${imageUrl}" alt="${person.name}" class="w-10 h-10 object-cover rounded-full" onerror="this.src='img/default-avatar.png'">
                </div>
            </td>
            <td class="px-6 py-4 text-center">${person.name}</td>
            <td class="px-6 py-4 text-center">${person.job}</td>
            <td class="px-6 py-4 text-center">${person.section}</td>
            <td class="px-6 py-4 text-center">${person.city || 'غير محدد'}</td>
            <td class="px-6 py-4 text-center">
                <button class="edit-person-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-2" data-id="${personId}" data-collection="${collectionName}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-person-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${personId}" data-collection="${collectionName}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        personsTableBody.appendChild(row);
    });
    
    // إذا كانت هناك مجموعة ثانية (people)، نضيف بياناتها أيضًا
    if (secondSnapshot && !secondSnapshot.empty) {
        secondSnapshot.forEach(doc => {
            const person = doc.data();
            const personId = doc.id;
            const collectionName = doc.ref.parent.id; // اسم المجموعة التي ينتمي إليها المستند
            
            // تطبيق فلترة المدينة - عرض فقط الأشخاص في المدينة المختارة
            const personCity = (person.city || '');
            // تحويل المدينة إلى أحرف صغيرة للمقارنة
            const personCityLower = personCity.toLowerCase();
            // طباعة معلومات تصحيح الأخطاء
            console.log('مدينة الشخص (المجموعة الثانية):', personCity, 'بعد التحويل:', personCityLower);
            // التحقق من وجود المدينة في القائمة (بالأحرف الصغيرة أو العربية)
            if (!cityValues.includes(personCityLower) && !cityValues.includes(personCity)) {
                console.log('تخطي الشخص لأن مدينته غير مطابقة للمدينة المختارة');
                return; // تخطي هذا الشخص إذا لم يكن في المدينة المختارة
            }
            
            const row = document.createElement('tr');
            row.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
            
            // تحسين عرض الصور في جدول الأشخاص
            const imageUrl = convertImgBBUrl(person.image) || 'img/default-avatar.png';
            
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex justify-center">
                        <img src="${imageUrl}" alt="${person.name}" class="w-10 h-10 object-cover rounded-full" onerror="this.src='img/default-avatar.png'">
                    </div>
                </td>
                <td class="px-6 py-4 text-center">${person.name}</td>
                <td class="px-6 py-4 text-center">${person.job}</td>
                <td class="px-6 py-4 text-center">${person.section}</td>
                <td class="px-6 py-4 text-center">${person.city || 'غير محدد'}</td>
                <td class="px-6 py-4 text-center">
                    <button class="edit-person-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-2" data-id="${personId}" data-collection="${collectionName}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-person-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${personId}" data-collection="${collectionName}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            personsTableBody.appendChild(row);
        });
    }
    
    console.log(`تم تحديث جدول الأشخاص بنجاح مع ${snapshot.size} شخص`);
    
    // Add event listeners to edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-person-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const personId = button.getAttribute('data-id');
            const collectionName = button.getAttribute('data-collection') || 'persons';
            openEditPersonModal(personId, collectionName);
        });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-person-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const personId = button.getAttribute('data-id');
            const collectionName = button.getAttribute('data-collection') || 'persons';
            openDeletePersonConfirmation(personId, collectionName);
        });
    });
}

// Load admins from Firestore
async function loadAdmins() {
    try {
        // Check if window.db is initialized
        if (!window.db) {
            console.error('Firestore is not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات');
            return;
        }
        
        try {
            const snapshot = await window.db.collection('admins').get();
            
            // Clear existing admins
            const adminsTableBody = document.getElementById('adminsTableBody');
            adminsTableBody.innerHTML = '';
            
            // Add admins to table
            snapshot.forEach(doc => {
                const admin = doc.data();
                const adminId = doc.id;
                
                const row = document.createElement('tr');
                row.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700';
                row.innerHTML = `
                    <td class="px-6 py-4">${admin.email}</td>
                    <td class="px-6 py-4">${admin.role === 'superadmin' ? 'مسؤول رئيسي' : 'مسؤول'}</td>
                    <td class="px-6 py-4">
                        <button class="delete-admin-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${adminId}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                adminsTableBody.appendChild(row);
            });
            
            // Add event listeners to delete buttons
            const deleteButtons = document.querySelectorAll('.delete-admin-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const adminId = button.getAttribute('data-id');
                    openDeleteAdminConfirmation(adminId);
                });
            });
        } catch (fetchError) {
            console.error('Error fetching admins:', fetchError);
            
            // Show specific error message based on error code
            if (fetchError.code === 'unavailable') {
                alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
            } else if (fetchError.code === 'permission-denied') {
                alert('ليس لديك صلاحيات كافية للوصول إلى البيانات. يرجى تسجيل الدخول مرة أخرى.');
            } else {
                alert('حدث خطأ أثناء تحميل البيانات: ' + fetchError.message);
            }
        }
    } catch (error) {
        console.error('Error loading admins:', error);
    }
}

// Filter persons by category
function filterPersonsByCategory(category) {
    const personCards = document.querySelectorAll('.person-card');
    console.log('تصفية حسب القسم:', category);
    console.log('عدد البطاقات الكلي:', personCards.length);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    personCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        console.log('فئة البطاقة:', cardCategory);
        
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
            hiddenCount++;
        }
    });
    
    console.log('البطاقات المرئية:', visibleCount);
    console.log('البطاقات المخفية:', hiddenCount);
}

// Handle search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const personCards = document.querySelectorAll('.person-card');
    
    personCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const job = card.querySelector('p').textContent.toLowerCase();
        const section = card.querySelector('span').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || job.includes(searchTerm) || section.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Handle adding a new person
async function handleAddPerson(e) {
    e.preventDefault();
    
    const name = document.getElementById('personName').value;
    const job = document.getElementById('personJob').value;
    const section = document.getElementById('personSection').value;
    // تحويل المدينة إلى القيمة المناسبة للتخزين
    let city = document.getElementById('personCity').value;
    // تحويل أسماء المدن العربية إلى الإنجليزية للتوحيد
    if (city === 'دهوك') {
        city = 'duhok';
    } else if (city === 'زاخو') {
        city = 'zakho';
    }
    // تحويل إلى أحرف صغيرة للتأكد من التوحيد
    city = city.toLowerCase();
    const phone = document.getElementById('personPhone').value;
    const directImageUrl = document.getElementById('directImageUrl').value;
    
    if (!name || !job || !section || !city || !phone || !directImageUrl) {
        alert('يرجى ملء جميع الحقول بما في ذلك المدينة ورقم الهاتف ورابط الصورة');
        return;
    }
    
    // التحقق من صحة رابط الصورة
    if (!isValidImageUrl(directImageUrl)) {
        alert('يرجى إدخال رابط صحيح للصورة. يمكنك استخدام رابط صفحة عرض الصورة من ImgBB مثل https://ibb.co/0jsTLgnm أو رابط مباشر للصورة ينتهي بامتداد الصورة مثل .jpg أو .png');
        return;
    }
    
    try {
        // Check if window.db and window.storage are initialized
        if (!window.db || !window.storage) {
            console.error('Firebase services are not initialized');
            alert('خطأ في الاتصال بخدمات Firebase');
            return;
        }
        
        // التحقق من صلاحيات المستخدم كمسؤول
        console.log('جاري التحقق من صلاحيات المستخدم...');
        const isAdmin = await checkAdminStatus();
        console.log('نتيجة التحقق من حالة المسؤول:', isAdmin);
        
        if (!isAdmin) {
            // التحقق من دور المستخدم
            console.log('المستخدم ليس مسؤولاً حسب checkAdminStatus، جاري التحقق مرة أخرى...');
            const user = firebase.auth().currentUser;
            console.log('المستخدم الحالي:', user ? user.email : 'غير مسجل الدخول');
            
            if (user) {
                console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
                const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
                console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
                
                if (adminDoc.exists) {
                    const adminData = adminDoc.data();
                    console.log('بيانات المسؤول:', adminData);
                    console.log('دور المستخدم:', adminData.role || 'غير محدد');
                    
                    // التحقق من دور المستخدم (superadmin أو admin)
                    if (adminData.role === 'superadmin' || adminData.role === 'admin') {
                        console.log('المستخدم هو مسؤول، السماح بإضافة شخص');
                    } else {
                        console.error('المستخدم ليس مسؤولاً، رفض إضافة شخص');
                        alert('ليس لديك صلاحيات كافية لإضافة شخص جديد. يرجى تسجيل الدخول مرة أخرى.');
                        return;
                    }
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض إضافة شخص');
                    alert('ليس لديك صلاحيات كافية لإضافة شخص جديد. يجب أن تكون مسؤولاً.');
                    return;
                }
            } else {
                console.error('المستخدم غير مسجل الدخول، رفض إضافة شخص');
                alert('ليس لديك صلاحيات كافية لإضافة شخص جديد. يجب أن تكون مسؤولاً.');
                return;
            }
        }
        
        // Check if person with same name already exists in the same section
        const existingPerson = await window.db.collection('persons')
            .where('name', '==', name)
            .where('section', '==', section)
            .get();
            
        if (!existingPerson.empty) {
            alert('يوجد شخص بنفس الاسم في هذا القسم بالفعل. يرجى استخدام اسم آخر أو اختيار قسم مختلف.');
            return;
        }
        
        // Create a timestamp to ensure unique documents
        const timestamp = new Date().getTime();
        let imageUrl = null;
        let docRef = null;
        
        try {
            // استخدام الرابط المباشر للصورة
            console.log('استخدام رابط مباشر للصورة:', directImageUrl);
            imageUrl = directImageUrl;
            alert('جاري إضافة البيانات، يرجى الانتظار...');
            
            try {
                // Add person to Firestore with a specific ID
                const personId = `person_${timestamp}`;
                // تأكد من تخزين المدينة بنفس التنسيق المستخدم في الاستعلام
                const personData = {
                    name,
                    job,
                    section,
                    city: city.toLowerCase(), // تحويل إلى أحرف صغيرة للتوحيد
                    phone, // إضافة رقم الهاتف
                    image: imageUrl,
                    createdAt: timestamp
                };
                
                console.log('بيانات الشخص المراد إضافته:', personData);
                
                console.log('جاري إضافة البيانات إلى Firestore:', personData);
                
                // Use set with merge option to ensure it works even if document exists
                try {
                    await window.db.collection('persons').doc(personId).set(personData, { merge: true });
                    console.log('تم إرسال البيانات إلى Firestore بنجاح');
                } catch (setError) {
                    console.error('خطأ في إرسال البيانات إلى Firestore:', setError);
                    throw setError;
                }
                
                // Verify the write by reading back the document
                console.log('جاري التحقق من حفظ البيانات...');
                docRef = await window.db.collection('persons').doc(personId).get();
                
                if (!docRef.exists) {
                    throw new Error('فشل التحقق من حفظ البيانات');
                }
                
                console.log('Person added successfully to Firestore and verified');
                
                console.log('تم التحقق من حفظ البيانات بنجاح');
                
                // Reset form
                document.getElementById('addPersonForm').reset();
                
                // Reload persons
                console.log('جاري إعادة تحميل قائمة الأشخاص...');
                loadPersons();
                
                alert('تمت إضافة الشخص بنجاح');
                console.log('اكتملت عملية إضافة الشخص بنجاح');
            } catch (firestoreError) {
                console.error('Error adding person to Firestore:', firestoreError);
                
                // لا نحتاج إلى حذف الصورة لأننا نستخدم رابط مباشر
                
                if (firestoreError.code === 'unavailable') {
                    alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
                } else if (firestoreError.code === 'permission-denied') {
                    console.error('خطأ في الصلاحيات: ليس لديك صلاحيات كافية لإضافة شخص جديد');
                    alert('ليس لديك صلاحيات كافية لإضافة شخص جديد. يرجى تسجيل الدخول مرة أخرى.');
                } else if (firestoreError.code === 'resource-exhausted') {
                    console.error('تم استنفاد موارد Firestore');
                    alert('تم استنفاد موارد قاعدة البيانات. يرجى المحاولة لاحقًا.');
                } else if (firestoreError.code === 'failed-precondition') {
                    console.error('فشل في الشروط المسبقة لعملية Firestore');
                    alert('فشل في الشروط المسبقة لعملية قاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت.');
                } else {
                    console.error('خطأ غير معروف في Firestore:', firestoreError);
                    alert('حدث خطأ أثناء إضافة الشخص: ' + firestoreError.message);
                }
            }
        } catch (storageError) {
            console.error('Error uploading image:', storageError);
            console.error('تفاصيل الخطأ:', JSON.stringify(storageError));
            
            if (storageError.code === 'storage/unauthorized') {
                alert('ليس لديك صلاحيات كافية لرفع الصور. يرجى تسجيل الدخول مرة أخرى.');
                console.log('خطأ في الصلاحيات: ليس لديك صلاحيات كافية لرفع الصور');
            } else if (storageError.code === 'storage/canceled') {
                alert('تم إلغاء عملية رفع الصورة.');
                console.log('تم إلغاء عملية رفع الصورة');
            } else if (storageError.code === 'storage/unknown') {
                alert('حدث خطأ غير معروف أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
                console.log('خطأ غير معروف في رفع الصورة');
            } else if (storageError.code === 'storage/quota-exceeded') {
                alert('تم تجاوز الحد الأقصى لمساحة التخزين. يرجى التواصل مع مسؤول النظام.');
                console.log('تم تجاوز الحد الأقصى لمساحة التخزين');
            } else if (storageError.code === 'storage/unauthenticated') {
                alert('يجب تسجيل الدخول لرفع الصور. يرجى تسجيل الدخول مرة أخرى.');
                console.log('المستخدم غير مسجل الدخول');
            } else {
                alert(`خطأ في رفع الصورة: ${storageError.message}`);
                console.log(`خطأ في رفع الصورة: ${storageError.message}`);
            }
        }
    } catch (error) {
        console.error('Error in handleAddPerson:', error);
        alert(`خطأ في إضافة الشخص: ${error.message}`);
    }
}

// Handle adding a new section
async function handleAddSection(e) {
    e.preventDefault();
    
    const name = document.getElementById('sectionName').value;
    const description = document.getElementById('sectionDescription').value;
    
    if (!name || !description) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    try {
        // Check if window.db is initialized
        if (!window.db) {
            console.error('Firestore is not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات');
            return;
        }
        
        // التحقق من صلاحيات المستخدم كمسؤول
        console.log('جاري التحقق من صلاحيات المستخدم...');
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.error('المستخدم غير مسجل الدخول، رفض إضافة قسم');
            alert('ليس لديك صلاحيات كافية لإضافة قسم جديد. يرجى تسجيل الدخول.');
            return;
        }
        
        console.log('المستخدم الحالي:', user.email);
        
        // التحقق مباشرة من وجود المستخدم في مجموعة المسؤولين
        const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
        console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
        
        if (!adminDoc.exists) {
            console.error('المستخدم ليس مسؤولاً، رفض إضافة قسم');
            alert('ليس لديك صلاحيات كافية لإضافة قسم جديد. يجب أن تكون مسؤولاً.');
            return;
        }
        
        const adminData = adminDoc.data();
        console.log('بيانات المسؤول:', adminData);
        console.log('دور المستخدم:', adminData.role || 'غير محدد');
        
        // التحقق من دور المستخدم (superadmin له كامل الصلاحيات بدون قيود)
        if (adminData.role === 'superadmin') {
            console.log('المستخدم هو سوبر أدمين، السماح بإضافة قسم بدون قيود');
        } else if (adminData.role === 'admin') {
            console.log('المستخدم هو مسؤول عادي، السماح بإضافة قسم');
        } else {
            console.error('المستخدم ليس لديه دور مسؤول صالح، رفض إضافة قسم');
            alert('ليس لديك صلاحيات كافية لإضافة قسم جديد. يرجى تسجيل الدخول مرة أخرى.');
            return;
        }

        
        console.log('Adding section:', name, description);
        
        // Check if section with same name already exists
        const existingSection = await window.db.collection('sections').where('name', '==', name).get();
        if (!existingSection.empty) {
            alert('يوجد قسم بهذا الاسم بالفعل. يرجى اختيار اسم آخر.');
            return;
        }
        
        // Create a timestamp to ensure unique documents
        const timestamp = new Date().getTime();
        
        // Create a unique ID for the section
        const sectionId = `section_${timestamp}`;
        
        console.log('Generated section ID:', sectionId);
        
        // Add section to Firestore with a specific ID to avoid permission issues
        console.log('Attempting to add section to Firestore...');
        
        // Create section data object
        const sectionData = {
            name,
            description,
            createdAt: timestamp
        };
        
        console.log('Section data:', sectionData);
        
        try {
            // Use set with merge option and wait for server write to complete
            await window.db.collection('sections').doc(sectionId).set(sectionData, { 
                merge: true
            });
            
            // Verify the write by reading back the document
            const docRef = await window.db.collection('sections').doc(sectionId).get();
            
            if (!docRef.exists) {
                throw new Error('فشل التحقق من حفظ البيانات');
            }
            
            console.log('Section added successfully to Firestore and verified');
            
            // Reset form
            document.getElementById('addSectionForm').reset();
            
            // Reload sections
            loadSections();
            
            alert('تمت إضافة القسم بنجاح');
        } catch (firestoreError) {
            console.error('Error adding section to Firestore:', firestoreError);
            
            if (firestoreError.code === 'unavailable') {
                alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
            } else if (firestoreError.code === 'permission-denied') {
                alert('ليس لديك صلاحيات كافية لإضافة قسم جديد. يرجى تسجيل الدخول مرة أخرى.');
            } else {
                alert('حدث خطأ أثناء إضافة القسم: ' + firestoreError.message);
            }
        }
    } catch (error) {
        console.error('Error in handleAddSection:', error);
        alert(`خطأ في إضافة القسم: ${error.message}`);
        
        // Try to verify database connection
        try {
            const testConnection = await window.db.collection('sections').limit(1).get();
            console.log('Database connection test result:', testConnection.empty ? 'No documents' : 'Connection successful');
        } catch (connError) {
            console.error('Database connection test failed:', connError);
        }
    }
}

// Handle adding a new admin
async function handleAddAdmin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const role = document.getElementById('adminRole').value;
    
    if (!email || !password || !role) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    try {
        // Check if window.auth and window.db are initialized
        if (!window.auth || !window.db) {
            console.error('Firebase services are not initialized');
            alert('خطأ في الاتصال بخدمات Firebase');
            return;
        }
        
        // التحقق من صلاحيات المستخدم
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('ليس لديك صلاحيات كافية لإضافة مسؤول جديد. يجب أن تكون مسجل الدخول.');
            return;
        }
        
        // التحقق من دور المستخدم
        const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
        if (!adminDoc.exists) {
            alert('ليس لديك صلاحيات كافية لإضافة مسؤول جديد. يجب أن تكون مسؤولاً.');
            return;
        }
        
        const adminData = adminDoc.data();
        console.log('دور المستخدم:', adminData.role);
        
        if (adminData.role === 'superadmin') {
            console.log('المستخدم هو سوبر أدمين، السماح بإضافة مسؤول جديد بدون قيود');
        } else if (adminData.role === 'admin') {
            console.log('المستخدم هو مسؤول عادي، السماح بإضافة مسؤول جديد');
        } else {
            alert('ليس لديك صلاحيات كافية لإضافة مسؤول جديد. يجب أن تكون مسؤولاً.');
            return;
        }
        
        console.log('المستخدم هو ' + adminData.role + '، السماح بإضافة مسؤول جديد');
        
        // Check if email already exists in admins collection
        const adminsSnapshot = await window.db.collection('admins').where('email', '==', email).get();
        if (!adminsSnapshot.empty) {
            alert('هذا البريد الإلكتروني مستخدم بالفعل كمسؤول');
            return;
        }
        
        let userId = null;
        
        try {
            // Create user in Firebase Authentication
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            userId = userCredential.user.uid;
            console.log('User created in Authentication with ID:', userId);
            
            try {
                // Add admin to Firestore with verification
                const adminData = {
                    email,
                    role,
                    createdAt: new Date().getTime()
                };
                
                // Use set with merge option to ensure it works even if document exists
                await window.db.collection('admins').doc(userId).set(adminData, { merge: true });
                
                // Verify the write by reading back the document
                const docRef = await window.db.collection('admins').doc(userId).get();
                
                if (!docRef.exists) {
                    throw new Error('فشل التحقق من حفظ بيانات المسؤول');
                }
                
                console.log('Admin added successfully to Firestore and verified');
                
                // Reset form
                document.getElementById('addAdminForm').reset();
                
                // Reload admins
                loadAdmins();
                
                alert('تمت إضافة المسؤول بنجاح');
            } catch (firestoreError) {
                console.error('Error adding admin to Firestore:', firestoreError);
                
                // If we created the auth user but failed to add to Firestore, try to delete the auth user
                if (userId) {
                    try {
                        const user = window.auth.currentUser;
                        if (user && user.uid === userId) {
                            await user.delete();
                            console.log('Deleted auth user after Firestore error');
                        }
                    } catch (deleteError) {
                        console.error('Could not delete auth user after Firestore error:', deleteError);
                    }
                }
                
                if (firestoreError.code === 'unavailable') {
                    alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
                } else if (firestoreError.code === 'permission-denied') {
                    alert('ليس لديك صلاحيات كافية لإضافة مسؤول جديد. يرجى تسجيل الدخول مرة أخرى.');
                } else {
                    alert('حدث خطأ أثناء إضافة المسؤول إلى قاعدة البيانات: ' + firestoreError.message);
                }
            }
        } catch (authError) {
            console.error('Error creating user:', authError);
            
            if (authError.code === 'auth/email-already-in-use') {
                alert('هذا البريد الإلكتروني مستخدم بالفعل في حساب آخر');
            } else if (authError.code === 'auth/invalid-email') {
                alert('البريد الإلكتروني غير صالح');
            } else if (authError.code === 'auth/weak-password') {
                alert('كلمة المرور ضعيفة جدًا. يجب أن تكون على الأقل 6 أحرف.');
            } else if (authError.code === 'auth/operation-not-allowed') {
                alert('تسجيل المستخدمين بالبريد الإلكتروني وكلمة المرور غير مفعل. يرجى الاتصال بمسؤول النظام.');
            } else if (authError.code === 'auth/network-request-failed') {
                alert('فشل طلب الشبكة. يرجى التحقق من اتصالك بالإنترنت.');
            } else {
                alert(`خطأ في إنشاء المستخدم: ${authError.message}`);
            }
        }
    } catch (error) {
        console.error('Error adding admin:', error);
        alert(`خطأ في إضافة المسؤول: ${error.message}`);
    }
}

// Open edit person modal
async function openEditPersonModal(personId, collectionName = 'persons') {
    try {
        // التحقق من صلاحيات المستخدم كمسؤول
        console.log('جاري التحقق من صلاحيات المستخدم...');
        const isAdmin = await checkAdminStatus();
        console.log('نتيجة التحقق من حالة المسؤول:', isAdmin);
        
        if (!isAdmin) {
            // التحقق من دور المستخدم
            console.log('المستخدم ليس مسؤولاً حسب checkAdminStatus، جاري التحقق مرة أخرى...');
            const user = firebase.auth().currentUser;
            console.log('المستخدم الحالي:', user ? user.email : 'غير مسجل الدخول');
            
            if (user) {
                console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
                const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
                console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
                
                if (adminDoc.exists) {
                    const adminData = adminDoc.data();
                    console.log('بيانات المسؤول:', adminData);
                    console.log('دور المستخدم:', adminData.role || 'غير محدد');
                    
                    // التحقق من دور المستخدم (superadmin أو admin)
                    if (adminData.role === 'superadmin') {
                        console.log('المستخدم هو سوبر أدمين، السماح بفتح نافذة تعديل الشخص بدون قيود');
                    } else if (adminData.role === 'admin') {
                        console.log('المستخدم هو مسؤول عادي، السماح بفتح نافذة تعديل الشخص');
                    } else {
                        console.error('المستخدم ليس مسؤولاً، رفض فتح نافذة تعديل الشخص');
                        alert('ليس لديك صلاحيات كافية لتعديل الشخص. يرجى تسجيل الدخول مرة أخرى.');
                        return;
                    }
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض فتح نافذة تعديل الشخص');
                    alert('ليس لديك صلاحيات كافية لتعديل الشخص. يجب أن تكون مسؤولاً.');
                    return;
                }
            } else {
                console.error('المستخدم غير مسجل الدخول، رفض فتح نافذة تعديل الشخص');
                alert('ليس لديك صلاحيات كافية لتعديل الشخص. يجب أن تكون مسؤولاً.');
                return;
            }
        }
        
        console.log(`جاري فتح نافذة تعديل الشخص من المجموعة: ${collectionName}`);
        const doc = await db.collection(collectionName).doc(personId).get();
        
        if (!doc.exists) {
            console.error(`لم يتم العثور على الشخص بالمعرف ${personId} في المجموعة ${collectionName}`);
            alert('لم يتم العثور على بيانات الشخص');
            return;
        }
        
        const person = doc.data();
        
        document.getElementById('editPersonId').value = personId;
        // إضافة معلومات المجموعة للاستخدام عند الحفظ
        document.getElementById('editPersonId').setAttribute('data-collection', collectionName);
        document.getElementById('editPersonName').value = person.name;
        document.getElementById('editPersonJob').value = person.job;
        document.getElementById('editPersonSection').value = person.section;
        // تعيين قيمة المدينة إذا كانت موجودة
        if (document.getElementById('editPersonCity')) {
            document.getElementById('editPersonCity').value = person.city || 'دهوك';
        }
        // تعيين قيمة رقم الهاتف إذا كانت موجودة
        if (document.getElementById('editPersonPhone')) {
            document.getElementById('editPersonPhone').value = person.phone || '';
        }
        document.getElementById('currentPersonImage').src = convertImgBBUrl(person.image);
        document.getElementById('editPersonDirectImageUrl').value = person.image;
        
        document.getElementById('editPersonModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error opening edit person modal:', error);
    }
}

// Handle editing a person
async function handleEditPerson(e) {
    e.preventDefault();
    
    const personIdElement = document.getElementById('editPersonId');
    const personId = personIdElement.value;
    // الحصول على اسم المجموعة من السمة المخصصة
    const collectionName = personIdElement.getAttribute('data-collection') || 'persons';
    
    console.log(`جاري تعديل الشخص بالمعرف ${personId} من المجموعة ${collectionName}`);
    
    const name = document.getElementById('editPersonName').value;
    const job = document.getElementById('editPersonJob').value;
    const section = document.getElementById('editPersonSection').value;
    // تحويل المدينة إلى القيمة المناسبة للتخزين
    let city = document.getElementById('editPersonCity') ? document.getElementById('editPersonCity').value : 'duhok';
    // تحويل أسماء المدن العربية إلى الإنجليزية للتوحيد
    if (city === 'دهوك') {
        city = 'duhok';
    } else if (city === 'زاخو') {
        city = 'zakho';
    }
    // تحويل إلى أحرف صغيرة للتأكد من التوحيد
    city = city.toLowerCase();
    const phone = document.getElementById('editPersonPhone').value;
    const directImageUrl = document.getElementById('editPersonDirectImageUrl').value;

    if (!name || !job || !section || !city || !phone || !directImageUrl) {
        alert('يرجى ملء جميع الحقول بما في ذلك المدينة ورقم الهاتف ورابط الصورة');
        return;
    }
    
    console.log('بيانات الشخص المراد تعديله:', { name, job, section, city, directImageUrl });
    
    // التحقق من صحة رابط الصورة
    if (!isValidImageUrl(directImageUrl)) {
        alert('يرجى إدخال رابط صحيح للصورة. يمكنك استخدام رابط صفحة عرض الصورة من ImgBB مثل https://ibb.co/0jsTLgnm أو رابط مباشر للصورة ينتهي بامتداد الصورة مثل .jpg أو .png');
        return;
    }
    
    // التحقق من صلاحيات المستخدم كمسؤول
    console.log('جاري التحقق من صلاحيات المستخدم...');
    const isAdmin = await checkAdminStatus();
    console.log('نتيجة التحقق من حالة المسؤول:', isAdmin);
    
    if (!isAdmin) {
        // التحقق من دور المستخدم
        console.log('المستخدم ليس مسؤولاً حسب checkAdminStatus، جاري التحقق مرة أخرى...');
        const user = firebase.auth().currentUser;
        console.log('المستخدم الحالي:', user ? user.email : 'غير مسجل الدخول');
        
        if (user) {
            console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
            try {
                if (!firebase.firestore) {
                    console.error('خطأ: firebase.firestore غير متاح');
                    alert('حدث خطأ في الاتصال بقاعدة البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
                    return;
                }
                const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
                console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
                
                if (adminDoc.exists) {
                const adminData = adminDoc.data();
                console.log('بيانات المسؤول:', adminData);
                console.log('دور المستخدم:', adminData.role || 'غير محدد');
                
                // التحقق من دور المستخدم (superadmin أو admin)
                if (adminData.role === 'superadmin') {
                    console.log('المستخدم هو سوبر أدمين، السماح بتعديل الشخص بدون قيود');
                } else if (adminData.role === 'admin') {
                    console.log('المستخدم هو مسؤول عادي، السماح بتعديل الشخص');
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض تعديل الشخص');
                    alert('ليس لديك صلاحيات كافية لتعديل الشخص. يرجى تسجيل الدخول مرة أخرى.');
                    return;
                }
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض تعديل الشخص');
                    alert('ليس لديك صلاحيات كافية لتعديل الشخص. يجب أن تكون مسؤولاً.');
                    return;
                }
            } catch (error) {
                console.error('حدث خطأ أثناء التحقق من صلاحيات المستخدم:', error);
                alert('حدث خطأ أثناء التحقق من صلاحياتك. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
                return;
            }
        } else {
            console.error('المستخدم غير مسجل الدخول، رفض تعديل الشخص');
            alert('ليس لديك صلاحيات كافية لتعديل الشخص. يجب أن تكون مسؤولاً.');
            return;
        }
    }
    
    try {
        // Check if window.db and window.storage are initialized
        if (!window.db || !window.storage) {
            console.error('Firebase services are not initialized');
            alert('خطأ في الاتصال بخدمات Firebase');
            return;
        }
        
        // Check if person with same name already exists in the same section (excluding current person)
        const existingPerson = await window.db.collection(collectionName)
            .where('name', '==', name)
            .where('section', '==', section)
            .get();
            
        // Check if any of the found documents is not the current one
        let nameExists = false;
        existingPerson.forEach(doc => {
            if (doc.id !== personId) {
                nameExists = true;
            }
        });
        
        if (nameExists) {
            alert('يوجد شخص آخر بنفس الاسم في هذا القسم بالفعل. يرجى استخدام اسم آخر أو اختيار قسم مختلف.');
            return;
        }
        
        // الحصول على قيمة المدينة من النموذج إذا كانت موجودة
        const cityValue = document.getElementById('editPersonCity') ? document.getElementById('editPersonCity').value : 'دهوك';
        // تحويل المدينة إلى أحرف صغيرة للتخزين
        const city = cityValue.toLowerCase();
        
        // الحصول على قيمة رقم الهاتف من النموذج
        const phone = document.getElementById('editPersonPhone') ? document.getElementById('editPersonPhone').value : '';
        
        let updateData = {
            name,
            job,
            section,
            city,
            phone, // إضافة رقم الهاتف
            image: directImageUrl,
            updatedAt: new Date().getTime()
        };
        
        console.log('تحديث بيانات الشخص باستخدام رابط الصورة المباشر:', directImageUrl);
        
        try {
            // Update person in Firestore using the correct collection
            await db.collection(collectionName).doc(personId).update(updateData);
            
            // Verify the update by reading back the document
            const docRef = await db.collection(collectionName).doc(personId).get();
            
            if (!docRef.exists) {
                throw new Error('فشل التحقق من حفظ البيانات المحدثة');
            }
            
            const updatedData = docRef.data();
            if (updatedData.name !== name || updatedData.job !== job || updatedData.section !== section || updatedData.city !== city) {
                throw new Error('البيانات المحدثة غير متطابقة مع البيانات المدخلة');
            }
            
            console.log('Person updated successfully in Firestore and verified');
            
            // لا نحتاج لحذف الصورة القديمة لأننا نستخدم روابط مباشرة للصور
            console.log('تم تحديث الصورة باستخدام الرابط المباشر بنجاح');
            
            // Close modal
            document.getElementById('editPersonModal').classList.add('hidden');
            
            // Reload persons
            loadPersons();
            
            alert('تم تحديث الشخص بنجاح');
        } catch (firestoreError) {
            console.error('Error updating person in Firestore:', firestoreError);
            
            // لا نحتاج لحذف الصورة لأننا نستخدم روابط مباشرة للصور
            console.log('فشل تحديث البيانات في Firestore ولكن لا نحتاج لحذف الصورة لأننا نستخدم روابط مباشرة');
            
            if (firestoreError.code === 'unavailable') {
                alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
            } else if (firestoreError.code === 'permission-denied') {
                alert('ليس لديك صلاحيات كافية لتحديث بيانات الشخص. يرجى تسجيل الدخول مرة أخرى.');
            } else {
                alert('حدث خطأ أثناء تحديث الشخص: ' + firestoreError.message);
            }
        }
    } catch (error) {
        console.error('Error in handleEditPerson:', error);
        alert(`خطأ في تحديث الشخص: ${error.message}`);
    }
}

// Open edit section modal
async function openEditSectionModal(sectionId) {
    console.log('Opening edit section modal for section ID:', sectionId);
    
    try {
        // Verify database connection
        if (!window.db) {
            console.error('Firestore is not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات');
            return;
        }
        
        // التحقق من صلاحيات المستخدم كمسؤول
        console.log('جاري التحقق من صلاحيات المستخدم...');
        const isAdmin = await checkAdminStatus();
        console.log('نتيجة التحقق من حالة المسؤول:', isAdmin);
        
        if (!isAdmin) {
            // التحقق من دور المستخدم
            console.log('المستخدم ليس مسؤولاً حسب checkAdminStatus، جاري التحقق مرة أخرى...');
            const user = firebase.auth().currentUser;
            console.log('المستخدم الحالي:', user ? user.email : 'غير مسجل الدخول');
            
            if (user) {
                console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
                const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
                console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
                
                if (adminDoc.exists) {
                    const adminData = adminDoc.data();
                    console.log('بيانات المسؤول:', adminData);
                    console.log('دور المستخدم:', adminData.role || 'غير محدد');
                    
                    // التحقق من دور المستخدم (superadmin أو admin)
                    if (adminData.role === 'superadmin') {
                        console.log('المستخدم هو سوبر أدمين، السماح بتعديل القسم بدون قيود');
                    } else if (adminData.role === 'admin') {
                        console.log('المستخدم هو مسؤول عادي، السماح بتعديل القسم');
                    } else {
                        console.error('المستخدم ليس مسؤولاً، رفض تعديل القسم');
                        alert('ليس لديك صلاحيات كافية لتعديل القسم. يرجى تسجيل الدخول مرة أخرى.');
                        return;
                    }
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض تعديل القسم');
                    alert('ليس لديك صلاحيات كافية لتعديل القسم. يجب أن تكون مسؤولاً.');
                    return;
                }
            } else {
                console.error('المستخدم غير مسجل الدخول، رفض تعديل القسم');
                alert('ليس لديك صلاحيات كافية لتعديل القسم. يرجى تسجيل الدخول.');
                return;
            }
        }
        
        console.log('Fetching section data from Firestore...');
        const doc = await window.db.collection('sections').doc(sectionId).get();
        
        if (!doc.exists) {
            console.error('Section document not found:', sectionId);
            alert('لم يتم العثور على القسم المطلوب');
            return;
        }
        
        const section = doc.data();
        console.log('Section data retrieved:', section);
        
        document.getElementById('editSectionId').value = sectionId;
        document.getElementById('editSectionName').value = section.name;
        document.getElementById('editSectionDescription').value = section.description;
        
        document.getElementById('editSectionModal').classList.remove('hidden');
        console.log('Edit section modal opened successfully');
    } catch (error) {
        console.error('Error opening edit section modal:', error);
        alert(`خطأ في فتح نافذة تعديل القسم: ${error.message}`);
    }
}

// Handle editing a section
async function handleEditSection(e) {
    e.preventDefault();
    console.log('Handling edit section form submission...');
    
    const sectionId = document.getElementById('editSectionId').value;
    const name = document.getElementById('editSectionName').value;
    const description = document.getElementById('editSectionDescription').value;
    
    console.log('Edit section form data:', { sectionId, name, description });
    
    if (!name || !description) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    try {
        // Verify database connection
        if (!window.db) {
            console.error('Firestore is not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات');
            return;
        }
        
        // التحقق من صلاحيات المستخدم كمسؤول
        console.log('جاري التحقق من صلاحيات المستخدم...');
        const isAdmin = await checkAdminStatus();
        console.log('نتيجة التحقق من حالة المسؤول:', isAdmin);
        
        if (!isAdmin) {
            // التحقق من دور المستخدم
            console.log('المستخدم ليس مسؤولاً حسب checkAdminStatus، جاري التحقق مرة أخرى...');
            const user = firebase.auth().currentUser;
            console.log('المستخدم الحالي:', user ? user.email : 'غير مسجل الدخول');
            
            if (user) {
                console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
                const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
                console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
                
                if (adminDoc.exists) {
                    const adminData = adminDoc.data();
                    console.log('بيانات المسؤول:', adminData);
                    console.log('دور المستخدم:', adminData.role || 'غير محدد');
                    
                    // التحقق من دور المستخدم (superadmin أو admin)
                    if (adminData.role === 'superadmin' || adminData.role === 'admin') {
                        console.log('المستخدم هو مسؤول، السماح بتعديل القسم');
                    } else {
                        console.error('المستخدم ليس مسؤولاً، رفض تعديل القسم');
                        alert('ليس لديك صلاحيات كافية لتعديل القسم. يرجى تسجيل الدخول مرة أخرى.');
                        return;
                    }
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض تعديل القسم');
                    alert('ليس لديك صلاحيات كافية لتعديل القسم. يجب أن تكون مسؤولاً.');
                    return;
                }
            } else {
                console.error('المستخدم غير مسجل الدخول، رفض تعديل القسم');
                alert('ليس لديك صلاحيات كافية لتعديل القسم. يرجى تسجيل الدخول.');
                return;
            }
        }
        
        // Check if section with same name already exists (excluding current section)
        const existingSection = await window.db.collection('sections').where('name', '==', name).get();
        
        // Check if any of the found documents is not the current one
        let nameExists = false;
        existingSection.forEach(doc => {
            if (doc.id !== sectionId) {
                nameExists = true;
            }
        });
        
        if (nameExists) {
            alert('يوجد قسم آخر بهذا الاسم بالفعل. يرجى اختيار اسم آخر.');
            return;
        }
        
        console.log('Updating section in Firestore...');
        
        // Create section data object
        const sectionData = {
            name,
            description,
            updatedAt: new Date().getTime()
        };
        
        try {
            // Update section in Firestore
            await window.db.collection('sections').doc(sectionId).update(sectionData);
            
            // Verify the update by reading back the document
            const docRef = await window.db.collection('sections').doc(sectionId).get();
            
            if (!docRef.exists) {
                throw new Error('فشل التحقق من حفظ البيانات المحدثة');
            }
            
            const updatedData = docRef.data();
            console.log('Verification data:', updatedData);
            
            if (updatedData.name !== name || updatedData.description !== description) {
                throw new Error('البيانات المحدثة غير متطابقة مع البيانات المدخلة');
            }
            
            console.log('Section updated successfully in Firestore and verified');
            
            // Close modal
            document.getElementById('editSectionModal').classList.add('hidden');
            
            // Reload sections
            loadSections();
            
            alert('تم تحديث القسم بنجاح');
        } catch (firestoreError) {
            console.error('Error updating section in Firestore:', firestoreError);
            console.error('Error code:', firestoreError.code);
            console.error('Error message:', firestoreError.message);
            
            let errorMessage = firestoreError.message;
            
            if (firestoreError.code === 'unavailable') {
                errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
            } else if (firestoreError.code === 'permission-denied') {
                errorMessage = 'ليس لديك صلاحيات كافية لتحديث بيانات القسم. يرجى تسجيل الدخول مرة أخرى.';
            } else if (firestoreError.code === 'not-found') {
                errorMessage = 'لم يتم العثور على القسم المطلوب. قد يكون تم حذفه.';
            }
            
            alert('حدث خطأ أثناء تحديث القسم: ' + errorMessage);
        }
    } catch (error) {
        console.error('Error in handleEditSection:', error);
        alert(`خطأ في تحديث القسم: ${error.message}`);
    }
}

// Open delete person confirmation
async function openDeletePersonConfirmation(personId, collectionName = 'persons') {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmDelete = document.getElementById('confirmDelete');
    
    // التحقق من صلاحيات المستخدم كمسؤول
    console.log('جاري التحقق من صلاحيات المستخدم...');
    const isAdmin = await checkAdminStatus();
    console.log('نتيجة التحقق من حالة المسؤول:', isAdmin);
    
    if (!isAdmin) {
        // التحقق من دور المستخدم
        console.log('المستخدم ليس مسؤولاً حسب checkAdminStatus، جاري التحقق مرة أخرى...');
        const user = firebase.auth().currentUser;
        console.log('المستخدم الحالي:', user ? user.email : 'غير مسجل الدخول');
        
        if (user) {
            console.log('جاري التحقق من وجود المستخدم في مجموعة المسؤولين...');
            const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
            console.log('هل المستخدم موجود في مجموعة المسؤولين:', adminDoc.exists);
            
            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                console.log('بيانات المسؤول:', adminData);
                console.log('دور المستخدم:', adminData.role || 'غير محدد');
                
                // التحقق من دور المستخدم (superadmin أو admin)
                if (adminData.role === 'superadmin') {
                    console.log('المستخدم هو سوبر أدمين، السماح بحذف الشخص بدون قيود');
                } else if (adminData.role === 'admin') {
                    console.log('المستخدم هو مسؤول عادي، السماح بحذف الشخص');
                } else {
                    console.error('المستخدم ليس مسؤولاً، رفض حذف الشخص');
                    alert('ليس لديك صلاحيات كافية لحذف الشخص. يرجى تسجيل الدخول مرة أخرى.');
                    return;
                }
            } else {
                console.error('المستخدم ليس مسؤولاً، رفض حذف الشخص');
                alert('ليس لديك صلاحيات كافية لحذف الشخص. يجب أن تكون مسؤولاً.');
                return;
            }
        } else {
            console.error('المستخدم غير مسجل الدخول، رفض حذف الشخص');
            alert('ليس لديك صلاحيات كافية لحذف الشخص. يجب أن تكون مسؤولاً.');
            return;
        }
    }
    
    console.log(`جاري فتح نافذة حذف الشخص من المجموعة: ${collectionName}`);
    
    confirmationMessage.textContent = 'هل أنت متأكد من أنك تريد حذف هذا الشخص؟';
    confirmationModal.classList.remove('hidden');
    
    // Remove any existing event listeners
    const newConfirmDelete = confirmDelete.cloneNode(true);
    confirmDelete.parentNode.replaceChild(newConfirmDelete, confirmDelete);
    
    // تخزين معلومات المجموعة للاستخدام عند الحذف
    newConfirmDelete.setAttribute('data-id', personId);
    newConfirmDelete.setAttribute('data-collection', collectionName);
    
    // Add new event listener
    newConfirmDelete.addEventListener('click', async () => {
        try {
            // Verify database connection
            if (!window.db || !window.storage) {
                console.error('Firebase services are not initialized');
                alert('خطأ في الاتصال بخدمات Firebase');
                confirmationModal.classList.add('hidden');
                return;
            }
            
            // الحصول على اسم المجموعة من زر التأكيد
            const collectionToUse = newConfirmDelete.getAttribute('data-collection') || 'persons';
            console.log(`جاري حذف الشخص من المجموعة: ${collectionToUse}`);
            
            // Get person data to delete image
            const doc = await db.collection(collectionToUse).doc(personId).get();
            
            if (!doc.exists) {
                console.error(`Person document not found in ${collectionToUse}:`, personId);
                alert('لم يتم العثور على الشخص المطلوب. قد يكون تم حذفه بالفعل.');
                confirmationModal.classList.add('hidden');
                return;
            }
            
            const person = doc.data();
            let imageDeleted = false;
            let imageUrl = null;
            
            // Delete image from storage if it exists
            if (person && person.image) {
                imageUrl = person.image;
                try {
                    const imageRef = storage.refFromURL(person.image);
                    await imageRef.delete();
                    imageDeleted = true;
                    console.log('Image deleted successfully');
                } catch (storageError) {
                    console.error('Error deleting image:', storageError);
                    console.error('Error code:', storageError.code);
                    
                    if (storageError.code === 'storage/object-not-found') {
                        console.log('Image not found in storage, continuing with person deletion');
                    } else if (storageError.code === 'storage/unauthorized') {
                        alert('ليس لديك صلاحيات كافية لحذف الصورة. يرجى تسجيل الدخول مرة أخرى.');
                        confirmationModal.classList.add('hidden');
                        return;
                    } else {
                        console.warn('Non-critical error deleting image, continuing with person deletion');
                    }
                }
            }
            
            try {
                // Delete person from Firestore using the correct collection
                await db.collection(collectionToUse).doc(personId).delete();
                
                // Verify the deletion by trying to read the document
                const verifyDoc = await db.collection(collectionToUse).doc(personId).get();
                
                if (verifyDoc.exists) {
                    throw new Error('فشل التحقق من حذف الشخص');
                }
                
                console.log('Person deleted successfully and verified');
                
                // Close modal
                confirmationModal.classList.add('hidden');
                
                // Reload persons
                loadPersons();
                
                alert('تم حذف الشخص بنجاح');
            } catch (firestoreError) {
                console.error('Error in Firestore delete operation:', firestoreError);
                console.error('Error code:', firestoreError.code);
                
                // If image was deleted but person deletion failed, log this inconsistency
                if (imageDeleted) {
                    console.error('WARNING: Image was deleted but person record deletion failed. Data inconsistency may occur.');
                }
                
                let errorMessage = firestoreError.message;
                
                if (firestoreError.code === 'unavailable') {
                    errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
                } else if (firestoreError.code === 'permission-denied') {
                    errorMessage = 'ليس لديك صلاحيات كافية لحذف هذا الشخص. يرجى تسجيل الدخول مرة أخرى.';
                }
                
                confirmationModal.classList.add('hidden');
                alert('حدث خطأ أثناء حذف الشخص: ' + errorMessage);
            }
        } catch (error) {
            console.error('Error in openDeletePersonConfirmation:', error);
            confirmationModal.classList.add('hidden');
            alert(`خطأ في حذف الشخص: ${error.message}`);
        }
    });
}

// Open delete section confirmation
async function openDeleteSectionConfirmation(sectionId) {
    console.log('Opening delete section confirmation for section ID:', sectionId);
    
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (!confirmationModal || !confirmationMessage || !confirmDelete) {
        console.error('Confirmation modal elements not found');
        alert('خطأ في فتح نافذة التأكيد');
        return;
    }
    
    // التحقق من صلاحيات المستخدم
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('ليس لديك صلاحيات كافية لحذف القسم. يجب أن تكون مسؤولاً.');
        return;
    }
    
    // التحقق من دور المستخدم
    const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
    if (!adminDoc.exists) {
        alert('ليس لديك صلاحيات كافية لحذف القسم. يجب أن تكون مسؤولاً.');
        return;
    }
    
    const adminData = adminDoc.data();
    if (adminData.role === 'superadmin') {
        console.log('المستخدم هو سوبر أدمين، السماح بحذف القسم بدون قيود');
    } else if (adminData.role === 'admin') {
        console.log('المستخدم هو مسؤول عادي، السماح بحذف القسم');
    } else {
        console.error('المستخدم ليس لديه دور مسؤول صالح، رفض حذف القسم');
        alert('ليس لديك صلاحيات كافية لحذف القسم. يرجى تسجيل الدخول مرة أخرى.');
        return;
    }
    
    confirmationMessage.textContent = 'هل أنت متأكد من أنك تريد حذف هذا القسم؟';
    confirmationModal.classList.remove('hidden');
    console.log('Confirmation modal displayed');
    
    // Remove any existing event listeners
    const newConfirmDelete = confirmDelete.cloneNode(true);
    confirmDelete.parentNode.replaceChild(newConfirmDelete, confirmDelete);
    
    // Add new event listener
    newConfirmDelete.addEventListener('click', async () => {
        console.log('Delete confirmation clicked for section ID:', sectionId);
        
        try {
            // Verify database connection
            if (!window.db) {
                console.error('Firestore is not initialized');
                alert('خطأ في الاتصال بقاعدة البيانات');
                confirmationModal.classList.add('hidden');
                return;
            }
            
            // Check if there are persons in this section
            console.log('Checking if section has associated persons...');
            const personsSnapshot = await window.db.collection('persons').where('section', '==', sectionId).get();
            
            if (!personsSnapshot.empty) {
                console.log('Section has associated persons, cannot delete');
                alert('لا يمكن حذف هذا القسم لأنه يحتوي على أشخاص. يرجى نقل الأشخاص إلى قسم آخر أولاً.');
                confirmationModal.classList.add('hidden');
                return;
            }
            
            console.log('Deleting section from Firestore...');
            
            try {
                // Delete section from Firestore
                await window.db.collection('sections').doc(sectionId).delete();
                
                // Verify the deletion by trying to read the document
                const docRef = await window.db.collection('sections').doc(sectionId).get();
                
                if (docRef.exists) {
                    throw new Error('فشل التحقق من حذف القسم');
                }
                
                console.log('Section deleted successfully and verified');
                
                // Close modal
                confirmationModal.classList.add('hidden');
                
                // Reload sections
                loadSections();
                
                alert('تم حذف القسم بنجاح');
            } catch (firestoreError) {
                console.error('Error in Firestore operation:', firestoreError);
                console.error('Error code:', firestoreError.code);
                console.error('Error message:', firestoreError.message);
                
                let errorMessage = firestoreError.message;
                
                if (firestoreError.code === 'unavailable') {
                    errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
                } else if (firestoreError.code === 'permission-denied') {
                    errorMessage = 'ليس لديك صلاحيات كافية لحذف هذا القسم. يرجى تسجيل الدخول مرة أخرى.';
                }
                
                confirmationModal.classList.add('hidden');
                alert('حدث خطأ أثناء حذف القسم: ' + errorMessage);
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Add more detailed error information
            let errorMessage = error.message;
            
            // Check for specific error types
            if (error.code === 'permission-denied') {
                errorMessage = 'ليس لديك صلاحيات كافية لحذف هذا القسم. يرجى تسجيل الدخول مرة أخرى.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
            } else if (error.code === 'not-found') {
                errorMessage = 'لم يتم العثور على القسم المطلوب. قد يكون تم حذفه بالفعل.';
            }
            
            confirmationModal.classList.add('hidden');
            alert(`خطأ في حذف القسم: ${errorMessage}`);
        }
    });
}

// Open delete admin confirmation
async function openDeleteAdminConfirmation(adminId) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmDelete = document.getElementById('confirmDelete');
    
    // التحقق من صلاحيات المستخدم كمسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        alert('ليس لديك صلاحيات كافية لحذف المسؤول. يجب أن تكون مسؤولاً.');
        return;
    }
    
    confirmationMessage.textContent = 'هل أنت متأكد من أنك تريد حذف هذا المسؤول؟';
    confirmationModal.classList.remove('hidden');
    
    // Remove any existing event listeners
    const newConfirmDelete = confirmDelete.cloneNode(true);
    confirmDelete.parentNode.replaceChild(newConfirmDelete, confirmDelete);
    
    // Add new event listener
    newConfirmDelete.addEventListener('click', async () => {
        try {
            // Verify database connection
            if (!window.db || !window.auth) {
                console.error('Firebase services are not initialized');
                alert('خطأ في الاتصال بخدمات Firebase');
                confirmationModal.classList.add('hidden');
                return;
            }
            
            // Get admin data to delete user account if needed
            const doc = await db.collection('admins').doc(adminId).get();
            
            if (!doc.exists) {
                console.error('Admin document not found:', adminId);
                alert('لم يتم العثور على المسؤول المطلوب. قد يكون تم حذفه بالفعل.');
                confirmationModal.classList.add('hidden');
                return;
            }
            
            const admin = doc.data();
            
            try {
                // Delete admin from Firestore
                await db.collection('admins').doc(adminId).delete();
                
                // Verify the deletion by trying to read the document
                const verifyDoc = await db.collection('admins').doc(adminId).get();
                
                if (verifyDoc.exists) {
                    throw new Error('فشل التحقق من حذف المسؤول');
                }
                
                console.log('Admin deleted successfully and verified');
                
                // Close modal
                confirmationModal.classList.add('hidden');
                
                // Reload admins
                loadAdmins();
                
                alert('تم حذف المسؤول بنجاح');
            } catch (firestoreError) {
                console.error('Error in Firestore delete operation:', firestoreError);
                console.error('Error code:', firestoreError.code);
                
                let errorMessage = firestoreError.message;
                
                if (firestoreError.code === 'unavailable') {
                    errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
                } else if (firestoreError.code === 'permission-denied') {
                    errorMessage = 'ليس لديك صلاحيات كافية لحذف هذا المسؤول. يرجى تسجيل الدخول مرة أخرى.';
                }
                
                confirmationModal.classList.add('hidden');
                alert('حدث خطأ أثناء حذف المسؤول: ' + errorMessage);
            }
        } catch (error) {
            console.error('Error in openDeleteAdminConfirmation:', error);
            confirmationModal.classList.add('hidden');
            alert(`خطأ في حذف المسؤول: ${error.message}`);
        }
    });
}

// Setup dark mode
function setupDarkMode() {
    // تطبيق الوضع الداكن بشكل افتراضي دائمًا
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
    
    // تطبيق الأنماط على البطاقات بعد تحديد وضع السمة
    setTimeout(() => {
        applyCardStyles();
    }, 100); // تأخير قصير لضمان تحميل البطاقات
}

// Toggle dark mode
function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }
    
    // تطبيق الأنماط على البطاقات بعد تغيير الوضع
    applyCardStyles();
}