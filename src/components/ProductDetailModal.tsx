import React from "react";
import { X, Heart, ShieldCheck, PhoneCall, Star, Clock, AlertTriangle, FileText, Send, Image, MessageSquare, Scale, QrCode, Download, Copy, Check } from "lucide-react";
import { Product, Review, Enquiry } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  reviews: Review[];
  wishlist: string[];
  compareList: string[];
  onClose: () => void;
  onToggleWishlist: (p: Product) => void;
  onToggleCompare: (p: Product) => void;
  onAddReview: (reviewData: any) => Promise<boolean>;
  onAddEnquiry: (enquiryData: any) => Promise<boolean>;
  lang: "en" | "np";
}

export default function ProductDetailModal({
  product,
  reviews,
  wishlist,
  compareList,
  onClose,
  onToggleWishlist,
  onToggleCompare,
  onAddReview,
  onAddEnquiry,
  lang
}: ProductDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const productUrl = `${window.location.origin}?product=${product?.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(productUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product?.sku || "product"}-QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code image", err);
      window.open(qrCodeUrl, "_blank");
    }
  };
  const [showEnquiryForm, setShowEnquiryForm] = React.useState(false);
  const [showReviewForm, setShowReviewForm] = React.useState(false);

  // Enquiry Form State
  const [enqName, setEnqName] = React.useState("");
  const [enqPhone, setEnqPhone] = React.useState("");
  const [enqMessage, setEnqMessage] = React.useState("");
  const [enqLoading, setEnqLoading] = React.useState(false);
  const [enqSuccess, setEnqSuccess] = React.useState(false);

  // Review Form State
  const [revName, setRevName] = React.useState("");
  const [revRating, setRevRating] = React.useState(5);
  const [revComment, setRevComment] = React.useState("");
  const [revPhoto, setRevPhoto] = React.useState("");
  const [revVerified, setRevVerified] = React.useState(true);
  const [revLoading, setRevLoading] = React.useState(false);
  const [revSuccess, setRevSuccess] = React.useState(false);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const isComparing = compareList.includes(product.id);

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const avgRating = productReviews.length
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : "0.0";

  const hasDiscount = product.discount > 0;
  const discountedPrice = product.price - (product.price * product.discount) / 100;

  // Formatting helpers
  const formatNRS = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0
    })
      .format(num)
      .replace("NPR", "Rs.");
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) {
      return {
        label: lang === "en" ? "Out of Stock ❌" : "सकिएको छ ❌",
        style: "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/20",
        indicatorColor: "bg-red-500"
      };
    }
    if (qty <= 10) {
      return {
        label: lang === "en" ? `Low Stock ⚠️ (${qty} items)` : `थोरै मात्र बाँकी ⚠️ (${qty} थान)`,
        style: "bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400 border-orange-200 dark:border-orange-900/20",
        indicatorColor: "bg-orange-500"
      };
    }
    return {
      label: lang === "en" ? `In Stock ✅ (${qty} items)` : `मौजदात उपलब्ध छ ✅ (${qty} थान)`,
      style: "bg-green-500/10 text-green-500 border-green-500/20",
      indicatorColor: "bg-green-500"
    };
  };

  const stockInfo = getStockStatus(product.availableQty);

  // Handle Photo upload change
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRevPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Enquiry
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqName || !enqPhone || !enqMessage) return;
    setEnqLoading(true);

    const success = await onAddEnquiry({
      name: enqName,
      phone: enqPhone,
      productName: product.name,
      message: enqMessage
    });

    setEnqLoading(false);
    if (success) {
      setEnqSuccess(true);
      setEnqName("");
      setEnqPhone("");
      setEnqMessage("");
      setTimeout(() => setEnqSuccess(false), 4000);
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revComment) return;
    setRevLoading(true);

    const success = await onAddReview({
      productId: product.id,
      customerName: revName,
      rating: revRating,
      comment: revComment,
      isVerified: revVerified,
      photoUrl: revPhoto
    });

    setRevLoading(false);
    if (success) {
      setRevSuccess(true);
      setRevName("");
      setRevComment("");
      setRevPhoto("");
      setTimeout(() => {
        setRevSuccess(false);
        setShowReviewForm(false);
      }, 4000);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/55 dark:bg-slate-950/75 backdrop-blur-xs z-50 flex flex-col justify-end">
      <div className="bg-white dark:bg-slate-900 rounded-t-[32px] w-full max-h-[88%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Top Drag handle / Close Bar */}
        <div className="h-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex gap-1.5">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-1 rounded-full transition-colors ${
                isWishlisted ? "text-red-500" : "text-slate-400 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => onToggleCompare(product)}
              className={`p-1 rounded-full transition-colors ${
                isComparing ? "text-blue-500" : "text-slate-400 hover:text-blue-500"
              }`}
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>

          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>

          <button
            onClick={onClose}
            className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 text-slate-500 dark:text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          
          {/* Images Slider / Detail Header */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800">
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {product.discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImageIdx === i ? "border-amber-500 scale-105" : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Identification & Price */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  {product.brand} • {product.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {product.name}
                </h3>
              </div>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex text-amber-500">
                <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">{avgRating}</span>
              <span>({productReviews.length} {lang === "en" ? "Reviews" : "प्रतिक्रिया"})</span>
            </div>

            {/* Live Stock Panel */}
            <div className={`p-2.5 border rounded-xl flex items-center justify-between ${stockInfo.style}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stockInfo.indicatorColor}`}></span>
                <span className="text-xs font-bold">{stockInfo.label}</span>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated: {new Date(product.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="mt-1 flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold">{lang === "en" ? "Offer Price" : "विशेष मूल्य"}</span>
                <span className="text-xl font-extrabold text-amber-500">
                  {formatNRS(hasDiscount ? discountedPrice : product.price)}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex flex-col text-slate-400">
                  <span className="text-[10px]">{lang === "en" ? "Regular" : "मूल मूल्य"}</span>
                  <span className="text-xs line-through">{formatNRS(product.price)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overview & Identification Codes */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 flex flex-col gap-2 border border-slate-100 dark:border-slate-800/60">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex flex-col">
                <span className="text-slate-400">{lang === "en" ? "Product SKU" : "उत्पादन कोड"}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{product.sku}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">{lang === "en" ? "Warranty" : "वारेन्टी"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.warranty}</span>
              </div>
            </div>

            {/* Barcode Visual Representation */}
            {product.barcode && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-1.5 flex flex-col items-center gap-1">
                <span className="text-[9px] text-slate-400">{lang === "en" ? "Simulated Barcode Scanner" : "उत्पादन बारकोड"}</span>
                {/* Custom Mock Barcode */}
                <div className="flex items-center gap-0.5 bg-white p-1.5 rounded border border-slate-200">
                  {product.barcode.split("").map((char, index) => {
                    const width = (Number(char) % 3) + 1; // 1px to 3px width
                    return (
                      <div
                        key={index}
                        className="bg-black h-8"
                        style={{ width: `${width}px`, marginRight: index % 2 === 0 ? "1px" : "2px" }}
                      ></div>
                    );
                  })}
                </div>
                <span className="font-mono text-[9px] text-slate-500 tracking-widest">{product.barcode}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {lang === "en" ? "Product Description" : "विवरण विवरण"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Compatibility */}
          {((product.tractorModels && product.tractorModels.length > 0) || (product.vehicleModels && product.vehicleModels.length > 0)) && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {lang === "en" ? "Compatibility & Fitment" : "फिट हुने मोडेलहरू"}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tractorModels?.map((model) => (
                  <span key={model} className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[9px] font-bold border border-amber-500/20 flex items-center gap-1">
                    🚜 {model}
                  </span>
                ))}
                {product.vehicleModels?.map((model) => (
                  <span key={model} className="px-2.5 py-1 bg-blue-50 text-blue-800 dark:bg-blue-950/25 dark:text-blue-300 rounded-lg text-[9px] font-bold border border-blue-100 dark:border-blue-900/25 flex items-center gap-1">
                    🚙 {model}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {lang === "en" ? "Specifications & Dimensions" : "विस्तृत विवरण (साइजहरू)"}
              </h4>
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                      <th className="p-2 font-bold text-slate-500 uppercase">{lang === "en" ? "Feature" : "विशेषता"}</th>
                      <th className="p-2 font-bold text-slate-500 uppercase">{lang === "en" ? "Value" : "मापन"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specifications.map((spec, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="p-2 font-semibold text-slate-600 dark:text-slate-400">{spec.name}</td>
                        <td className="p-2 font-mono font-bold text-slate-800 dark:text-slate-200">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Action Button Box */}
          <div className="grid grid-cols-2 gap-2 my-2">
            <button
              onClick={() => {
                setShowReviewForm(false);
                setShowEnquiryForm(!showEnquiryForm);
              }}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs tracking-wide uppercase shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{lang === "en" ? "Send Enquiry" : "सोधपुछ फारम"}</span>
            </button>

            <button
              onClick={() => {
                setShowEnquiryForm(false);
                setShowReviewForm(!showReviewForm);
              }}
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-slate-700 hover:text-amber-500 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold rounded-xl text-xs tracking-wide uppercase shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>{lang === "en" ? "Write Review" : "प्रतिक्रिया दिनुहोस्"}</span>
            </button>
          </div>

          <button
            onClick={() => setShowQRModal(true)}
            className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-xl text-xs tracking-wide uppercase shadow-xs flex items-center justify-center gap-2 transition-all mb-1.5"
          >
            <QrCode className="h-4 w-4" />
            <span>{lang === "en" ? "Generate QR Code" : "QR कोड सिर्जना गर्नुहोस्"}</span>
          </button>

          {/* Quick Enquiry Form Panel */}
          {showEnquiryForm && (
            <div className="bg-amber-500/5 dark:bg-slate-900 border border-amber-500/10 rounded-2xl p-4 flex flex-col gap-3 shadow-inner animate-in slide-in-from-top-3 duration-200">
              <h5 className="text-xs font-bold text-amber-500">
                📬 {lang === "en" ? "Direct Stock Inquiry Form" : "सामान सोधपुछ फारम"}
              </h5>
              
              {enqSuccess ? (
                <div className="bg-amber-500/10 text-amber-500 p-3 rounded-lg text-xs font-semibold text-center border border-amber-500/20">
                  {lang === "en" ? "Enquiry submitted to Alex! We will call you shortly." : "सोधपुछ फारम दर्ता भयो! हामी छिट्टै फोन गर्नेछौं।"}
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-2.5 text-xs">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      required
                      value={enqName}
                      onChange={(e) => setEnqName(e.target.value)}
                      placeholder={lang === "en" ? "Your Full Name" : "तपाईको पुरा नाम"}
                      className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <input
                      type="tel"
                      required
                      value={enqPhone}
                      onChange={(e) => setEnqPhone(e.target.value)}
                      placeholder={lang === "en" ? "WhatsApp or Mobile Number (+977)" : "सम्पर्क फोन नम्बर"}
                      className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <textarea
                      required
                      value={enqMessage}
                      onChange={(e) => setEnqMessage(e.target.value)}
                      placeholder={`${lang === "en" ? "Type details here: I need" : "सन्देश लेख्नुहोस्: मलाई"} 5 pcs of ${product.sku}...`}
                      className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs h-16 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enqLoading}
                    className="py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>{enqLoading ? "Submitting..." : (lang === "en" ? "Submit to Sita Ram" : "पठाउनुहोस्")}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Write Review Form Panel */}
          {showReviewForm && (
            <div className="bg-amber-50/30 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col gap-3 shadow-inner animate-in slide-in-from-top-3 duration-200">
              <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400">
                📝 {lang === "en" ? "Write Verified Customer Review" : "प्रतिक्रिया फारम"}
              </h5>

              {revSuccess ? (
                <div className="bg-amber-500/10 text-amber-500 p-3 rounded-lg text-xs font-semibold text-center border border-amber-500/20">
                  {lang === "en" ? "Review received! Review is pending admin verification." : "प्रतिक्रिया प्राप्त भयो! प्रशासकले स्वीकृत गरेपछि देखिनेछ।"}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      placeholder={lang === "en" ? "Your Full Name" : "तपाईको नाम"}
                      className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Stars Rating selection */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold">{lang === "en" ? "Rating" : "मूल्याङ्कन तारा"}</span>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRevRating(star)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-amber-500"
                        >
                          <Star className={`h-5 w-5 ${star <= revRating ? "fill-amber-500" : "text-slate-300 dark:text-slate-700"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <textarea
                      required
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      placeholder={lang === "en" ? "Write about durability, fitting, performance..." : "बियरिङको टिकाउपन, पर्फर्मेन्स आदिको बारेमा लेख्नुहोस्..."}
                      className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs h-16 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Photo attachment mock */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold">{lang === "en" ? "Review Photo" : "फोटो थप्नुहोस् (ऐच्छिक)"}</span>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer py-1.5 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1">
                        <Image className="h-3.5 w-3.5 text-amber-500" />
                        <span>{lang === "en" ? "Upload Photo" : "फोटो चुन्नुहोस्"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {revPhoto && (
                        <div className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-50">
                          <img src={revPhoto} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verified check */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="revVerified"
                      checked={revVerified}
                      onChange={(e) => setRevVerified(e.target.checked)}
                      className="rounded border-slate-200 text-amber-500 focus:ring-amber-500 focus:accent-amber-500"
                    />
                    <label htmlFor="revVerified" className="text-[10px] text-slate-500 font-semibold cursor-pointer">
                      {lang === "en" ? "I bought this bearing from Sunkoshi Bearing Centre" : "मैले यो सामान सुनकोशी बियरिङ सेन्टरबाटै किनेको हुँ"}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={revLoading}
                    className="py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-lg text-xs transition-all"
                  >
                    {revLoading ? "Uploading Review..." : (lang === "en" ? "Submit Review for Approval" : "समीक्षा पेश गर्नुहोस्")}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="flex flex-col gap-3 mt-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {lang === "en" ? "Customer Reviews" : "ग्राहकका समीक्षाहरू"} ({productReviews.length})
            </h4>

            {productReviews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {productReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{r.customerName}</span>
                        <span className="text-[8px] text-slate-400 block">{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-2.5 w-2.5 ${star <= r.rating ? "fill-amber-500" : "text-slate-300 dark:text-slate-700"}`}
                          />
                        ))}
                      </div>
                    </div>

                    {r.isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] text-amber-500 font-bold">
                        <ShieldCheck className="h-3 w-3" />
                        {lang === "en" ? "Verified Purchase" : "प्रमाणित खरिद"}
                      </span>
                    )}

                    <p className="text-[10px] text-slate-600 dark:text-slate-300 italic">
                      "{r.comment}"
                    </p>

                    {/* Review attached photo */}
                    {r.photoUrl && (
                      <div className="max-w-[80px] aspect-square rounded overflow-hidden border border-slate-200 mt-1 bg-white">
                        <img src={r.photoUrl} alt="Review" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Admin Reply */}
                    {r.reply && (
                      <div className="bg-amber-500/5 dark:bg-amber-500/5 border-l-2 border-amber-500 p-2 rounded-r-lg mt-1 text-[9px]">
                        <div className="flex justify-between items-center text-amber-500 font-bold mb-0.5">
                          <span>{lang === "en" ? "Sita Ram's Reply" : "प्रबन्धकको जवाफ"}</span>
                          <span className="text-[7px] text-slate-400 font-normal">
                            {new Date(r.replyDate || "").toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 italic">"{r.reply}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                {lang === "en" ? "No reviews yet. Be the first to purchase and review this item!" : "हाल यस सामानको कुनै प्रतिक्रिया छैन। प्रतिक्रिया दिन पहिलो हुनुहोस्!"}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Product QR Code Share Modal */}
      {showQRModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-amber-500 font-extrabold">
                  {product.brand} • {product.sku}
                </span>
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 mt-0.5">
                  {lang === "en" ? "Product Share QR" : "उत्पादन साझा QR"}
                </h4>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-full text-slate-500 dark:text-slate-400 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* QR Image Visualizer Frame */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md">
                <img
                  src={qrCodeUrl}
                  alt="Product QR Code"
                  className="w-48 h-48 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
                {lang === "en"
                  ? "Scan with your phone camera to instantly open and view this product's full specs."
                  : "यो उत्पादनको विवरण सिधै हेर्न आफ्नो मोबाइल क्यामेराले यो QR कोड स्क्यान गर्नुहोस्।"}
              </p>
            </div>

            {/* QR Actions */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">{lang === "en" ? "Copied!" : "कपी गरियो!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-amber-500" />
                    <span>{lang === "en" ? "Copy Product Link" : "लिंक कपी गर्नुहोस्"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadQR}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Save QR Code Image" : "QR कोड सेभ गर्नुहोस्"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
