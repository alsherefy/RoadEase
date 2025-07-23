import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Car, ServiceOrder, InventoryItem, Invoice, Expense, Settings, DashboardStats } from '../types';

interface AppContextType {
  customers: Customer[];
  serviceOrders: ServiceOrder[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  expenses: Expense[];
  settings: Settings;
  dashboardStats: DashboardStats;
  
  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Car methods
  addCar: (car: Omit<Car, 'id' | 'createdAt' | 'maintenanceHistory'>) => void;
  updateCar: (id: string, car: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  
  // Service Order methods
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateServiceOrder: (id: string, order: Partial<ServiceOrder>) => void;
  deleteServiceOrder: (id: string) => void;
  
  // Inventory methods
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateInventoryQuantity: (id: string, quantity: number) => void;
  
  // Invoice methods
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  
  // Expense methods
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Settings methods
  updateSettings: (settings: Partial<Settings>) => void;
  
  refreshDashboard: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>({
    workshopName: 'ROAD EASE',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '+966 11 123 4567',
    email: 'info@roadease.com',
    taxNumber: '123456789',
    vatRate: 0.15,
    currency: 'SAR',
    language: 'ar',
    theme: {
      primary: '#F97316',
      secondary: '#1F2937',
    },
    invoiceSettings: {
      prefix: 'INV-',
      footer: 'شكراً لاختياركم ROAD EASE',
      terms: 'جميع الأسعار شاملة ضريبة القيمة المضافة',
    },
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCars: 0,
    openOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: [],
    topCustomers: [],
    lowStockItems: [],
    recentOrders: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('roadease_customers');
    const savedOrders = localStorage.getItem('roadease_orders');
    const savedInventory = localStorage.getItem('roadease_inventory');
    const savedInvoices = localStorage.getItem('roadease_invoices');
    const savedExpenses = localStorage.getItem('roadease_expenses');
    const savedSettings = localStorage.getItem('roadease_settings');

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedOrders) setServiceOrders(JSON.parse(savedOrders));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    else initializeInventory();
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedSettings) setSettings({ ...settings, ...JSON.parse(savedSettings) });
    else initializeSampleData();
  }, []);

  const initializeInventory = () => {
    const sampleInventory = [
      {
        id: generateId(),
        name: 'زيت محرك 5W-30',
        category: 'زيوت ومواد تشحيم',
        partNumber: 'OIL-5W30-001',
        quantity: 50,
        minQuantity: 10,
        cost: 25,
        sellingPrice: 35,
        supplier: 'شركة الزيوت المتحدة',
        location: 'A1-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'فلتر زيت',
        category: 'فلاتر',
        partNumber: 'FILTER-OIL-002',
        quantity: 30,
        minQuantity: 5,
        cost: 15,
        sellingPrice: 25,
        supplier: 'مؤسسة قطع الغيار',
        location: 'B2-03',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'إطار 225/65R17',
        category: 'إطارات',
        partNumber: 'TIRE-225-65-R17',
        quantity: 8,
        minQuantity: 4,
        cost: 200,
        sellingPrice: 280,
        supplier: 'شركة الإطارات الذهبية',
        location: 'C3-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'بطارية 12V 70Ah',
        category: 'بطاريات',
        partNumber: 'BAT-12V-70AH',
        quantity: 15,
        minQuantity: 3,
        cost: 120,
        sellingPrice: 180,
        supplier: 'مؤسسة البطاريات الحديثة',
        location: 'D1-02',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        name: 'قطع فرامل أمامية',
        category: 'فرامل',
        partNumber: 'BRAKE-FRONT-001',
        quantity: 20,
        minQuantity: 5,
        cost: 80,
        sellingPrice: 120,
        supplier: 'شركة قطع الفرامل المتخصصة',
        location: 'E2-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setInventory(sampleInventory);
    localStorage.setItem('roadease_inventory', JSON.stringify(sampleInventory));
  };

  const initializeSampleData = () => {
    const sampleCustomers = [
      {
        id: generateId(),
        name: 'أحمد محمد العلي',
        phone: '+966 50 123 4567',
        email: 'ahmed@example.com',
        address: 'الرياض، حي النرجس',
        cars: [
          {
            id: generateId(),
            customerId: '',
            make: 'تويوتا',
            model: 'كامري',
            year: 2020,
            color: 'أبيض',
            plateNumber: 'أ ب ج 123',
            chassisNumber: 'JTDBK31E050012345',
            mileage: 45000,
            maintenanceHistory: [],
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      },
      {
        id: generateId(),
        name: 'فاطمة عبدالله السالم',
        phone: '+966 55 987 6543',
        email: 'fatima@example.com',
        address: 'جدة، حي الزهراء',
        cars: [
          {
            id: generateId(),
            customerId: '',
            make: 'نيسان',
            model: 'التيما',
            year: 2019,
            color: 'أسود',
            plateNumber: 'د هـ و 456',
            chassisNumber: 'NISSAN12345678901',
            mileage: 32000,
            maintenanceHistory: [],
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      },
    ];

    // Fix customer IDs in cars
    sampleCustomers.forEach(customer => {
      customer.cars.forEach(car => {
        car.customerId = customer.id;
      });
    });

    const sampleOrders = [
      {
        id: generateId(),
        customerId: sampleCustomers[0].id,
        carId: sampleCustomers[0].cars[0].id,
        description: 'تغيير زيت المحرك والفلتر',
        status: 'open' as const,
        priority: 'medium' as const,
        assignedTechnician: 'فني الصيانة',
        partsUsed: [],
        laborCost: 50,
        notes: 'العميل يفضل الزيت المصنعي',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateId(),
        customerId: sampleCustomers[1].id,
        carId: sampleCustomers[1].cars[0].id,
        description: 'فحص الفرامل وتغيير الإطارات',
        status: 'in_progress' as const,
        priority: 'high' as const,
        assignedTechnician: 'فني الصيانة',
        partsUsed: [],
        laborCost: 150,
        notes: 'يحتاج فحص دقيق للفرامل',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setCustomers(sampleCustomers);
    setServiceOrders(sampleOrders);
    localStorage.setItem('roadease_customers', JSON.stringify(sampleCustomers));
    localStorage.setItem('roadease_orders', JSON.stringify(sampleOrders));
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('roadease_customers', JSON.stringify(customers));
    refreshDashboard();
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('roadease_orders', JSON.stringify(serviceOrders));
    refreshDashboard();
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem('roadease_inventory', JSON.stringify(inventory));
    refreshDashboard();
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('roadease_invoices', JSON.stringify(invoices));
    refreshDashboard();
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('roadease_expenses', JSON.stringify(expenses));
    refreshDashboard();
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('roadease_settings', JSON.stringify(settings));
  }, [settings]);

  const refreshDashboard = () => {
    const totalCars = customers.reduce((acc, customer) => acc + customer.cars.length, 0);
    const openOrders = serviceOrders.filter(order => order.status === 'open').length;
    
    // Calculate today's revenue from paid invoices
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = invoices
      .filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        invoiceDate.setHours(0, 0, 0, 0);
        return invoiceDate.getTime() === today.getTime() && invoice.paymentStatus === 'paid';
      })
      .reduce((acc, invoice) => acc + invoice.totalAmount, 0);

    // Calculate monthly revenue for the last 12 months
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
          const inventoryItem = inventory.find(i => i.id === part.itemId);
      return invoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.createdAt);
          return invoiceDate.getMonth() === month && 
                 invoiceDate.getFullYear() === year && 
                 invoice.paymentStatus === 'paid';
        })
        .reduce((acc, invoice) => acc + invoice.totalAmount, 0);
    }).reverse();

    // Top customers by spending
    const customerSpending = customers.map(customer => {
      const spending = invoices
        .filter(invoice => invoice.customerId === customer.id && invoice.paymentStatus === 'paid')
        .reduce((acc, invoice) => acc + invoice.totalAmount, 0);
      return { name: customer.name, amount: spending };
    }).sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Low stock items
    const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

    // Recent orders
    const recentOrders = serviceOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setDashboardStats({
      totalCustomers: customers.length,
      totalCars,
      openOrders,
      todayRevenue,
      monthlyRevenue,
      topCustomers: customerSpending,
      lowStockItems,
      recentOrders,
    });
  };

