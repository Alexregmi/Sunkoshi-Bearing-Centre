import React from "react";
import { Search, ChevronLeft, ChevronRight, Phone, MessageSquare, MapPin, Mail, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Product, Banner, AppSettings, Review, Brand } from "../types";
import { playSynthSound } from "../lib/sounds";

interface HomeViewProps {
  products: Product[];
  banners: Banner[];
  settings: AppSettings;
  reviews: Review[];
  categories: string[];
  brands: Brand[];
  lang: "en" | "np";
  onSelectProduct: (p: Product) => void;
  onNavigateToTab: (tab: string, searchFilter?: string, catFilter?: string) => void;
}

export default function HomeView({
  products,
  banners,
  settings,
  reviews,
  categories,
  brands,
  lang,
  onSelectProduct,
  onNavigateToTab
}: HomeViewProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Slide rotation
  React.useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNextSlide = () => {
    playSynthSound("tap");
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handlePrevSlide = () => {
    playSynthSound("tap");
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playSynthSound("search");
      onNavigateToTab("catalog", searchQuery.trim());
    }
  };

  // Filter products for sections
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSelling).slice(0, 4);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);

  // Helper to render rating stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-3 w-3 ${s <= rating ? "fill-amber-500" : "text-slate-300 dark:text-slate-700"}`}
          />
        ))}
      </div>
    );
  };

  // Nepalese Number Formatter
  const formatNRS = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0
    })
      .format(num)
      .replace("NPR", "Rs.");
  };

  // Get active stock color classes
  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: lang === "en" ? "Out of Stock" : "सकिएको", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    if (qty <= 10) return { label: lang === "en" ? "Low Stock" : "थोरै मात्र बाँकी", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { label: lang === "en" ? "In Stock" : "मौजदात छ", color: "bg-green-500/10 text-green-500 border-green-500/20" };
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-5 text-black shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] text-black/10 text-9xl font-bold select-none">
          ⚙️
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-wider text-black/60 font-bold font-display">
            {lang === "en" ? "Official Partner: FAG, Timken, TVS Girling" : "आधिकारिक पार्टनर: FAG, Timken, TVS Girling"}
          </p>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight leading-none mt-1.5">
            {settings.businessName.toUpperCase()}
          </h2>
          <p className="text-xs text-black/80 mt-2 font-medium">
            {lang === "en"
              ? "Premium industrial bearing solutions and genuine spare parts imported to Nepal."
              : "नेपालको उत्कृष्ट गुणस्तरीय बियरिङ र जेनुइन अटो पार्ट्स खरिद गर्ने आधिकारिक केन्द्र।"}
          </p>
        </div>
      </div>

      {/* 2. Image Slider */}
      {banners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[16/9] bg-slate-200 dark:bg-slate-800">
          <img
            src={banners[currentSlide].imageUrl}
            alt={banners[currentSlide].title}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/45 flex flex-col justify-end p-4">
            <h3 className="text-white font-display font-bold text-sm md:text-base leading-tight">
              {banners[currentSlide].title}
            </h3>
            <p className="text-slate-200 text-[10px] mt-0.5 leading-normal line-clamp-2">
              {banners[currentSlide].subtitle}
            </p>
            {banners[currentSlide].linkToCategory && (
              <button
                onClick={() => onNavigateToTab("catalog", "", banners[currentSlide].linkToCategory)}
                className="mt-2 text-white font-semibold text-[10px] flex items-center gap-1 hover:underline"
              >
                {lang === "en" ? "Explore Catalog" : "सामान हेर्नुहोस्"}
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Left/Right Slider Controls */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  playSynthSound("tap");
                  setCurrentSlide(i);
                }}
                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                  currentSlide === i ? "bg-amber-500 scale-125" : "bg-white/50"
                }`}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === "en" ? "Search bearings, tractor models, brands..." : "बियरिङ, ट्रयाक्टर मोडेल, ब्रान्ड खोज्नुहोस्..."}
          className="w-full py-2.5 pl-4 pr-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-amber-500"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* 4. Product Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight uppercase">
            {lang === "en" ? "Product Categories" : "उत्पादन कोटिहरू"}
          </h4>
          <button
            onClick={() => {
              playSynthSound("tap");
              onNavigateToTab("catalog");
            }}
            className="text-[10px] font-bold text-amber-500 hover:underline"
          >
            {lang === "en" ? "View All" : "सबै हेर्नुहोस्"}
          </button>
        </div>

        {/* Categories scroll area */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  playSynthSound("tap");
                  onNavigateToTab("catalog", "", cat);
                }}
                className="flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 flex flex-col items-center gap-1 shadow-xs hover:border-amber-500 hover:scale-105 transition-all"
              >
                <span className="text-xl">
                  {cat === "Bearings" ? "🔘" : cat === "Tractor Parts" ? "🚜" : cat === "Lubricants" ? "🛢️" : cat === "Grease" ? "🧈" : cat === "Oil Seals" ? "⭕" : "⚙️"}
                </span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  {cat}
                </span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500">
                  {count} {lang === "en" ? "items" : "सामान"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Highlight Section: Featured Products */}
      {featuredProducts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight uppercase">
              ✨ {lang === "en" ? "Featured Products" : "विशेष उत्पादनहरू"}
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => {
              const stock = getStockStatus(p.availableQty);
              const hasDiscount = p.discount > 0;
              const discountedPrice = p.price - (p.price * p.discount) / 100;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    playSynthSound("tap");
                    onSelectProduct(p);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden p-2 flex flex-col gap-1.5 shadow-sm hover:border-amber-500 transition-all cursor-pointer relative"
                >
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">
                      {p.discount}% OFF
                    </span>
                  )}
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 justify-between">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                        {p.brand}
                      </span>
                      <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {p.name}
                      </h5>
                    </div>

                    <div className="mt-1">
                      {/* Live Stock Indicator */}
                      <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-md border ${stock.color} mb-1`}>
                        {stock.label}
                      </span>

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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Brands Scrolling Banner */}
      <div>
        <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight uppercase mb-2.5">
          🏢 {lang === "en" ? "Popular Brands" : "लोकप्रिय ब्रान्डहरू"}
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                playSynthSound("tap");
                onNavigateToTab("catalog", b.name);
              }}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-amber-500 rounded-xl text-[10px] font-bold text-slate-800 dark:text-slate-200 flex-shrink-0 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
            >
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  className="h-4 w-4 object-contain rounded-md bg-slate-50 dark:bg-slate-950 p-0.5"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="w-4 h-4 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-[8px]">
                  {b.name.substring(0, 2).toUpperCase()}
                </span>
              )}
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Highlight Section: Best Selling Spares */}
      {bestSellers.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight uppercase">
              🔥 {lang === "en" ? "Best Selling Products" : "धेरै बिक्री हुने सामानहरू"}
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((p) => {
              const stock = getStockStatus(p.availableQty);
              const hasDiscount = p.discount > 0;
              const discountedPrice = p.price - (p.price * p.discount) / 100;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    playSynthSound("tap");
                    onSelectProduct(p);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden p-2 flex flex-col gap-1.5 shadow-sm hover:border-amber-500 transition-all cursor-pointer relative"
                >
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">
                      {p.discount}% OFF
                    </span>
                  )}
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 justify-between">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                        {p.brand}
                      </span>
                      <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {p.name}
                      </h5>
                    </div>

                    <div className="mt-1">
                      {/* Live Stock Indicator */}
                      <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-md border ${stock.color} mb-1`}>
                        {stock.label}
                      </span>

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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. Verified Customer Reviews */}
      <div>
        <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight uppercase mb-3">
          ⭐ {lang === "en" ? "Customer Reviews" : "ग्राहकका प्रतिक्रियाहरू"}
        </h4>
        <div className="flex flex-col gap-3">
          {reviews.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-xl p-3 shadow-xs flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-[10px] font-bold text-slate-800 dark:text-slate-100">
                    {r.customerName}
                  </h6>
                  <span className="text-[8px] text-slate-400">
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                </div>
                {renderStars(r.rating)}
              </div>

              {r.isVerified && (
                <span className="inline-flex items-center gap-1 text-[8px] text-amber-500 font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  {lang === "en" ? "Verified Purchase" : "प्रमाणित खरिदकर्ता"}
                </span>
              )}

              <p className="text-[10px] text-slate-600 dark:text-slate-300 italic leading-normal">
                "{r.comment}"
              </p>

              {r.reply && (
                <div className="bg-amber-500/5 dark:bg-amber-500/5 border-l-2 border-amber-500 p-2 rounded-r-lg mt-1 text-[9px]">
                  <div className="flex justify-between items-center text-amber-600 dark:text-amber-500 font-bold mb-0.5">
                    <span>{lang === "en" ? "Official Response" : "सञ्चालकको उत्तर"}</span>
                    <span className="text-[7px] text-slate-400 font-normal">
                      {new Date(r.replyDate || "").toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic font-medium">"{r.reply}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 9. Contact Info & Directions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight uppercase">
          📍 {lang === "en" ? "Find Our Store" : "हाम्रो ठेगाना"}
        </h4>

        <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{settings.address}</p>
              <p className="text-[10px] text-slate-400">Labipur, Highway Road, Itahari, Nepal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="font-semibold">{settings.phone}</p>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-[11px]">{settings.adminEmail}</p>
          </div>
        </div>

        {/* Embedded Google Map */}
        {settings.mapEmbedUrl && (
          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/9] bg-slate-100 dark:bg-slate-800 mt-1">
            <iframe
              src={settings.mapEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer"
              title="Google Maps Location"
            ></iframe>
          </div>
        )}

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <a
            href={`tel:${settings.phone}`}
            onClick={() => playSynthSound("tap")}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-3 rounded-lg text-[10px] tracking-wide uppercase transition-all shadow-xs"
          >
            <Phone className="h-3 w-3" />
            {lang === "en" ? "Call Sita Ram" : "फोन गर्नुहोस्"}
          </a>

          <a
            href={`https://wa.me/${settings.whatsappPhone.replace(/[^0-9]/g, "")}`}
            onClick={() => playSynthSound("tap")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold py-2 px-3 rounded-lg text-[10px] tracking-wide uppercase transition-all shadow-xs"
          >
            <MessageSquare className="h-3 w-3 text-amber-500" />
            {lang === "en" ? "WhatsApp Chat" : "व्हाट्सएप च्याट"}
          </a>
        </div>
      </div>

    </div>
  );
}
