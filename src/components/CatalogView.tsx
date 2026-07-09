import React from "react";
import { Filter, Search, Grid, Eye, Check, Heart, Scale, FileSpreadsheet, RefreshCw, Star } from "lucide-react";
import { Product, Brand } from "../types";
import { playSynthSound } from "../lib/sounds";

interface CatalogViewProps {
  products: Product[];
  categories: string[];
  brands: Brand[];
  wishlist: string[];
  compareList: string[];
  lang: "en" | "np";
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onToggleCompare: (p: Product) => void;
  onNavigateToTab: (t: string) => void;
  initialSearchQuery?: string;
  initialCategoryQuery?: string;
}

export default function CatalogView({
  products,
  categories,
  brands,
  wishlist,
  compareList,
  lang,
  onSelectProduct,
  onToggleWishlist,
  onToggleCompare,
  onNavigateToTab,
  initialSearchQuery = "",
  initialCategoryQuery = ""
}: CatalogViewProps) {
  const [search, setSearch] = React.useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategoryQuery);
  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [selectedStock, setSelectedStock] = React.useState("all"); // 'all' | 'in' | 'low' | 'out'
  const [selectedTractorModel, setSelectedTractorModel] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  // Synchronize with initial queries passed from home click
  React.useEffect(() => {
    if (initialSearchQuery) setSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  React.useEffect(() => {
    if (initialCategoryQuery) setSelectedCategory(initialCategoryQuery);
  }, [initialCategoryQuery]);

  // Extract all compatible tractor models dynamically
  const tractorModelsList = React.useMemo(() => {
    const modelsSet = new Set<string>();
    products.forEach((p) => {
      if (p.tractorModels) {
        p.tractorModels.forEach((m) => modelsSet.add(m));
      }
    });
    return Array.from(modelsSet);
  }, [products]);

  // Handle filtering logic
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query (matches name, brand, category, sku, tractor compatibility, vehicle compatibility)
      const query = search.toLowerCase().trim();
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesTractor = p.tractorModels?.some((m) => m.toLowerCase().includes(query)) || false;
        const matchesVehicle = p.vehicleModels?.some((m) => m.toLowerCase().includes(query)) || false;
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesSku && !matchesTractor && !matchesVehicle) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory && p.category !== selectedCategory) return false;

      // 3. Brand Filter
      if (selectedBrand && p.brand !== selectedBrand) return false;

      // 4. Stock Filter
      if (selectedStock === "in" && p.availableQty === 0) return false;
      if (selectedStock === "low" && (p.availableQty === 0 || p.availableQty > 10)) return false;
      if (selectedStock === "out" && p.availableQty > 0) return false;

      // 5. Tractor Compatibility Filter
      if (selectedTractorModel && !p.tractorModels?.includes(selectedTractorModel)) return false;

      return true;
    });
  }, [products, search, selectedCategory, selectedBrand, selectedStock, selectedTractorModel]);

  const clearAllFilters = () => {
    playSynthSound("tap");
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedStock("all");
    setSelectedTractorModel("");
  };

  // formatting
  const formatNRS = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0
    })
      .format(num)
      .replace("NPR", "Rs.");
  };

  const getStockBadge = (qty: number) => {
    if (qty === 0) {
      return {
        label: lang === "en" ? "Out of Stock" : "सकिएको",
        style: "bg-red-500/10 text-red-500 border-red-500/20"
      };
    }
    if (qty <= 10) {
      return {
        label: lang === "en" ? `Low Stock (${qty})` : `थोरै बाँकी (${qty})`,
        style: "bg-amber-500/10 text-amber-500 border-amber-500/20"
      };
    }
    return {
      label: lang === "en" ? "In Stock" : "मौजदात छ",
      style: "bg-green-500/10 text-green-500 border-green-500/20"
    };
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              playSynthSound("search");
            }}
            placeholder={lang === "en" ? "Search genuine spare parts..." : "सामान खोज्नुहोस्..."}
            className="w-full py-2 pl-3 pr-9 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-xs focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>
        <button
          onClick={() => {
            playSynthSound("tap");
            setShowFilters(!showFilters);
          }}
          className={`px-3 py-2 border rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
            showFilters || selectedCategory || selectedBrand || selectedTractorModel || selectedStock !== "all"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>{lang === "en" ? "Filter" : "फिल्टर"}</span>
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {lang === "en" ? "Advanced Filter Options" : "विस्तृत फिल्टर सेटिङ"}
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              {lang === "en" ? "Clear Filters" : "सबै हटाउनुहोस्"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">
                {lang === "en" ? "Category" : "कोटि"}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  playSynthSound("search");
                }}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-amber-500"
              >
                <option value="">{lang === "en" ? "All Categories" : "सबै कोटिहरू"}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">
                {lang === "en" ? "Brand" : "ब्रान्ड"}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  playSynthSound("search");
                }}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-amber-500"
              >
                <option value="">{lang === "en" ? "All Brands" : "सबै ब्रान्डहरू"}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Stock Availability */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">
                {lang === "en" ? "Availability" : "मौजदात स्थिति"}
              </label>
              <select
                value={selectedStock}
                onChange={(e) => {
                  setSelectedStock(e.target.value);
                  playSynthSound("search");
                }}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-amber-500"
              >
                <option value="all">{lang === "en" ? "All Stock Status" : "सबै मौजदात"}</option>
                <option value="in">{lang === "en" ? "In Stock ✅" : "मौजदात छ ✅"}</option>
                <option value="low">{lang === "en" ? "Low Stock ⚠️" : "थोरै मात्र बाँकी ⚠️"}</option>
                <option value="out">{lang === "en" ? "Out of Stock ❌" : "सकिएको ❌"}</option>
              </select>
            </div>

            {/* Tractor Compatibility */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">
                {lang === "en" ? "Tractor Model" : "ट्रयाक्टर मोडेल"}
              </label>
              <select
                value={selectedTractorModel}
                onChange={(e) => {
                  setSelectedTractorModel(e.target.value);
                  playSynthSound("search");
                }}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-amber-500"
              >
                <option value="">{lang === "en" ? "All Tractor Models" : "सबै ट्रयाक्टर मोडेल"}</option>
                {tractorModelsList.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Listing Control Bar */}
      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span>
          {lang === "en" ? "Showing" : "देखाइएको"}{" "}
          <strong className="text-slate-700 dark:text-slate-200">{filteredProducts.length}</strong>{" "}
          {lang === "en" ? "genuine parts" : "सामानहरू"}
        </span>

        <button
          onClick={() => {
            playSynthSound("tap");
            window.print();
          }}
          className="flex items-center gap-1 text-amber-500 font-bold hover:underline"
          title="Print Catalog to PDF"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>{lang === "en" ? "Export Catalog" : "कैटलग डाउनलोड"}</span>
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isWishlisted = wishlist.includes(p.id);
            const isComparing = compareList.includes(p.id);
            const badge = getStockBadge(p.availableQty);
            const hasDiscount = p.discount > 0;
            const discountedPrice = p.price - (p.price * p.discount) / 100;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden p-2 flex flex-col gap-1.5 hover:border-amber-500 hover:scale-[1.01] transition-all relative group shadow-xs"
              >
                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">
                    {p.discount}% OFF
                  </span>
                )}

                {/* Wishlist and Compare Buttons on Hover/Corners */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSynthSound("favorite");
                      onToggleWishlist(p);
                    }}
                    className={`p-1.5 rounded-full border shadow-xs transition-colors ${
                      isWishlisted
                        ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/50"
                        : "bg-white/80 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-white dark:bg-slate-800 dark:border-slate-700"
                    }`}
                    title={lang === "en" ? "Add to Wishlist" : "मनपर्ने सूचीमा थप्नुहोस्"}
                  >
                    <Heart className={`h-3 w-3 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSynthSound("tap");
                      onToggleCompare(p);
                    }}
                    className={`p-1.5 rounded-full border shadow-xs transition-colors ${
                      isComparing
                        ? "bg-blue-50 border-blue-200 text-blue-500 dark:bg-blue-950/50"
                        : "bg-white/80 border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-white dark:bg-slate-800 dark:border-slate-700"
                    }`}
                    title={lang === "en" ? "Add to Compare" : "तुलना गर्नुहोस्"}
                  >
                    <Scale className="h-3 w-3" />
                  </button>
                </div>

                {/* Image Canvas */}
                <div
                  onClick={() => {
                    playSynthSound("tap");
                    onSelectProduct(p);
                  }}
                  className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info Text Area */}
                <div className="flex flex-col gap-1 flex-1 justify-between">
                  <div 
                    onClick={() => {
                      playSynthSound("tap");
                      onSelectProduct(p);
                    }} 
                    className="cursor-pointer"
                  >
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">
                      {p.brand}
                    </span>
                    <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                      {p.name}
                    </h5>
                  </div>

                  <div className="mt-1 flex flex-col gap-1">
                    {/* Live Stock Indicators */}
                    <span className={`inline-block border px-1.5 py-0.5 text-[8px] font-bold rounded-md self-start ${badge.style}`}>
                      {badge.label}
                    </span>

                    {/* Price Tag */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold text-slate-900 dark:text-amber-400">
                        {formatNRS(hasDiscount ? discountedPrice : p.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[8px] text-slate-400 line-through">
                          {formatNRS(p.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 gap-1.5">
                    <button
                      onClick={() => {
                        playSynthSound("tap");
                        onSelectProduct(p);
                      }}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-slate-700 hover:text-amber-500 text-slate-700 dark:text-slate-300 font-bold py-1 px-2 rounded-lg text-[9px] transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="h-2.5 w-2.5" />
                      <span>{lang === "en" ? "Details" : "हेर्नुहोस्"}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        playSynthSound("tap");
                        onNavigateToTab("wishlist");
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-1 px-2 rounded-lg text-[9px] transition-all flex items-center justify-center"
                      title={lang === "en" ? "Request Quotation" : "कोटेसन लिनुहोस्"}
                    >
                      {lang === "en" ? "Quote" : "कोट"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <span className="text-3xl">⚙️</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {lang === "en" ? "No Matching Spare Parts" : "कुनै सामान भेटिएन"}
          </h4>
          <p className="text-xs text-slate-400 max-w-xs leading-normal">
            {lang === "en"
              ? "We couldn't find any products matching your search criteria. Try modifying your filters or contact Sita Ram for custom orders!"
              : "तपाईंले खोज्नुभएको सामान भेटिएन। कृपया अर्कै नाम खोज्नुहोस् वा सिधै प्रोप्राइटर सीता राम रेग्मीलाई सम्पर्क गर्नुहोस्।"}
          </p>
          <button
            onClick={() => {
              playSynthSound("tap");
              clearAllFilters();
            }}
            className="mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-bold transition-all"
          >
            {lang === "en" ? "Reset Filters" : "फिल्टर रिसेट"}
          </button>
        </div>
      )}
    </div>
  );
}
