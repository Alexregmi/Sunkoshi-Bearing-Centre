import React from "react";
import { Heart, Trash2, FileText, Send, Clock, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { Product, QuotationRequest } from "../types";

interface WishlistQuoteViewProps {
  products: Product[];
  wishlist: string[];
  onRemoveFromWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onNavigateToTab: (t: string) => void;
  onAddQuotation: (quoteData: any) => Promise<boolean>;
  lang: "en" | "np";
}

export default function WishlistQuoteView({
  products,
  wishlist,
  onRemoveFromWishlist,
  onSelectProduct,
  onNavigateToTab,
  onAddQuotation,
  lang
}: WishlistQuoteViewProps) {
  const wishlistedItems = products.filter((p) => wishlist.includes(p.id));
  
  // Create quantities state mapping productId -> quantity
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [successQuote, setSuccessQuote] = React.useState<QuotationRequest | null>(null);

  // Initialize quantities to 1 when items change
  React.useEffect(() => {
    const updatedQuantities = { ...quantities };
    wishlistedItems.forEach((item) => {
      if (!updatedQuantities[item.id]) {
        updatedQuantities[item.id] = 1;
      }
    });
    setQuantities(updatedQuantities);
  }, [wishlist]);

  const handleQtyChange = (productId: string, val: number) => {
    if (val < 1) return;
    setQuantities((prev) => ({ ...prev, [productId]: val }));
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wishlistedItems.length === 0) return;
    if (!name || !phone) return;
    setLoading(true);

    const items = wishlistedItems.map((item) => ({
      productId: item.id,
      name: item.name,
      sku: item.sku,
      brand: item.brand,
      qtyRequested: quantities[item.id] || 1,
      estimatedPrice: item.price - (item.price * item.discount) / 100
    }));

    const quotePayload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      items,
      notes
    };

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotePayload)
      });
      const data = await response.json();
      if (response.ok && data.quotation) {
        setSuccessQuote(data.quotation);
        // Clear wishlist after quotation request
        wishlistedItems.forEach((item) => onRemoveFromWishlist(item));
        setName("");
        setPhone("");
        setEmail("");
        setNotes("");
      } else {
        throw new Error(data.error || "Failed to submit quotation");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatNRS = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0
    })
      .format(num)
      .replace("NPR", "Rs.");
  };

  // Calculate estimated summary total
  const estimatedTotal = wishlistedItems.reduce((acc, item) => {
    const qty = quantities[item.id] || 1;
    const finalPrice = item.price - (item.price * item.discount) / 100;
    return acc + finalPrice * qty;
  }, 0);

  // Render invoice layout on success
  if (successQuote) {
    return (
      <div className="flex flex-col gap-5 p-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center flex flex-col items-center gap-3 shadow-inner">
          <span className="text-4xl">📄</span>
          <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wide">
            {lang === "en" ? "Quotation Request Submitted!" : "कोटेसन दर्ता भयो!"}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-normal">
            {lang === "en"
              ? `Thank you, ${successQuote.customerName}! Your official quotation request #${successQuote.id} has been submitted to Sita Ram & Alex. We will review and send you a final WhatsApp quote shortly.`
              : `धन्यवाद, ${successQuote.customerName}! यहाँको कोटेसन अनुरोध #${successQuote.id} सफल्तापुर्वक दर्ता भएको छ। हामी छिट्टै ह्वाट्सएप मार्फत आधिकारिक मूल्य पठाउनेछौं।`}
          </p>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm font-sans flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Quotation Summary</span>
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-bold">
              #{successQuote.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">{lang === "en" ? "Contact Person" : "सम्पर्क व्यक्ति"}</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{successQuote.customerName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">{lang === "en" ? "Phone Number" : "फोन नम्बर"}</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{successQuote.customerPhone}</p>
            </div>
          </div>

          {/* Table Items */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mt-2">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-2 font-bold text-slate-500 uppercase">{lang === "en" ? "Item" : "सामान"}</th>
                  <th className="p-2 font-bold text-slate-500 uppercase text-center">{lang === "en" ? "Qty" : "मात्रा"}</th>
                  <th className="p-2 font-bold text-slate-500 uppercase text-right">{lang === "en" ? "Est. Subtotal" : "उपकुल"}</th>
                </tr>
              </thead>
              <tbody>
                {successQuote.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <td className="p-2 font-semibold">
                      <p className="text-slate-800 dark:text-slate-200 line-clamp-1">{it.name}</p>
                      <span className="text-[8px] text-slate-400 font-mono">{it.sku}</span>
                    </td>
                    <td className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">{it.qtyRequested}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatNRS(it.estimatedPrice * it.qtyRequested)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/50">
                  <td colSpan={2} className="p-2 text-right font-bold text-slate-500 uppercase">{lang === "en" ? "Est. Total" : "अनुमानित जम्मा"}</td>
                  <td className="p-2 text-right font-mono font-extrabold text-amber-500 text-xs">
                    {formatNRS(successQuote.estimatedTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setSuccessQuote(null)}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all text-center"
          >
            {lang === "en" ? "Create New Request" : "नयाँ अनुरोध सिर्जना गर्नुहोस्"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* View Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Heart className="h-4.5 w-4.5 text-red-500 fill-current" />
          {lang === "en" ? "My Custom Quotation Sheet" : "मेरो कोटेसन सीट"}
        </h3>
        <span className="text-[10px] font-bold text-slate-400">
          {wishlistedItems.length} {lang === "en" ? "items added" : "सामान थपिएका"}
        </span>
      </div>

      {wishlistedItems.length > 0 ? (
        <div className="flex flex-col gap-4">
          
          {/* Wishlisted item nodes */}
          <div className="flex flex-col gap-2.5">
            {wishlistedItems.map((item) => {
              const qty = quantities[item.id] || 1;
              const hasDiscount = item.discount > 0;
              const finalPrice = item.price - (item.price * item.discount) / 100;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-xs"
                >
                  {/* Photo thumbnail */}
                  <div
                    onClick={() => onSelectProduct(item)}
                    className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 cursor-pointer flex-shrink-0"
                  >
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Brand */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">
                      {item.brand}
                    </span>
                    <h5
                      onClick={() => onSelectProduct(item)}
                      className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:underline"
                    >
                      {item.name}
                    </h5>
                    <span className="text-[9px] font-mono text-slate-400">{item.sku}</span>
                  </div>

                  {/* Quantity selector & Prices */}
                  <div className="flex items-center gap-3">
                    {/* Quantity counter */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 p-0.5">
                      <button
                        onClick={() => handleQtyChange(item.id, qty - 1)}
                        className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200">{qty}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, qty + 1)}
                        className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* price details */}
                    <div className="text-right flex flex-col">
                      <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                        {formatNRS(finalPrice * qty)}
                      </span>
                      <span className="text-[8px] text-slate-400 block">
                        {formatNRS(finalPrice)} {lang === "en" ? "each" : "प्रति गोटा"}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onRemoveFromWishlist(item)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title={lang === "en" ? "Remove from sheet" : "सूचीबाट हटाउनुहोस्"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Total Card */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">{lang === "en" ? "Estimated Cost Total" : "अनुमानित कुल लागत"}</p>
              <p className="text-[9px] text-slate-400 italic font-sans leading-none mt-0.5">
                {lang === "en" ? "Final price confirmed on invoice" : "अन्तिम दर कोटेसन सिटमा तोकिनेछ"}
              </p>
            </div>
            <span className="text-base font-extrabold text-amber-500 font-mono">
              {formatNRS(estimatedTotal)}
            </span>
          </div>

          {/* Quote submission contact details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-4.5 w-4.5 text-amber-500" />
              {lang === "en" ? "Confirm Contact Details" : "सम्पर्क विवरण सुनिश्चित गर्नुहोस्"}
            </h4>

            <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "en" ? "Your Contact Full Name" : "सम्पर्क व्यक्तिको नाम"}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={lang === "en" ? "Active Mobile or WhatsApp No. (+977)" : "ह्वाट्सएप वा फोन नम्बर"}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === "en" ? "Email Address (Optional)" : "इमेल ठेगाना (ऐच्छिक)"}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={lang === "en" ? "Add notes (e.g., Deliver to Labipur, Itahari or need specific brand packs...)" : "थप विवरण (उदा. मलाई प्याकिङ बक्स सहित इटहरीमा डेलिभरी चाहिन्छ)"}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs h-16 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs uppercase tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Send className="h-4.5 w-4.5" />
                <span>{loading ? "Submitting Quotation..." : (lang === "en" ? "Submit Bid to Alex Regmi" : "कोटेसन अनुरोध पठाउनुहोस्")}</span>
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <span className="text-3xl">📋</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {lang === "en" ? "Quotation Sheet is Empty" : "कोटेसन सूची खाली छ"}
          </h4>
          <p className="text-xs text-slate-400 max-w-xs leading-normal">
            {lang === "en"
              ? "To request a fast, bulk price quotation for your tractor or vehicle, browse our catalog and click 'Quote' or the heart icon to add them here!"
              : "तपाईंको ट्रयाक्टर वा सवारी साधनको लागि कोटेसन मूल्य प्राप्त गर्न उत्पादन सूचीमा गएर सामानहरू थप्नुहोस्!"}
          </p>
          <button
            onClick={() => onNavigateToTab("catalog")}
            className="mt-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          >
            <span>{lang === "en" ? "Browse Catalog" : "क्याटलग हेर्नुहोस्"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
