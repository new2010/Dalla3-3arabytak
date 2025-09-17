// إعدادات API للمتجر
// بعد نشر Google Apps Script، ضع الرابط هنا
const API_BASE = "https://script.google.com/macros/s/AKfycbzFYDMcyMhKIvVxaipO5QBpe57e-0FRqDTqSGDTkOfYCpqNx6r9w3A1qP5JLgLZKPWO/exec";

// ملاحظة: لا تضع ADMIN_KEY هنا أبداً
// سيتم إدخال ADMIN_KEY يدوياً في لوحة الأدمن عند تسجيل الدخول

// إعدادات عامة للمتجر
const STORE_CONFIG = {
    storeName: "دلع عربيتك",
    currency: "جنيه",
    shippingCost: 50,
    freeShippingThreshold: 500,
    categories: [
        "الكل",
        "إكسسوارات داخلية", 
        "إكسسوارات خارجية",
        "إضاءة",
        "تنظيف وعناية",
        "قطع غيار"
    ]
};

// رسائل التطبيق
const MESSAGES = {
    loading: "جاري التحميل...",
    error: "حدث خطأ، يرجى المحاولة مرة أخرى",
    addedToCart: "تم إضافة المنتج للسلة بنجاح",
    productNotFound: "لم يتم العثور على المنتج",
    orderSuccess: "تم إرسال طلبك بنجاح",
    emptyCart: "السلة فارغة",
    invalidPhone: "رقم الهاتف غير صحيح",
    requiredFields: "يرجى ملء جميع الحقول المطلوبة"
};
