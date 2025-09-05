// تهيئة صفحة الإعدادات
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من تسجيل الدخول
    checkLoginStatus();
    
    // تهيئة نموذج إعدادات الحساب
    const accountSettingsForm = document.getElementById('accountSettingsForm');
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // الحصول على بيانات النموذج
            const formData = getFormData(accountSettingsForm);
            
            // التحقق من صحة البيانات
            const validationRules = {
                username: { required: true },
                currentPassword: { required: true }
            };
            
            const errors = validateForm(formData, validationRules);
            
            if (errors) {
                // عرض رسائل الخطأ
                displayFormErrors(errors, accountSettingsForm);
                return;
            }
            
            // التحقق من كلمة المرور الحالية
            if (formData.currentPassword !== adminPassword) {
                const errors = { currentPassword: 'كلمة المرور غير صحيحة' };
                displayFormErrors(errors, accountSettingsForm);
                return;
            }
            
            // التحقق من كلمة المرور الجديدة إذا تم إدخالها
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    const errors = { confirmPassword: 'كلمة المرور غير متطابقة' };
                    displayFormErrors(errors, accountSettingsForm);
                    return;
                }
                
                // تحديث كلمة المرور
                adminPassword = formData.newPassword;
                localStorage.setItem('adminPassword', adminPassword);
            }
            
            // تحديث اسم المستخدم
            adminUsername = formData.username;
            localStorage.setItem('adminUsername', adminUsername);
            
            // تحديث اسم المستخدم في الواجهة
            const adminUsernameElement = document.getElementById('adminUsername');
            if (adminUsernameElement) {
                adminUsernameElement.textContent = adminUsername;
            }
            
            // عرض رسالة نجاح
            alert('تم تحديث إعدادات الحساب بنجاح');
        });
    }
    
    // تهيئة نموذج إعدادات الموقع
    const siteSettingsForm = document.getElementById('siteSettingsForm');
    if (siteSettingsForm) {
        siteSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // الحصول على بيانات النموذج
            const formData = getFormData(siteSettingsForm);
            
            // التحقق من صحة البيانات
            const validationRules = {
                siteName: { required: true },
                siteDescription: { required: true },
                itemsPerPage: { required: true, min: 4, max: 24 }
            };
            
            const errors = validateForm(formData, validationRules);
            
            if (errors) {
                // عرض رسائل الخطأ
                displayFormErrors(errors, siteSettingsForm);
                return;
            }
            
            // حفظ إعدادات الموقع في التخزين المحلي
            const siteSettings = {
                siteName: formData.siteName,
                siteDescription: formData.siteDescription,
                contactEmail: formData.contactEmail,
                itemsPerPage: parseInt(formData.itemsPerPage)
            };
            
            localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
            
            // عرض رسالة نجاح
            alert('تم تحديث إعدادات الموقع بنجاح');
        });
        
        // تحميل إعدادات الموقع المحفوظة
        loadSiteSettings();
    }
    
    // تهيئة زر النسخ الاحتياطي
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', function() {
            exportData();
        });
    }
    
    // تهيئة زر الاستيراد
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            importData();
        });
    }
});

// دالة لتحميل إعدادات الموقع
function loadSiteSettings() {
    const siteSettingsForm = document.getElementById('siteSettingsForm');
    if (!siteSettingsForm) return;
    
    // محاولة استرجاع الإعدادات من التخزين المحلي
    const siteSettingsJson = localStorage.getItem('siteSettings');
    if (siteSettingsJson) {
        try {
            const siteSettings = JSON.parse(siteSettingsJson);
            
            // تعبئة النموذج بالإعدادات المحفوظة
            if (siteSettings.siteName) {
                siteSettingsForm.elements.siteName.value = siteSettings.siteName;
            }
            
            if (siteSettings.siteDescription) {
                siteSettingsForm.elements.siteDescription.value = siteSettings.siteDescription;
            }
            
            if (siteSettings.contactEmail) {
                siteSettingsForm.elements.contactEmail.value = siteSettings.contactEmail;
            }
            
            if (siteSettings.itemsPerPage) {
                siteSettingsForm.elements.itemsPerPage.value = siteSettings.itemsPerPage;
            }
        } catch (error) {
            console.error('خطأ في تحميل إعدادات الموقع:', error);
        }
    }
}

// دالة لتصدير البيانات
function exportData() {
    // إنشاء كائن يحتوي على جميع البيانات
    const data = {
        profiles: profiles,
        categories: categories,
        adminUsername: adminUsername,
        adminPassword: adminPassword,
        siteSettings: localStorage.getItem('siteSettings') ? JSON.parse(localStorage.getItem('siteSettings')) : null
    };
    
    // تحويل البيانات إلى سلسلة JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // إنشاء ملف للتنزيل
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء رابط وهمي للتنزيل
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaar_backup_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    
    // تنظيف
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// دالة لاستيراد البيانات
function importData() {
    const importFile = document.getElementById('importFile');
    if (!importFile || !importFile.files || !importFile.files[0]) {
        alert('الرجاء اختيار ملف للاستيراد');
        return;
    }
    
    const file = importFile.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // التحقق من صحة البيانات
            if (!data.profiles || !data.categories) {
                throw new Error('تنسيق الملف غير صالح');
            }
            
            // عرض تأكيد للمستخدم
            showConfirmDialog('سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد من المتابعة؟', function() {
                // استيراد البيانات
                profiles = data.profiles;
                categories = data.categories;
                
                // استيراد بيانات المسؤول إذا كانت موجودة
                if (data.adminUsername && data.adminPassword) {
                    adminUsername = data.adminUsername;
                    adminPassword = data.adminPassword;
                    localStorage.setItem('adminUsername', adminUsername);
                    localStorage.setItem('adminPassword', adminPassword);
                }
                
                // استيراد إعدادات الموقع إذا كانت موجودة
                if (data.siteSettings) {
                    localStorage.setItem('siteSettings', JSON.stringify(data.siteSettings));
                }
                
                // تحديث الواجهة
                loadSiteSettings();
                
                // تحديث اسم المستخدم في الواجهة
                const adminUsernameElement = document.getElementById('adminUsername');
                if (adminUsernameElement) {
                    adminUsernameElement.textContent = adminUsername;
                }
                
                // عرض رسالة نجاح
                alert('تم استيراد البيانات بنجاح');
            });
        } catch (error) {
            alert('خطأ في استيراد البيانات: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}