import React, { useState } from 'react';
import { Save, Upload, Palette, Globe, FileText, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { settings, updateSettings } = useApp();
  
  const [settingsForm, setSettingsForm] = useState(settings);
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert('تم حفظ الإعدادات بنجاح');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setSettingsForm({ ...settingsForm, logo: logoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: Globe },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'invoice', label: 'الفواتير', icon: FileText },
    { id: 'financial', label: 'المالية', icon: DollarSign }
  ];

  // Only admins can access settings
  if (!user?.permissions?.settings) {
    return (
      <div className="text-center py-8">
        <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح</h2>
        <p className="text-gray-600">ليس لديك صلاحية للوصول إلى الإعدادات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
        <Button icon={Save} onClick={handleSubmit}>
          حفظ الإعدادات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات العامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شعار الورشة
                    </label>
                    <div className="flex items-center space-x-4">
                      {settingsForm.logo && (
                        <img 
                          src={settingsForm.logo} 
                          alt="Logo" 
                          className="h-16 w-16 object-contain border rounded-lg"
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload">
                          <Button type="button" variant="secondary" icon={Upload}>
                            رفع شعار
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الورشة
                      </label>
                      <Input
                        type="text"
                        value={settingsForm.workshopName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, workshopName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                      </label>
                      <Input
                        type="tel"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الرقم الضريبي
                      </label>
                      <Input
                        type="text"
                        value={settingsForm.taxNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taxNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    <textarea
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      rows={3}
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العملة
                      </label>
                      <Select
                        value={settingsForm.currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                      >
                        <option value="SAR">ريال سعودي (SAR)</option>
                        <option value="AED">درهم إماراتي (AED)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                        <option value="EUR">يورو (EUR)</option>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اللغة الافتراضية
                      </label>
                      <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات المظهر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      ألوان النظام
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">اللون الأساسي</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settingsForm.theme.primary}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              theme: { ...settingsForm.theme, primary: e.target.value }
                            })}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settingsForm.theme.primary}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              theme: { ...settingsForm.theme, primary: e.target.value }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">اللون الثانوي</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settingsForm.theme.secondary}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              theme: { ...settingsForm.theme, secondary: e.target.value }
                            })}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settingsForm.theme.secondary}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              theme: { ...settingsForm.theme, secondary: e.target.value }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">معاينة الألوان</h4>
                    <div className="flex space-x-4">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: settingsForm.theme.primary }}
                      />
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: settingsForm.theme.secondary }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSettingsForm({
                        ...settingsForm,
                        theme: { primary: '#F97316', secondary: '#1F2937' }
                      })}
                    >
                      الألوان الافتراضية
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'invoice' && (
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الفواتير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      بادئة رقم الفاتورة
                    </label>
                    <Input
                      type="text"
                      value={settingsForm.invoiceSettings.prefix}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        invoiceSettings: { ...settingsForm.invoiceSettings, prefix: e.target.value }
                      })}
                      placeholder="INV-"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      مثال: INV-0001, BILL-0001
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نص التذييل
                    </label>
                    <Input
                      type="text"
                      value={settingsForm.invoiceSettings.footer}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        invoiceSettings: { ...settingsForm.invoiceSettings, footer: e.target.value }
                      })}
                      placeholder="شكراً لاختياركم خدماتنا"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الشروط والأحكام
                    </label>
                    <textarea
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      rows={4}
                      value={settingsForm.invoiceSettings.terms}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        invoiceSettings: { ...settingsForm.invoiceSettings, terms: e.target.value }
                      })}
                      placeholder="جميع الأسعار شاملة ضريبة القيمة المضافة..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'financial' && (
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات المالية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      معدل ضريبة القيمة المضافة
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={settingsForm.vatRate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, vatRate: parseFloat(e.target.value) || 0 })}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">
                        ({(settingsForm.vatRate * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      أدخل القيمة كعدد عشري (مثال: 0.15 للضريبة 15%)
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">معلومات مهمة</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• معدل ضريبة القيمة المضافة في السعودية: 15%</li>
                      <li>• معدل ضريبة القيمة المضافة في الإمارات: 5%</li>
                      <li>• يتم تطبيق الضريبة على جميع الفواتير الجديدة</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;