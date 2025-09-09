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
        console.log('تم التحقق بنجاح: المستخدم هو مسؤول');
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من صلاحيات المستخدم:', error);
        console.error('رمز الخطأ:', error.code);
        console.error('رسالة الخطأ:', error.message);
        return false;
    }
}

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

// Main application initialization
function initApp() {
    // إضافة meta viewport tag للتأكد من عرض التطبيق بشكل صحيح على الأجهزة المحمولة
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        const newViewportMeta = document.createElement('meta');
        newViewportMeta.name = 'viewport';
        newViewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(newViewportMeta);
    }
    
    // Check authentication state
    checkAuthState();
    
    // Load data
    loadSections();
    loadPersons();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup dark mode
    setupDarkMode();
    
    // Add viewport meta tag for better mobile responsiveness if not exists
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewportMeta);
    }
}

// دالة معالجة تغيير حجم الشاشة
function handleScreenResize() {
    const personsGrid = document.getElementById('personsGrid');
    if (personsGrid) {
        if (window.innerWidth <= 480) {
            personsGrid.className = 'grid grid-cols-2 gap-2';
        } else if (window.innerWidth <= 640) {
            personsGrid.className = 'grid grid-cols-2 gap-4';
        } else if (window.innerWidth <= 768) {
            personsGrid.className = 'grid grid-cols-3 gap-4';
        } else {
            personsGrid.className = 'grid grid-cols-4 gap-6';
        }
    }
}

