const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { Groq } = require("groq-sdk");

const PORT = process.env.PORT || 3001;
const RECOURSE_API_URL = process.env.RECOURSE_API_URL || "http://localhost:3000/api/agent";
const RECOURSE_MANDATE_URL = process.env.RECOURSE_MANDATE_URL || "http://localhost:3000/api/mandate/draft";
const PUBLIC_DIR = path.join(__dirname, "public");

// Extract Groq Key from env or .env.local
function getGroqApiKey() {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("placeholder")) {
    return process.env.GROQ_API_KEY;
  }
  try {
    const envLocalPath = path.resolve(__dirname, "../../.env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      const m = content.match(/GROQ_API_KEY=([^\r\n]+)/);
      if (m && m[1].trim() && !m[1].includes("placeholder")) {
        return m[1].trim();
      }
    }
  } catch {}
  return "";
}

const GROQ_API_KEY = getGroqApiKey();
const groqClient = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Comprehensive 24-Product Curated Catalog with high-res photography
const PRODUCTS = [
  {
    id: "p1",
    name: "Organic Almond Milk (1L)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 249,
    rating: 4.8,
    reviews_count: 86,
    tag: "100% Organic",
    image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80",
    description: "Cold-pressed unsweetened almond milk with zero preservatives and fortified calcium.",
    in_stock: true
  },
  {
    id: "p2",
    name: "Cold Pressed Virgin Coconut Oil (500ml)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 380,
    rating: 4.9,
    reviews_count: 64,
    tag: "Cold Pressed",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
    description: "Pure raw extra virgin coconut oil extracted from fresh coastal organic coconut groves.",
    in_stock: true
  },
  {
    id: "p3",
    name: "Farm Fresh Organic Avocado (Pack of 2)",
    category: "Produce",
    merchant: "ExaStore",
    price: 280,
    rating: 4.7,
    reviews_count: 112,
    tag: "Farm Fresh",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
    description: "Creamy, nutrient-dense Haas avocados picked fresh at peak ripeness this morning.",
    in_stock: true
  },
  {
    id: "p4",
    name: "Pure Raw Wild Forest Honey (500g)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 490,
    rating: 4.9,
    reviews_count: 142,
    tag: "Raw & Pure",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Unprocessed organic wildflower honey harvested directly from protected Nilgiri forest reserves.",
    in_stock: true
  },
  {
    id: "p5",
    name: "Gourmet Extra Virgin Olive Oil (1L)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 850,
    rating: 4.8,
    reviews_count: 53,
    tag: "First Harvest",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Imported first cold-pressed olive oil from single-estate Mediterranean family groves.",
    in_stock: true
  },
  {
    id: "p6",
    name: "Organic Greek Probiotic Yogurt (400g)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 190,
    rating: 4.8,
    reviews_count: 94,
    tag: "High Protein",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    description: "Slow-strained, ultra-thick Greek yogurt packed with 15g natural protein and live probiotic cultures.",
    in_stock: true
  },
  {
    id: "p7",
    name: "Traditional A2 Desi Cow Ghee (500ml)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 780,
    rating: 4.9,
    reviews_count: 78,
    tag: "Bilona Churned",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80",
    description: "Grass-fed Gir cow A2 curd-churned golden aromatic ghee in premium UV-protective glass jar.",
    in_stock: true
  },
  {
    id: "p8",
    name: "Alphonso Mango Pulp (850g)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 320,
    rating: 4.9,
    reviews_count: 67,
    tag: "GI Tagged",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    description: "100% pure Ratnagiri Alphonso mango purée with rich aroma and zero refined cane sugar.",
    in_stock: true
  },
  {
    id: "p9",
    name: "Organic Chia & Flax Superseed Mix (250g)",
    category: "Groceries",
    merchant: "ExaStore",
    price: 220,
    rating: 4.7,
    reviews_count: 45,
    tag: "Superfood",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Omega-3 and dietary fiber powerhouse seeds perfect for breakfast smoothie bowls and overnight oats.",
    in_stock: true
  },
  {
    id: "p10",
    name: "Ceremonial Grade Uji Matcha (50g)",
    category: "Beverages",
    merchant: "ExaStore",
    price: 690,
    rating: 4.9,
    reviews_count: 82,
    tag: "Single Origin",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    description: "First-spring harvest shade-grown Japanese matcha from Kyoto, vibrant emerald green with silky umami.",
    in_stock: true
  },
  {
    id: "p11",
    name: "Artisan Sourdough Country Boule (600g)",
    category: "Bakery",
    merchant: "ExaStore",
    price: 180,
    rating: 4.8,
    reviews_count: 104,
    tag: "Wild Yeast",
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
    description: "36-hour slow-fermented crusty wild yeast boule baked stone-hearth with an airy open crumb.",
    in_stock: true
  },
  {
    id: "p12",
    name: "Toasted Hazelnut Dark Granola (350g)",
    category: "Bakery",
    merchant: "ExaStore",
    price: 340,
    rating: 4.7,
    reviews_count: 62,
    tag: "Artisan Baked",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80",
    description: "Jumbo rolled oats crisped in wildflower honey, whole roasted Oregon hazelnuts, and Madagascar vanilla.",
    in_stock: true
  },
  {
    id: "p13",
    name: "Multigrain Everything Bagels (Pack of 4)",
    category: "Bakery",
    merchant: "ExaStore",
    price: 160,
    rating: 4.8,
    reviews_count: 58,
    tag: "Fresh Baked",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80",
    description: "Kettle-boiled chewy authentic bagels crusted with roasted garlic, onion flakes, and toasted seeds.",
    in_stock: true
  },
  {
    id: "p14",
    name: "Hydroponic Tuscan Baby Kale (200g)",
    category: "Produce",
    merchant: "ExaStore",
    price: 140,
    rating: 4.7,
    reviews_count: 39,
    tag: "Pesticide Free",
    image: "https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=600&q=80",
    description: "Crisp, tender baby kale leaves grown in climate-controlled hydroponic indoor vertical farms.",
    in_stock: true
  },
  {
    id: "p15",
    name: "Farm Fresh Mahabaleshwar Strawberries (250g)",
    category: "Produce",
    merchant: "ExaStore",
    price: 175,
    rating: 4.8,
    reviews_count: 91,
    tag: "Hand Picked",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    description: "Sweet, ruby-red strawberries harvested at daybreak from cool mountain plateau slopes.",
    in_stock: true
  },
  {
    id: "p16",
    name: "Organic Sweet Blueberries (125g Punnet)",
    category: "Produce",
    merchant: "ExaStore",
    price: 260,
    rating: 4.9,
    reviews_count: 73,
    tag: "Antioxidant Rich",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80",
    description: "Plump, sweet organic blueberries bursting with vibrant natural antioxidants and juice.",
    in_stock: true
  },
  {
    id: "p17",
    name: "Pure Tender Coconut Water (Pack of 4)",
    category: "Beverages",
    merchant: "ExaStore",
    price: 200,
    rating: 4.8,
    reviews_count: 85,
    tag: "Zero Additives",
    image: "https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80",
    description: "Naturally isotonic green coconut water cold-bottled within 2 hours of tree harvest.",
    in_stock: true
  },
  {
    id: "p18",
    name: "Cold-Pressed Valencia Orange Juice (1L)",
    category: "Beverages",
    merchant: "ExaStore",
    price: 230,
    rating: 4.9,
    reviews_count: 119,
    tag: "100% Raw Juice",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    description: "Freshly squeezed unpasteurized sunshine juice with citrus pulp intact and zero added water.",
    in_stock: true
  },
  {
    id: "p19",
    name: "Sparkling Ginger Lemon Kombucha (330ml)",
    category: "Beverages",
    merchant: "ExaStore",
    price: 150,
    rating: 4.7,
    reviews_count: 64,
    tag: "Probiotic Living",
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80",
    description: "Effervescent small-batch fermented green tea with zesty ginger root and cold-pressed Meyer lemon.",
    in_stock: true
  },
  {
    id: "p20",
    name: "70% Dark Chocolate Sea Salt Bark (150g)",
    category: "Bakery",
    merchant: "ExaStore",
    price: 290,
    rating: 4.9,
    reviews_count: 88,
    tag: "Single Origin",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
    description: "Bean-to-bar stone ground dark chocolate layered with roasted California almonds and crunchy Maldon sea salt.",
    in_stock: true
  },
  {
    id: "p21",
    name: "Emergency First Aid & Wellness Kit",
    category: "Produce",
    merchant: "ExaStore",
    price: 420,
    rating: 4.8,
    reviews_count: 36,
    tag: "Essential",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    description: "Sterile medical essentials, herbal antiseptic balm, and zinc-vitamin C immunity wellness tablets.",
    in_stock: true
  },
  {
    id: "p22",
    name: "Predator ROG RTX 4080 Gaming Laptop",
    category: "Electronics",
    merchant: "ExaStore",
    price: 89999,
    rating: 4.9,
    reviews_count: 24,
    tag: "Workstation",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    description: "High-performance AI workstation laptop with 32GB RAM, 1TB NVMe SSD, and RTX 4080 graphics.",
    in_stock: true
  },
  {
    id: "p23",
    name: "Studio Wireless ANC Headphones",
    category: "Electronics",
    merchant: "ExaStore",
    price: 1450,
    rating: 4.6,
    reviews_count: 142,
    tag: "Hi-Fi Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    description: "Active noise cancelling over-ear studio headphones with spatial sound and 40-hour battery life.",
    in_stock: true
  },
  {
    id: "p24",
    name: "Ultra-Slim MagSafe Power Bank (10,000mAh)",
    category: "Electronics",
    merchant: "ExaStore",
    price: 999,
    rating: 4.7,
    reviews_count: 98,
    tag: "Fast Charge",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80",
    description: "15W magnetic wireless fast charging battery pack with aerospace-grade anodized aluminum casing.",
    in_stock: true
  }
];

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Groq chat completion with model fallback
async function executeGroqCompletion(messages, temperature = 0.2) {
  if (!groqClient) return null;
  const models = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
  ];
  for (const model of models) {
    try {
      const resp = await groqClient.chat.completions.create({
        model,
        messages,
        temperature,
      });
      if (resp && resp.choices && resp.choices[0] && resp.choices[0].message) {
        return resp.choices[0].message.content;
      }
    } catch (err) {
      // try next model
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // Endpoint 1: Catalog API for Shopping AI & Frontend
  if (pathname === "/api/products" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, count: PRODUCTS.length, products: PRODUCTS }));
    return;
  }

  // Endpoint 2: Order & Proxy Checkout to Recourse Gateway (port 3000)
  if ((pathname === "/api/order" || pathname === "/api/proxy-checkout") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });

    req.on("end", async () => {
      try {
        const parsedBody = JSON.parse(body || "{}");
        const orderMessage = parsedBody.user_message || `Order ${parsedBody.item || 'Item'} for ₹${(parsedBody.amount_paisa || 24900) / 100} from ExaStore to ${parsedBody.address || 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103'}`;
        
        console.log(`[ExaStore] Routing order to Recourse Rails: ${orderMessage}`);

        const response = await fetch(RECOURSE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_message: orderMessage,
            address: parsedBody.address || "Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103",
            item: parsedBody.item || "Organic Almond Milk (1L)",
            amount_paisa: parsedBody.amount_paisa || 24900,
            merchant: "ExaStore",
            category: parsedBody.category || "Groceries",
          }),
        });

        const data = await response.json();
        res.writeHead(response.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        console.error("[ExaStore] Gateway error:", err.message);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Failed to connect to Recourse Gateway",
          details: err.message,
        }));
      }
    });
    return;
  }

  // Endpoint 3: Schedule Proxy Endpoint
  if (pathname === "/api/schedule" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const parsedBody = JSON.parse(body || "{}");
        const resp = await fetch(RECOURSE_MANDATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: parsedBody.prompt || "Schedule groceries on weekends with ₹500 cap" }),
        });
        const data = await resp.json();
        res.writeHead(resp.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Endpoint 4: Built-in Groq Shopping AI Copilot Chat Endpoint
  if (pathname === "/api/ai/chat" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { message, history = [] } = JSON.parse(body || "{}");
        const cleanMessage = (message || "").trim();
        const lower = cleanMessage.toLowerCase();

        // Check if intent is to BUY an item
        const isBuyIntent = /buy|order|purchase|checkout|get me/i.test(lower);
        // Check if intent is to SCHEDULE
        const isScheduleIntent = /schedule|recurring|every weekend|every saturday|every sunday|weekly/i.test(lower);

        if (isScheduleIntent) {
          // Stage schedule via Recourse
          try {
            const schedResp = await fetch(RECOURSE_MANDATE_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: cleanMessage }),
            });
            const schedData = await schedResp.json();
            if (schedData.success) {
              const draft = schedData.draft;
              return sendJson(res, 200, {
                reply: `📅 **Schedule Staged Successfully!**\n\nI have staged a recurring grocery policy for **ExaStore**:\n- **Category:** ${draft.category}\n- **Per-Item Cap:** ₹${draft.per_item_cap_inr}\n- **Frequency:** ${(draft.schedule_days || ["Everyday"]).join(", ")}\n- **Status:** Staged for review on Recourse Console (Port 3000).\n\nYour automated weekend basket will be processed within policy limits!`,
                action: "SCHEDULE_STAGED",
                schedule: draft
              });
            }
          } catch (schedErr) {
            console.warn("Schedule staging error:", schedErr.message);
          }
        }

        if (isBuyIntent) {
          // Identify product by finding best matching item in catalog
          let targetProduct = null;
          let bestScore = 0;

          for (const p of PRODUCTS) {
            const words = p.name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 2);
            let score = 0;
            for (const w of words) {
              if (lower.includes(w)) {
                score += (w === "organic" || w === "pack" || w === "fresh") ? 1 : 4;
              }
            }
            if (score > bestScore) {
              bestScore = score;
              targetProduct = p;
            }
          }

          if (!targetProduct || bestScore === 0) {
            // Default heuristics
            if (/milk|almond/i.test(lower)) targetProduct = PRODUCTS[0];
            else if (/avocado/i.test(lower)) targetProduct = PRODUCTS[2];
            else if (/honey/i.test(lower)) targetProduct = PRODUCTS[3];
            else if (/laptop|gaming/i.test(lower)) targetProduct = PRODUCTS[21];
            else targetProduct = PRODUCTS[0];
          }

          // Execute order directly through Recourse Gateway
          try {
            const orderPayload = {
              user_message: `Order ${targetProduct.name} for ₹${targetProduct.price} from ExaStore to Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103`,
              item: targetProduct.name,
              amount_paisa: targetProduct.price * 100,
              merchant: "ExaStore",
              category: targetProduct.category,
              address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103"
            };

            const orderResp = await fetch(RECOURSE_API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderPayload)
            });
            const orderData = await orderResp.json();

            if (orderData.pass || orderData.action === "APPROVED") {
              const rzpId = orderData.razorpay_order_id || orderData.razorpay_order?.id || "order_live_settled";
              return sendJson(res, 200, {
                reply: `✅ **Order Confirmed & Settled!**\n\nI have placed your order for **${targetProduct.name}** at **₹${targetProduct.price.toFixed(2)}**.\n\n- **Merchant:** ExaStore (Authorized)\n- **Razorpay Order ID:** \`${rzpId}\`\n- **Delivery Address:** Flat 402, Green Glen Layout, Bellandur, Bengaluru\n- **Risk Gate:** Approved (Zero Fund Leakage)\n\nThe item has been added to your order history and settled on Razorpay test rails.`,
                action: "ORDER_PLACED",
                product: targetProduct,
                razorpay_order_id: rzpId,
                deposit_paisa: orderData.deposit_paisa || 0
              });
            } else {
              const reason = orderData.failureReason || orderData.reason || "Out of policy spend limit";
              return sendJson(res, 200, {
                reply: `🚫 **Order Blocked by Recourse Risk Gate!**\n\n- **Item:** ${targetProduct.name} (₹${targetProduct.price.toFixed(2)})\n- **Interception Reason:** ${reason}\n- **Fund Leakage Prevented:** ₹${targetProduct.price.toFixed(2)} protected on merchant payment rails.\n\nRecourse prevented this transaction because it violates spending boundaries.`,
                action: "ORDER_BLOCKED",
                product: targetProduct,
                reason: reason
              });
            }
          } catch (err) {
            console.error("AI order execution error:", err);
          }
        }

        // Conversational Q&A / Recommendations using Groq
        const catalogContext = PRODUCTS.map(p => `- ${p.name} (₹${p.price}) [${p.category}, ${p.tag}]: ${p.description}`).join("\n");

        const systemPrompt = `You are "Shopping AI", an intelligent, courteous, and efficient shopping assistant embedded directly inside "ExaStore", created by Anbu.
ExaStore is a premier online marketplace specializing in organic groceries, farm-fresh produce, artisanal bakery items, healthy beverages, and electronics.

Catalog of available products:
${catalogContext}

Your capabilities:
1. Help users discover products, check ingredients, dietary tags (organic, gluten-free, bilona churned, cold-pressed), and compare prices.
2. If the user wants to buy something, recommend the exact product and inform them they can say "Buy [Item]" to execute immediately.
3. If the user asks about schedules, explain that they can schedule automated weekend or weekly deliveries by saying "Schedule [items] on weekends under ₹[budget]".
4. Always maintain a warm, crisp, professional tone. Keep answers under 3-4 concise paragraphs with clear bullet points. Mention prices in Indian Rupees (₹).`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-4),
          { role: "user", content: cleanMessage }
        ];

        let aiReply = await executeGroqCompletion(messages);
        if (!aiReply) {
          // High quality heuristic fallback
          aiReply = `I'm **Shopping AI by Anbu**. We have 24 fresh organic and artisan items in stock today! You can ask me to **"Buy Organic Almond Milk"**, **"Order Avocados"**, or **"Schedule groceries on weekends under ₹500"**. How can I help with your cart?`;
        }

        return sendJson(res, 200, {
          reply: aiReply,
          action: "CONVERSATION"
        });

      } catch (err) {
        console.error("AI Chat handler error:", err);
        return sendJson(res, 500, { error: "AI reasoning failed", details: err.message });
      }
    });
    return;
  }

  // Endpoint 5: Static Files
  let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (readErr, indexContent) => {
          if (readErr) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(indexContent, "utf-8");
          }
        });
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ExaStore (Pure Consumer E-Commerce Storefront)      `);
  console.log(`  URL: http://localhost:${PORT}                       `);
  console.log(`  Products API: http://localhost:${PORT}/api/products  `);
  console.log(`  Embedded AI Endpoint: http://localhost:${PORT}/api/ai/chat`);
  console.log(`  Connected to Recourse Gateway: ${RECOURSE_API_URL}   `);
  console.log(`=======================================================`);
});
