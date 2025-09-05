// تهيئة الخادم باستخدام Express
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// تهيئة ملفات البيانات
const DATA_DIR = path.join(__dirname, 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

// التأكد من وجود مجلد البيانات
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// البيانات الافتراضية للأقسام
const defaultCategories = [
    { id: 'developers', name: 'المطورين' },
    { id: 'designers', name: 'المصممين' },
    { id: 'companies', name: 'الشركات' }
];

// البيانات الافتراضية للأشخاص
const defaultProfiles = [
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
    }
];

// التأكد من وجود ملفات البيانات وإنشائها إذا لم تكن موجودة
if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
}

if (!fs.existsSync(PROFILES_FILE)) {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(defaultProfiles, null, 2));
}

// تهيئة الوسائط
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// دوال مساعدة لقراءة وكتابة البيانات
function readData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
}

function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        return false;
    }
}

// واجهات برمجة التطبيق (API) للأقسام
app.get('/api/categories', (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    res.json(categories);
});

app.post('/api/categories', (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    const newCategory = req.body;
    
    // التحقق من وجود القسم
    const existingCategory = categories.find(cat => cat.id === newCategory.id);
    if (existingCategory) {
        return res.status(400).json({ error: 'هذا المعرف مستخدم بالفعل' });
    }
    
    categories.push(newCategory);
    
    if (writeData(CATEGORIES_FILE, categories)) {
        res.status(201).json(newCategory);
    } else {
        res.status(500).json({ error: 'فشل في حفظ البيانات' });
    }
});

app.put('/api/categories/:id', (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    const categoryId = req.params.id;
    const updatedCategory = req.body;
    
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) {
        return res.status(404).json({ error: 'القسم غير موجود' });
    }
    
    categories[categoryIndex] = { ...categories[categoryIndex], ...updatedCategory };
    
    if (writeData(CATEGORIES_FILE, categories)) {
        res.json(categories[categoryIndex]);
    } else {
        res.status(500).json({ error: 'فشل في حفظ البيانات' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    const profiles = readData(PROFILES_FILE);
    const categoryId = req.params.id;
    
    // التحقق من وجود مستخدمين في القسم
    const usersInCategory = profiles.filter(user => user.category === categoryId).length;
    if (usersInCategory > 0) {
        return res.status(400).json({ 
            error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${usersInCategory} مستخدم` 
        });
    }
    
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) {
        return res.status(404).json({ error: 'القسم غير موجود' });
    }
    
    categories.splice(categoryIndex, 1);
    
    if (writeData(CATEGORIES_FILE, categories)) {
        res.json({ message: 'تم حذف القسم بنجاح' });
    } else {
        res.status(500).json({ error: 'فشل في حفظ البيانات' });
    }
});

// واجهات برمجة التطبيق (API) للأشخاص
app.get('/api/profiles', (req, res) => {
    const profiles = readData(PROFILES_FILE);
    res.json(profiles);
});

app.post('/api/profiles', (req, res) => {
    const profiles = readData(PROFILES_FILE);
    const newProfile = req.body;
    
    // إنشاء معرف جديد
    const maxId = profiles.reduce((max, profile) => Math.max(max, profile.id), 0);
    newProfile.id = maxId + 1;
    
    profiles.push(newProfile);
    
    if (writeData(PROFILES_FILE, profiles)) {
        res.status(201).json(newProfile);
    } else {
        res.status(500).json({ error: 'فشل في حفظ البيانات' });
    }
});

app.put('/api/profiles/:id', (req, res) => {
    const profiles = readData(PROFILES_FILE);
    const profileId = parseInt(req.params.id);
    const updatedProfile = req.body;
    
    const profileIndex = profiles.findIndex(profile => profile.id === profileId);
    if (profileIndex === -1) {
        return res.status(404).json({ error: 'الملف الشخصي غير موجود' });
    }
    
    profiles[profileIndex] = { ...profiles[profileIndex], ...updatedProfile };
    
    if (writeData(PROFILES_FILE, profiles)) {
        res.json(profiles[profileIndex]);
    } else {
        res.status(500).json({ error: 'فشل في حفظ البيانات' });
    }
});

app.delete('/api/profiles/:id', (req, res) => {
    const profiles = readData(PROFILES_FILE);
    const profileId = parseInt(req.params.id);
    
    const profileIndex = profiles.findIndex(profile => profile.id === profileId);
    if (profileIndex === -1) {
        return res.status(404).json({ error: 'الملف الشخصي غير موجود' });
    }
    
    profiles.splice(profileIndex, 1);
    
    if (writeData(PROFILES_FILE, profiles)) {
        res.json({ message: 'تم حذف الملف الشخصي بنجاح' });
    } else {
        res.status(500).json({ error: 'فشل في حفظ البيانات' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});