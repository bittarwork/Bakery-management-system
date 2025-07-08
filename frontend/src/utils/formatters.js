/**
 * دوال مساعدة للتنسيق والعرض مع دعم تفضيلات المستخدم
 */

// الحصول على التفضيلات من localStorage
const getUserPreferences = () => {
    try {
        const prefs = localStorage.getItem('userPreferences');
        return prefs ? JSON.parse(prefs) : null;
    } catch {
        return null;
    }
};

// الحصول على اللغة الحالية
const getCurrentLanguage = () => {
    const prefs = getUserPreferences();
    return prefs?.general?.language || 'ar';
};

// الحصول على العملة الحالية
const getCurrentCurrency = () => {
    const prefs = getUserPreferences();
    return prefs?.general?.currency || 'SAR';
};

// الحصول على المنطقة الزمنية
const getCurrentTimezone = () => {
    const prefs = getUserPreferences();
    return prefs?.general?.timezone || 'Asia/Riyadh';
};

// تنسيق العملة مع دعم التفضيلات
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0.00';

    const currency = getCurrentCurrency();
    const language = getCurrentLanguage();

    // تحديد الـ locale بناءً على اللغة
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    } catch {
        // fallback في حالة عدم دعم العملة
        return `${amount.toFixed(2)} ${currency}`;
    }
};

// تنسيق الأرقام مع دعم اللغة
export const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';

    const language = getCurrentLanguage();
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';

    return new Intl.NumberFormat(locale).format(number);
};

// تنسيق التاريخ مع دعم اللغة والمنطقة الزمنية
export const formatDate = (date) => {
    if (!date) return '';

    const language = getCurrentLanguage();
    const timezone = getCurrentTimezone();
    const locale = language === 'ar' ? 'ar-SA' : 'en-GB';

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: timezone
    }).format(new Date(date));
};

// تنسيق التاريخ والوقت مع دعم اللغة
export const formatDateTime = (date) => {
    if (!date) return '';

    const language = getCurrentLanguage();
    const timezone = getCurrentTimezone();
    const locale = language === 'ar' ? 'ar-SA' : 'en-GB';

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
    }).format(new Date(date));
};

// تنسيق الوقت فقط
export const formatTime = (date) => {
    if (!date) return '';

    const language = getCurrentLanguage();
    const timezone = getCurrentTimezone();
    const locale = language === 'ar' ? 'ar-SA' : 'en-GB';

    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
    }).format(new Date(date));
};

// تنسيق النسبة المئوية
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
};

// تنسيق حجم الملف
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const language = getCurrentLanguage();

    const sizes = language === 'ar'
        ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
        : ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// تنسيق المدة الزمنية
