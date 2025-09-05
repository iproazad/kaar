// التحقق من حالة تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود المستخدم في localStorage
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        // إذا لم يكن المستخدم مسجل الدخول، توجيهه إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
        return;
    }
    
    // عرض اسم المستخدم في الشريط العلوي
    const adminUsernameElement = document.getElementById('adminUsername');
    if (adminUsernameElement) {
        adminUsernameElement.textContent = localStorage.getItem('adminUsername') || 'azad';
    }
    
    // إضافة مستمع الحدث لزر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // تحميل البيانات من localStorage
    if (localStorage.getItem('profiles')) {
        profiles = JSON.parse(localStorage.getItem('profiles'));
    }
    
    if (localStorage.getItem('categories')) {
        categories = JSON.parse(localStorage.getItem('categories'));
    }
});

// دالة تسجيل الخروج
function logout() {
    // حذف بيانات المستخدم من localStorage
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    
    // توجيه المستخدم إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}

// دالة لإنشاء عنصر في الجدول
function createTableRow(data) {
    const row = document.createElement('tr');
    
    // إضافة البيانات إلى الصف
    for (const key in data) {
        if (key !== 'actions') {
            const cell = document.createElement('td');
            cell.innerHTML = data[key];
            row.appendChild(cell);
        }
    }
    
    // إضافة أزرار الإجراءات إذا كانت موجودة
    if (data.actions) {
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';
        actionsCell.innerHTML = data.actions;
        row.appendChild(actionsCell);
    }
    
    return row;
}

// دالة لإنشاء عنصر في النموذج
function createFormInput(type, id, name, label, value = '', required = true) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', id);
    labelElement.textContent = label;
    formGroup.appendChild(labelElement);
    
    let inputElement;
    
    if (type === 'textarea') {
        inputElement = document.createElement('textarea');
    } else if (type === 'select') {
        inputElement = document.createElement('select');
    } else {
        inputElement = document.createElement('input');
        inputElement.setAttribute('type', type);
    }
    
    inputElement.setAttribute('id', id);
    inputElement.setAttribute('name', name);
    
    if (value) {
        if (type === 'textarea' || type === 'select') {
            inputElement.value = value;
        } else {
            inputElement.setAttribute('value', value);
        }
    }
    
    if (required) {
        inputElement.setAttribute('required', '');
    }
    
    formGroup.appendChild(inputElement);
    
    return formGroup;
}

// دالة لإضافة خيارات إلى عنصر select
function addSelectOptions(selectElement, options) {
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectElement.appendChild(optionElement);
    });
}

// دالة لعرض رسالة تأكيد
function showConfirmDialog(message, confirmCallback) {
    if (confirm(message)) {
        confirmCallback();
    }
}

// دالة للحصول على معرف فريد
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// دالة لتحويل الصورة إلى Base64
function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// دالة لإنشاء معاينة للصورة
function createImagePreview(inputElement, previewElement) {
    inputElement.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="معاينة الصورة">`;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
}

// دالة للتحقق من صحة البيانات
function validateForm(formData, rules) {
    const errors = {};
    
    for (const field in rules) {
        const value = formData[field];
        const fieldRules = rules[field];
        
        if (fieldRules.required && (!value || value.trim() === '')) {
            errors[field] = 'هذا الحقل مطلوب';
            continue;
        }
        
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[field] = `يجب أن يكون الحقل على الأقل ${fieldRules.minLength} أحرف`;
        }
        
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[field] = fieldRules.message || 'قيمة الحقل غير صالحة';
        }
    }
    
    return Object.keys(errors).length === 0 ? null : errors;
}

// دالة لعرض أخطاء النموذج
function displayFormErrors(errors, formElement) {
    // إزالة رسائل الخطأ السابقة
    const previousErrors = formElement.querySelectorAll('.error-message');
    previousErrors.forEach(error => error.remove());
    
    // إضافة رسائل الخطأ الجديدة
    for (const field in errors) {
        const inputElement = formElement.querySelector(`[name="${field}"]`);
        if (inputElement) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errors[field];
            inputElement.parentNode.appendChild(errorElement);
        }
    }
}

// دالة للحصول على بيانات النموذج
function getFormData(formElement) {
    const formData = {};
    const elements = formElement.elements;
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.name && element.name !== '') {
            formData[element.name] = element.value;
        }
    }
    
    return formData;
}