  // Customer methods
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    setServiceOrders(prev => prev.filter(order => order.customerId !== id));
  };

  // Car methods
  const addCar = (carData: Omit<Car, 'id' | 'createdAt' | 'maintenanceHistory'>) => {
    const newCar = {
      ...carData,
      id: generateId(),
      maintenanceHistory: [],
      createdAt: new Date(),
    };

    setCustomers(prev => prev.map(customer => 
      customer.id === carData.customerId 
        ? { ...customer, cars: [...customer.cars, newCar] }
        : customer
    ));
  };

  const updateCar = (id: string, carData: Partial<Car>) => {
    setCustomers(prev => prev.map(customer => ({
      ...customer,
      cars: customer.cars.map(car => 
        car.id === id ? { ...car, ...carData } : car
      )
    })));
  };

  const deleteCar = (id: string) => {
    setCustomers(prev => prev.map(customer => ({
      ...customer,
      cars: customer.cars.filter(car => car.id !== id)
    })));
    setServiceOrders(prev => prev.filter(order => order.carId !== id));
  };

  // Service Order methods
  const addServiceOrder = (orderData: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder = {
      ...orderData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setServiceOrders(prev => [...prev, newOrder]);
  };

  const updateServiceOrder = (id: string, orderData: Partial<ServiceOrder>) => {
    setServiceOrders(prev => prev.map(order => 
      order.id === id ? { ...order, ...orderData, updatedAt: new Date() } : order
    ));

    // If order is completed, update inventory quantities
    if (orderData.status === 'completed') {
      const order = serviceOrders.find(o => o.id === id);
      if (order) {
        order.partsUsed.forEach(part => {
          const inventoryItem = inventory.find(i => i.id === part.itemId);
          if (inventoryItem) {
            updateInventoryQuantity(part.itemId, -part.quantity);
          }
        });
      }
    }
  };

  const deleteServiceOrder = (id: string) => {
    setServiceOrders(prev => prev.filter(order => order.id !== id));
  };

  // Inventory methods
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = {
      ...itemData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...itemData, updatedAt: new Date() } : item
    ));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateInventoryQuantity = (id: string, quantityChange: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + quantityChange), updatedAt: new Date() }
        : item
    ));
  };

  // Invoice methods
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice = {
      ...invoiceData,
      id: generateId(),
      createdAt: new Date(),
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === id ? { ...invoice, ...invoiceData } : invoice
    ));
  };

  // Expense methods
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...expenseData } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Settings methods
  const updateSettings = (settingsData: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...settingsData }));
  };

  return (
    <AppContext.Provider value={{
      customers,
      serviceOrders,
      inventory,
      invoices,
      expenses,
      settings,
      dashboardStats,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addCar,
      updateCar,
      deleteCar,
      addServiceOrder,
      updateServiceOrder,
      deleteServiceOrder,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      updateInventoryQuantity,
      addInvoice,
      updateInvoice,
      addExpense,
      updateExpense,
      deleteExpense,
      updateSettings,
      refreshDashboard,
    }}>
      {children}
    </AppContext.Provider>
  );
};