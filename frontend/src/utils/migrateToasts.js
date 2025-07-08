// Script لتحديث جميع استخدامات react-hot-toast إلى النظام الجديد

const fs = require('fs');
const path = require('path');

// قائمة الملفات التي تحتاج تحديث
const filesToUpdate = [
    'src/pages/Stores/StoresList.jsx',
    'src/pages/Stores/StoresDashboard.jsx',
    'src/pages/Products/ProductsPage.jsx',
    'src/components/NotificationCenter.jsx',
    'src/components/Stores/AddStoreModal.jsx',
    'src/components/Stores/EditStoreModal.jsx',
    'src/components/Stores/ExportModal.jsx',
    'src/components/Stores/DeleteConfirmModal.jsx',
    'src/components/PreferencesSettings.jsx',
    'src/components/Products/ProductForm.jsx',
    'src/components/Products/ProductCard.jsx',
    'src/components/LogoutConfirmation.jsx',
    'src/components/EnhancedSessionStatus.jsx',
    'src/components/EnhancedSessionManager.jsx',
    'src/components/DashboardSettings.jsx',
    'src/components/Auth/ProtectedRoute.jsx',
];

// دالة لتحديث ملف واحد
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // استبدال import
        content = content.replace(
            /import toast from ['"]react-hot-toast['"];?/g,
            "import { useToastContext } from '../components/common';"
        );

        content = content.replace(
            /import { toast } from ['"]react-hot-toast['"];?/g,
            "import { useToastContext } from '../components/common';"
        );

        // إضافة hook في بداية المكون
        content = content.replace(
            /(const \w+ = \([^)]*\) => \{)/,
            '$1\n  const toast = useToastContext();'
        );

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ تم تحديث: ${filePath}`);
    } catch (error) {
        console.error(`❌ خطأ في تحديث ${filePath}:`, error.message);
    }
}

// تشغيل التحديث على جميع الملفات
console.log('🚀 بدء تحديث ملفات التوست...');
filesToUpdate.forEach(file => {
    const fullPath = path.join(__dirname, '..', '..', file);
    if (fs.existsSync(fullPath)) {
        updateFile(fullPath);
    } else {
        console.log(`⚠️ الملف غير موجود: ${file}`);
    }
});

console.log('✨ تم الانتهاء من تحديث جميع الملفات!'); 