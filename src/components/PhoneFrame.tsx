import React from "react";
import { Smartphone, Monitor, ShieldCheck, HelpCircle, PhoneCall, Languages, Moon, Sun, Heart, Settings, ShoppingBag, Menu, X, LogOut, MapPin, User, Phone } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  lang: "en" | "np";
  setLang: (l: "en" | "np") => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  wishlistCount: number;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export default function PhoneFrame({
  children,
  theme,
  setTheme,
  lang,
  setLang,
  activeTab,
  setActiveTab,
  wishlistCount,
  isAdminLoggedIn,
  onAdminLogout
}: PhoneFrameProps) {
  const [deviceOS, setDeviceOS] = React.useState<"ios" | "android">("ios");
  const [currentTime, setCurrentTime] = React.useState("10:00 AM");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 md:py-6 md:px-4 flex flex-col items-center justify-center font-sans transition-colors duration-300">
      {/* Top Application Header for desktop layout - Hidden on Mobile */}
      <div className="hidden md:flex w-full max-w-4xl mb-6 flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
              <Settings className="w-5 h-5" />
            </div>
            <span>Sunkoshi <span className="text-amber-500">Bearing Centre</span></span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-1">
            Labipur, Itahari, Nepal • Sita Ram Regmi (+977 9842176142)
          </p>
        </div>

        {/* Outer Frame Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* OS Switcher */}
          <div className="bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm flex border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setDeviceOS("ios")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                deviceOS === "ios"
                  ? "bg-slate-900 text-white dark:bg-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setDeviceOS("android")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                deviceOS === "android"
                  ? "bg-slate-900 text-white dark:bg-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Android
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm text-slate-700 dark:text-slate-300 transition-all"
            title="Toggle App Theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "np" : "en")}
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <Languages className="h-3.5 w-3.5 text-amber-500" />
            {lang === "en" ? "नेपाली" : "English"}
          </button>

          {/* Super Admin status badge */}
          {isAdminLoggedIn && (
            <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-full text-xs font-semibold text-red-700 dark:text-red-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Super Admin Active</span>
              <button onClick={onAdminLogout} className="underline ml-1 hover:text-red-900">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Smartphone Mockup Container */}
      <div className={`relative w-full md:max-w-[420px] h-screen md:h-[860px] transition-all duration-300 ${theme === "dark" ? "dark" : ""}`}>
        {/* Device Outer Frame - Adaptive styling for mobile/desktop */}
        <div className="relative mx-auto w-full h-full bg-slate-950 md:rounded-[55px] md:p-3.5 md:shadow-2xl md:border-[5px] md:border-slate-800 md:dark:border-slate-900 flex flex-col overflow-hidden">
          {/* iOS Dynamic Island or Android Camera Notch - Hidden on mobile screens */}
          {deviceOS === "ios" ? (
            <div className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 items-center justify-between px-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
              <div className="w-10 h-1.5 rounded-full bg-slate-950"></div>
              <div className="w-3 h-3 rounded-full border border-slate-900 bg-slate-950 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-900"></div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 border-2 border-slate-800 items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950"></div>
            </div>
          )}

          {/* Left/Right Button Elements (purely aesthetic - hidden on mobile) */}
          <div className="hidden md:block absolute left-[-11px] top-28 w-1.5 h-12 bg-slate-800 rounded-r-sm"></div>
          <div className="hidden md:block absolute left-[-11px] top-44 w-1.5 h-14 bg-slate-800 rounded-r-sm"></div>
          <div className="hidden md:block absolute left-[-11px] top-60 w-1.5 h-14 bg-slate-800 rounded-r-sm"></div>
          <div className="hidden md:block absolute right-[-11px] top-36 w-1.5 h-20 bg-slate-800 rounded-l-sm"></div>

          {/* Phone Screen Canvas */}
          <div className="w-full h-full bg-white dark:bg-slate-900 md:rounded-[44px] flex flex-col relative overflow-hidden select-none md:border md:border-slate-200/50 md:dark:border-slate-800/50">
            
            {/* Status Bar - Hidden on mobile screens */}
            <div className="hidden md:flex h-10 px-6 pt-1 items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-100 z-40 bg-white dark:bg-slate-900 transition-colors">
              <div>{currentTime}</div>
              <div className="flex items-center gap-1.5">
                {/* Simulated Signal Bars */}
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="w-0.5 h-1 bg-current rounded-xs"></div>
                  <div className="w-0.5 h-1.5 bg-current rounded-xs"></div>
                  <div className="w-0.5 h-2 bg-current rounded-xs"></div>
                  <div className="w-0.5 h-2.5 bg-current rounded-xs"></div>
                </div>
                <span>5G</span>
                {/* Simulated Battery */}
                <div className="w-5.5 h-3 border border-current rounded-xs p-0.5 flex items-center">
                  <div className="w-full h-full bg-current rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* Slide-out Side Drawer menu */}
            {isDrawerOpen && (
              <div className="absolute inset-0 z-50 flex">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
                  onClick={() => setIsDrawerOpen(false)}
                />
                
                {/* Drawer Content */}
                <div className="relative w-4/5 max-w-[280px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-amber-500 text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-black font-bold text-xs shadow-xs">
                        ⚙️
                      </div>
                      <span className="font-extrabold text-xs tracking-tight uppercase">Sunkoshi Menu</span>
                    </div>
                    <button 
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1 rounded-full hover:bg-black/10 text-black transition-all"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  
                  {/* Drawer Body - Navigation & Options */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                    
                    {/* Navigation Section */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        {lang === "en" ? "Navigation" : "नेभिगेसन"}
                      </h3>
                      {[
                        { id: "home", label: lang === "en" ? "Home" : "गृहपृष्ठ", icon: Monitor },
                        { id: "catalog", label: lang === "en" ? "Products & Inventory" : "सामान सूची", icon: ShoppingBag },
                        { id: "ai-chat", label: lang === "en" ? "Sunkoshi AI Helper" : "सङ्कोशी एआई", icon: HelpCircle },
                        { id: "wishlist", label: lang === "en" ? "Wishlist & Quotation" : "इच्छा सूची", icon: Heart },
                        { id: "admin", label: lang === "en" ? "Super Admin Portal" : "प्रबन्धक पोर्टल", icon: Settings },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsDrawerOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                              activeTab === item.id
                                ? "bg-amber-500 text-black shadow-xs shadow-amber-500/10"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Settings & Device controls */}
                    <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-4">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        {lang === "en" ? "App Controls" : "एप सेटिङहरू"}
                      </h3>
                      
                      {/* OS Switcher */}
                      <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          {lang === "en" ? "Simulated OS Layout" : "सिमुलेटेड ओएस"}
                        </span>
                        <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
                          <button
                            onClick={() => setDeviceOS("ios")}
                            className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                              deviceOS === "ios"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            iOS
                          </button>
                          <button
                            onClick={() => setDeviceOS("android")}
                            className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                              deviceOS === "android"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            }`}
                          >
                            Android
                          </button>
                        </div>
                      </div>

                      {/* Theme switcher */}
                      <button
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                      >
                        <span className="flex items-center gap-3">
                          {theme === "light" ? <Moon className="h-4 w-4 text-amber-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
                          <span>{theme === "light" ? (lang === "en" ? "Dark Mode" : "डार्क मोड") : (lang === "en" ? "Light Mode" : "लाइट मोड")}</span>
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-normal">
                          {theme.toUpperCase()}
                        </span>
                      </button>
                    </div>

                    {/* Admin section & Logout button */}
                    {isAdminLoggedIn && (
                      <div className="flex flex-col gap-2 border-t border-red-100 dark:border-red-950/40 pt-4 mt-auto">
                        <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-xl text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-red-500" />
                          <span>Super Admin</span>
                        </div>
                        <button
                          onClick={() => {
                            onAdminLogout();
                            setIsDrawerOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/10"
                        >
                          <LogOut className="h-4 w-4 flex-shrink-0" />
                          <span>{lang === "en" ? "Logout Admin" : "लगआउट गर्नुहोस्"}</span>
                        </button>
                      </div>
                    )}
                    
                  </div>
                  
                  {/* Drawer Footer */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-center text-[9px] text-slate-400 font-medium">
                    Sunkoshi Bearing Centre v2.5
                  </div>
                </div>
              </div>
            )}

            {/* Compact Header - Fully Mobile-First, Highly Responsive, Stacked Layout */}
            <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 p-3 flex flex-col gap-2.5 z-40 flex-shrink-0 select-none">
              
              {/* Row 1: ☰ Menu & Title */}
              <div className="flex items-center justify-between w-full">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-extrabold transition-all text-[11px] uppercase tracking-wide"
                >
                  <Menu className="h-3.5 w-3.5 text-amber-500" />
                  <span>{lang === "en" ? "Menu" : "मेनु"}</span>
                </button>
                
                <div className="flex items-center gap-1.5">
                  <div className="w-5.5 h-5.5 bg-amber-500 rounded flex items-center justify-center text-black font-black text-[9px]">
                    ⚙️
                  </div>
                  <span className="font-extrabold text-[11px] tracking-tight text-slate-900 dark:text-white uppercase">
                    Sunkoshi <span className="text-amber-500">Bearing Centre</span>
                  </span>
                </div>
              </div>

              {/* Row 2: Location, Contact & Phone */}
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-1.5 w-full text-[9px] text-slate-600 dark:text-slate-400 font-bold border-t border-slate-50 dark:border-slate-800/40 pt-2">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">📍 Labipur, Itahari, Nepal</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <User className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">👤 Sita Ram Regmi</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Phone className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  <a href="tel:+9779842176142" className="hover:text-amber-500 truncate">📞 +977 9842176142</a>
                </div>
              </div>

              {/* Row 3: Language */}
              <div className="flex items-center justify-between w-full border-t border-slate-50 dark:border-slate-800/40 pt-2">
                <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">
                  <Languages className="h-3 w-3 text-amber-500" />
                  <span>Language / भाषा</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLang("en")}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider transition-all ${
                      lang === "en" 
                        ? "bg-amber-500 text-black shadow-xs" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang("np")}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider transition-all ${
                      lang === "np" 
                        ? "bg-amber-500 text-black shadow-xs" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              {/* Row 4: Super Admin Active (only if logged in!) */}
              {isAdminLoggedIn && (
                <div className="w-full border-t border-slate-50 dark:border-slate-800/40 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>🟢 Super Admin Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Main Embedded App Views Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-16 bg-slate-50 dark:bg-slate-950 relative">
              {children}
            </div>

            {/* Smartphone Bottom Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-around px-2 z-40">
              <button
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "home"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-[10px]">{lang === "en" ? "Home" : "गृहपृष्ठ"}</span>
              </button>

              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "catalog"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-[10px]">{lang === "en" ? "Products" : "सामानहरू"}</span>
              </button>

              <button
                onClick={() => setActiveTab("ai-chat")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "ai-chat"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <HelpCircle className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                </div>
                <span className="text-[10px]">{lang === "en" ? "Sunkoshi AI" : "एआई च्याट"}</span>
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "wishlist"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{lang === "en" ? "Wishlist" : "इच्छा सूची"}</span>
              </button>

              <button
                onClick={() => setActiveTab("admin")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "admin"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="text-[10px]">{lang === "en" ? "Admin" : "प्रबन्धक"}</span>
              </button>
            </div>

            {/* Safe Area Notch Line on iOS - Hidden on mobile screen views */}
            {deviceOS === "ios" && (
              <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full z-50"></div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 no-print hidden md:block">
        Demo tip: Sunkoshi Bearing Centre Super Admin Email is <strong className="text-amber-500">tikaregmi551@gmail.com</strong>
      </div>
    </div>
  );
}
