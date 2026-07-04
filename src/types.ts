export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  photoUrl?: string;
  approved: boolean;
  reply?: string;
  replyDate?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discount: number; // percentage
  warranty: string;
  availableQty: number;
  lastUpdated: string;
  images: string[]; // URLs or base64
  specifications: ProductSpecification[];
  featured?: boolean;
  bestSelling?: boolean;
  newArrival?: boolean;
  tractorModels?: string[]; // tractor models this part is compatible with
  vehicleModels?: string[]; // vehicle models
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  productName: string;
  message: string;
  date: string;
  status: 'pending' | 'responded' | 'archived';
  adminNotes?: string;
}

export interface QuotationRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  message: string;
  date: string;
  status: 'pending' | 'processed' | 'declined';
}

export interface AdminLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkToCategory?: string;
}

export interface AppSettings {
  // General & Contact Info
  appName?: string;
  businessName: string;
  ownerName: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  whatsappPhone: string; // for direct WhatsApp chat
  address: string;
  logoUrl: string;
  splashScreenUrl?: string;
  mapEmbedUrl: string;
  businessHours?: string;

  // Appearance
  themeMode: 'light' | 'dark' | 'auto';
  themePrimaryColor: string; // hex
  appIconUrl?: string;
  homepageLayout?: 'standard' | 'bento';

  // Language
  defaultLanguage?: 'en' | 'np';
  languagesEnabled?: ('en' | 'np')[];

  // Product Settings
  enableCustomSku?: boolean;
  defaultProductVisibility?: 'show' | 'hide';

  // Inventory Settings
  lowStockLevel?: number;
  outOfStockNotificationEnabled?: boolean;

  // Review Settings
  reviewModerationRequired?: boolean;
  customerRatingsEnabled?: boolean;

  // Notification Settings
  pushNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  lowStockAlertsEnabled?: boolean;
  offerNotificationsEnabled?: boolean;
  announcementsText?: string;

  // Security
  twoFactorEnabled?: boolean;
  password?: string;

  // About
  appVersion?: string;
  privacyPolicy?: string;
  termsConditions?: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  featured?: boolean;
}

export interface DatabaseSchema {
  products: Product[];
  categories: string[];
  brands: Brand[];
  enquiries: Enquiry[];
  quotations: QuotationRequest[];
  reviews: Review[];
  banners: Banner[];
  settings: AppSettings;
  logs: AdminLog[];
}
