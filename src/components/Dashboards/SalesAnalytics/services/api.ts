import axios from 'axios';
import { 
  DashboardSummary, 
  ChartData, 
  Customer, 
  Product, 
  Order, 
  FilterParams,
  CHART_COLORS 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data generators
const generateMockCustomers = (): Customer[] => {
  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Energy'];
  const segments = ['Enterprise', 'Corporate', 'SMB'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Africa', 'Latin America'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `C${String(i + 1).padStart(3, '0')}`,
    name: `${industries[i % industries.length]} Corp ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
    industry: industries[i % industries.length],
    segment: segments[i % segments.length] as 'Enterprise' | 'Corporate' | 'SMB',
    region: regions[i % regions.length],
    status: i % 10 === 0 ? 'Inactive' : 'Active',
    totalSpent: Math.floor(Math.random() * 1000000) + 50000,
    margin: Math.floor(Math.random() * 30) + 15,
    since: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  }));
};

const generateMockProducts = (): Product[] => {
  const categories = ['Electronics', 'Software', 'Hardware', 'Services', 'Consulting', 'Support'];
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `P${String(i + 1).padStart(3, '0')}`,
    name: `Product ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    category: categories[i % categories.length],
    unitPrice: Math.floor(Math.random() * 10000) + 1000,
    cost: Math.floor(Math.random() * 5000) + 500,
    margin: Math.floor(Math.random() * 40) + 20,
    stock: Math.floor(Math.random() * 1000),
    status: i % 10 === 0 ? 'Out of Stock' : i % 5 === 0 ? 'Low Stock' : 'In Stock',
  }));
};

const generateMockOrders = (customers: Customer[], products: Product[]): Order[] => {
  const statuses = ['Ordered', 'Billed', 'Pending', 'Shipped', 'Delivered'];
  const paymentStatuses = ['Paid', 'Unpaid', 'Partial'];
  
  return Array.from({ length: 100 }, (_, i) => {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const orderDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 30) + 7);
    
    return {
      id: `ORD${String(i + 1).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      productId: product.id,
      productName: product.name,
      quantity: Math.floor(Math.random() * 20) + 1,
      value: product.unitPrice * (Math.floor(Math.random() * 20) + 1),
      poNumber: `PO-2024-${String(i + 1).padStart(5, '0')}`,
      orderDate: orderDate.toISOString().split('T')[0],
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      status: statuses[i % statuses.length] as any,
      paymentStatus: paymentStatuses[i % paymentStatuses.length] as any,
      notes: i % 7 === 0 ? 'Special handling required' : 'Standard order',
    };
  });
};

// Mock data storage
let mockCustomers = generateMockCustomers();
let mockProducts = generateMockProducts();
let mockOrders = generateMockOrders(mockCustomers, mockProducts);

// Dashboard Service
export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const totalSales = mockOrders.reduce((sum, order) => sum + order.value, 0);
    const totalOrders = mockOrders.length;
    const totalCustomers = mockCustomers.filter(c => c.status === 'Active').length;
    const totalProducts = mockProducts.filter(p => p.status === 'In Stock').length;
    const pendingOrders = mockOrders.filter(o => o.status === 'Pending').length;
    
    return {
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      revenueGrowth: 12.5,
      avgOrderValue: totalSales / totalOrders,
      conversionRate: 3.8,
    };
  },

  getSalesByChannel: async (): Promise<ChartData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const channels = ['Direct', 'Partner', 'Online', 'Referral', 'Reseller'];
    const colorKeys = ['primary', 'secondary', 'accent', 'warning', 'info'] as const;
    
    return channels.map((channel, index) => ({
      name: channel,
      value: Math.floor(Math.random() * 500000) + 100000,
      color: CHART_COLORS[colorKeys[index % colorKeys.length]],
    }));
  },

  getSalesTrend: async (dateRange: string): Promise<ChartData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => {
      const sales = Math.floor(Math.random() * 1000000) + 500000;
      return {
        name: month,
        value: sales,
        sales,
        orders: Math.floor(Math.random() * 1000) + 100,
        customers: Math.floor(Math.random() * 500) + 50,
      };
    });
  },

  getTopCustomers: async (limit: number = 5): Promise<ChartData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit)
      .map(customer => ({
        name: customer.name,
        value: customer.totalSpent,
        margin: customer.margin,
        region: customer.region,
      }));
  },

  getProductPerformance: async (): Promise<ChartData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockProducts
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 8)
      .map(product => {
        const sales = Math.floor(Math.random() * 1000000) + 100000;
        return {
          name: product.name.substring(0, 15) + '...',
          value: sales,
          sales,
          margin: product.margin,
          stock: product.stock,
        };
      });
  },
};

// Customer Service - renamed from customersService to customerService
export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCustomers;
  },

  getById: async (id: string): Promise<Customer | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCustomers.find(c => c.id === id);
  },

  create: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCustomer = {
      ...customer,
      id: `C${String(mockCustomers.length + 1).padStart(3, '0')}`,
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },

  update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    mockCustomers[index] = { ...mockCustomers[index], ...updates };
    return mockCustomers[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockCustomers = mockCustomers.filter(c => c.id !== id);
  },
};

// Product Service
export const productService = {
  getAll: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  },

  getCategories: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return Array.from(new Set(mockProducts.map(p => p.category)));
  },
};

// Order Service
export const orderService = {
  getAll: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  },

  getByStatus: async (status: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.filter(o => o.status === status);
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    mockOrders[index].status = status;
    return mockOrders[index];
  },
};

// Export Service
export const exportService = {
  exportDashboard: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const summary = await dashboardService.getSummary();
    const topCustomers = await dashboardService.getTopCustomers(10);
    const productPerformance = await dashboardService.getProductPerformance();
    
    const exportData = {
      summary,
      topCustomers,
      productPerformance,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, this would call a backend endpoint
    console.log('Exporting data:', exportData);
    return Promise.resolve();
  },
};