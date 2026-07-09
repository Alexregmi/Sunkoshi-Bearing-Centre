import React from "react";
import { Smartphone, Monitor, ShieldCheck, HelpCircle, PhoneCall, Languages, Moon, Sun, Heart, Settings, ShoppingBag, Menu, X, LogOut, MapPin, User, Phone, Volume2, VolumeX, Bell, BellOff, Info, Globe } from "lucide-react";
import { playSynthSound } from "../lib/sounds";

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
  const [viewMode, setViewMode] = React.useState<"phone" | "tablet" | "fluid">("fluid");
  const [currentTime, setCurrentTime] = React.useState("10:00 AM");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Sounds & Notification Setting States (Persisted locally on device)
  const [soundsEnabled, setSoundsEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("sound_enabled") !== "false";
  });
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("notifications_enabled") !== "false";
  });
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const toggleSounds = () => {
    const nextVal = !soundsEnabled;
    setSoundsEnabled(nextVal);
    localStorage.setItem("sound_enabled", String(nextVal));
    if (nextVal) {
      setTimeout(() => playSynthSound("success"), 50);
    }
  };

  const toggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    localStorage.setItem("notifications_enabled", String(nextVal));
    if (nextVal) {
      setTimeout(() => playSynthSound("notification"), 50);
    } else {
      setTimeout(() => playSynthSound("tap"), 50);
    }
  };

  const handleNavClick = (tabId: string) => {
    playSynthSound("tap");
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

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
          {/* Device Layout Switcher */}
          <div className="bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm flex border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { playSynthSound("tap"); setViewMode("phone"); }}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                viewMode === "phone"
                  ? "bg-amber-500 text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Switch to Phone layout mockup"
            >
              <span>📱 Phone</span>
            </button>
            <button
              onClick={() => { playSynthSound("tap"); setViewMode("tablet"); }}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                viewMode === "tablet"
                  ? "bg-amber-500 text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Switch to Tablet/iPad layout mockup"
            >
              <span>💻 Tablet</span>
            </button>
            <button
              onClick={() => { playSynthSound("tap"); setViewMode("fluid"); }}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                viewMode === "fluid"
                  ? "bg-amber-500 text-black shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Auto Fluid Responsive layout"
            >
              <span>🖥️ Full-Width</span>
            </button>
          </div>

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

      {/* Main Interactive Device Mockup Container */}
      <div className={`relative transition-all duration-500 ease-in-out ${theme === "dark" ? "dark" : ""} ${
        viewMode === "phone"
          ? "w-full md:max-w-[420px] h-screen md:h-[860px]"
          : viewMode === "tablet"
            ? "w-full md:max-w-[820px] h-screen md:h-[1024px] md:max-h-[92vh] md:my-auto"
            : "w-full max-w-full md:max-w-[1240px] h-screen md:h-[94vh]"
      }`}>
        {/* Device Outer Frame - Adaptive styling for mobile/desktop */}
        <div className={`relative mx-auto w-full h-full bg-slate-950 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
          viewMode === "phone"
            ? "md:rounded-[55px] md:p-3.5 md:shadow-2xl md:border-[5px] md:border-slate-800 md:dark:border-slate-900"
            : viewMode === "tablet"
              ? "md:rounded-[40px] md:p-4.5 md:shadow-2xl md:border-[10px] md:border-slate-800 md:dark:border-slate-900"
              : "md:rounded-3xl md:p-1.5 md:shadow-xl md:border-[3px] md:border-slate-800/40 md:dark:border-slate-900/40"
        }`}>
          {/* iOS Dynamic Island or Android Camera Notch - Hidden on mobile screens */}
          {viewMode === "phone" ? (
            deviceOS === "ios" ? (
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
            )
          ) : viewMode === "tablet" ? (
            <div className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 border border-slate-800 items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-950"></div>
            </div>
          ) : null}

          {/* Left/Right Button Elements (purely aesthetic - hidden on mobile) */}
          {viewMode === "phone" && (
            <>
              <div className="hidden md:block absolute left-[-11px] top-28 w-1.5 h-12 bg-slate-800 rounded-r-sm"></div>
              <div className="hidden md:block absolute left-[-11px] top-44 w-1.5 h-14 bg-slate-800 rounded-r-sm"></div>
              <div className="hidden md:block absolute left-[-11px] top-60 w-1.5 h-14 bg-slate-800 rounded-r-sm"></div>
              <div className="hidden md:block absolute right-[-11px] top-36 w-1.5 h-20 bg-slate-800 rounded-l-sm"></div>
            </>
          )}

          {/* Device Screen Canvas */}
          <div className={`w-full h-full bg-white dark:bg-slate-900 flex flex-col relative overflow-hidden select-none md:border md:border-slate-200/50 md:dark:border-slate-800/50 transition-all duration-500 ease-in-out ${
            viewMode === "phone"
              ? "md:rounded-[44px]"
              : viewMode === "tablet"
                ? "md:rounded-[28px]"
                : "md:rounded-2xl"
          }`}>
            
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
                        { id: "admin", label: lang === "en" ? "Super Admin Portal" : "प्रबन्धक पोर्टल", icon: ShieldCheck },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
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
                      
                      {/* Comprehensive Settings Modal trigger */}
                      <button
                        onClick={() => {
                          playSynthSound("tap");
                          setIsSettingsOpen(true);
                          setIsDrawerOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 rounded-xl text-xs font-extrabold transition-all uppercase text-left"
                      >
                        <span className="flex items-center gap-3">
                          <Settings className="h-4 w-4 text-amber-500" />
                          <span>{lang === "en" ? "⚙️ App Settings" : "⚙️ एप सेटिङ"}</span>
                        </span>
                        <span>➔</span>
                      </button>

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
                  onClick={() => {
                    playSynthSound("tap");
                    setIsDrawerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-extrabold transition-all text-[11px] uppercase tracking-wide"
                >
                  <Menu className="h-3.5 w-3.5 text-amber-500" />
                  <span>{lang === "en" ? "Menu" : "मेनु"}</span>
                </button>
                
                <button 
                  onClick={() => {
                    playSynthSound("tap");
                    setIsSettingsOpen(true);
                  }}
                  className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all uppercase tracking-wide"
                >
                  ⚙️
                  <span>{lang === "en" ? "Settings" : "सेटिङ"}</span>
                </button>
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
                  <a href="tel:+9779842176142" onClick={() => playSynthSound("tap")} className="hover:text-amber-500 truncate">📞 +977 9842176142</a>
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
                    onClick={() => {
                      playSynthSound("tap");
                      setLang("en");
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider transition-all ${
                      lang === "en" 
                        ? "bg-amber-500 text-black shadow-xs" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      playSynthSound("tap");
                      setLang("np");
                    }}
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

              {/* Comprehensive general Settings Overlay Modal */}
              {isSettingsOpen && (
                <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300 select-none">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-500 text-black flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚙️</span>
                      <span className="font-extrabold text-xs tracking-tight uppercase">
                        {lang === "en" ? "App Settings & Info" : "एप सेटिङ र विवरण"}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        playSynthSound("tap");
                        setIsSettingsOpen(false);
                      }}
                      className="px-3 py-1 bg-black/10 hover:bg-black/20 rounded-lg text-black font-extrabold text-[10px] uppercase transition-all"
                    >
                      {lang === "en" ? "✕ Close" : "✕ बन्द"}
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-slate-800 dark:text-slate-100">
                    
                    {/* Guest mode banner */}
                    <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-1.5 shadow-xs">
                      <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <span>🏠 Guest Mode Enabled</span>
                      </h4>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-normal">
                        {lang === "en" 
                          ? "You are logged in as a Guest. No login or registration is required to check prices, live stock, or contact shop! Save your favorites locally on your device." 
                          : "तपाईं गेस्टको रूपमा प्रवेश गर्नुभएको छ। सामानहरू हेर्न, मूल्य विवरण बुझ्न वा कुराकानी गर्न कुनै अकाउन्ट चाहिँदैन! आफ्नो मनपर्ने सामान सेभ गर्नुहोस्।"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 text-[8px] font-bold uppercase tracking-wider text-amber-500">
                        <span>✓ No Login Required</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>✓ Local Favorites Saved</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>✓ Real-time Inventory</span>
                      </div>
                    </div>

                    {/* Settings section */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {lang === "en" ? "Interactions & Audio" : "अन्तरक्रिया र अडियो"}
                      </h3>

                      {/* Audio Synthesizer toggle */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            {soundsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold uppercase">
                              {lang === "en" ? "Sound Effects 🔊" : "अडियो प्रभावहरू 🔊"}
                            </p>
                            <p className="text-[8px] text-slate-400 leading-normal">
                              {lang === "en" ? "Synthesized click, cart, success & search tones" : "बटन थिच्दा, सेभ गर्दा बज्ने स्वरहरू"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={toggleSounds}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                            soundsEnabled
                              ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {soundsEnabled ? (lang === "en" ? "ON" : "अन") : (lang === "en" ? "OFF" : "अफ")}
                        </button>
                      </div>

                      {/* Notifications toggle */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold uppercase">
                              {lang === "en" ? "App Notifications 🔔" : "एप नोटिफिकेसन 🔔"}
                            </p>
                            <p className="text-[8px] text-slate-400 leading-normal">
                              {lang === "en" ? "Get stock updates and low inventory notifications" : "स्टक र नयाँ अफरहरू सम्बन्धी जानकारीहरू"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={toggleNotifications}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                            notificationsEnabled
                              ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {notificationsEnabled ? (lang === "en" ? "ON" : "अन") : (lang === "en" ? "OFF" : "अफ")}
                        </button>
                      </div>

                      {/* Quick Language Toggle inside modal */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold uppercase">
                              {lang === "en" ? "Language Selection 🌐" : "भाषा चयन गर्नुहोस् 🌐"}
                            </p>
                            <p className="text-[8px] text-slate-400 leading-normal">
                              {lang === "en" ? "Switch language to English or नेपाली" : "अंग्रेजी वा नेपाली भाषा छनौट गर्नुहोस्"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              playSynthSound("tap");
                              setLang("en");
                            }}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-md ${
                              lang === "en" ? "bg-amber-500 text-black font-extrabold" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
                            }`}
                          >
                            EN
                          </button>
                          <button
                            onClick={() => {
                              playSynthSound("tap");
                              setLang("np");
                            }}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-md ${
                              lang === "np" ? "bg-amber-500 text-black font-extrabold" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
                            }`}
                          >
                            नेपाली
                          </button>
                        </div>
                      </div>

                      {/* Theme selector inside settings modal */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold uppercase">
                              {lang === "en" ? "Theme Appearance 🌙" : "रंग र थिम 🌙"}
                            </p>
                            <p className="text-[8px] text-slate-400 leading-normal">
                              {lang === "en" ? "Toggle between beautiful light and dark modes" : "लाइट मोड वा डार्क मोड रोज्नुहोस्"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            playSynthSound("tap");
                            setTheme(theme === "light" ? "dark" : "light");
                          }}
                          className="px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {theme === "light" ? (lang === "en" ? "Light Mode" : "लाइट") : (lang === "en" ? "Dark Mode" : "डार्क")}
                        </button>
                      </div>

                    </div>

                    {/* About the App section */}
                    <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-amber-500" />
                        <span>{lang === "en" ? "About Sunkoshi Bearing Centre" : "सुनकोशी बियरिङ सेन्टरको बारेमा"}</span>
                      </h3>

                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850/60 text-[10px] text-slate-500 dark:text-slate-400 flex flex-col gap-2 leading-relaxed">
                        <p>
                          {lang === "en"
                            ? "Sunkoshi Bearing Centre is the premier industrial and automotive bearing supplier in Itahari, Nepal. We supply authorized partner products from top international brands such as FAG, Timken, TVS Girling, and NRB."
                            : "सुनकोशी बियरिङ सेन्टर इटहरी, नेपालमा बियरिङ र अटो पार्ट्सको विश्वसनीय केन्द्र हो। हामी FAG, Timken, TVS Girling र NRB जस्ता ख्यातीप्राप्त विश्वस्तरीय ब्रान्डका सक्कली सामानहरू मात्र बिक्री गर्दछौं।"}
                        </p>
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="text-slate-400 block text-[8px] font-semibold">{lang === "en" ? "Owner / Proprietor" : "सञ्चालक"}</span>
                            <span>Sita Ram Regmi</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] font-semibold">{lang === "en" ? "App Version" : "एप संस्करण"}</span>
                            <span>v2.5 (Stable Release)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Sunkoshi Bearing Centre section */}
                    <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <PhoneCall className="h-3.5 w-3.5 text-amber-500" />
                        <span>{lang === "en" ? "Direct Store Contact 📞" : "पसल सम्पर्क र ठेगाना 📞"}</span>
                      </h3>

                      <div className="flex flex-col gap-2 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/15 rounded-2xl p-3.5">
                        <div className="flex items-start gap-2.5 text-[10px] leading-tight">
                          <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">Labipur, Itahari, Nepal</p>
                            <p className="text-[9px] text-slate-400">Main Highway Road, Sunsari District</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-[10px] mt-1">
                          <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">+977 9842176142</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                          <a
                            href="tel:+9779842176142"
                            onClick={() => playSynthSound("tap")}
                            className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-black text-[9px] font-bold rounded-lg text-center uppercase shadow-xs flex items-center justify-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{lang === "en" ? "Call Store" : "कल गर्नुहोस्"}</span>
                          </a>

                          <a
                            href="https://wa.me/9779842176142"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSynthSound("tap")}
                            className="py-1.5 px-3 bg-slate-900 dark:bg-slate-950 text-slate-200 text-[9px] font-bold rounded-lg text-center uppercase border border-slate-800 shadow-xs flex items-center justify-center gap-1 hover:bg-black"
                          >
                            <span>💬 WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-[9px] text-slate-400 font-medium flex-shrink-0">
                    © 2026 Sunkoshi Bearing Centre • Guest Mode 😊
                  </div>
                </div>
              )}
            </div>

            {/* Smartphone Bottom Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-around px-2 z-40">
              <button
                onClick={() => handleNavClick("home")}
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
                onClick={() => handleNavClick("catalog")}
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
                onClick={() => handleNavClick("ai-chat")}
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
                onClick={() => handleNavClick("wishlist")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "wishlist"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{lang === "en" ? "Wishlist" : "इच्छा सूची"}</span>
              </button>

              <button
                onClick={() => handleNavClick("admin")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "admin"
                    ? "text-amber-500 scale-105 font-medium"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
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
