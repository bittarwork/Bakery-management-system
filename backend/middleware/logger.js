import chalk from 'chalk';

/**
 * Middleware لتسجيل الطلبات الواردة بطريقة احترافية
 */

// ألوان للحالات المختلفة
const statusColors = {
    2: chalk.green,      // 2xx - نجاح
    3: chalk.cyan,       // 3xx - إعادة توجيه
    4: chalk.yellow,     // 4xx - خطأ العميل
    5: chalk.red         // 5xx - خطأ الخادم
};

// أيقونات للطرق المختلفة
const methodIcons = {
    GET: '📖',
    POST: '📝',
    PUT: '✏️',
    PATCH: '🔧',
    DELETE: '🗑️'
};

// دالة لتنسيق الوقت
const formatTime = () => {
    return new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/Brussels',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// دالة لتنسيق مدة الاستجابة
const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

// دالة لاستخراج معلومات المستخدم
const getUserInfo = (req) => {
    if (req.user) {
        return `${req.user.full_name} (${req.user.role})`;
    }
    return 'غير مُسجل';
};

// دالة لتنسيق حجم البيانات
const formatSize = (bytes) => {
    if (!bytes) return '0B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`;
};

// دالة لاستخراج IP الحقيقي
const getRealIP = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.ip;
};

/**
 * Middleware الرئيسي للتسجيل
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = formatTime();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = getRealIP(req);

    // تسجيل بداية الطلب
    const methodIcon = methodIcons[method] || '📄';
    const methodColor = method === 'GET' ? chalk.blue :
        method === 'POST' ? chalk.green :
            method === 'PUT' ? chalk.yellow :
                method === 'PATCH' ? chalk.orange :
                    method === 'DELETE' ? chalk.red : chalk.white;

    console.log(chalk.gray(`[${timestamp}]`) +
        ` ${methodIcon} ` +
        (methodColor ? methodColor.bold(`${method}`) : chalk.white.bold(`${method}`)) +
        ` ${chalk.cyan(url)} ` +
        chalk.gray(`from ${ip ? ip.replace('::ffff:', '') : 'unknown'}`));

    // تسجيل معلومات إضافية للطلبات المهمة
    if (method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
        const bodySize = JSON.stringify(req.body).length;
        console.log(chalk.gray(`    📦 Body: ${formatSize(bodySize)}`));
    }

    // Override للـ res.json لتسجيل الاستجابة
    const originalJson = res.json;
    res.json = function (data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const statusClass = Math.floor(statusCode / 100);
        const statusColor = statusColors[statusClass] || chalk.white;

        // تسجيل الاستجابة
        console.log(chalk.gray(`[${formatTime()}]`) +
            ` ${methodIcon} ` +
            (methodColor ? methodColor.bold(`${method}`) : chalk.white.bold(`${method}`)) +
            ` ${chalk.cyan(url)} ` +
            (statusColor ? statusColor.bold(`${statusCode}`) : chalk.white.bold(`${statusCode}`)) +
            ` ${chalk.magenta(formatDuration(duration))}`);

        // تسجيل معلومات المستخدم للطلبات المحمية
        if (req.user) {
            console.log(chalk.gray(`    👤 User: ${getUserInfo(req)}`));
        }

        // تسجيل الأخطاء
        if (statusClass >= 4) {
            if (data && data.message) {
                console.log(chalk.gray(`    ❌ Error: ${data.message}`));
            }
        }

        // تسجيل العمليات المهمة
        if (method !== 'GET' && data && data.success) {
            if (data.data && data.data.id) {
                console.log(chalk.gray(`    ✅ Resource ID: ${data.data.id}`));
            }
        }

        console.log(chalk.gray('    ' + '─'.repeat(50)));

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Middleware لتسجيل الأخطاء
 */
export const errorLogger = (err, req, res, next) => {
    const timestamp = formatTime();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = getRealIP(req);

    console.log(chalk.red.bold(`[${timestamp}] 💥 ERROR`));
    console.log(chalk.red(`    ${method} ${url} from ${ip ? ip.replace('::ffff:', '') : 'unknown'}`));
    console.log(chalk.red(`    Message: ${err.message}`));

    if (req.user) {
        console.log(chalk.red(`    User: ${getUserInfo(req)}`));
    }

    // تسجيل stack trace في development فقط
    if (process.env.NODE_ENV === 'development') {
        console.log(chalk.red(`    Stack: ${err.stack}`));
    }

    console.log(chalk.red('    ' + '═'.repeat(50)));

    next(err);
};

/**
 * Middleware مبسط للتطوير
 */
export const simpleLogger = (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const methodIcon = methodIcons[method] || '📄';

    console.log(`${methodIcon} ${method} ${url}`);
    next();
};

export default {
    requestLogger,
    errorLogger,
    simpleLogger
}; 