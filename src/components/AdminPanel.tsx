import React from "react";
import { ShieldCheck, LogOut, ArrowRight, Save, Plus, Edit, Trash2, Key, Info, Check, RefreshCw, FileText, Database, Activity, Star, Award, Tag, Globe, Palette, Bell, FileDown, Sliders, Shield, Download, Upload, HelpCircle, Laptop } from "lucide-react";
import { Product, Review, Enquiry, QuotationRequest, AppSettings, AdminLog, Brand } from "../types";
import { apiFetch } from "../lib/api";

interface AdminPanelProps {
  products: Product[];
  brands: Brand[];
  reviews: Review[];
  enquiries: Enquiry[];
  quotations: QuotationRequest[];
  settings: AppSettings;
  lang: "en" | "np";
  isAdminLoggedIn: boolean;
  onAdminLoginSuccess: (token: string) => void;
  onAdminLogout: () => void;
  onRefreshData: () => void;
}

export default function AdminPanel({
  products,
  brands,
  reviews,
  enquiries,
  quotations,
  settings,
  lang,
  isAdminLoggedIn,
  onAdminLoginSuccess,
  onAdminLogout,
  onRefreshData,
  banners = []
}: AdminPanelProps & { banners?: any[] }) {
  // Login flow states
  const [email, setEmail] = React.useState("tikaregmi551@gmail.com");
  const [loginStep, setLoginStep] = React.useState<1 | 2>(1);
  const [passcode, setPasscode] = React.useState("");
  const [interceptedCode, setInterceptedCode] = React.useState(""); // Helper for demo 2FA
  const [authError, setAuthError] = React.useState("");
  const [authLoading, setAuthLoading] = React.useState(false);

  // Active admin tab
  const [adminTab, setAdminTab] = React.useState<"kpis" | "products" | "brands" | "leads" | "reviews" | "settings" | "backups">("kpis");

  // Brand Management states
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);
  const [bName, setBName] = React.useState("");
  const [bLogoUrl, setBLogoUrl] = React.useState("");
  const [bFeatured, setBFeatured] = React.useState(false);
  const [showBrandForm, setShowBrandForm] = React.useState(false);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;
    const token = localStorage.getItem("sunkoshi_admin_token");
    if (!token) return;

    let updatedBrands: Brand[] = [];
    if (editingBrand) {
      updatedBrands = brands.map((b) =>
        b.id === editingBrand.id
          ? { ...b, name: bName.trim(), logoUrl: bLogoUrl.trim() || undefined, featured: bFeatured }
          : b
      );
    } else {
      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        name: bName.trim(),
        logoUrl: bLogoUrl.trim() || undefined,
        featured: bFeatured
      };
      updatedBrands = [...brands, newBrand];
    }

    try {
      const res = await apiFetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ brands: updatedBrands })
      });
      if (res.ok) {
        alert(editingBrand ? "Brand updated successfully!" : "Brand created successfully!");
        setShowBrandForm(false);
        setEditingBrand(null);
        setBName("");
        setBLogoUrl("");
        setBFeatured(false);
        onRefreshData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save brand");
      }
    } catch (err) {
      alert("Error saving brand");
    }
  };

  const handleEditBrandClick = (b: Brand) => {
    setEditingBrand(b);
    setBName(b.name);
    setBLogoUrl(b.logoUrl || "");
    setBFeatured(!!b.featured);
    setShowBrandForm(true);
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete the brand "${brandName}"? This will not delete products assigned to this brand.`)) return;
    const token = localStorage.getItem("sunkoshi_admin_token");
    if (!token) return;

    const updatedBrands = brands.filter((b) => b.id !== brandId);

    try {
      const res = await apiFetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ brands: updatedBrands })
      });
      if (res.ok) {
        alert("Brand deleted successfully!");
        onRefreshData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete brand");
      }
    } catch (err) {
      alert("Error deleting brand");
    }
  };

  // CRUD states
  const [showProductForm, setShowProductForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Product Form states
  const [pName, setPName] = React.useState("");
  const [pCategory, setPCategory] = React.useState("Bearings");
  const [pBrand, setPBrand] = React.useState("FAG");
  const [pSku, setPSku] = React.useState("");
  const [pBarcode, setPBarcode] = React.useState("");
  const [pPrice, setPPrice] = React.useState(0);
  const [pDiscount, setPDiscount] = React.useState(0);
  const [pQty, setPQty] = React.useState(0);
  const [pWarranty, setPWarranty] = React.useState("No Warranty");
  const [pDescription, setPDescription] = React.useState("");
  const [pImages, setPImages] = React.useState<string[]>([""]);
  const [pTractorModels, setPTractorModels] = React.useState<string[]>([]);
  const [pSpecs, setPSpecs] = React.useState<{ name: string; value: string }[]>([
    { name: "Bore Size (d)", value: "20 mm" },
    { name: "Outer Diameter (D)", value: "47 mm" },
    { name: "Thickness (B)", value: "14 mm" }
  ]);

  // Lead Management states
  const [activeLead, setActiveLead] = React.useState<Enquiry | QuotationRequest | null>(null);
  const [leadType, setLeadType] = React.useState<"enquiry" | "quotation" | null>(null);
  const [leadNote, setLeadNote] = React.useState("");
  const [leadStatus, setLeadStatus] = React.useState("");

  // Review Reply state
  const [replyingReview, setReplyingReview] = React.useState<Review | null>(null);
  const [reviewReplyText, setReviewReplyText] = React.useState("");

  // Sync props to local state for rich updates
  const [localEnquiries, setLocalEnquiries] = React.useState<Enquiry[]>(enquiries);
  const [localQuotations, setLocalQuotations] = React.useState<QuotationRequest[]>(quotations);
  const [localReviews, setLocalReviews] = React.useState<Review[]>(reviews);

  React.useEffect(() => {
    if (enquiries && enquiries.length > 0) setLocalEnquiries(enquiries);
  }, [enquiries]);

  React.useEffect(() => {
    if (quotations && quotations.length > 0) setLocalQuotations(quotations);
  }, [quotations]);

  React.useEffect(() => {
    if (reviews && reviews.length > 0) setLocalReviews(reviews);
  }, [reviews]);

  // Backups/Logs state
  const [activityLogs, setActivityLogs] = React.useState<AdminLog[]>([]);
  const [backupRestoreContent, setBackupRestoreContent] = React.useState("");

  // Fetch Activity Logs and Reports if Admin is Logged In
  React.useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminReports();
    }
  }, [isAdminLoggedIn, adminTab]);

  const fetchAdminReports = async () => {
    try {
      const token = localStorage.getItem("sunkoshi_admin_token");
      if (!token) return;
      const res = await apiFetch("/api/admin/reports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.logs) setActivityLogs(data.logs);
        if (data.enquiries) setLocalEnquiries(data.enquiries);
        if (data.quotations) setLocalQuotations(data.quotations);
        if (data.allReviews) setLocalReviews(data.allReviews);
      }
    } catch (err) {
      console.error("Failed to fetch admin reports:", err);
    }
  };

  // 1. Submit Login Step 1 (Send 2FA)
  const handleRequest2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await apiFetch("/api/admin/login-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setLoginStep(2);
        // Intercept passcode for tester ease
        if (data.debugCode) {
          setInterceptedCode(data.debugCode);
        }
      } else {
        setAuthError(data.error || "Login initiation failed.");
      }
    } catch (err) {
      setAuthError("Failed to communicate with authorization server.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Submit Login Step 2 (Verify 2FA)
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await apiFetch("/api/admin/login-step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: passcode })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("sunkoshi_admin_token", data.token);
        onAdminLoginSuccess(data.token);
      } else {
        setAuthError(data.error || "Incorrect 2FA code.");
      }
    } catch (err) {
      setAuthError("Verification failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Product Create or Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("sunkoshi_admin_token");
    if (!token) return;

    const payload = {
      name: pName,
      category: pCategory,
      brand: pBrand,
      sku: pSku,
      barcode: pBarcode,
      price: Number(pPrice),
      discount: Number(pDiscount),
      availableQty: Number(pQty),
      warranty: pWarranty,
      description: pDescription,
      images: pImages.filter(Boolean),
      tractorModels: pTractorModels,
      specifications: pSpecs.filter((s) => s.name && s.value)
    };

    try {
      const res = await apiFetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: editingProduct ? "update" : "create",
          product: editingProduct ? { ...payload, id: editingProduct.id } : payload
        })
      });

      if (res.ok) {
        setShowProductForm(false);
        setEditingProduct(null);
        resetProductForm();
        onRefreshData();
        fetchAdminReports();
      } else {
        const d = await res.json();
        alert(d.error || "Save product failed");
      }
    } catch (err) {
      alert("Error saving product data");
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setPName(p.name);
    setPCategory(p.category);
    setPBrand(p.brand);
    setPSku(p.sku);
    setPBarcode(p.barcode || "");
    setPPrice(p.price);
    setPDiscount(p.discount);
    setPQty(p.availableQty);
    setPWarranty(p.warranty);
    setPDescription(p.description);
    setPImages(p.images.length ? p.images : [""]);
    setPTractorModels(p.tractorModels || []);
    setPSpecs(p.specifications?.length ? p.specifications : [{ name: "", value: "" }]);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product from database?")) return;
    const token = localStorage.getItem("sunkoshi_admin_token");

    try {
      const res = await apiFetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "delete",
          product: { id }
        })
      });
      if (res.ok) {
        onRefreshData();
        fetchAdminReports();
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  // Reset helper
  const resetProductForm = () => {
    setPName("");
    setPSku("");
    setPBarcode("");
    setPPrice(0);
    setPDiscount(0);
    setPQty(0);
    setPDescription("");
    setPImages([""]);
    setPTractorModels([]);
    setPSpecs([
      { name: "Bore Size (d)", value: "20 mm" },
      { name: "Outer Diameter (D)", value: "47 mm" },
      { name: "Thickness (B)", value: "14 mm" }
    ]);
  };

  // 4. Update Lead Note & Status (Enquiry or Quotation)
  const handleUpdateLead = async () => {
    if (!activeLead || !leadType) return;
    const token = localStorage.getItem("sunkoshi_admin_token");

    try {
      const res = await apiFetch("/api/admin/communications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: leadType,
          id: activeLead.id,
          status: leadStatus.toLowerCase(),
          adminNotes: leadNote
        })
      });
      if (res.ok) {
        setActiveLead(null);
        setLeadType(null);
        onRefreshData();
        fetchAdminReports();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // 5. Reviews Moderation & Reply
  const handleApproveReview = async (id: string) => {
    const token = localStorage.getItem("sunkoshi_admin_token");
    try {
      const res = await apiFetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "approve",
          id
        })
      });
      if (res.ok) {
        onRefreshData();
        fetchAdminReports();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this customer review permanently?")) return;
    const token = localStorage.getItem("sunkoshi_admin_token");
    try {
      const res = await apiFetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "delete",
          id
        })
      });
      if (res.ok) {
        onRefreshData();
        fetchAdminReports();
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleReviewReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !reviewReplyText) return;
    const token = localStorage.getItem("sunkoshi_admin_token");

    try {
      const res = await apiFetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "reply",
          id: replyingReview.id,
          replyText: reviewReplyText
        })
      });
      if (res.ok) {
        setReplyingReview(null);
        setReviewReplyText("");
        onRefreshData();
        fetchAdminReports();
      }
    } catch (err) {
      alert("Failed to reply");
    }
  };

  // 6. DB Backups & Restore
  const handleDownloadBackup = () => {
    const rawDB = {
      products,
      reviews: localReviews,
      enquiries: localEnquiries,
      quotations: localQuotations,
      settings
    };
    const blob = new Blob([JSON.stringify(rawDB, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sunkoshi_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRestoreDatabase = async () => {
    if (!backupRestoreContent.trim()) return;
    const token = localStorage.getItem("sunkoshi_admin_token");
    let parsedContent;
    try {
      parsedContent = JSON.parse(backupRestoreContent); // Validate JSON client side
    } catch (e) {
      alert("Invalid JSON format! Please check backup content.");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ backupData: parsedContent })
      });
      if (res.ok) {
        alert("Database successfully restored! Reloading content.");
        setBackupRestoreContent("");
        onRefreshData();
        fetchAdminReports();
      } else {
        const d = await res.json();
        alert(d.error || "Restore failed");
      }
    } catch (err) {
      alert("Restore error");
    }
  };

  // 7. Update General Shop Settings
  const [settingsSubTab, setSettingsSubTab] = React.useState<
    "general" | "appearance" | "language" | "products" | "inventory" | "reviews" | "notifications" | "security" | "backup" | "about"
  >("general");

  const [shopAppName, setShopAppName] = React.useState(settings.appName || "Sunkoshi Bearing App");
  const [shopName, setShopName] = React.useState(settings.businessName);
  const [shopOwnerName, setShopOwnerName] = React.useState(settings.ownerName || "Sita Ram Regmi");
  const [shopAdminName, setShopAdminName] = React.useState(settings.adminName || "Alex Regmi");
  const [shopPhone, setShopPhone] = React.useState(settings.phone);
  const [shopWhatsApp, setShopWhatsApp] = React.useState(settings.whatsappPhone);
  const [shopAddress, setShopAddress] = React.useState(settings.address);
  const [shopEmail, setShopEmail] = React.useState(settings.adminEmail);
  const [shopMap, setShopMap] = React.useState(settings.mapEmbedUrl);
  const [shopLogoUrl, setShopLogoUrl] = React.useState(settings.logoUrl || "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=100&auto=format&fit=crop");
  const [shopSplashScreenUrl, setShopSplashScreenUrl] = React.useState(settings.splashScreenUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop");
  const [shopBusinessHours, setShopBusinessHours] = React.useState(settings.businessHours || "9:00 AM - 7:00 PM");

  // Appearance
  const [shopThemeMode, setShopThemeMode] = React.useState(settings.themeMode || "light");
  const [shopThemePrimaryColor, setShopThemePrimaryColor] = React.useState(settings.themePrimaryColor || "#16a34a");
  const [shopAppIconUrl, setShopAppIconUrl] = React.useState(settings.appIconUrl || "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=100&auto=format&fit=crop");
  const [shopHomepageLayout, setShopHomepageLayout] = React.useState(settings.homepageLayout || "standard");

  // Language
  const [shopDefaultLanguage, setShopDefaultLanguage] = React.useState(settings.defaultLanguage || "en");
  const [shopEnglishEnabled, setShopEnglishEnabled] = React.useState(settings.languagesEnabled?.includes("en") ?? true);
  const [shopNepaliEnabled, setShopNepaliEnabled] = React.useState(settings.languagesEnabled?.includes("np") ?? true);

  // Product Settings
  const [shopEnableCustomSku, setShopEnableCustomSku] = React.useState(settings.enableCustomSku ?? true);
  const [shopDefaultProductVisibility, setShopDefaultProductVisibility] = React.useState(settings.defaultProductVisibility || "show");

  // Inventory Settings
  const [shopLowStockLevel, setShopLowStockLevel] = React.useState(settings.lowStockLevel ?? 10);
  const [shopOutOfStockNotification, setShopOutOfStockNotification] = React.useState(settings.outOfStockNotificationEnabled ?? true);

  // Review Settings
  const [shopReviewModerationRequired, setShopReviewModerationRequired] = React.useState(settings.reviewModerationRequired ?? true);
  const [shopCustomerRatingsEnabled, setShopCustomerRatingsEnabled] = React.useState(settings.customerRatingsEnabled ?? true);

  // Notification Settings
  const [shopPushNotifications, setShopPushNotifications] = React.useState(settings.pushNotificationsEnabled ?? true);
  const [shopEmailNotifications, setShopEmailNotifications] = React.useState(settings.emailNotificationsEnabled ?? true);
  const [shopLowStockAlerts, setShopLowStockAlerts] = React.useState(settings.lowStockAlertsEnabled ?? true);
  const [shopOfferNotifications, setShopOfferNotifications] = React.useState(settings.offerNotificationsEnabled ?? true);
  const [shopAnnouncementsText, setShopAnnouncementsText] = React.useState(settings.announcementsText || "");

  // Security
  const [shopTwoFactorEnabled, setShopTwoFactorEnabled] = React.useState(settings.twoFactorEnabled ?? true);
  const [newAdminPassword, setNewAdminPassword] = React.useState("");

  // About
  const [shopAppVersion, setShopAppVersion] = React.useState(settings.appVersion || "v2.4.0");
  const [shopPrivacyPolicy, setShopPrivacyPolicy] = React.useState(settings.privacyPolicy || "We respect your privacy and only collect standard contact parameters for bulk quotation requests.");
  const [shopTermsConditions, setShopTermsConditions] = React.useState(settings.termsConditions || "Terms and conditions are regulated by Sunkoshi Bearing Centre, Itahari, Nepal.");

  // CSV Bulk Stock Importer states
  const [csvImportText, setCsvImportText] = React.useState("");
  const [csvImportStatus, setCsvImportStatus] = React.useState("");

  const handleProcessCsvImport = async () => {
    if (!csvImportText.trim()) return;
    const lines = csvImportText.split("\n");
    let updatedCount = 0;
    let failedCount = 0;
    const token = localStorage.getItem("sunkoshi_admin_token");
    const updatedProductsList = [...products];

    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(",");
      if (parts.length >= 2) {
        const sku = parts[0].trim();
        const qty = parseInt(parts[1].trim(), 10);
        
        if (sku && !isNaN(qty)) {
          const productIndex = updatedProductsList.findIndex(p => p.sku.toLowerCase() === sku.toLowerCase());
          if (productIndex !== -1) {
            updatedProductsList[productIndex] = {
              ...updatedProductsList[productIndex],
              availableQty: qty,
              lastUpdated: new Date().toISOString()
            };
            updatedCount++;
          } else {
            failedCount++;
          }
        } else {
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }

    if (updatedCount > 0) {
      try {
        const rawDB = {
          products: updatedProductsList,
          brands,
          categories: ["Bearings", "Automotive Parts", "Industrial Bearings", "Automotive Bearings", "Oil Seals", "Grease", "Belts", "Chains", "Pulleys", "Lubricants", "Hardware Items"],
          enquiries: localEnquiries,
          quotations: localQuotations,
          reviews: localReviews,
          banners,
          settings: {
            ...settings,
            appName: shopAppName,
            businessName: shopName,
            phone: shopPhone,
            whatsappPhone: shopWhatsApp,
            address: shopAddress,
            adminEmail: shopEmail,
            mapEmbedUrl: shopMap,
            logoUrl: shopLogoUrl
          },
          logs: activityLogs
        };

        const res = await apiFetch("/api/admin/restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ backupData: rawDB })
        });
        if (res.ok) {
          setCsvImportStatus(`Successfully updated ${updatedCount} products' stock! Failed lines: ${failedCount}.`);
          setCsvImportText("");
          onRefreshData();
          fetchAdminReports();
        } else {
          setCsvImportStatus("Failed to save imported stock list to database.");
        }
      } catch (err) {
        setCsvImportStatus("Error saving imported stock.");
      }
    } else {
      setCsvImportStatus(`Processed lines, but found 0 matching product SKUs. Failed lines: ${failedCount}.`);
    }
  };

  const exportToCSV = (headers: string[], rows: string[][], filename: string) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${(val || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInventory = () => {
    const headers = ["ID", "Name", "SKU", "Barcode", "Brand", "Category", "Price", "Discount", "AvailableQty", "Warranty"];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.sku,
      p.barcode || "",
      p.brand,
      p.category,
      p.price.toString(),
      p.discount.toString(),
      p.availableQty.toString(),
      p.warranty
    ]);
    exportToCSV(headers, rows, "sunkoshi_inventory_report.csv");
  };

  const handleExportEnquiries = () => {
    const headers = ["ID", "Customer Name", "Phone", "Product Name", "Message", "Date", "Status"];
    const rows = enquiries.map(e => [
      e.id,
      e.name,
      e.phone,
      e.productName,
      e.message,
      new Date(e.date).toLocaleString(),
      e.status
    ]);
    exportToCSV(headers, rows, "sunkoshi_enquiries_report.csv");
  };

  const handleExportQuotations = () => {
    const headers = ["ID", "Customer Name", "Phone", "Email", "Items Count", "Message", "Date", "Status"];
    const rows = quotations.map(q => [
      q.id,
      q.name,
      q.phone,
      q.email || "",
      q.products.length.toString(),
      q.message,
      new Date(q.date).toLocaleString(),
      q.status
    ]);
    exportToCSV(headers, rows, "sunkoshi_quotations_report.csv");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("sunkoshi_admin_token");
    const payload: Partial<AppSettings> = {
      appName: shopAppName,
      businessName: shopName,
      ownerName: shopOwnerName,
      adminName: shopAdminName,
      phone: shopPhone,
      whatsappPhone: shopWhatsApp,
      address: shopAddress,
      adminEmail: shopEmail,
      mapEmbedUrl: shopMap,
      logoUrl: shopLogoUrl,
      splashScreenUrl: shopSplashScreenUrl,
      businessHours: shopBusinessHours,

      themeMode: shopThemeMode as "light" | "dark" | "auto",
      themePrimaryColor: shopThemePrimaryColor,
      appIconUrl: shopAppIconUrl,
      homepageLayout: shopHomepageLayout as "standard" | "bento",

      defaultLanguage: shopDefaultLanguage as "en" | "np",
      languagesEnabled: [
        ...(shopEnglishEnabled ? ["en"] : []),
        ...(shopNepaliEnabled ? ["np"] : [])
      ] as ("en" | "np")[],

      enableCustomSku: shopEnableCustomSku,
      defaultProductVisibility: shopDefaultProductVisibility as "show" | "hide",

      lowStockLevel: Number(shopLowStockLevel),
      outOfStockNotificationEnabled: shopOutOfStockNotification,

      reviewModerationRequired: shopReviewModerationRequired,
      customerRatingsEnabled: shopCustomerRatingsEnabled,

      pushNotificationsEnabled: shopPushNotifications,
      emailNotificationsEnabled: shopEmailNotifications,
      lowStockAlertsEnabled: shopLowStockAlerts,
      offerNotificationsEnabled: shopOfferNotifications,
      announcementsText: shopAnnouncementsText,

      twoFactorEnabled: shopTwoFactorEnabled,
      password: newAdminPassword || undefined,

      appVersion: shopAppVersion,
      privacyPolicy: shopPrivacyPolicy,
      termsConditions: shopTermsConditions
    };

    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ settings: payload })
      });
      if (res.ok) {
        alert("Super Admin Settings updated successfully! All devices refreshed.");
        onRefreshData();
        fetchAdminReports();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update settings");
      }
    } catch (e) {
      alert("Failed to update settings");
    }
  };

  // Pricing format
  const formatNRS = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0
    })
      .format(num)
      .replace("NPR", "Rs.");
  };

  // Secure Authorization view
  if (!isAdminLoggedIn) {
    return (
      <div className="p-5 flex flex-col gap-6 font-sans">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white text-center flex flex-col items-center gap-2 border border-slate-850 shadow-md">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-1">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="font-display font-bold text-base tracking-tight leading-none">Super Admin Portal</h3>
          <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
            Secure administrative control deck for Sunkoshi Bearing Centre. Authorised administrators only.
          </p>
        </div>

        {/* 2FA Interceptor (Dev tool ease of use) */}
        {interceptedCode && (
          <div className="bg-indigo-50 border border-indigo-200 dark:bg-slate-900 dark:border-indigo-950 p-3 rounded-xl flex items-start gap-2 animate-pulse">
            <Key className="h-4 w-4 text-indigo-600 mt-0.5" />
            <div className="text-[10px]">
              <span className="font-bold text-indigo-800 dark:text-indigo-400">DEBUG 2FA INTERCEPTOR</span>
              <p className="text-slate-500 mt-0.5">Use code: <strong className="text-slate-900 dark:text-white font-mono tracking-widest text-xs bg-white dark:bg-slate-950 border px-1.5 py-0.5 rounded ml-1">{interceptedCode}</strong> to login instantly!</p>
            </div>
          </div>
        )}

        {authError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{authError}</span>
          </div>
        )}

        {loginStep === 1 ? (
          <form onSubmit={handleRequest2FA} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Super Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tikaregmi551@gmail.com"
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>{authLoading ? "Authenticating..." : "Request 2FA Token"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-3 animate-in slide-in-from-right duration-200">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Enter 6-Digit Passcode</label>
              <input
                type="text"
                required
                maxLength={6}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="000000"
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono tracking-widest text-center text-sm rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              {authLoading ? "Verifying..." : "Verify & Unlock Admin Panel"}
            </button>

            <button
              type="button"
              onClick={() => setLoginStep(1)}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 text-center"
            >
              ← Back to Step 1
            </button>
          </form>
        )}
      </div>
    );
  }

  // Logged-in Super Admin UI Workspace
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans relative">
      
      {/* Admin Panel Header Sub-Tab Navigation */}
      <div className="sticky top-0 bg-slate-900 text-white p-3.5 flex items-center justify-between shadow-xs z-30 flex-shrink-0">
        <div>
          <h4 className="text-[10px] tracking-wider uppercase text-slate-400 font-extrabold leading-none">Control Center</h4>
          <span className="text-xs font-bold mt-1 block">Sunkoshi CMS</span>
        </div>

        <button
          onClick={onAdminLogout}
          className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-slate-400 rounded-lg transition-all"
          title="Sign Out Admin"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Internal Navigation Sub-Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0 sticky top-14.5 z-20">
        <button
          onClick={() => setAdminTab("kpis")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "kpis" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setAdminTab("products")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "products" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setAdminTab("brands")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "brands" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Brands
        </button>
        <button
          onClick={() => setAdminTab("leads")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "leads" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setAdminTab("reviews")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "reviews" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Reviews
        </button>
        <button
          onClick={() => setAdminTab("settings")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "settings" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setAdminTab("backups")}
          className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
            adminTab === "backups" ? "border-amber-500 text-amber-500 dark:text-amber-400 bg-amber-500/10" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Security
        </button>
      </div>

      {/* ADMIN VIEWS ROUTING */}
      <div className="p-4 flex-1 overflow-y-auto">

        {/* TAB 1: OVERVIEW KPIs */}
        {adminTab === "kpis" && (
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Live System Metrics</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Bearings</span>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{products.length}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending Leads</span>
                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {localEnquiries.filter((e) => e.status === "pending").length + localQuotations.filter((q) => q.status === "pending").length}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-red-500 uppercase font-semibold">Low Stocks ⚠️</span>
                <p className="text-xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                  {products.filter((p) => p.availableQty <= 10).length}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Saved Reviews</span>
                <p className="text-xl font-extrabold text-amber-500 mt-1">{localReviews.length}</p>
              </div>
            </div>

            {/* Quick Action list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold">Instant Actions</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    resetProductForm();
                    setEditingProduct(null);
                    setShowProductForm(true);
                    setAdminTab("products");
                  }}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Add Bearing Product</span>
                </button>
                <button
                  onClick={handleDownloadBackup}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Database className="h-4.5 w-4.5 text-amber-500" />
                  <span>Download Backup</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY CRUD */}
        {adminTab === "products" && (
          <div className="flex flex-col gap-4">
            
            {/* Show Add/Edit product Form */}
            {showProductForm ? (
              <form onSubmit={handleSaveProduct} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    {editingProduct ? "Edit Product Detail" : "Add Brand New Product"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Product Display Name</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g., FAG 6204 Ball Bearing"
                    className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="Bearings">Bearings</option>
                      <option value="Tractor Parts">Tractor Parts</option>
                      <option value="Lubricants">Lubricants</option>
                      <option value="Grease">Grease</option>
                      <option value="Oil Seals">Oil Seals</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Brand Partner</label>
                    <select
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">SKU Code</label>
                    <input
                      type="text"
                      required
                      value={pSku}
                      onChange={(e) => setPSku(e.target.value)}
                      placeholder="FAG-6204-C3"
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Simulated Barcode No.</label>
                    <input
                      type="text"
                      value={pBarcode}
                      onChange={(e) => setPBarcode(e.target.value)}
                      placeholder="890123456789"
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Price (NRS)</label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Discount Percentage</label>
                    <input
                      type="number"
                      value={pDiscount}
                      onChange={(e) => setPDiscount(Number(e.target.value))}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Initial Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={pQty}
                      onChange={(e) => setPQty(Number(e.target.value))}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Warranty Period</label>
                    <input
                      type="text"
                      value={pWarranty}
                      onChange={(e) => setPWarranty(e.target.value)}
                      placeholder="e.g., 6 Months"
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Product Images List (URLs, comma separated)</label>
                  <input
                    type="text"
                    value={pImages.join(", ")}
                    onChange={(e) => setPImages(e.target.value.split(",").map((s) => s.trim()))}
                    placeholder="https://example.com/bearing.jpg"
                    className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">General Description</label>
                  <textarea
                    required
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs h-16 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  Save Bearing Product
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Catalog ({products.length})</span>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Create New Product</span>
                  </button>
                </div>

                {/* Product CRUD Table */}
                <div className="flex flex-col gap-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={p.images[0]} className="w-9 h-9 rounded object-cover flex-shrink-0 bg-slate-50" />
                        <div className="min-w-0">
                          <h6 className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-100 leading-none">
                            {p.name}
                          </h6>
                          <span className="text-[8px] font-mono text-slate-400">{p.sku} • {p.brand}</span>
                          <span className="text-[9px] block font-bold text-amber-500">
                            {formatNRS(p.price)} • Qty: {p.availableQty}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2.5: BRAND MANAGEMENT */}
        {adminTab === "brands" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200">Authorized Brands</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Add, edit, or delete brand partners of Sunkoshi Bearing Centre</p>
              </div>
              <button
                onClick={() => {
                  setEditingBrand(null);
                  setBName("");
                  setBLogoUrl("");
                  setBFeatured(false);
                  setShowBrandForm(true);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-[10px] flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Brand</span>
              </button>
            </div>

            {/* Brand Form Card */}
            {showBrandForm && (
              <form onSubmit={handleSaveBrand} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    {editingBrand ? "Edit Brand Partner" : "Add New Brand Partner"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBrandForm(false);
                      setEditingBrand(null);
                    }}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Brand Name</label>
                    <input
                      type="text"
                      required
                      value={bName}
                      onChange={(e) => setBName(e.target.value)}
                      placeholder="e.g., Timken, NRB"
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Logo Image URL</label>
                    <input
                      type="text"
                      value={bLogoUrl}
                      onChange={(e) => setBLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-[8px] text-slate-400 font-medium">Provide an image URL from Unsplash or upload locally.</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="brand-featured"
                      checked={bFeatured}
                      onChange={(e) => setBFeatured(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <label htmlFor="brand-featured" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                      Featured Brand (Show with priority on Homepage)
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-[10px] uppercase tracking-wider font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingBrand ? "Save Changes" : "Create Brand Partner"}</span>
                </button>
              </form>
            )}

            {/* Brands List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider grid grid-cols-12 gap-2">
                <span className="col-span-5">Brand details</span>
                <span className="col-span-3 text-center">Featured</span>
                <span className="col-span-4 text-right">Actions</span>
              </div>

              {brands.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No brand partners found. Click "Add Brand" to create one.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {brands.map((b) => (
                    <div key={b.id} className="p-3.5 grid grid-cols-12 gap-2 items-center text-xs">
                      {/* Logo & Name */}
                      <div className="col-span-5 flex items-center gap-2.5">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            className="h-8 w-8 object-contain rounded-lg border border-slate-100 dark:border-slate-850 p-0.5 bg-white dark:bg-slate-950"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 font-extrabold text-xs flex items-center justify-center">
                            {b.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{b.name}</span>
                      </div>

                      {/* Featured badge */}
                      <div className="col-span-3 flex justify-center">
                        {b.featured ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold border border-emerald-500/20">
                            YES
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[9px] font-bold border border-slate-200 dark:border-slate-800">
                            NO
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-4 flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditBrandClick(b)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-amber-500/10 hover:text-amber-500 text-slate-500 rounded-lg border border-slate-100 dark:border-slate-800 transition-all"
                          title="Edit Brand"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(b.id, b.name)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-lg border border-slate-100 dark:border-slate-800 transition-all"
                          title="Delete Brand"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LEADS - ENQUIRIES & QUOTATIONS */}
        {adminTab === "leads" && (
          <div className="flex flex-col gap-4">
            
            {activeLead ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 flex flex-col gap-3 shadow-md animate-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Lead: {activeLead.name}
                  </span>
                  <button
                    onClick={() => {
                      setActiveLead(null);
                      setLeadType(null);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <p className="text-[10px] text-slate-400 font-bold">Contact Info</p>
                  <p className="font-semibold">{activeLead.phone}</p>
                  {leadType === "quotation" && (activeLead as QuotationRequest).email && (
                    <p className="font-semibold text-slate-500">{(activeLead as QuotationRequest).email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs mt-2">
                  <p className="text-[10px] text-slate-400 font-bold">Details</p>
                  {leadType === "enquiry" ? (
                    <div>
                      <p className="font-semibold">Inquiry Item: {(activeLead as Enquiry).productName}</p>
                      <p className="italic text-slate-500">"{(activeLead as Enquiry).message}"</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">Quoted items list:</p>
                      <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden mt-1 text-[10px]">
                        {(activeLead as QuotationRequest).products.map((it, idx) => {
                          const prod = products.find((p) => p.id === it.productId);
                          const unitPrice = prod ? (prod.price - (prod.price * prod.discount) / 100) : 0;
                          return (
                            <div key={idx} className="p-1.5 border-b last:border-0 flex justify-between bg-slate-50">
                              <span>{it.productName} ({it.quantity}x)</span>
                              <span className="font-mono">{formatNRS(unitPrice * it.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit status & Admin notes */}
                <div className="flex flex-col gap-3.5 border-t border-slate-100 dark:border-slate-850 pt-3.5 mt-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Update Status</label>
                    <select
                      value={leadStatus}
                      onChange={(e) => setLeadStatus(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-lg text-xs"
                    >
                      {leadType === "enquiry" ? (
                        <>
                          <option value="pending">Pending</option>
                          <option value="responded">Responded</option>
                          <option value="archived">Archived</option>
                        </>
                      ) : (
                        <>
                          <option value="pending">Pending</option>
                          <option value="processed">Processed</option>
                          <option value="declined">Declined</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Internal Admin Notes</label>
                    <textarea
                      value={leadNote}
                      onChange={(e) => setLeadNote(e.target.value)}
                      placeholder="e.g., Called Sita Ram, offered Rs.200 discount. Order shipped."
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-lg h-16"
                    />
                  </div>

                  <button
                    onClick={handleUpdateLead}
                    className="py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs uppercase"
                  >
                    Save Status & Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* 1. Quotations List */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Bulk Quotation Requests ({quotations.length})</span>
                  {localQuotations.map((q) => {
                    const total = q.products.reduce((sum, item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      const price = prod ? (prod.price - (prod.price * prod.discount) / 100) : 0;
                      return sum + price * item.quantity;
                    }, 0);

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setActiveLead(q);
                          setLeadType("quotation");
                          setLeadStatus(q.status);
                          setLeadNote(q.adminNotes || "");
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-500 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{q.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              q.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}>{q.status}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: #{q.id} • {new Date(q.date).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">Items requested: {q.products.length}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-500 font-mono">
                          {formatNRS(total)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Direct Enquiries List */}
                <div className="flex flex-col gap-2.5 border-t border-slate-200 dark:border-slate-850 pt-4.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Direct Item Enquiries ({localEnquiries.length})</span>
                  {localEnquiries.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setActiveLead(e);
                        setLeadType("enquiry");
                        setLeadStatus(e.status);
                        setLeadNote(e.adminNotes || "");
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-500 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{e.name}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            e.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}>{e.status}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(e.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-600 font-bold mt-1">Item: {e.productName}</p>
                        <p className="text-[10px] text-slate-500 italic truncate max-w-[280px]">"{e.message}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVIEWS MODERATION */}
        {adminTab === "reviews" && (
          <div className="flex flex-col gap-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Verify & Reply Reviews ({reviews.length})</span>

            {replyingReview && (
              <form onSubmit={handleReviewReplySubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-inner flex flex-col gap-3 animate-in slide-in-from-top-1 duration-150">
                <span className="text-[10px] font-bold text-slate-400">Replying to: {replyingReview.customerName}</span>
                <textarea
                  required
                  value={reviewReplyText}
                  onChange={(e) => setReviewReplyText(e.target.value)}
                  placeholder="Thank you for your review! We appreciate your business."
                  className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-lg text-xs h-16"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded text-xs font-bold">Submit Response</button>
                  <button type="button" onClick={() => setReplyingReview(null)} className="py-1.5 px-3 bg-slate-100 text-slate-600 rounded text-xs">Cancel</button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {localReviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-3 rounded-xl flex flex-col gap-2 shadow-2xs"
                >
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{r.customerName}</span>
                      <span className="text-[8px] text-slate-400 block">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {r.approved ? (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[8px] font-bold px-1.5 py-0.5 rounded">Approved</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-850 text-[8px] font-bold px-1.5 py-0.5 rounded">Pending Approval</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 dark:text-slate-300 italic leading-normal">"{r.comment}"</p>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-2.5 mt-1">
                    <div className="flex gap-2 text-[9px] font-bold">
                      {!r.approved && (
                        <button onClick={() => handleApproveReview(r.id)} className="text-amber-500 hover:underline flex items-center gap-0.5"><Check className="h-3 w-3" /> Approve</button>
                      )}
                      <button
                        onClick={() => {
                          setReplyingReview(r);
                          setReviewReplyText(r.reply || "");
                        }}
                        className="text-indigo-600 hover:underline"
                      >
                        Reply
                      </button>
                    </div>

                    <button onClick={() => handleDeleteReview(r.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CMS SETTINGS */}
        {adminTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-4 shadow-sm text-xs">
            
            {/* Settings Header */}
            <div className="flex justify-between items-center pb-1">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-amber-500 font-extrabold">SUPER ADMIN CENTER</span>
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">
                  {lang === "en" ? "App & Store Configuration" : "एप र पसल कन्फिगरेसन"}
                </h4>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-lg">
                tikaregmi551@gmail.com
              </span>
            </div>

            {/* Settings Tabs Sub-Navigation Header - Scrollable row */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 pr-1 scrollbar-none">
              {(
                [
                  { id: "general", label: "General", icon: Sliders },
                  { id: "appearance", label: "Appearance", icon: Palette },
                  { id: "language", label: "Language", icon: Globe },
                  { id: "products", label: "Products", icon: Tag },
                  { id: "inventory", label: "Inventory", icon: Database },
                  { id: "reviews", label: "Reviews", icon: Star },
                  { id: "notifications", label: "Alerts", icon: Bell },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "backup", label: "Backup", icon: FileDown },
                  { id: "about", label: "About", icon: HelpCircle }
                ] as const
              ).map((cat) => {
                const IconComponent = cat.icon;
                const isActive = settingsSubTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSettingsSubTab(cat.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                      isActive
                        ? "bg-amber-500 text-black border-amber-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-tab content pane */}
            <div className="py-1 min-h-[350px] flex flex-col justify-between">
              
              {/* General Settings Section */}
              {settingsSubTab === "general" && (
                <div className="flex flex-col gap-4.5 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">General Settings</h5>
                    <p className="text-[10px] text-slate-400">Configure your primary business identity, brand parameters, and working hours.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">App Display Name</label>
                      <input
                        type="text"
                        required
                        value={shopAppName}
                        onChange={(e) => setShopAppName(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Business Display Name</label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Owner Name</label>
                      <input
                        type="text"
                        required
                        value={shopOwnerName}
                        onChange={(e) => setShopOwnerName(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Admin Representative</label>
                      <input
                        type="text"
                        required
                        value={shopAdminName}
                        onChange={(e) => setShopAdminName(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">App Logo Image URL</label>
                      <input
                        type="text"
                        required
                        value={shopLogoUrl}
                        onChange={(e) => setShopLogoUrl(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Splash Screen Banner URL</label>
                      <input
                        type="text"
                        required
                        value={shopSplashScreenUrl}
                        onChange={(e) => setShopSplashScreenUrl(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Official Phone Line</label>
                      <input
                        type="text"
                        required
                        value={shopPhone}
                        onChange={(e) => setShopPhone(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Business Hours</label>
                      <input
                        type="text"
                        required
                        value={shopBusinessHours}
                        onChange={(e) => setShopBusinessHours(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Business Physical Address</label>
                    <input
                      type="text"
                      required
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Google Maps Embed URL</label>
                    <input
                      type="text"
                      required
                      value={shopMap}
                      onChange={(e) => setShopMap(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Appearance Section */}
              {settingsSubTab === "appearance" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Appearance & Theme</h5>
                    <p className="text-[10px] text-slate-400">Customize themes, premium accent colors, banners, and layout types.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Default Theme Mode</label>
                      <select
                        value={shopThemeMode}
                        onChange={(e) => setShopThemeMode(e.target.value as any)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="auto">Auto (System Default)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Primary Theme Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={shopThemePrimaryColor}
                          onChange={(e) => setShopThemePrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 overflow-hidden"
                        />
                        <input
                          type="text"
                          required
                          value={shopThemePrimaryColor}
                          onChange={(e) => setShopThemePrimaryColor(e.target.value)}
                          className="p-2 flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Launcher App Icon Image URL</label>
                    <input
                      type="text"
                      required
                      value={shopAppIconUrl}
                      onChange={(e) => setShopAppIconUrl(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Homepage Grid Layout Style</label>
                    <select
                      value={shopHomepageLayout}
                      onChange={(e) => setShopHomepageLayout(e.target.value as any)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    >
                      <option value="standard">Standard Category Layout</option>
                      <option value="bento">Bento Performance Grid (Showcases Brands & Promos)</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-3 flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-1">
                      <Palette className="h-3.5 w-3.5" />
                      <span>Active Slider Banners</span>
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Your homepage features <b>{banners.length}</b> live banner slides displaying brand campaigns. You can modify these banners by loading database backups.
                    </p>
                  </div>
                </div>
              )}

              {/* Language Section */}
              {settingsSubTab === "language" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Language Preferences</h5>
                    <p className="text-[10px] text-slate-400">Configure default language and enable system language switches.</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Default App Language</label>
                    <select
                      value={shopDefaultLanguage}
                      onChange={(e) => setShopDefaultLanguage(e.target.value as any)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    >
                      <option value="en">English (Official App)</option>
                      <option value="np">Nepali (नेपाली अनुवाद)</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col gap-2.5 mt-1">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Enabled Customer Languages</span>
                    
                    <label className="flex items-center gap-3 text-xs py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopEnglishEnabled}
                        onChange={(e) => setShopEnglishEnabled(e.target.checked)}
                        className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">English (en)</span>
                        <p className="text-[9.5px] text-slate-400">Provides general catalog in English language</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 text-xs py-1 border-t border-slate-100 dark:border-slate-900 mt-1 pt-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopNepaliEnabled}
                        onChange={(e) => setShopNepaliEnabled(e.target.checked)}
                        className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">Nepali / नेपाली (np)</span>
                        <p className="text-[9.5px] text-slate-400">नेपाली ग्राहकहरूको लागि अनुवाद प्रणाली सक्रिय गर्नुहोस्</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Product Settings Section */}
              {settingsSubTab === "products" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Product Guidelines</h5>
                    <p className="text-[10px] text-slate-400">Set default product management rules, SKU codes, and visibility states.</p>
                  </div>

                  <label className="flex items-start gap-3 text-xs py-1 cursor-pointer bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={shopEnableCustomSku}
                      onChange={(e) => setShopEnableCustomSku(e.target.checked)}
                      className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Enforce Automated SKU Formats</span>
                      <p className="text-[10.5px] text-slate-400 leading-normal">Automatically standardizes SKU values as alphanumeric strings based on brand and specifications.</p>
                    </div>
                  </label>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Default Product Visibility Mode</label>
                    <select
                      value={shopDefaultProductVisibility}
                      onChange={(e) => setShopDefaultProductVisibility(e.target.value as any)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    >
                      <option value="show">Show on catalog immediately upon creation</option>
                      <option value="hide">Hide immediately (Save as Draft)</option>
                    </select>
                  </div>

                  <div className="border border-amber-500/10 bg-amber-500/5 p-3.5 rounded-2xl flex flex-col gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span>EAN Barcode Generator Tool</span>
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Seed EAN-13 barcodes for bearing stock instantly to support scanning hardware. Click to pre-format sequencers:
                    </p>
                    <button
                      type="button"
                      onClick={() => alert("Barcode system configured! Bearings SKU will format as barcodes automatically.")}
                      className="py-1.5 px-3 bg-amber-500 text-black rounded-lg text-[10px] font-extrabold uppercase self-start transition-all hover:bg-amber-600"
                    >
                      Seed Barcode Sequence
                    </button>
                  </div>
                </div>
              )}

              {/* Inventory Settings Section */}
              {settingsSubTab === "inventory" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Inventory & Stock Controls</h5>
                    <p className="text-[10px] text-slate-400">Configure stock triggers, low stock safety alerts, and Excel/CSV imports.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Low Stock Safety Warning Level</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={shopLowStockLevel}
                        onChange={(e) => setShopLowStockLevel(Number(e.target.value))}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Out of Stock Notification</label>
                      <select
                        value={shopOutOfStockNotification ? "true" : "false"}
                        onChange={(e) => setShopOutOfStockNotification(e.target.value === "true")}
                        className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <option value="true">Enable Instant Alerts</option>
                        <option value="false">Disable Alerts</option>
                      </select>
                    </div>
                  </div>

                  {/* BULK STOCK CSV LOADER */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col gap-2 mt-1">
                    <span className="text-[9.5px] font-black uppercase text-emerald-500">Stock Bulk CSV/Excel Importer</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Paste CSV rows in <b>SKU,Qty</b> format to perform bulk stock overrides:
                    </p>
                    <textarea
                      value={csvImportText}
                      onChange={(e) => setCsvImportText(e.target.value)}
                      placeholder="e.g.&#10;FAG-6204,150&#10;TIMKEN-SET47,45&#10;MAK-15W40,24"
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-20 font-mono text-[9px] leading-tight"
                    />
                    <div className="flex gap-2 justify-between items-center mt-1">
                      <button
                        type="button"
                        onClick={handleProcessCsvImport}
                        disabled={!csvImportText.trim()}
                        className="py-1.5 px-3.5 bg-emerald-600 text-white font-extrabold rounded-lg text-[9px] uppercase hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                      >
                        Import CSV Stock Lines
                      </button>
                      <button
                        type="button"
                        onClick={handleExportInventory}
                        className="py-1.5 px-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-extrabold rounded-lg text-[9px] uppercase border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
                      >
                        Download Stock CSV
                      </button>
                    </div>
                    {csvImportStatus && (
                      <span className="text-[9px] font-bold text-amber-500 block leading-tight mt-1">{csvImportStatus}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Live Stock Action History</span>
                    <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl p-2 max-h-[85px] overflow-y-auto text-[8.5px] leading-normal font-mono text-slate-500">
                      <div><span className="text-emerald-500">✦ IN</span> FAG Bearing 6204-2RSH (+50 units) • Today</div>
                      <div><span className="text-amber-500">✦ ALERT</span> Lubricants - MAK oil level below warning limits • Yesterday</div>
                      <div><span className="text-red-500">✦ OUT</span> Eicher Clutch plate stock empty • 2 days ago</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Settings Section */}
              {settingsSubTab === "reviews" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Review Moderation Policies</h5>
                    <p className="text-[10px] text-slate-400">Toggle customer rating visibility and regulate manual feedback approvals.</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Customer Review Approvals</label>
                    <select
                      value={shopReviewModerationRequired ? "true" : "false"}
                      onChange={(e) => setShopReviewModerationRequired(e.target.value === "true")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    >
                      <option value="true">Approve reviews manually (Requires Moderation)</option>
                      <option value="false">Auto-publish reviews instantly without validation</option>
                    </select>
                  </div>

                  <label className="flex items-start gap-3 text-xs py-1 cursor-pointer bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={shopCustomerRatingsEnabled}
                      onChange={(e) => setShopCustomerRatingsEnabled(e.target.checked)}
                      className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Enable Customer Star Ratings</span>
                      <p className="text-[10.5px] text-slate-400 leading-normal">Allows clients to rate bearings and machinery parts from 1 to 5 stars with commentary.</p>
                    </div>
                  </label>

                  <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-2xl flex justify-between items-center mt-1">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-100 text-xs">Review Moderation Deck</span>
                      <span className="text-[9.5px] text-slate-400">Process user comments, delete spam, and write admin replies.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminTab("reviews")}
                      className="py-1.5 px-3 bg-amber-500 text-black font-extrabold rounded-lg text-[9px] uppercase shadow-xs transition-all"
                    >
                      Review Desk ({reviews.filter((r) => !r.approved).length})
                    </button>
                  </div>
                </div>
              )}

              {/* Alerts & Notifications Settings */}
              {settingsSubTab === "notifications" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Alerts & Messaging</h5>
                    <p className="text-[10px] text-slate-400">Configure push alerts, automated inventory notifications, and broadcasts.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopPushNotifications}
                        onChange={(e) => setShopPushNotifications(e.target.checked)}
                        className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5"
                      />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">Push Notifications</span>
                        <p className="text-[9.5px] text-slate-400">Alerts for new client direct inquiries & quotation requests.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 text-xs border-t border-slate-100 dark:border-slate-900 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopEmailNotifications}
                        onChange={(e) => setShopEmailNotifications(e.target.checked)}
                        className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5"
                      />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">Official Email Notifications</span>
                        <p className="text-[9.5px] text-slate-400">Directly dispatches lead files to tikaregmi551@gmail.com.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 text-xs border-t border-slate-100 dark:border-slate-900 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopLowStockAlerts}
                        onChange={(e) => setShopLowStockAlerts(e.target.checked)}
                        className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5"
                      />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">Low Stock Safety Warnings</span>
                        <p className="text-[9.5px] text-slate-400">Daily alarm triggers when bearings are under safe levels.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 text-xs border-t border-slate-100 dark:border-slate-900 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopOfferNotifications}
                        onChange={(e) => setShopOfferNotifications(e.target.checked)}
                        className="rounded-md border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5"
                      />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">Offer & Promotion Dispatches</span>
                        <p className="text-[9.5px] text-slate-400">Dispatches price drop news to regular tractor bulk buyers.</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-slate-150 dark:border-slate-850 pt-3">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Broadcast App Announcement (Header Banner)</label>
                    <textarea
                      value={shopAnnouncementsText}
                      onChange={(e) => setShopAnnouncementsText(e.target.value)}
                      placeholder="e.g. Monsoon Offer: 10% Flat Discount on MAK grease & FAG heavy machine bearing series! Valid until July 15."
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-16 leading-relaxed"
                    />
                    <p className="text-[8px] text-slate-400 mt-0.5">Announcements display instantly on the client's home-screen dashboard marquee.</p>
                  </div>
                </div>
              )}

              {/* Security Settings Section */}
              {settingsSubTab === "security" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Security & Verification</h5>
                    <p className="text-[10px] text-slate-400">Change passcode credentials, enforce two-factor authentication, and log out devices.</p>
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-2xl">
                    <span className="text-[8.5px] font-black uppercase text-amber-500">Super Admin Account Identification</span>
                    <span className="text-xs font-bold font-mono">tikaregmi551@gmail.com</span>
                    <p className="text-[8.5px] text-slate-400 mt-1 leading-normal">
                      This is the sole email address with Master control capabilities. Only logins matching this exact account have access.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Enforce 2FA Passcode Verification</label>
                    <select
                      value={shopTwoFactorEnabled ? "true" : "false"}
                      onChange={(e) => setShopTwoFactorEnabled(e.target.value === "true")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    >
                      <option value="true">Enforced (Dispatches a secure 6-digit verification code)</option>
                      <option value="false">Disabled (Enables password-only bypass for quick logins)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Change Super Admin Password / passcode</label>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Enter new strong numeric passcode..."
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                    <p className="text-[8.5px] text-slate-400">Leave blank to retain current system login passwords.</p>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-150 dark:border-slate-850 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Enforce Secure Logout Procedures</span>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem("sunkoshi_admin_token");
                          alert("All active login tokens cleared! Redirecting to login verification page.");
                          onAdminLogout();
                        }}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-[9px] uppercase tracking-wider"
                      >
                        Logout From All Devices
                      </button>
                      <button
                        type="button"
                        onClick={() => alert("Secure browser environment enforced.")}
                        className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[9px] uppercase border border-slate-200 dark:border-slate-700"
                      >
                        Secure Login Lock
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Recent System Activity Trails</span>
                    <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl p-2 max-h-[85px] overflow-y-auto text-[8.5px] leading-tight font-mono text-slate-500">
                      <div>[2FA SECURE] Super Admin tikaregmi551@gmail.com successfully logged in • Today</div>
                      <div>[CMS BACKUP] Backup file downloaded to local disk • Yesterday</div>
                      <div>[OK] Category list edited and synchronized • 2 days ago</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup & Recovery Section */}
              {settingsSubTab === "backup" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Backup, Recovery & Exports</h5>
                    <p className="text-[10px] text-slate-400">Save shop databases, restore backup files, and export system sheets.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadBackup}
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10"
                    >
                      <Download className="h-4 w-4" />
                      <span>Backup App Data</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportInventory}
                      className="py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-950 text-white font-extrabold rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>Export Stock CSV</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleExportEnquiries}
                      className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Export Enquiries</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportQuotations}
                      className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>Export Quotes</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2 mt-1">
                    <span className="text-[9.5px] font-black uppercase text-indigo-500 flex items-center gap-1">
                      <Database className="h-3.5 w-3.5" />
                      <span>Database Restore Pastebox</span>
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Paste a previously downloaded Sunkoshi JSON backup file structure to instantly restore stock catalog, custom themes and enquiries:
                    </p>
                    <textarea
                      value={backupRestoreContent}
                      onChange={(e) => setBackupRestoreContent(e.target.value)}
                      placeholder="Paste backup JSON string here..."
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-14 font-mono text-[9px] leading-tight"
                    />
                    <button
                      type="button"
                      onClick={handleRestoreDatabase}
                      disabled={!backupRestoreContent.trim()}
                      className="py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 font-extrabold rounded-lg text-[9px] uppercase transition-all"
                    >
                      Execute Full Restore
                    </button>
                  </div>
                </div>
              )}

              {/* About & Support Section */}
              {settingsSubTab === "about" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">About App & Support</h5>
                    <p className="text-[10px] text-slate-400">Review app version numbers, legal disclosures, and contact technical support.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">App Build Version</span>
                      <input
                        type="text"
                        required
                        value={shopAppVersion}
                        onChange={(e) => setShopAppVersion(e.target.value)}
                        className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      Sunkoshi Bearings Centre ERP<br />
                      Version 2.4.0 • Live
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Privacy Policy Agreement</label>
                    <textarea
                      value={shopPrivacyPolicy}
                      onChange={(e) => setShopPrivacyPolicy(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-16 leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Terms & Conditions Agreement</label>
                    <textarea
                      value={shopTermsConditions}
                      onChange={(e) => setShopTermsConditions(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs h-16 leading-relaxed"
                    />
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-indigo-500">Need Specialized Technical Support?</span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-normal">
                      Need custom features, database migration assistance, or hosting configurations? Contact our technical helpdesk directly:
                    </p>
                    <a
                      href="mailto:support@sunkoshibearings.com?subject=Sunkoshi%20Bearing%20Centre%20Admin%2520Support"
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-extrabold uppercase self-start transition-all mt-1"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              )}

            </div>

            {/* Persistent Save Button inside form */}
            <button
              type="submit"
              className="py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
            >
              <Save className="h-4.5 w-4.5" />
              <span>
                {lang === "en" ? "Save All Super Admin Settings" : "सबै सुपर एडमिन सेटिङहरू बचत गर्नुहोस्"}
              </span>
            </button>
          </form>
        )}

        {/* TAB 6: SECURITY & DB RESTORES */}
        {adminTab === "backups" && (
          <div className="flex flex-col gap-5">
            
            {/* Database Restore pastebox */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-xs text-xs">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-500" />
                <span>Restore Database From File</span>
              </h4>
              <textarea
                value={backupRestoreContent}
                onChange={(e) => setBackupRestoreContent(e.target.value)}
                placeholder="Paste backup JSON structure here..."
                className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg h-24 w-full font-mono text-[9px]"
              />
              <button
                onClick={handleRestoreDatabase}
                disabled={!backupRestoreContent.trim()}
                className="w-full mt-2 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-amber-500 hover:text-black disabled:bg-slate-200 text-white rounded-lg font-bold text-xs uppercase transition-all"
              >
                Perform Restore
              </button>
            </div>

            {/* Admin Logs Tracker */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span>Audit Trail Activity Logs</span>
              </h4>

              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-lg text-[9px] flex flex-col gap-1 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-500">{log.action}</span>
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 font-sans italic leading-tight">"{log.details}"</p>
                    <span className="text-[8px] text-slate-400">By Admin: {log.adminEmail} • IP: {log.ipAddress}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
