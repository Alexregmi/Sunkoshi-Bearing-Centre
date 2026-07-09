import React from "react";
import PhoneFrame from "./components/PhoneFrame";
import HomeView from "./components/HomeView";
import CatalogView from "./components/CatalogView";
import ProductDetailModal from "./components/ProductDetailModal";
import AIChatView from "./components/AIChatView";
import WishlistQuoteView from "./components/WishlistQuoteView";
import AdminPanel from "./components/AdminPanel";
import { Product, Review, Enquiry, QuotationRequest, AppSettings, Banner, Brand } from "./types";
import { Scale, Heart, ShieldAlert, Sparkles, Check, X } from "lucide-react";
import { apiFetch } from "./lib/api";

export default function App() {
  // Format price helper
  const formatNRS = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0
    })
      .format(num)
      .replace("NPR", "Rs.");
  };

  // Appearance & Language State
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [lang, setLang] = React.useState<"en" | "np">("en");
  const [activeTab, setActiveTab] = React.useState<string>("home");

  // Filter Queries passed from Home to Catalog
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");

  // DB Synced States
  const [products, setProducts] = React.useState<Product[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [quotations, setQuotations] = React.useState<QuotationRequest[]>([]);
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>({
    businessName: "Sunkoshi Bearing Centre",
    phone: "+977 9842176142",
    whatsappPhone: "+9779842176142",
    address: "Labipur, Itahari, Nepal",
    adminEmail: "tikaregmi551@gmail.com",
    mapEmbedUrl: "",
    logoUrl: "",
    activePromoBanner: ""
  });

  // Client Interactivity States
  const [wishlist, setWishlist] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sunkoshi_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [compareList, setCompareList] = React.useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);

  // Sync wishlist to local storage
  React.useEffect(() => {
    localStorage.setItem("sunkoshi_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Compare Drawer toggle
  const [showCompareDrawer, setShowCompareDrawer] = React.useState(false);

  // Apply dark mode styling to html document
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Initial Fetch of Data catalog
  const fetchData = async () => {
    try {
      const res = await apiFetch("/api/catalog");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setBrands(data.brands || []);
        setReviews(data.reviews || []);
        setEnquiries(data.enquiries || []);
        setQuotations(data.quotations || []);
        setBanners(data.banners || []);
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error("Failed to fetch shop database:", err);
    }
  };

  React.useEffect(() => {
    fetchData();
    // Check if token exists to automatically login
    const token = localStorage.getItem("sunkoshi_admin_token");
    if (token) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Listen to product list updates and parse deep-link parameters if any
  React.useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("product");
      if (productId) {
        const found = products.find((p) => p.id === productId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    }
  }, [products]);

  // Admin Logout Handler
  const handleAdminLogout = () => {
    localStorage.removeItem("sunkoshi_admin_token");
    setIsAdminLoggedIn(false);
  };

  // Toggle Wishlist handler
  const handleToggleWishlist = (p: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(p.id);
      if (exists) {
        return prev.filter((id) => id !== p.id);
      } else {
        return [...prev, p.id];
      }
    });
  };

  const handleRemoveFromWishlist = (p: Product) => {
    setWishlist((prev) => prev.filter((id) => id !== p.id));
  };

  // Toggle Compare list
  const handleToggleCompare = (p: Product) => {
    setCompareList((prev) => {
      const exists = prev.includes(p.id);
      if (exists) {
        return prev.filter((id) => id !== p.id);
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 products at a time!");
          return prev;
        }
        setShowCompareDrawer(true);
        return [...prev, p.id];
      }
    });
  };

  // Safe submission handlers (called inside components)
  const handleAddReview = async (reviewData: any) => {
    try {
      const res = await apiFetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });
      if (res.ok) {
        fetchData(); // reload
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleAddEnquiry = async (enquiryData: any) => {
    try {
      const res = await apiFetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryData)
      });
      if (res.ok) {
        fetchData(); // reload
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleAddQuotation = async (quoteData: any) => {
    try {
      const res = await apiFetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData)
      });
      if (res.ok) {
        fetchData(); // reload
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Navigation controller passing specific queries
  const handleNavigateToTab = (tab: string, search: string = "", category: string = "") => {
    setSearchQuery(search);
    setCategoryFilter(category);
    setActiveTab(tab);
  };

  return (
    <PhoneFrame
      theme={theme}
      setTheme={setTheme}
      lang={lang}
      setLang={setLang}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      wishlistCount={wishlist.length}
      isAdminLoggedIn={isAdminLoggedIn}
      onAdminLogout={handleAdminLogout}
    >
      {/* Dynamic Screen Routing */}
      {activeTab === "home" && (
        <HomeView
          products={products}
          banners={banners}
          settings={settings}
          reviews={reviews.filter((r) => r.isApproved || r.approved)}
          categories={["Bearings", "Automotive Parts", "Lubricants", "Grease", "Oil Seals"]}
          brands={brands}
          lang={lang}
          onSelectProduct={setSelectedProduct}
          onNavigateToTab={handleNavigateToTab}
        />
      )}

      {activeTab === "catalog" && (
        <CatalogView
          products={products}
          categories={["Bearings", "Automotive Parts", "Lubricants", "Grease", "Oil Seals"]}
          brands={brands}
          wishlist={wishlist}
          compareList={compareList}
          lang={lang}
          onSelectProduct={setSelectedProduct}
          onToggleWishlist={handleToggleWishlist}
          onToggleCompare={handleToggleCompare}
          onNavigateToTab={handleNavigateToTab}
          initialSearchQuery={searchQuery}
          initialCategoryQuery={categoryFilter}
        />
      )}

      {activeTab === "ai-chat" && (
        <AIChatView lang={lang} onNavigateToTab={handleNavigateToTab} />
      )}

      {activeTab === "wishlist" && (
        <WishlistQuoteView
          products={products}
          wishlist={wishlist}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onSelectProduct={setSelectedProduct}
          onNavigateToTab={handleNavigateToTab}
          onAddQuotation={handleAddQuotation}
          lang={lang}
        />
      )}

      {activeTab === "admin" && (
        <AdminPanel
          products={products}
          brands={brands}
          reviews={reviews}
          enquiries={enquiries}
          quotations={quotations}
          settings={settings}
          lang={lang}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminLoginSuccess={(token) => {
            setIsAdminLoggedIn(true);
          }}
          onAdminLogout={handleAdminLogout}
          onRefreshData={fetchData}
          banners={banners}
        />
      )}

      {/* DETAIL MODAL OVERLAY */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          reviews={reviews.filter((r) => r.isApproved)}
          wishlist={wishlist}
          compareList={compareList}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onToggleCompare={handleToggleCompare}
          onAddReview={handleAddReview}
          onAddEnquiry={handleAddEnquiry}
          lang={lang}
        />
      )}

      {/* FLOATING COMPARE BAR/DRAWER */}
      {compareList.length > 0 && (
        <div className="absolute bottom-18 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl text-white z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <Scale className="h-4 w-4" />
              <span>Compare Bearings ({compareList.length}/3)</span>
            </span>
            <button
              onClick={() => setShowCompareDrawer(!showCompareDrawer)}
              className="text-[10px] font-bold text-slate-400 hover:text-white"
            >
              {showCompareDrawer ? "Hide Specs ✕" : "Show Specs ↕"}
            </button>
          </div>

          {/* Thumbnails of compared items */}
          <div className="flex gap-2">
            {compareList.map((id) => {
              const item = products.find((p) => p.id === id);
              if (!item) return null;
              return (
                <div key={item.id} className="flex-1 bg-slate-800 border border-slate-700 p-1.5 rounded-xl flex items-center justify-between gap-1.5 min-w-0 relative">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={item.images[0]} className="w-6 h-6 rounded object-cover" />
                    <span className="text-[9px] font-bold truncate text-slate-200">{item.name}</span>
                  </div>
                  <button
                    onClick={() => handleToggleCompare(item)}
                    className="p-0.5 bg-slate-700 hover:bg-slate-600 rounded text-red-400"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Specs comparison matrix table */}
          {showCompareDrawer && (
            <div className="mt-3 border-t border-slate-800 pt-3 flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {/* Table comparisons */}
              <div className="grid grid-cols-4 text-[9px] border-b border-slate-800 pb-1.5 font-bold text-slate-400">
                <span>Specs</span>
                {compareList.map((id, i) => (
                  <span key={id} className="truncate text-center">#{i + 1} SKU</span>
                ))}
              </div>

              {/* Row for SKUs */}
              <div className="grid grid-cols-4 text-[9px] border-b border-slate-850 py-1 font-semibold text-slate-300">
                <span className="text-slate-500 font-bold">SKU</span>
                {compareList.map((id) => {
                  const item = products.find((p) => p.id === id);
                  return <span key={id} className="truncate text-center font-mono">{item?.sku}</span>;
                })}
              </div>

              {/* Row for Brand */}
              <div className="grid grid-cols-4 text-[9px] border-b border-slate-850 py-1 font-semibold text-slate-300">
                <span className="text-slate-500 font-bold">Brand</span>
                {compareList.map((id) => {
                  const item = products.find((p) => p.id === id);
                  return <span key={id} className="truncate text-center font-bold">{item?.brand}</span>;
                })}
              </div>

              {/* Row for Bore Size */}
              <div className="grid grid-cols-4 text-[9px] border-b border-slate-850 py-1 font-semibold text-slate-300">
                <span className="text-slate-500 font-bold">Bore (d)</span>
                {compareList.map((id) => {
                  const item = products.find((p) => p.id === id);
                  const spec = item?.specifications?.find((s) => s.name.toLowerCase().includes("bore"));
                  return <span key={id} className="truncate text-center font-mono">{spec?.value || "-"}</span>;
                })}
              </div>

              {/* Row for Outer Size */}
              <div className="grid grid-cols-4 text-[9px] border-b border-slate-850 py-1 font-semibold text-slate-300">
                <span className="text-slate-500 font-bold font-sans">OD (D)</span>
                {compareList.map((id) => {
                  const item = products.find((p) => p.id === id);
                  const spec = item?.specifications?.find((s) => s.name.toLowerCase().includes("outer") || s.name.toLowerCase().includes("od"));
                  return <span key={id} className="truncate text-center font-mono">{spec?.value || "-"}</span>;
                })}
              </div>

              {/* Row for Thickness */}
              <div className="grid grid-cols-4 text-[9px] border-b border-slate-850 py-1 font-semibold text-slate-300">
                <span className="text-slate-500 font-bold">Thick (B)</span>
                {compareList.map((id) => {
                  const item = products.find((p) => p.id === id);
                  const spec = item?.specifications?.find((s) => s.name.toLowerCase().includes("thickness") || s.name.toLowerCase().includes("width"));
                  return <span key={id} className="truncate text-center font-mono">{spec?.value || "-"}</span>;
                })}
              </div>

              {/* Row for Price */}
              <div className="grid grid-cols-4 text-[9px] py-1 font-bold text-emerald-400">
                <span className="text-slate-500 uppercase font-extrabold text-[8px]">Price</span>
                {compareList.map((id) => {
                  const item = products.find((p) => p.id === id);
                  return <span key={id} className="text-center font-mono">{item ? formatNRS(item.price) : "-"}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </PhoneFrame>
  );
}
