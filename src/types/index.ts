// User and Authentication Types
export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  phone?: string;
  permissions: UserPermissions;
  salary?: Salary;
  createdAt: Date;
}

export interface UserPermissions {
  customers: boolean;
  serviceOrders: boolean;
  inventory: boolean;
  invoices: boolean;
  expenses: boolean;
  reports: boolean;
  employees: boolean;
  settings: boolean;
  financialReports: boolean;
  profitAnalysis: boolean;
  payroll: boolean;
  workshopRent: boolean;
}

export interface Salary {
  baseSalary: number;
  allowances: Allowance[];
  profitPercentage: number;
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

// Customer and Car Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cars: Car[];
  createdAt: Date;
}

export interface Car {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  chassisNumber: string;
  mileage: number;
  maintenanceHistory: MaintenanceRecord[];
  createdAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  description: string;
  cost: number;
  technician: string;
  partsUsed: string[];
}

// Service Order Types
export interface ServiceOrder {
  id: string;
  customerId: string;
  carId: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTechnician?: string;
  partsUsed: PartUsed[];
  laborCost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  actualCompletion?: Date;
}

export interface PartUsed {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  partNumber: string;
  quantity: number;
  minQuantity: number;
  cost: number;
  sellingPrice: number;
  supplier?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  serviceOrderId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  discountAmount?: number;
  vatAmount: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: 'cash' | 'mada' | 'visa';
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  notes?: string;
  createdAt: Date | string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Expense Types
export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'transfer';
  receipt?: string;
  createdBy: string;
  createdAt: Date;
}

// Settings Types
export interface Settings {
  workshopName: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  vatRate: number;
  currency: string;
  language: string;
  logo?: string;
  theme: {
    primary: string;
    secondary: string;
  };
  invoiceSettings: {
    prefix: string;
    footer: string;
    terms: string;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalCustomers: number;
  totalCars: number;
  openOrders: number;
  todayRevenue: number;
  monthlyRevenue: number[];
  topCustomers: { name: string; amount: number }[];
  lowStockItems: InventoryItem[];
  recentOrders: ServiceOrder[];
}

// Payroll Types
export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  allowances: number;
  profitShare: number;
  totalSalary: number;
  paidDate: Date;
  createdAt: Date;
}

// Financial Forecast Types
export interface FinancialForecast {
  currentPeriod: {
    from: string;
    to: string;
  };
  projectedYearEnd: {
    revenue: number;
    expenses: number;
    netProfit: number;
  };
  growthFactor: number;
  alerts: ForecastAlert[];
}

export interface ForecastAlert {
  type: 'info' | 'warning' | 'danger';
  message: string;
  messageEn: string;
}