export const formatDuration = (minutes) => {
    if (!minutes) return getCurrentLanguage() === 'ar' ? '0 دقيقة' : '0 minutes';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const language = getCurrentLanguage();

    if (language === 'ar') {
        if (hours > 0) {
            return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
        }
        return `${mins} دقيقة`;
    } else {
        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` and ${mins} minute${mins > 1 ? 's' : ''}` : ''}`;
        }
        return `${mins} minute${mins > 1 ? 's' : ''}`;
    }
};

// تنسيق المسافة
export const formatDistance = (meters) => {
    if (!meters) return getCurrentLanguage() === 'ar' ? '0 م' : '0 m';
    const language = getCurrentLanguage();

    if (meters >= 1000) {
        return language === 'ar'
            ? `${(meters / 1000).toFixed(1)} كم`
            : `${(meters / 1000).toFixed(1)} km`;
    }
    return language === 'ar' ? `${meters} م` : `${meters} m`;
};

// تنسيق الوزن
export const formatWeight = (grams) => {
    if (!grams) return getCurrentLanguage() === 'ar' ? '0 غ' : '0 g';
    const language = getCurrentLanguage();

    if (grams >= 1000) {
        return language === 'ar'
            ? `${(grams / 1000).toFixed(1)} كغ`
            : `${(grams / 1000).toFixed(1)} kg`;
    }
    return language === 'ar' ? `${grams} غ` : `${grams} g`;
};

// تنسيق رقم الهاتف
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 11) {
        return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4');
    }

    return phone;
};

// اختصار النص
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// تحويل النص إلى عنوان URL
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// تنسيق الحالة مع دعم اللغات
export const formatStatus = (status) => {
    const language = getCurrentLanguage();

    const statusMaps = {
        ar: {
            // Order statuses
            'draft': 'مسودة',
            'confirmed': 'مؤكد',
            'in_progress': 'قيد التنفيذ',
            'delivered': 'تم التسليم',
            'cancelled': 'ملغي',

            // Payment statuses
            'pending': 'معلق',
            'paid': 'مدفوع',
            'partial': 'مدفوع جزئياً',
            'overdue': 'متأخر',

            // User statuses
            'active': 'نشط',
            'inactive': 'غير نشط',
            'suspended': 'معلق',

            // Order related
            'orders': 'الطلبات',
            'order': 'طلب',
            'new_order': 'طلب جديد',
            'order_details': 'تفاصيل الطلب',
            'order_number': 'رقم الطلب',
            'order_date': 'تاريخ الطلب',
            'delivery_date': 'تاريخ التسليم',
            'total_amount': 'المبلغ الإجمالي',
            'discount_amount': 'مبلغ الخصم',
            'final_amount': 'المبلغ النهائي',
            'paid_amount': 'المبلغ المدفوع',
            'remaining_amount': 'المبلغ المتبقي',
            'store_name': 'اسم المتجر',
            'customer_name': 'اسم العميل',
            'items': 'العناصر',
            'quantity': 'الكمية',
            'unit_price': 'سعر الوحدة',
            'notes': 'ملاحظات',
            'gifts': 'الهدايا',

            // Navigation & Layout
            'dashboard': 'لوحة التحكم',
            'products': 'المنتجات',
            'stores': 'المحلات',
            'distribution': 'التوزيع',
            'payments': 'المدفوعات',
            'reports': 'التقارير',
            'viewProfile': 'عرض الملف',
            'openMenu': 'فتح القائمة',
            'toggleTheme': 'تبديل المظهر',
            'themeShortcuts': 'اختصارات المظهر',
            'notificationShortcuts': 'اختصارات الإشعارات',
            'keyboardShortcuts': 'اختصارات لوحة المفاتيح',
            'notifications': 'الإشعارات',

            // Settings / Preferences
            'preferences': 'التفضيلات',
            'userSettings': 'إعدادات المستخدم',
            'managePreferences': 'إدارة التفضيلات',
            'quickInfo': 'معلومات سريعة',
            'language': 'اللغة',
            'theme': 'المظهر',
            'generalSettings': 'الإعدادات العامة',

            // Pagination & UI
            'previous': 'السابق',
            'next': 'التالي',

            // Orders status
            'status_pending': 'قيد الانتظار',
            'status_confirmed': 'مؤكد',
            'status_delivered': 'تم التسليم',
            'status_cancelled': 'ملغي',

            // Filters / Actions
            'retry': 'إعادة المحاولة',
            'apply': 'تطبيق',
            'reset': 'إعادة تعيين',
            'advanced': 'متقدم',
            'all_stores': 'جميع المحلات',
            'date_from': 'من تاريخ',
            'date_to': 'إلى تاريخ',
            'amount_min': 'أقل مبلغ',
            'amount_max': 'أكبر مبلغ',
            'saved_filters': 'الفلاتر المحفوظة',
            'save_preset': 'حفظ الإعداد',
            'preset_name': 'اسم الإعداد',
            'active_filters': 'الفلاتر النشطة',

            // Toasts / Notifications
            'refresh_success': 'تم التحديث بنجاح',
            'preset_saved': 'تم حفظ الإعداد',
            'preset_loaded': 'تم تحميل الإعداد',
            'preset_deleted': 'تم حذف الإعداد',
            'bulk_action_success': 'تمت العملية بنجاح',
            'bulk_action_error': 'فشلت العملية',
            'order_updated': 'تم تحديث الطلب',
            'order_update_error': 'فشل تحديث الطلب',
            'status_updated': 'تم تحديث الحالة',
            'status_update_error': 'فشل تحديث الحالة',
            'import_error': 'خطأ في الاستيراد',

            // Stats & Misc
            'completion_rate': 'معدل الإنجاز',
            'of_target': 'من الهدف',
            'sales': 'المبيعات',
            'completed': 'مكتملة',

            // Stores Page specific
            'stores_management': 'إدارة المحلات',
            'stores_page_subtitle': 'عرض وإدارة جميع المحلات مع الإحصائيات والخريطة التفاعلية',
            'stores_list': 'قائمة المحلات',
            'stores_list_subtitle': 'إدارة وعرض جميع المحلات المسجلة في النظام',
            'stores_map': 'خريطة المحلات',
            'stores_map_subtitle': 'عرض المحلات على الخريطة مع الإحصائيات والمعلومات الجغرافية',
            'list': 'القائمة',
            'map': 'الخريطة',

            // Orders & Products Page
            'orders_management': 'إدارة الطلبات',
            'view_manage_orders': 'عرض وإدارة جميع الطلبات',
            'products_management': 'إدارة المنتجات',
            'view_manage_products': 'عرض وإدارة جميع المنتجات والأسعار',
        },
        en: {
            // Order statuses
            'draft': 'Draft',
            'confirmed': 'Confirmed',
            'in_progress': 'In Progress',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',

            // Payment statuses
            'pending': 'Pending',
            'paid': 'Paid',
            'partial': 'Partially Paid',
            'overdue': 'Overdue',

            // User statuses
            'active': 'Active',
            'inactive': 'Inactive',
            'suspended': 'Suspended',

            // Order related
            'orders': 'Orders',
            'order': 'Order',
            'new_order': 'New Order',
            'order_details': 'Order Details',
            'order_number': 'Order Number',
            'order_date': 'Order Date',
            'delivery_date': 'Delivery Date',
            'total_amount': 'Total Amount',
            'discount_amount': 'Discount Amount',
            'final_amount': 'Final Amount',
            'paid_amount': 'Paid Amount',
            'remaining_amount': 'Remaining Amount',
            'store_name': 'Store Name',
            'customer_name': 'Customer Name',
            'items': 'Items',
            'quantity': 'Quantity',
            'unit_price': 'Unit Price',
            'notes': 'Notes',
            'gifts': 'Gifts',

            // Navigation & Layout
            'dashboard': 'Dashboard',
            'products': 'Products',
            'stores': 'Stores',
            'distribution': 'Distribution',
            'payments': 'Payments',
            'reports': 'Reports',
            'viewProfile': 'View Profile',
            'openMenu': 'Open menu',
            'toggleTheme': 'Toggle theme',
            'themeShortcuts': 'Theme shortcuts',
            'notificationShortcuts': 'Notification shortcuts',
            'keyboardShortcuts': 'Keyboard shortcuts',
            'notifications': 'Notifications',

            // Settings / Preferences
            'preferences': 'Preferences',
            'userSettings': 'User Settings',
            'managePreferences': 'Manage Preferences',
            'quickInfo': 'Quick Info',
            'language': 'Language',
            'theme': 'Theme',
            'generalSettings': 'General Settings',

            // Pagination & UI
            'previous': 'Previous',
            'next': 'Next',

            // Orders status
            'status_pending': 'Pending',
            'status_confirmed': 'Confirmed',
            'status_delivered': 'Delivered',
            'status_cancelled': 'Cancelled',

            // Filters / Actions
            'retry': 'Retry',
            'apply': 'Apply',
            'reset': 'Reset',
            'advanced': 'Advanced',
            'all_stores': 'All Stores',
            'date_from': 'Date From',
            'date_to': 'Date To',
            'amount_min': 'Min Amount',
            'amount_max': 'Max Amount',
            'saved_filters': 'Saved Filters',
            'save_preset': 'Save Preset',
            'preset_name': 'Preset Name',
            'active_filters': 'Active Filters',

            // Toasts / Notifications
            'refresh_success': 'Data updated successfully',
            'preset_saved': 'Preset saved successfully',
            'preset_loaded': 'Preset loaded successfully',
            'preset_deleted': 'Preset deleted successfully',
            'bulk_action_success': 'Bulk action completed',
            'bulk_action_error': 'Bulk action failed',
            'order_updated': 'Order updated',
            'order_update_error': 'Order update failed',
            'status_updated': 'Status updated',
            'status_update_error': 'Status update failed',
            'import_error': 'Import error',

            // Stats & Misc
            'completion_rate': 'Completion Rate',
            'of_target': 'of target',
            'sales': 'Sales',
            'completed': 'Completed',

            // Stores Page specific
            'stores_management': 'Stores Management',
            'stores_page_subtitle': 'View and manage all stores with interactive map and statistics',
            'stores_list': 'Stores List',
            'stores_list_subtitle': 'Manage and view all stores registered in the system',
            'stores_map': 'Stores Map',
            'stores_map_subtitle': 'Display stores on the map with statistics and geo information',
            'list': 'List',
            'map': 'Map',

            // Orders & Products Page
            'orders_management': 'Orders Management',
            'view_manage_orders': 'View and manage all orders',
            'products_management': 'Products Management',
            'view_manage_products': 'View and manage all products and prices',
        }
    };

    return statusMaps[language]?.[status] || status;
};

// تنسيق الأولوية مع دعم اللغات
export const formatPriority = (priority) => {
    const language = getCurrentLanguage();

    const priorityMaps = {
        ar: {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية',
            'urgent': 'عاجلة'
        },
        en: {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'urgent': 'Urgent'
        }
    };

    return priorityMaps[language]?.[priority] || priority;
};

// حساب العمر من تاريخ الميلاد
export const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

// تنسيق الفترة الزمنية النسبية
export const formatRelativeTime = (date) => {
    if (!date) return '';

    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now - target) / 1000);
    const language = getCurrentLanguage();

    const timeUnits = {
        ar: {
            now: 'الآن',
            minute: 'دقيقة',
            minutes: 'دقائق',
            hour: 'ساعة',
            hours: 'ساعات',
            day: 'يوم',
            days: 'أيام',
            week: 'أسبوع',
            weeks: 'أسابيع',
            month: 'شهر',
            months: 'أشهر',
            year: 'سنة',
            years: 'سنوات',
            ago: 'منذ'
        },
        en: {
            now: 'now',
            minute: 'minute',
            minutes: 'minutes',
            hour: 'hour',
            hours: 'hours',
            day: 'day',
            days: 'days',
            week: 'week',
            weeks: 'weeks',
            month: 'month',
            months: 'months',
            year: 'year',
            years: 'years',
            ago: 'ago'
        }
    };

    const units = timeUnits[language];

    if (diffInSeconds < 60) {
        return units.now;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        const unit = minutes === 1 ? units.minute : units.minutes;
        return language === 'ar' ? `${units.ago} ${minutes} ${unit}` : `${minutes} ${unit} ${units.ago}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        const unit = hours === 1 ? units.hour : units.hours;
        return language === 'ar' ? `${units.ago} ${hours} ${unit}` : `${hours} ${unit} ${units.ago}`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        const unit = days === 1 ? units.day : units.days;
        return language === 'ar' ? `${units.ago} ${days} ${unit}` : `${days} ${unit} ${units.ago}`;
    } else if (diffInSeconds < 2629746) {
        const weeks = Math.floor(diffInSeconds / 604800);
        const unit = weeks === 1 ? units.week : units.weeks;
        return language === 'ar' ? `${units.ago} ${weeks} ${unit}` : `${weeks} ${unit} ${units.ago}`;
    } else if (diffInSeconds < 31556952) {
        const months = Math.floor(diffInSeconds / 2629746);
        const unit = months === 1 ? units.month : units.months;
        return language === 'ar' ? `${units.ago} ${months} ${unit}` : `${months} ${unit} ${units.ago}`;
    } else {
        const years = Math.floor(diffInSeconds / 31556952);
        const unit = years === 1 ? units.year : units.years;
        return language === 'ar' ? `${units.ago} ${years} ${unit}` : `${years} ${unit} ${units.ago}`;
    }
};

