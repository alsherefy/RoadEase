# دليل إعداد وتعديل مشروع ROAD EASE على GitHub

## 📋 المحتويات
1. [إنشاء مستودع GitHub](#إنشاء-مستودع-github)
2. [رفع المشروع إلى GitHub](#رفع-المشروع-إلى-github)
3. [التعديل عبر واجهة GitHub الويب](#التعديل-عبر-واجهة-github-الويب)
4. [التعديل المحلي وربطه بـ GitHub](#التعديل-المحلي-وربطه-بـ-github)
5. [نشر التحديثات على Netlify](#نشر-التحديثات-على-netlify)

---

## 🚀 إنشاء مستودع GitHub

### الخطوة 1: إنشاء مستودع جديد
1. اذهب إلى [GitHub.com](https://github.com)
2. انقر على **"New repository"** أو **"+"** ثم **"New repository"**
3. أدخل التفاصيل:
   ```
   Repository name: road-ease-workshop
   Description: نظام إدارة ورشة السيارات المتكامل - ROAD EASE
   Visibility: Public (أو Private حسب اختيارك)
   ✅ Add a README file
   ✅ Add .gitignore (Node)
   ```
4. انقر **"Create repository"**

---

## 📤 رفع المشروع إلى GitHub

### الطريقة 1: رفع الملفات مباشرة عبر الويب

#### رفع كل ملف منفرداً:
1. في صفحة المستودع، انقر **"Add file"** > **"Create new file"**
2. اكتب اسم الملف (مثل: `package.json`)
3. انسخ والصق محتوى الملف من هذه البيئة
4. انقر **"Commit changes"**
5. كرر العملية لكل ملف

#### رفع عدة ملفات:
1. انقر **"Add file"** > **"Upload files"**
2. اسحب الملفات أو انقر **"choose your files"**
3. أضف رسالة الـ commit: `Initial project setup`
4. انقر **"Commit changes"**

### الطريقة 2: استخدام Git محلياً

```bash
# استنسخ المستودع الجديد
git clone https://github.com/yourusername/road-ease-workshop.git
cd road-ease-workshop

# انسخ جميع ملفات المشروع إلى هذا المجلد
# ثم ارفعها:
git add .
git commit -m "Initial project setup"
git push origin main
```

---

## ✏️ التعديل عبر واجهة GitHub الويب

### تعديل ملف موجود:
1. انتقل إلى الملف المراد تعديله
2. انقر على أيقونة القلم **"Edit this file"** 
3. قم بالتعديلات المطلوبة
4. في الأسفل، أضف وصف للتغيير
5. انقر **"Commit changes"**

### إنشاء ملف جديد:
1. انقر **"Add file"** > **"Create new file"**
2. اكتب مسار الملف مع اسمه (مثل: `src/pages/NewPage.tsx`)
3. أضف المحتوى
4. انقر **"Commit changes"**

### إنشاء مجلد جديد:
1. انقر **"Add file"** > **"Create new file"**
2. اكتب مسار المجلد مع `/` (مثل: `src/newFolder/file.tsx`)
3. GitHub سينشئ المجلد تلقائياً

---

## 💻 التعديل المحلي وربطه بـ GitHub

### إعداد البيئة المحلية:

#### 1. تثبيت المتطلبات:
```bash
# تثبيت Node.js (إذا لم يكن مثبتاً)
# قم بتحميله من: https://nodejs.org

# تثبيت Git (إذا لم يكن مثبتاً)  
# قم بتحميله من: https://git-scm.com
```

#### 2. استنساخ المشروع:
```bash
git clone https://github.com/yourusername/road-ease-workshop.git
cd road-ease-workshop
```

#### 3. تثبيت المكتبات:
```bash
npm install
```

#### 4. تشغيل المشروع:
```bash
npm run dev
```

### سير العمل للتعديل:

#### 1. إنشاء فرع جديد للتطوير:
```bash
git checkout -b feature/new-feature
```

#### 2. التعديل على الملفات باستخدام محرر نصوص:
```bash
# فتح المشروع في Visual Studio Code
code .

# أو أي محرر آخر تفضله
```

#### 3. حفظ التغييرات:
```bash
git add .
git commit -m "وصف التغيير"
```

#### 4. رفع التغييرات:
```bash
git push origin feature/new-feature
```

#### 5. إنشاء Pull Request في GitHub:
1. اذهب إلى صفحة المستودع
2. انقر **"Compare & pull request"**
3. أضف وصف للتغييرات
4. انقر **"Create pull request"**
5. ادمج التغييرات في الفرع الرئيسي

---

## 🔄 نشر التحديثات على Netlify

### الطريقة 1: الربط التلقائي
1. في لوحة تحكم Netlify، اذهب إلى موقعك
2. انقر **"Site settings"**
3. انقر **"Build & deploy"**
4. في قسم **"Continuous Deployment"**، انقر **"Link site to Git"**
5. اختر GitHub واختر مستودعك
6. أعد التكوين:
   ```
   Branch to deploy: main
   Build command: npm run build
   Publish directory: dist
   ```

الآن كلما قمت بتحديث الكود في GitHub، سيتم نشر التحديثات تلقائياً على Netlify!

### الطريقة 2: النشر اليدوي
1. بناء المشروع محلياً:
   ```bash
   npm run build
   ```
2. في Netlify، اسحب مجلد `dist` إلى منطقة النشر

---

## 📝 أمثلة تعديلات شائعة

### إضافة ماركة سيارة جديدة:
**الملف:** `src/data/saudiVehicles.ts`
```typescript
// أضف في نهاية المصفوفة:
{
  id: 'genesis',
  name: 'Genesis',
  nameEn: 'Genesis',
  models: [
    {
      id: 'g90',
      name: 'G90',
      nameEn: 'G90',
      years: [2024, 2023, 2022, 2021, 2020]
    }
  ]
}
```

### تعديل شعار الورشة:
**الملف:** `src/contexts/AppContext.tsx`
```typescript
// في دالة initializeSampleData، غير:
workshopName: 'اسم ورشتك الجديد',
```

### إضافة قائمة جديدة للشريط الجانبي:
**الملف:** `src/components/Layout/Sidebar.tsx`
```typescript
// أضف في navigationItems:
{ path: '/new-page', icon: NewIcon, label: 'صفحة جديدة', key: 'newPage' },
```

### تغيير الألوان الأساسية:
**الملف:** `tailwind.config.js`
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-secondary-color'
    }
  }
}
```

---

## 🚨 نصائح مهمة

### ✅ أفضل الممارسات:
- اكتب رسائل commit واضحة ومفصلة
- استخدم فروع منفصلة للميزات الجديدة
- اختبر التغييرات محلياً قبل رفعها
- احتفظ بنسخة احتياطية من البيانات المهمة

### ⚠️ تحذيرات:
- لا تشارك كلمات المرور أو المفاتيح السرية في الكود
- احذف ملفات `node_modules` قبل الرفع (موجودة في .gitignore)
- تأكد من أن الكود يعمل محلياً قبل النشر

### 🔧 حل المشاكل الشائعة:

#### خطأ في git push:
```bash
git pull origin main
# حل التعارضات إن وجدت
git push origin main
```

#### خطأ في npm install:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### خطأ في البناء:
```bash
npm run build
# راجع رسائل الخطأ وصححها
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع وثائق [GitHub](https://docs.github.com)
2. راجع وثائق [Netlify](https://docs.netlify.com)
3. تحقق من console للأخطاء في المتصفح
4. تأكد من تحديث المكتبات: `npm update`

---

**بالتوفيق في تطوير مشروعك! 🚀**