// Check if user is authenticated
function checkAuthState() {
    auth.onAuthStateChanged(async user => {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        
        if (user) {
            console.log('User is signed in:', user.email);
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            
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
            
            // Check user role
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.role === 'admin') {
                        // Admin user - show dashboard button
                        dashboardBtn.classList.remove('hidden');
                        // Load admin data
                        loadAdmins();
                    } else {
                        // Regular user - hide dashboard button
                        dashboardBtn.classList.add('hidden');
                    }
                }
            } catch (error) {
                console.error('Error checking user role:', error);
            }
        } else {
            console.log('User is signed out');
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            dashboardBtn.classList.add('hidden');
            
            // Hide user profile button if exists
            const userProfileBtn = document.getElementById('userProfileBtn');
            if (userProfileBtn) {
                userProfileBtn.classList.add('hidden');
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
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
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
        
        // Try to get sections with error handling
        let snapshot;
        try {
            console.log('Attempting to fetch sections from server...');
            snapshot = await window.db.collection('sections').get();
            console.log('Sections fetched successfully:', snapshot.size, 'sections found');
        } catch (fetchError) {
            console.error('Error fetching sections:', fetchError);
            
            // Show specific error message based on error code
            if (fetchError.code === 'unavailable') {
                alert('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
            } else if (fetchError.code === 'permission-denied') {
                alert('ليس لديك صلاحيات كافية للوصول إلى البيانات. يرجى تسجيل الدخول مرة أخرى.');
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
                openConfirmationModal('section', sectionId);
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
        
        try {
            // Clear existing persons
            const personsGrid = document.getElementById('personsGrid');
            if (!personsGrid) {
                console.error('لم يتم العثور على عنصر personsGrid في الصفحة');
                return;
            }
            personsGrid.innerHTML = '';
            console.log('تم مسح العناصر السابقة من الشبكة');
            
            // Load persons from 'persons' collection
            console.log('جاري جلب بيانات الأشخاص من Firestore...');
            const personsSnapshot = await window.db.collection('persons').get();
            console.log(`تم جلب ${personsSnapshot.size} شخص من مجموعة persons`);
            
            // تطبيق استجابة الشاشة على شبكة العرض
            handleScreenResize();
            
            // Add persons to grid
            personsSnapshot.forEach(doc => {
                const person = doc.data();
                const personId = doc.id;
                
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
                `;
                
                personsGrid.appendChild(card);
            });
            
            // Load registered users from 'people' collection
            console.log('جاري جلب بيانات المستخدمين المسجلين من Firestore...');
            const peopleSnapshot = await window.db.collection('people').get();
            console.log(`تم جلب ${peopleSnapshot.size} مستخدم مسجل من مجموعة people`);
            
            // Add registered users to grid
            peopleSnapshot.forEach(async doc => {
                const person = doc.data();
                const personId = doc.id;
                
                // Skip if no section (incomplete profile)
                if (!person.sectionId) return;
                
                // Get section name
                let sectionName = '';
                try {
                    const sectionDoc = await db.collection('sections').doc(person.sectionId).get();
                    if (sectionDoc.exists) {
                        sectionName = sectionDoc.data().name;
                    }
                } catch (error) {
                    console.error('خطأ في جلب اسم القسم:', error);
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
            });
            
            console.log('تم إضافة جميع الأشخاص والمستخدمين المسجلين إلى الشبكة بنجاح');
            
            // Also update the persons table in admin dashboard
            try {
                console.log('جاري تحديث جدول الأشخاص في لوحة التحكم...');
                updatePersonsTable(personsSnapshot);
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
function updatePersonsTable(snapshot) {
    const personsTableBody = document.getElementById('personsTableBody');
    if (!personsTableBody) {
        console.log('لم يتم العثور على عنصر personsTableBody، قد تكون في صفحة غير صفحة الإدارة');
        return; // لا نقوم بتحديث الجدول إذا لم يكن موجودًا في الصفحة الحالية
    }
    personsTableBody.innerHTML = '';
    console.log('جاري تحديث جدول الأشخاص...');
    
    snapshot.forEach(doc => {
        const person = doc.data();
        const personId = doc.id;
        
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
            <td class="px-6 py-4 text-center">
                <button class="edit-person-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ml-2" data-id="${personId}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-person-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${personId}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        personsTableBody.appendChild(row);
    });
    
    console.log(`تم تحديث جدول الأشخاص بنجاح مع ${snapshot.size} شخص`);
    
    // Add event listeners to edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-person-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const personId = button.getAttribute('data-id');
            openEditPersonModal(personId);
        });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-person-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const personId = button.getAttribute('data-id');
            openDeletePersonConfirmation(personId);
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
    
    personCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
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
    const directImageUrl = document.getElementById('directImageUrl').value;
    
    if (!name || !job || !section || !directImageUrl) {
        alert('يرجى ملء جميع الحقول بما في ذلك رابط الصورة');
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
                    // منح جميع المسؤولين صلاحيات كاملة بغض النظر عن الدور
                    console.log('المستخدم هو مسؤول، السماح بإضافة شخص');
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
                const personData = {
                    name,
                    job,
                    section,
                    image: imageUrl,
                    createdAt: timestamp
                };
                
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
  const isAdmin = await checkAdminStatus();
  if (!isAdmin) {
    // التحقق من دور المستخدم
    const user = firebase.auth().currentUser;
    if (user) {
      const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
      if (adminDoc.exists) {
        // منح جميع المسؤولين صلاحيات كاملة بغض النظر عن الدور
        console.log('المستخدم هو مسؤول، السماح بإضافة قسم');
      } else {
        alert('ليس لديك صلاحيات كافية لإضافة قسم جديد. يجب أن تكون مسؤولاً.');
        return;
      }
    } else {
      alert('ليس لديك صلاحيات كافية لإضافة قسم جديد. يجب أن تكون مسؤولاً.');
      return;
    }
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
        
        // التحقق من صلاحيات المستخدم كمسؤول
        const isAdmin = await checkAdminStatus();
        if (!isAdmin) {
            alert('ليس لديك صلاحيات كافية لإضافة مسؤول جديد. يجب أن تكون مسؤولاً.');
            return;
        }
        
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
async function openEditPersonModal(personId) {
    try {
        const doc = await db.collection('persons').doc(personId).get();
        const person = doc.data();
        
        document.getElementById('editPersonId').value = personId;
        document.getElementById('editPersonName').value = person.name;
        document.getElementById('editPersonJob').value = person.job;
        document.getElementById('editPersonSection').value = person.section;
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
    
    const personId = document.getElementById('editPersonId').value;
    const name = document.getElementById('editPersonName').value;
    const job = document.getElementById('editPersonJob').value;
    const section = document.getElementById('editPersonSection').value;
    const directImageUrl = document.getElementById('editPersonDirectImageUrl').value;

    if (!name || !job || !section || !directImageUrl) {
        alert('يرجى ملء جميع الحقول بما في ذلك رابط الصورة');
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
        
        // Check if person with same name already exists in the same section (excluding current person)
        const existingPerson = await window.db.collection('persons')
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
        
        let updateData = {
            name,
            job,
            section,
            image: directImageUrl,
            updatedAt: new Date().getTime()
        };
        
        console.log('تحديث بيانات الشخص باستخدام رابط الصورة المباشر:', directImageUrl);
        
        try {
            // Update person in Firestore
            await db.collection('persons').doc(personId).update(updateData);
            
            // Verify the update by reading back the document
            const docRef = await db.collection('persons').doc(personId).get();
            
            if (!docRef.exists) {
                throw new Error('فشل التحقق من حفظ البيانات المحدثة');
            }
            
            const updatedData = docRef.data();
            if (updatedData.name !== name || updatedData.job !== job || updatedData.section !== section) {
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
        const isAdmin = await checkAdminStatus();
        if (!isAdmin) {
            alert('ليس لديك صلاحيات كافية لتعديل القسم. يجب أن تكون مسؤولاً.');
            return;
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
        const isAdmin = await checkAdminStatus();
        if (!isAdmin) {
            alert('ليس لديك صلاحيات كافية لتعديل القسم. يجب أن تكون مسؤولاً.');
            return;
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
async function openDeletePersonConfirmation(personId) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmDelete = document.getElementById('confirmDelete');
    
    // التحقق من صلاحيات المستخدم كمسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        // التحقق من دور المستخدم
        const user = firebase.auth().currentUser;
        if (user) {
            const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
            if (adminDoc.exists) {
                // منح جميع المسؤولين صلاحيات كاملة بغض النظر عن الدور
                console.log('المستخدم هو مسؤول، السماح بحذف الشخص');
            } else {
                alert('ليس لديك صلاحيات كافية لحذف الشخص. يجب أن تكون مسؤولاً.');
                return;
            }
        } else {
            alert('ليس لديك صلاحيات كافية لحذف الشخص. يجب أن تكون مسؤولاً.');
            return;
        }
    }
    
    confirmationMessage.textContent = 'هل أنت متأكد من أنك تريد حذف هذا الشخص؟';
    confirmationModal.classList.remove('hidden');
    
    // Remove any existing event listeners
    const newConfirmDelete = confirmDelete.cloneNode(true);
    confirmDelete.parentNode.replaceChild(newConfirmDelete, confirmDelete);
    
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
            
            // Get person data to delete image
            const doc = await db.collection('persons').doc(personId).get();
            
            if (!doc.exists) {
                console.error('Person document not found:', personId);
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
                // Delete person from Firestore
                await db.collection('persons').doc(personId).delete();
                
                // Verify the deletion by trying to read the document
                const verifyDoc = await db.collection('persons').doc(personId).get();
                
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
    
    // التحقق من صلاحيات المستخدم كمسؤول
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        // التحقق من دور المستخدم
        const user = firebase.auth().currentUser;
        if (user) {
            const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
            if (adminDoc.exists) {
                // منح جميع المسؤولين صلاحيات كاملة بغض النظر عن الدور
                console.log('المستخدم هو مسؤول، السماح بحذف القسم');
            } else {
                alert('ليس لديك صلاحيات كافية لحذف القسم. يجب أن تكون مسؤولاً.');
                return;
            }
        } else {
            alert('ليس لديك صلاحيات كافية لحذف القسم. يجب أن تكون مسؤولاً.');
            return;
        }
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
    // Check for saved theme preference or use the system preference
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
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
}