// دالة مساعدة للحصول على النصوص المترجمة
export const getLocalizedText = (textKey, arFallback = '', enFallback = '') => {
    const language = getCurrentLanguage();

    const translations = {
        ar: {
            // Common terms
            'loading': 'جاري التحميل...',
            'error': 'خطأ',
            'success': 'نجح',
            'warning': 'تحذير',
            'info': 'معلومات',
            'confirm': 'تأكيد',
            'cancel': 'إلغاء',
            'save': 'حفظ',
            'delete': 'حذف',
            'edit': 'تعديل',
            'add': 'إضافة',
            'search': 'بحث',
            'filter': 'تصفية',
            'export': 'تصدير',
            'import': 'استيراد',
            'print': 'طباعة',
            'share': 'مشاركة',
            'copy': 'نسخ',
            'refresh': 'تحديث',
            'close': 'إغلاق',
            'open': 'فتح',
            'view': 'عرض',
            'details': 'التفاصيل',
            'settings': 'الإعدادات',
            'profile': 'الملف الشخصي',
            'logout': 'تسجيل الخروج',
            'login': 'تسجيل الدخول',

            // Order related
            'orders': 'الطلبات',
            'order': 'طلب',
            'new_order': 'طلب جديد',
            'order_details': 'تفاصيل الطلب',
            'order_number': 'رقم الطلب',
            'order_date': 'تاريخ الطلب',
            'delivery_date': 'تاريخ التسليم',
            'total_amount': 'المبلغ الإجمالي',
            'discount_amount': 'مبلغ الخصم',
            'final_amount': 'المبلغ النهائي',
            'paid_amount': 'المبلغ المدفوع',
            'remaining_amount': 'المبلغ المتبقي',
            'store_name': 'اسم المتجر',
            'customer_name': 'اسم العميل',
            'items': 'العناصر',
            'quantity': 'الكمية',
            'unit_price': 'سعر الوحدة',
            'notes': 'ملاحظات',
            'gifts': 'الهدايا',

            // Navigation & Layout
            'dashboard': 'لوحة التحكم',
            'products': 'المنتجات',
            'stores': 'المحلات',
            'distribution': 'التوزيع',
            'payments': 'المدفوعات',
            'reports': 'التقارير',
            'viewProfile': 'عرض الملف',
            'openMenu': 'فتح القائمة',
            'toggleTheme': 'تبديل المظهر',
            'themeShortcuts': 'اختصارات المظهر',
            'notificationShortcuts': 'اختصارات الإشعارات',
            'keyboardShortcuts': 'اختصارات لوحة المفاتيح',
            'notifications': 'الإشعارات',

            // Settings / Preferences
            'preferences': 'التفضيلات',
            'userSettings': 'إعدادات المستخدم',
            'managePreferences': 'إدارة التفضيلات',
            'quickInfo': 'معلومات سريعة',
            'language': 'اللغة',
            'theme': 'المظهر',
            'generalSettings': 'الإعدادات العامة',

            // Pagination & UI
            'previous': 'السابق',
            'next': 'التالي',

            // Orders status
            'status_pending': 'قيد الانتظار',
            'status_confirmed': 'مؤكد',
            'status_delivered': 'تم التسليم',
            'status_cancelled': 'ملغي',

            // Filters / Actions
            'retry': 'إعادة المحاولة',
            'apply': 'تطبيق',
            'reset': 'إعادة تعيين',
            'advanced': 'متقدم',
            'all_stores': 'جميع المحلات',
            'date_from': 'من تاريخ',
            'date_to': 'إلى تاريخ',
            'amount_min': 'أقل مبلغ',
            'amount_max': 'أكبر مبلغ',
            'saved_filters': 'الفلاتر المحفوظة',
            'save_preset': 'حفظ الإعداد',
            'preset_name': 'اسم الإعداد',
            'active_filters': 'الفلاتر النشطة',

            // Toasts / Notifications
            'refresh_success': 'تم التحديث بنجاح',
            'preset_saved': 'تم حفظ الإعداد',
            'preset_loaded': 'تم تحميل الإعداد',
            'preset_deleted': 'تم حذف الإعداد',
            'bulk_action_success': 'تمت العملية بنجاح',
            'bulk_action_error': 'فشلت العملية',
            'order_updated': 'تم تحديث الطلب',
            'order_update_error': 'فشل تحديث الطلب',
            'status_updated': 'تم تحديث الحالة',
            'status_update_error': 'فشل تحديث الحالة',
            'import_error': 'خطأ في الاستيراد',

            // Stats & Misc
            'completion_rate': 'معدل الإنجاز',
            'of_target': 'من الهدف',
            'sales': 'المبيعات',
            'completed': 'مكتملة',

            // Stores Page specific
            'stores_management': 'إدارة المحلات',
            'stores_page_subtitle': 'عرض وإدارة جميع المحلات مع الإحصائيات والخريطة التفاعلية',
            'stores_list': 'قائمة المحلات',
            'stores_list_subtitle': 'إدارة وعرض جميع المحلات المسجلة في النظام',
            'stores_map': 'خريطة المحلات',
            'stores_map_subtitle': 'عرض المحلات على الخريطة مع الإحصائيات والمعلومات الجغرافية',
            'list': 'القائمة',
            'map': 'الخريطة',

            // Orders & Products Page
            'orders_management': 'إدارة الطلبات',
            'view_manage_orders': 'عرض وإدارة جميع الطلبات',
            'products_management': 'إدارة المنتجات',
            'view_manage_products': 'عرض وإدارة جميع المنتجات والأسعار',
        },
        en: {
            // Common terms
            'loading': 'Loading...',
            'error': 'Error',
            'success': 'Success',
            'warning': 'Warning',
            'info': 'Information',
            'confirm': 'Confirm',
            'cancel': 'Cancel',
            'save': 'Save',
            'delete': 'Delete',
            'edit': 'Edit',
            'add': 'Add',
            'search': 'Search',
            'filter': 'Filter',
            'export': 'Export',
            'import': 'Import',
            'print': 'Print',
            'share': 'Share',
            'copy': 'Copy',
            'refresh': 'Refresh',
            'close': 'Close',
            'open': 'Open',
            'view': 'View',
            'details': 'Details',
            'settings': 'Settings',
            'profile': 'Profile',
            'logout': 'Logout',
            'login': 'Login',

            // Order related
            'orders': 'Orders',
            'order': 'Order',
            'new_order': 'New Order',
            'order_details': 'Order Details',
            'order_number': 'Order Number',
            'order_date': 'Order Date',
            'delivery_date': 'Delivery Date',
            'total_amount': 'Total Amount',
            'discount_amount': 'Discount Amount',
            'final_amount': 'Final Amount',
            'paid_amount': 'Paid Amount',
            'remaining_amount': 'Remaining Amount',
            'store_name': 'Store Name',
            'customer_name': 'Customer Name',
            'items': 'Items',
            'quantity': 'Quantity',
            'unit_price': 'Unit Price',
            'notes': 'Notes',
            'gifts': 'Gifts',

            // Navigation & Layout
            'dashboard': 'Dashboard',
            'products': 'Products',
            'stores': 'Stores',
            'distribution': 'Distribution',
            'payments': 'Payments',
            'reports': 'Reports',
            'viewProfile': 'View Profile',
            'openMenu': 'Open menu',
            'toggleTheme': 'Toggle theme',
            'themeShortcuts': 'Theme shortcuts',
            'notificationShortcuts': 'Notification shortcuts',
            'keyboardShortcuts': 'Keyboard shortcuts',
            'notifications': 'Notifications',

            // Settings / Preferences
            'preferences': 'Preferences',
            'userSettings': 'User Settings',
            'managePreferences': 'Manage Preferences',
            'quickInfo': 'Quick Info',
            'language': 'Language',
            'theme': 'Theme',
            'generalSettings': 'General Settings',

            // Pagination & UI
            'previous': 'Previous',
            'next': 'Next',

            // Orders status
            'status_pending': 'Pending',
            'status_confirmed': 'Confirmed',
            'status_delivered': 'Delivered',
            'status_cancelled': 'Cancelled',

            // Filters / Actions
            'retry': 'Retry',
            'apply': 'Apply',
            'reset': 'Reset',
            'advanced': 'Advanced',
            'all_stores': 'All Stores',
            'date_from': 'Date From',
            'date_to': 'Date To',
            'amount_min': 'Min Amount',
            'amount_max': 'Max Amount',
            'saved_filters': 'Saved Filters',
            'save_preset': 'Save Preset',
            'preset_name': 'Preset Name',
            'active_filters': 'Active Filters',

            // Toasts / Notifications
            'refresh_success': 'Data updated successfully',
            'preset_saved': 'Preset saved successfully',
            'preset_loaded': 'Preset loaded successfully',
            'preset_deleted': 'Preset deleted successfully',
            'bulk_action_success': 'Bulk action completed',
            'bulk_action_error': 'Bulk action failed',
            'order_updated': 'Order updated',
            'order_update_error': 'Order update failed',
            'status_updated': 'Status updated',
            'status_update_error': 'Status update failed',
            'import_error': 'Import error',

            // Stats & Misc
            'completion_rate': 'Completion Rate',
            'of_target': 'of target',
            'sales': 'Sales',
            'completed': 'Completed',

            // Stores Page specific
            'stores_management': 'Stores Management',
            'stores_page_subtitle': 'View and manage all stores with interactive map and statistics',
            'stores_list': 'Stores List',
            'stores_list_subtitle': 'Manage and view all stores registered in the system',
            'stores_map': 'Stores Map',
            'stores_map_subtitle': 'Display stores on the map with statistics and geo information',
            'list': 'List',
            'map': 'Map',

            // Orders & Products Page
            'orders_management': 'Orders Management',
            'view_manage_orders': 'View and manage all orders',
            'products_management': 'Products Management',
            'view_manage_products': 'View and manage all products and prices',
        }
    };

    // 1) Use dictionary if found
    if (translations[language] && translations[language][textKey]) {
        return translations[language][textKey];
    }

    // 2) Use provided fallbacks when caller supplies both Arabic & English
    if (enFallback !== '') {
        return language === 'ar' ? arFallback : enFallback;
    }

    // 3) Fallback to single provided value or key itself
    return arFallback || textKey;
};

export default {
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
    formatTime,
    formatPercentage,
    formatFileSize,
    formatDuration,
    formatDistance,
    formatWeight,
    formatPhoneNumber,
    truncateText,
    slugify,
    formatStatus,
    formatPriority,
    calculateAge,
    formatRelativeTime,
    getLocalizedText
}; 