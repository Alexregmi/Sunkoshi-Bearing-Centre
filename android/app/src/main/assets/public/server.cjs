var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_genai = require("@google/genai");
var PORT = 3e3;
var DB_FILE_PATH = import_path.default.join(process.cwd(), "server", "db.json");
var DEFAULT_BRANDS = [
  { id: "brand-1", name: "TVS Girling", logoUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=120", featured: true },
  { id: "brand-2", name: "HP", logoUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=120", featured: true },
  { id: "brand-3", name: "Eicher", logoUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=120", featured: true },
  { id: "brand-4", name: "FAG", logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=120", featured: true },
  { id: "brand-5", name: "Timken", logoUrl: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?q=80&w=120", featured: true },
  { id: "brand-6", name: "NRB", logoUrl: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?q=80&w=120", featured: true },
  { id: "brand-7", name: "Petronas", logoUrl: "https://images.unsplash.com/photo-1611244419377-b0a78db97a3d?q=80&w=120", featured: true },
  { id: "brand-8", name: "MAK Lubricants", logoUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=120", featured: true }
];
var active2FACodes = {};
async function readDatabase() {
  try {
    const data = await import_promises.default.readFile(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.brands || !Array.isArray(parsed.brands) || parsed.brands.length === 0) {
      parsed.brands = DEFAULT_BRANDS;
    } else {
      parsed.brands = parsed.brands.map((b, idx) => {
        if (typeof b === "string") {
          return { id: `brand-${Date.now()}-${idx}`, name: b, featured: true };
        }
        return b;
      });
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database file, using fallback setup:", err);
    return {
      products: [],
      categories: [],
      brands: DEFAULT_BRANDS,
      enquiries: [],
      quotations: [],
      reviews: [],
      banners: [],
      settings: {
        businessName: "Sunkoshi Bearing Centre",
        ownerName: "Sita Ram Regmi",
        adminName: "Alex Regmi",
        adminEmail: "tikaregmi551@gmail.com",
        phone: "+977 9842176142",
        whatsappPhone: "+9779842176142",
        address: "Labipur, Itahari, Nepal",
        logoUrl: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=100",
        mapEmbedUrl: "",
        themeMode: "light",
        themePrimaryColor: "#16a34a"
      },
      logs: []
    };
  }
}
async function saveDatabase(data) {
  await import_promises.default.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}
async function logAdminAction(action, details) {
  const db = await readDatabase();
  const newLog = {
    id: `log-${Date.now()}`,
    action,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    details
  };
  db.logs.unshift(newLog);
  if (db.logs.length > 200) {
    db.logs = db.logs.slice(0, 200);
  }
  await saveDatabase(db);
}
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing admin token" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== "sunkoshi-admin-secure-token-2026") {
    return res.status(403).json({ error: "Forbidden: Invalid admin token" });
  }
  next();
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "20mb" }));
  try {
    await import_promises.default.mkdir(import_path.default.join(process.cwd(), "server"), { recursive: true });
    await import_promises.default.access(DB_FILE_PATH);
  } catch {
    console.log("Database file not found at startup, will write default content or empty schema.");
  }
  app.get("/api/catalog", async (req, res) => {
    try {
      const db = await readDatabase();
      const approvedReviews = db.reviews.filter((r) => r.approved);
      res.json({
        products: db.products,
        categories: db.categories,
        brands: db.brands,
        reviews: approvedReviews,
        banners: db.banners,
        settings: db.settings
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load catalog data: " + error.message });
    }
  });
  app.post("/api/enquiries", async (req, res) => {
    try {
      const { name, phone, productName, message } = req.body;
      if (!name || !phone || !productName || !message) {
        return res.status(400).json({ error: "All inquiry fields (Name, Phone, Product, Message) are required." });
      }
      const db = await readDatabase();
      const newEnquiry = {
        id: `enq-${Date.now()}`,
        name,
        phone,
        productName,
        message,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      };
      db.enquiries.unshift(newEnquiry);
      await saveDatabase(db);
      console.log(`[MAIL MOCK] Sending enquiry from ${name} (${phone}) to ${db.settings.adminEmail}`);
      res.json({
        success: true,
        message: "Enquiry submitted successfully. Our team will contact you shortly.",
        enquiry: newEnquiry
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit enquiry: " + error.message });
    }
  });
  app.post("/api/quotations", async (req, res) => {
    try {
      const { name, phone, email, products, message } = req.body;
      if (!name || !phone || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Name, Phone, and at least one Product are required." });
      }
      const db = await readDatabase();
      const newQuotation = {
        id: `quot-${Date.now()}`,
        name,
        phone,
        email,
        products,
        message: message || "",
        date: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      };
      db.quotations.unshift(newQuotation);
      await saveDatabase(db);
      console.log(`[MAIL MOCK] Bulk quotation requested by ${name} (${phone}) sent to ${db.settings.adminEmail}`);
      res.json({
        success: true,
        message: "Quotation request received. Our sales desk will email/call you with a competitive bid.",
        quotation: newQuotation
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to request quotation: " + error.message });
    }
  });
  app.post("/api/reviews", async (req, res) => {
    try {
      const { productId, customerName, rating, comment, isVerified, photoUrl } = req.body;
      if (!productId || !customerName || !rating || !comment) {
        return res.status(400).json({ error: "Product ID, Name, Rating, and Review content are required." });
      }
      const db = await readDatabase();
      const product = db.products.find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }
      const newReview = {
        id: `rev-${Date.now()}`,
        productId,
        productName: product.name,
        customerName,
        rating: Number(rating),
        comment,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        isVerified: !!isVerified,
        photoUrl: photoUrl || void 0,
        approved: false
        // Admin must approve review to show up
      };
      db.reviews.unshift(newReview);
      await saveDatabase(db);
      res.json({
        success: true,
        message: "Review submitted successfully! It is currently pending Super Admin approval.",
        review: newReview
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit review: " + error.message });
    }
  });
  app.post("/api/admin/login-step1", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }
      const db = await readDatabase();
      const targetEmail = db.settings.adminEmail.toLowerCase().trim();
      if (email.toLowerCase().trim() !== targetEmail) {
        return res.status(401).json({ error: "Unauthorized access: You are not the Super Admin of this app." });
      }
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expires = Date.now() + 10 * 60 * 1e3;
      active2FACodes[targetEmail] = { code, expires };
      console.log(`
======================================================`);
      console.log(`[SECURITY 2FA CODE] Generated code for ${targetEmail}: ${code}`);
      console.log(`======================================================
`);
      res.json({
        success: true,
        message: "A secure verification code has been dispatched to your email/secrets dashboard.",
        // We include the code in a debug field so the developer can log in instantly
        // without check processes, but label it beautifully
        debugCode: code
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed: " + error.message });
    }
  });
  app.post("/api/admin/login-step2", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required." });
      }
      const targetEmail = email.toLowerCase().trim();
      const savedCodeRecord = active2FACodes[targetEmail];
      if (!savedCodeRecord) {
        return res.status(400).json({ error: "No active verification code found for this admin email." });
      }
      if (Date.now() > savedCodeRecord.expires) {
        delete active2FACodes[targetEmail];
        return res.status(400).json({ error: "Verification code expired. Please request a new one." });
      }
      if (savedCodeRecord.code !== code.trim()) {
        return res.status(401).json({ error: "Incorrect verification code. Access denied." });
      }
      delete active2FACodes[targetEmail];
      await logAdminAction(
        "Super Admin Login",
        `Super Admin successfully authenticated using two-factor passcode.`
      );
      res.json({
        success: true,
        token: "sunkoshi-admin-secure-token-2026",
        adminInfo: {
          email: targetEmail,
          name: "Alex Regmi"
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Authentication failed: " + error.message });
    }
  });
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    try {
      const db = await readDatabase();
      res.json({
        enquiries: db.enquiries,
        quotations: db.quotations,
        logs: db.logs,
        allReviews: db.reviews
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const { action, product } = req.body;
      if (!action || !product) {
        return res.status(400).json({ error: "Action and Product object are required." });
      }
      const db = await readDatabase();
      if (action === "create") {
        const id = `prod-${Date.now()}`;
        const newProduct = {
          ...product,
          id,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.products.push(newProduct);
        await saveDatabase(db);
        await logAdminAction("Created Product", `Added new product ${newProduct.name} (${newProduct.sku})`);
        return res.json({ success: true, product: newProduct });
      }
      if (action === "update") {
        const index = db.products.findIndex((p) => p.id === product.id);
        if (index === -1) {
          return res.status(404).json({ error: "Product to update not found." });
        }
        db.products[index] = {
          ...db.products[index],
          ...product,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
        await saveDatabase(db);
        await logAdminAction("Updated Product", `Modified specifications or stock of ${product.name}`);
        return res.json({ success: true, product: db.products[index] });
      }
      if (action === "delete") {
        const targetProduct = db.products.find((p) => p.id === product.id);
        db.products = db.products.filter((p) => p.id !== product.id);
        db.reviews = db.reviews.filter((r) => r.productId !== product.id);
        await saveDatabase(db);
        await logAdminAction("Deleted Product", `Removed product ${targetProduct?.name || product.id} from inventory`);
        return res.json({ success: true });
      }
      res.status(400).json({ error: "Invalid product management action." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const { categories } = req.body;
      if (!categories || !Array.isArray(categories)) {
        return res.status(400).json({ error: "Valid categories list is required." });
      }
      const db = await readDatabase();
      db.categories = categories;
      await saveDatabase(db);
      await logAdminAction("Updated Categories", `Modified the list of product categories.`);
      res.json({ success: true, categories: db.categories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/brands", requireAdmin, async (req, res) => {
    try {
      const { brands } = req.body;
      if (!brands || !Array.isArray(brands)) {
        return res.status(400).json({ error: "Valid brands list is required." });
      }
      const db = await readDatabase();
      db.brands = brands;
      await saveDatabase(db);
      await logAdminAction("Updated Brands", `Modified the list of authorized brands.`);
      res.json({ success: true, brands: db.brands });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/reviews", requireAdmin, async (req, res) => {
    try {
      const { action, id, replyText } = req.body;
      if (!action || !id) {
        return res.status(400).json({ error: "Action and Review ID are required." });
      }
      const db = await readDatabase();
      const reviewIndex = db.reviews.findIndex((r) => r.id === id);
      if (reviewIndex === -1) {
        return res.status(404).json({ error: "Review not found." });
      }
      if (action === "approve") {
        db.reviews[reviewIndex].approved = true;
        await saveDatabase(db);
        await logAdminAction("Approved Review", `Approved product review from ${db.reviews[reviewIndex].customerName}`);
        return res.json({ success: true, review: db.reviews[reviewIndex] });
      }
      if (action === "reply") {
        db.reviews[reviewIndex].reply = replyText || "";
        db.reviews[reviewIndex].replyDate = (/* @__PURE__ */ new Date()).toISOString();
        db.reviews[reviewIndex].approved = true;
        await saveDatabase(db);
        await logAdminAction("Replied to Review", `Added official response to review from ${db.reviews[reviewIndex].customerName}`);
        return res.json({ success: true, review: db.reviews[reviewIndex] });
      }
      if (action === "delete") {
        const deletedReview = db.reviews[reviewIndex];
        db.reviews.splice(reviewIndex, 1);
        await saveDatabase(db);
        await logAdminAction("Deleted Review", `Removed review from ${deletedReview.customerName}`);
        return res.json({ success: true });
      }
      res.status(400).json({ error: "Invalid review action." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/communications", requireAdmin, async (req, res) => {
    try {
      const { type, id, status, adminNotes } = req.body;
      if (!type || !id || !status) {
        return res.status(400).json({ error: "Type, ID, and Status are required." });
      }
      const db = await readDatabase();
      if (type === "enquiry") {
        const index = db.enquiries.findIndex((e) => e.id === id);
        if (index === -1) return res.status(404).json({ error: "Enquiry not found" });
        db.enquiries[index].status = status;
        if (adminNotes !== void 0) db.enquiries[index].adminNotes = adminNotes;
        await saveDatabase(db);
        await logAdminAction("Updated Enquiry", `Changed enquiry status to ${status} for ${db.enquiries[index].name}`);
        return res.json({ success: true });
      }
      if (type === "quotation") {
        const index = db.quotations.findIndex((q) => q.id === id);
        if (index === -1) return res.status(404).json({ error: "Quotation not found" });
        db.quotations[index].status = status;
        await saveDatabase(db);
        await logAdminAction("Updated Quotation", `Changed quotation status to ${status} for ${db.quotations[index].name}`);
        return res.json({ success: true });
      }
      res.status(400).json({ error: "Invalid communication type." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { settings, banners } = req.body;
      const db = await readDatabase();
      if (settings) {
        db.settings = {
          ...db.settings,
          ...settings
        };
        await logAdminAction("Updated Settings", `Modified app settings, owner details, or colors.`);
      }
      if (banners && Array.isArray(banners)) {
        db.banners = banners;
        await logAdminAction("Updated Banners", `Updated homepage slider banners.`);
      }
      await saveDatabase(db);
      res.json({ success: true, settings: db.settings, banners: db.banners });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/admin/backup", requireAdmin, async (req, res) => {
    try {
      const db = await readDatabase();
      res.setHeader("Content-Disposition", "attachment; filename=sunkoshi_db_backup.json");
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(db, null, 2));
    } catch (error) {
      res.status(500).json({ error: "Backup failed: " + error.message });
    }
  });
  app.post("/api/admin/restore", requireAdmin, async (req, res) => {
    try {
      const { backupData } = req.body;
      if (!backupData || typeof backupData !== "object") {
        return res.status(400).json({ error: "Valid JSON backup data is required." });
      }
      if (!backupData.products || !backupData.settings || !backupData.categories) {
        return res.status(400).json({ error: "Invalid backup file: Essential sections are missing." });
      }
      await saveDatabase(backupData);
      await logAdminAction("Database Restored", `System database completely restored from a backup file.`);
      res.json({ success: true, message: "Database restored successfully." });
    } catch (error) {
      res.status(500).json({ error: "Restore failed: " + error.message });
    }
  });
  app.post("/api/assistant", async (req, res) => {
    try {
      const { message, chatHistory } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }
      const db = await readDatabase();
      const miniCatalog = db.products.map((p) => {
        const stockStatus = p.availableQty === 0 ? "Out of Stock \u274C" : p.availableQty <= 10 ? `Low Stock \u26A0\uFE0F (${p.availableQty} units left)` : `In Stock \u2705 (${p.availableQty} units)`;
        return {
          name: p.name,
          sku: p.sku,
          brand: p.brand,
          category: p.category,
          price: `NRS ${p.price}`,
          discount: p.discount > 0 ? `${p.discount}% off` : "No discount",
          stock: stockStatus,
          warranty: p.warranty,
          tractors: p.tractorModels ? p.tractorModels.join(", ") : "None",
          vehicles: p.vehicleModels ? p.vehicleModels.join(", ") : "None"
        };
      });
      const systemPrompt = `You are the highly professional AI Assistant for "Sunkoshi Bearing Centre" located in Labipur, Itahari, Nepal.
Owner: Sita Ram Regmi. Admin: Alex Regmi. Phone: +977 9842176142. Super Admin Email: tikaregmi551@gmail.com.

Your main tasks are to:
1. Help users find bearings and tractor parts from our current active inventory.
2. Check stock availability, prices, and discounts accurately using the inventory catalog below.
3. Recommend similar products or products of premium brands we carry (FAG, Timken, TVS Girling, NRB, Petronas, MAK Lubricants, HP, Eicher).
4. Answer common queries about bearings, seals, tractor models compatibility, and lubricants.
5. Guide them on how to contact our shop (Call/WhatsApp/Email buttons are on the screen, and they can send enquiries through the contact form).

Here is our live Sunkoshi Bearing Centre catalog:
${JSON.stringify(miniCatalog, null, 2)}

Shop Information:
- Address: Labipur, Itahari, Nepal (on the Highway)
- Phone: +977 9842176142 (Calls & WhatsApp)
- Official Email: tikaregmi551@gmail.com

Guidelines:
- Keep your responses extremely professional, helpful, polite, and clean. Use scannable bullet points and bold formatting for product names and stock.
- Respond in English or Nepali based on the user's language choice.
- Never make up products or stock counts that do not exist in the catalog above. If a product isn't listed, politely say it is not in our standard live database, but users can request a special order by filling the 'Contact Us' form.
- Be humble, objective, and supportive. Ensure great Nepalese hospitality!`;
      if (!process.env.GEMINI_API_KEY) {
        console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
        return res.json({
          response: "Namaste! I'm the Sunkoshi Bearing Centre AI Assistant. [NOTE: Gemini API key is currently not configured in the system, so I am running in Offline Mode]. I can tell you that we have premium bearings (FAG 6204, Timken Set 47), Swaraj/Eicher tractor parts, oils and grease in our catalog. Please use the Call or WhatsApp buttons above to contact Sita Ram Regmi directly!"
        });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const formattedHistory = (chatHistory || []).map((h) => ({
        role: h.role === "assistant" ? "model" : h.role,
        parts: h.parts || [{ text: h.text }]
      }));
      const contents = [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ];
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7
        }
      });
      res.json({ response: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "AI Assistant failed to generate content: " + error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-stack application running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
