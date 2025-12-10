import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "store.db")

EXASTORE_PRODUCTS = [
    (101, "Organic Almond Milk (1L)", "Groceries", 249.0, "Cold-pressed unsweetened almond milk with zero preservatives", 1),
    (102, "Cold Pressed Virgin Coconut Oil (500ml)", "Groceries", 380.0, "Pure raw extra virgin coconut oil from coastal organic farms", 1),
    (103, "Farm Fresh Organic Avocado (Pack of 2)", "Produce", 280.0, "Nutrient-dense Haas avocados picked fresh this morning", 1),
    (104, "Pure Raw Wild Forest Honey (500g)", "Groceries", 490.0, "Unprocessed organic honey harvested directly from tribal reserves", 1),
    (105, "Gourmet Extra Virgin Olive Oil (1L)", "Groceries", 850.0, "Imported first cold-pressed olive oil from Mediterranean groves", 1),
    (106, "Organic Greek Probiotic Yogurt (400g)", "Groceries", 190.0, "Slow-strained, ultra-thick Greek yogurt packed with 15g protein", 1),
    (107, "Traditional A2 Desi Cow Ghee (500ml)", "Groceries", 780.0, "Grass-fed Gir cow A2 curd-churned golden aromatic ghee", 1),
    (108, "Alphonso Mango Pulp (850g)", "Groceries", 320.0, "100% pure Ratnagiri Alphonso mango purée with zero refined sugar", 1),
    (109, "Organic Chia & Flax Superseed Mix (250g)", "Groceries", 220.0, "Omega-3 and dietary fiber powerhouse seeds for smoothies", 1),
    (110, "Ceremonial Grade Uji Matcha (50g)", "Beverages", 690.0, "First-spring harvest shade-grown Japanese matcha from Kyoto", 1),
    (111, "Artisan Sourdough Country Boule (600g)", "Bakery", 180.0, "36-hour slow-fermented crusty wild yeast boule baked stone-hearth", 1),
    (112, "Toasted Hazelnut Dark Granola (350g)", "Bakery", 340.0, "Jumbo rolled oats crisped in wildflower honey and whole hazelnuts", 1),
    (113, "Multigrain Everything Bagels (Pack of 4)", "Bakery", 160.0, "Kettle-boiled chewy authentic bagels crusted with roasted garlic", 1),
    (114, "Hydroponic Tuscan Baby Kale (200g)", "Produce", 140.0, "Crisp, tender baby kale leaves grown in hydroponic vertical farms", 1),
    (115, "Farm Fresh Mahabaleshwar Strawberries (250g)", "Produce", 175.0, "Sweet, ruby-red strawberries harvested daily from mountain plateau", 1),
    (116, "Organic Sweet Blueberries (125g Punnet)", "Produce", 260.0, "Plump, sweet organic blueberries bursting with antioxidants", 1),
    (117, "Pure Tender Coconut Water (Pack of 4)", "Beverages", 200.0, "Naturally isotonic green coconut water cold-bottled within 2 hours", 1),
    (118, "Cold-Pressed Valencia Orange Juice (1L)", "Beverages", 230.0, "Freshly squeezed unpasteurized sunshine juice with citrus pulp", 1),
    (119, "Sparkling Ginger Lemon Kombucha (330ml)", "Beverages", 150.0, "Effervescent small-batch fermented green tea with zesty ginger root", 1),
    (120, "70% Dark Chocolate Sea Salt Bark (150g)", "Bakery", 290.0, "Bean-to-bar dark chocolate with roasted California almonds", 1),
    (121, "Emergency First Aid & Wellness Kit", "Produce", 420.0, "Sterile medical essentials and zinc-vitamin C immunity tablets", 0),
    (122, "Predator ROG RTX 4080 Gaming Laptop", "Electronics", 89999.0, "High-performance AI workstation laptop with 32GB RAM", 0),
    (123, "Studio Wireless ANC Headphones", "Electronics", 1450.0, "Active noise cancelling over-ear studio headphones with 40-hour battery", 0),
    (124, "Ultra-Slim MagSafe Power Bank (10,000mAh)", "Electronics", 999.0, "15W magnetic wireless fast charging battery pack", 0),
]

def sync():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    for p in EXASTORE_PRODUCTS:
        cur.execute("""
            INSERT OR REPLACE INTO products (id, name, category, price, description, is_organic)
            VALUES (?, ?, ?, ?, ?, ?)
        """, p)
        
    conn.commit()
    conn.close()
    print("All 24 ExaStore products synced into store.db successfully!")

if __name__ == "__main__":
    sync()
