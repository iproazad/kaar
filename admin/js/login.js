// بيانات المستخدم الأدمن
const adminCredentials = {
    username: 'azad',
    password: '19931993'
};

// استدعاء نموذج تسجيل الدخول
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// إضافة مستمع الحدث لنموذج تسجيل الدخول
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // الحصول على قيم الحقول
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // التحقق من صحة بيانات الدخول
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // تخزين حالة تسجيل الدخول في localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        
        // توجيه المستخدم إلى لوحة التحكم
        window.location.href = 'dashboard.html';
    } else {
        // عرض رسالة الخطأ
        errorMessage.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        
        // مسح الحقول
        document.getElementById('password').value = '';
        
        // تركيز على حقل اسم المستخدم
        document.getElementById('username').focus();
    }
});

// التحقق من حالة تسجيل الدخول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إذا كان المستخدم مسجل الدخول بالفعل، توجيهه إلى لوحة التحكم
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
});