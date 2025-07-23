export interface User {
  id: string;
  employeeId: string; // Auto-generated EMP-001, EMP-002, etc.
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatar?: string;
  phone?: string;
  permissions: UserPermissions;
  salary?: EmployeeSalary;
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

export interface EmployeeSalary {
  baseSalary: number;
  allowances: Allowance[];
  profitPercentage: number; // Percentage of net profit
  totalSalary?: number; // Calculated monthly
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM format
  baseSalary: number;
  allowances: number;
  profitShare: number;
  totalSalary: number;
  paidDate: Date;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cars: Car[];
  visitHistory: VisitRecord[];
  createdAt: Date;
}

export interface VisitRecord {
  id: string;
  date: Date;
  carId: string;
  carInfo: string; // Make Model - Plate
  serviceSummary: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  invoiceId: string;
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
  carId: string;
  serviceOrderId?: string;
  description: string;
  date: Date;
  mileage: number;
  cost: number;
  parts: InventoryItem[];
  technician: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  carId: string;
  services: ServiceItem[]; // Multiple services per order
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTechnician?: string;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'electrical' | 'mechanical' | 'bodywork' | 'maintenance' | 'other';
  description: string;
  price: number;
  partsUsed: InventoryUsage[];
  completed: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  partNumber: string;
  quantity: number;
  minQuantity: number;
  unitCost: number;
  sellingPrice: number;
  supplier?: string;
  location?: string;
  totalValue: number; // quantity * unitCost
  monthlyConsumption: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryUsage {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerInfo: CustomerInfo;
  serviceOrderId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  qrCode: string; // ZATCA QR Code
  notes?: string;
  createdAt: Date;
}

export interface CustomerInfo {
  name: string;
  nameEn?: string;
  phone: string;
  email?: string;
  address?: string;
  vatNumber?: string;
}

export interface InvoiceItem {
  description: string;
  descriptionEn?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

export interface Expense {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  amount: number;
  type: 'recurring' | 'one-time';
  recurrence?: 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  nextDueDate?: Date;
  attachments?: string[];
  description?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'check';
  date: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Settings {
  workshopName: string;
  workshopNameEn: string;
  logo?: string;
  seal?: string; // Workshop seal/stamp
  crNumber: string;
  vatNumber: string;
  address: string;
  addressEn: string;
  phone: string;
  email: string;
  iban?: string;
  vatRate: number;
  currency: string;
  defaultLanguage: 'ar' | 'en';
  theme: {
    primary: string;
    secondary: string;
  };
  invoiceSettings: {
    prefix: string;
    footer: string;
    footerEn: string;
    terms: string;
    termsEn: string;
    logoAsWatermark: boolean;
  };
}

export interface DashboardStats {
  totalCustomers: number;
  totalCars: number;
  openOrders: number;
  todayRevenue: number;
  monthlyRevenue: number[];
  topCustomers: { name: string; amount: number }[];
  lowStockItems: InventoryItem[];
  recentOrders: ServiceOrder[];
  totalInventoryValue: number;
  monthlyExpenses: number;
  netProfit: number;
}

export interface ProfitLossReport {
  period: {
    from: string;
    to: string;
  };
  revenue: {
    invoices: number;
    services: number;
    parts: number;
  };
  expenses: {
    salaries: number;
    rent: number;
    operating: number;
    partsCost: number;
    other: number;
  };
  netProfit: number;
  profitMargin: number;
}

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
  type: 'warning' | 'danger' | 'info';
  message: string;
  messageEn: string;
}

// Saudi Vehicle Database
export interface VehicleMake {
  id: string;
  name: string;
  nameEn: string;
  models: VehicleModel[];
}

export interface VehicleModel {
  id: string;
  name: string;
  nameEn: string;
  years: number[];
}

export interface PasswordResetRequest {
  employeeId: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}