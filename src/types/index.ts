export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee' | 'technician';
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

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
  customerId: string;
  carId: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTechnician?: string;
  partsUsed: InventoryUsage[];
  laborCost: number;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface InventoryUsage {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  serviceOrderId: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  issueDate: string;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

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

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  date: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Settings {
  workshopName: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  vatRate: number;
  currency: string;
  language: 'ar' | 'en';
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