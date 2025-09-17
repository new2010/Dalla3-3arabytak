# دلع عربيتك - متجر إكسسوارات السيارات

## نظرة عامة
متجر إلكتروني لإكسسوارات السيارات يعمل على GitHub Pages مع Google Sheets كقاعدة بيانات.

## الهيكل العام
```
├── index.html          # الصفحة الرئيسية (قائمة المنتجات)
├── product.html        # صفحة منتج واحد
├── cart.html          # سلة المشتريات والدفع  
├── admin.html         # لوحة الأدمن (مخفية)
├── config.js          # إعدادات API
├── assets/
│   ├── style.css      # التصميم الرئيسي
│   └── app.js         # الوظائف الرئيسية
├── products.json      # نسخة احتياطية محلية
└── README.md
```

## خطوات النشر والربط (خطوة بخطوة)

### 1. إعداد Google Sheets
1. انتقل إلى [Google Sheets](https://sheets.google.com)
2. أنشئ جدول بيانات جديد باسم "دلع عربيتك - قاعدة البيانات"
3. أنشئ Sheet باسم "Products" مع الأعمدة:
   ```
   id | name | image_desc | short_desc | long_desc | price | stock | category | tags | featured | created_at
   ```
4. أنشئ Sheet باسم "Orders" مع الأعمدة:
   ```
   order_id | customer_name | phone | address | items_json | subtotal | shipping | total | status | created_at
   ```
5. انسخ ID الجدول من الرابط (الجزء بين `/d/` و `/edit`)

### 2. إعداد Google Apps Script
1. في الجدول، اذهب إلى Extensions → Apps Script
2. احذف الكود الموجود والصق كود `Code.gs` المرفق
3. احفظ المشروع باسم "دلع عربيتك API"

### 3. إعداد Script Properties
1. في Apps Script، اذهب إلى Project Settings → Script properties
2. أضف خصائص جديدة:
   - Key: `SHEET_ID`, Value: `[ID الجدول من الخطوة 1]`
   - Key: `ADMIN_KEY`, Value: `[كلمة مرور قوية للأدمن مثل: MySecureKey2025!]`

### 4. نشر Web App
1. في Apps Script، انقر على Deploy → New deployment
2. اختر Type: Web app
3. إعدادات:
   - Execute as: Me
   - Who has access: Anyone
4. انقر Deploy وانسخ Web app URL

### 5. إعداد المشروع المحلي
1. عدّل ملف `config.js`:
   ```javascript
   const API_BASE = "YOUR_WEB_APP_URL_HERE";
   ```
2. ضع الرابط من الخطوة 4 مكان `YOUR_WEB_APP_URL_HERE`

### 6. نشر على GitHub Pages
1. أنشئ repository جديد على GitHub
2. ارفع جميع ملفات المشروع
3. اذهب إلى Settings → Pages
4. اختر Source: Deploy from a branch
5. Branch: main, Folder: / (root)
6. احفظ وانتظر النشر

## اختبار المشروع

### اختبارات الوظائف الأساسية
- [ ] الصفحة الرئيسية تعرض المنتجات
- [ ] يمكن عرض تفاصيل منتج واحد
- [ ] يمكن إضافة منتجات للسلة
- [ ] يمكن إكمال عملية شراء
- [ ] الطلب يظهر في Google Sheets

### اختبارات الأدمن
- [ ] تسجيل دخول لوحة الأدمن
- [ ] إضافة منتج جديد من الأدمن
- [ ] المنتج الجديد يظهر في الصفحة الرئيسية
- [ ] تعديل حالة طلب من الأدمن
- [ ] عرض إحصائيات المبيعات

### اختبارات الاستجابة
- [ ] الموقع يعمل على الهاتف المحمول
- [ ] الموقع يعمل على سطح المكتب
- [ ] النصوص العربية تظهر بشكل صحيح (RTL)

## البيانات التجريبية
يحتوي المشروع على 5 منتجات تجريبية:
1. طقم دواسات جلد فاخر
2. مساند رأس مطرزة
3. أضواء LED داخلية
4. كفرات مقود جلد طبيعي  
5. منظم حقيبة صندوق السيارة

## الأمان والاحتياطات
⚠️ **تنبيهات مهمة:**
- هذا تصميم MVP بسيط، ADMIN_KEY في body مناسب للتطوير فقط
- لا تضع ADMIN_KEY في config.js أو أي ملف عام
- احتفظ بنسخ احتياطية دورية من Google Sheets  
- Apps Script ينفذ بصلاحيات حسابك، تأكد من أمان الاستخدام

## الترقيات المستقبلية المقترحة
- دمج WhatsApp API للإشعارات
- ربط بوابة دفع إلكتروني
- ترقية المصادقة إلى Firebase Auth
- تصدير تقارير PDF
- رفع الصور الفعلية للمنتجات

## دعم فني
في حالة وجود مشاكل:
1. تحقق من إعدادات Script Properties
2. تأكد من نشر Web App بالإعدادات الصحيحة  
3. افحص console المتصفح للأخطاء
4. تحقق من أعمدة Google Sheets تطابق المواصفات

---
مشروع "دلع عربيتك" - متجر إكسسوارات السيارات
تم التطوير كـ MVP لاختبار السوق والتطوير التدريجي