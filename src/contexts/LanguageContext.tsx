import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    customers: 'العملاء',
    serviceOrders: 'طلبات الصيانة',
    inventory: 'المخزون',
    invoices: 'الفواتير',
    expenses: 'المصروفات',
    reports: 'التقارير',
    employees: 'الموظفين',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    
    // Common
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث',
    loading: 'جاري التحميل...',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    address: 'العنوان',
    date: 'التاريخ',
    status: 'الحالة',
    actions: 'الإجراءات',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    vat: 'ضريبة القيمة المضافة',
    
    // Login
    login: 'تسجيل الدخول',
    password: 'كلمة المرور',
    loginTitle: 'مرحباً بك في ROAD EASE',
    loginSubtitle: 'نظام إدارة ورشة السيارات',
    invalidCredentials: 'بيانات الدخول غير صحيحة',
    
    // Dashboard
    totalCustomers: 'إجمالي العملاء',
    totalCars: 'إجمالي السيارات',
    openOrders: 'الطلبات المفتوحة',
    todayRevenue: 'إيرادات اليوم',
    monthlyRevenue: 'الإيرادات الشهرية',
    topCustomers: 'أفضل العملاء',
    lowStock: 'مخزون منخفض',
    recentOrders: 'الطلبات الأخيرة',
    
    // Customers
    addCustomer: 'إضافة عميل جديد',
    customerName: 'اسم العميل',
    customerPhone: 'هاتف العميل',
    customerEmail: 'بريد العميل',
    customerAddress: 'عنوان العميل',
    customerCars: 'سيارات العميل',
    
    // Cars
    addCar: 'إضافة سيارة جديدة',
    carMake: 'الماركة',
    carModel: 'الموديل',
    carYear: 'سنة الصنع',
    carColor: 'اللون',
    plateNumber: 'رقم اللوحة',
    chassisNumber: 'رقم الهيكل',
    mileage: 'الكيلومترات',
    
    // Service Orders
    addServiceOrder: 'إضافة طلب صيانة',
    customer: 'العميل',
    car: 'السيارة',
    description: 'الوصف',
    priority: 'الأولوية',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    open: 'مفتوح',
    inProgress: 'تحت التنفيذ',
    completed: 'مكتمل',
    assignedTechnician: 'الفني المسؤول',
    laborCost: 'تكلفة العمالة',
    notes: 'ملاحظات',
    
    // Inventory
    addInventoryItem: 'إضافة قطعة جديدة',
    itemName: 'اسم القطعة',
    category: 'الفئة',
    partNumber: 'رقم القطعة',
    quantity: 'الكمية',
    minQuantity: 'الحد الأدنى',
    cost: 'سعر التكلفة',
    sellingPrice: 'سعر البيع',
    supplier: 'المورد',
    location: 'الموقع',
    
    // Invoices
    addInvoice: 'إنشاء فاتورة جديدة',
    invoiceNumber: 'رقم الفاتورة',
    serviceOrder: 'طلب الصيانة',
    items: 'البنود',
    unitPrice: 'السعر الوحدة',
    paymentStatus: 'حالة الدفع',
    paid: 'مدفوع',
    partial: 'جزئي',
    unpaid: 'غير مدفوع',
    dueDate: 'تاريخ الاستحقاق',
    printInvoice: 'طباعة الفاتورة',
    
    // Expenses
    addExpense: 'إضافة مصروف',
    expenseDescription: 'وصف المصروف',
    expenseCategory: 'فئة المصروف',
    amount: 'المبلغ',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'تحويل',
    
    // Settings
    workshopName: 'اسم الورشة',
    workshopAddress: 'عنوان الورشة',
    workshopPhone: 'هاتف الورشة',
    workshopEmail: 'بريد الورشة',
    taxNumber: 'الرقم الضريبي',
    currency: 'العملة',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'الإنجليزية',
    
    // Success/Error messages
    customerAdded: 'تم إضافة العميل بنجاح',
    customerUpdated: 'تم تحديث العميل بنجاح',
    customerDeleted: 'تم حذف العميل بنجاح',
    orderAdded: 'تم إضافة الطلب بنجاح',
    orderUpdated: 'تم تحديث الطلب بنجاح',
    settingsSaved: 'تم حفظ الإعدادات بنجاح',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    customers: 'Customers',
    serviceOrders: 'Service Orders',
    inventory: 'Inventory',
    invoices: 'Invoices',
    expenses: 'Expenses',
    reports: 'Reports',
    employees: 'Employees',
    settings: 'Settings',
    logout: 'Logout',
    
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    loading: 'Loading...',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
    total: 'Total',
    subtotal: 'Subtotal',
    vat: 'VAT',
    
    // Login
    login: 'Login',
    password: 'Password',
    loginTitle: 'Welcome to ROAD EASE',
    loginSubtitle: 'Workshop Management System',
    invalidCredentials: 'Invalid credentials',
    
    // Dashboard
    totalCustomers: 'Total Customers',
    totalCars: 'Total Cars',
    openOrders: 'Open Orders',
    todayRevenue: 'Today Revenue',
    monthlyRevenue: 'Monthly Revenue',
    topCustomers: 'Top Customers',
    lowStock: 'Low Stock',
    recentOrders: 'Recent Orders',
    
    // Customers
    addCustomer: 'Add New Customer',
    customerName: 'Customer Name',
    customerPhone: 'Customer Phone',
    customerEmail: 'Customer Email',
    customerAddress: 'Customer Address',
    customerCars: 'Customer Cars',
    
    // Cars
    addCar: 'Add New Car',
    carMake: 'Make',
    carModel: 'Model',
    carYear: 'Year',
    carColor: 'Color',
    plateNumber: 'Plate Number',
    chassisNumber: 'Chassis Number',
    mileage: 'Mileage',
    
    // Service Orders
    addServiceOrder: 'Add Service Order',
    customer: 'Customer',
    car: 'Car',
    description: 'Description',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    open: 'Open',
    inProgress: 'In Progress',
    completed: 'Completed',
    assignedTechnician: 'Assigned Technician',
    laborCost: 'Labor Cost',
    notes: 'Notes',
    
    // Inventory
    addInventoryItem: 'Add New Item',
    itemName: 'Item Name',
    category: 'Category',
    partNumber: 'Part Number',
    quantity: 'Quantity',
    minQuantity: 'Min Quantity',
    cost: 'Cost',
    sellingPrice: 'Selling Price',
    supplier: 'Supplier',
    location: 'Location',
    
    // Invoices
    addInvoice: 'Create New Invoice',
    invoiceNumber: 'Invoice Number',
    serviceOrder: 'Service Order',
    items: 'Items',
    unitPrice: 'Unit Price',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
    dueDate: 'Due Date',
    printInvoice: 'Print Invoice',
    
    // Expenses
    addExpense: 'Add Expense',
    expenseDescription: 'Expense Description',
    expenseCategory: 'Expense Category',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    
    // Settings
    workshopName: 'Workshop Name',
    workshopAddress: 'Workshop Address',
    workshopPhone: 'Workshop Phone',
    workshopEmail: 'Workshop Email',
    taxNumber: 'Tax Number',
    currency: 'Currency',
    language: 'Language',
    arabic: 'Arabic',
    english: 'English',
    
    // Success/Error messages
    customerAdded: 'Customer added successfully',
    customerUpdated: 'Customer updated successfully',
    customerDeleted: 'Customer deleted successfully',
    orderAdded: 'Order added successfully',
    orderUpdated: 'Order updated successfully',
    settingsSaved: 'Settings saved successfully',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('roadease_language');
    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
    }
    
    // Set document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const changeLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('roadease_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      dir: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};