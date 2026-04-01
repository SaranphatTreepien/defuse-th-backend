1. https://defuse-th-backend.onrender.com/

หน้าหลัก ของ API — ปกติแสดงข้อความ welcome หรือ Cannot GET /

2. https://defuse-th-backend.onrender.com/items?limit=5

ดึงข้อมูลไอเทม CS2 จาก database
?limit=5 = จำกัดให้แสดงแค่ 5 รายการ
ใช้ใน frontend เพื่อแสดงสินค้าในตลาด

3. https://defuse-th-backend.onrender.com/auth/steam

เข้าสู่ระบบด้วย Steam
กดแล้วจะ redirect ไปหน้า login ของ Steam
หลัง login สำเร็จ Steam จะส่งข้อมูล user กลับมาให้ backend
# ⚙️ Defuse TH — Backend (csgoBackend)

> Node.js + Express API server สำหรับ CS2 Skins Marketplace
> Frontend Repo: [defuse-th-app](https://github.com/)

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Runtime | Node.js + Express |
| Database | MongoDB Atlas (Mongoose) |
| Auth | passport + passport-steam (Steam OpenID) |
| Token | jsonwebtoken (JWT) |
| Deploy | Render (Free Tier) |

---

## ⚙️ Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```env
STEAM_API_KEY = D81D136C935C889858C738A63301B3E2
JWT_SECRET    = defuse_th_jwt_2024
MONGO_URI     = mongodb+srv://<user>:<pass>@cluster0.v8etbls.mongodb.net/defuseth
APP_SCHEME    = myapp://auth/callback
PORT          = 3000
```

> ⚠️ **Render Free Tier** อาจ sleep หลังไม่มีการใช้งาน 15 นาที — การเรียกครั้งแรกอาจช้า 30–60 วินาที

---

## 📂 โครงสร้างไฟล์

```
csgoBackend/
├── server.js
├── .env
├── data/
│   └── cs2_items.json      ← 2092 CS2 items (จาก ByMykel/CSGO-API)
├── models/
│   ├── User.js             ← steamId, displayName, avatar, balance, inventory[]
│   ├── Listing.js          ← listingId, sellerId, item{}, price, status
│   └── Order.js            ← orderId, buyerId, sellerId, item{}, price
└── routes/
    ├── auth.js             ← Steam OpenID + Mock Login + Admin Login
    ├── items.js            ← GET /items (search, filter, paginate)
    ├── inventory.js        ← GET /inventory/:steamId (Steam API)
    └── market.js           ← listings, buy, sell, balance, deposit
```

---

## 🚀 วิธีรัน (Local)

```bash
# เข้าโฟลเดอร์
cd csgoBackend

# ติดตั้ง dependencies
npm install

# รัน server
node server.js

# หรือใช้ nodemon (auto-restart)
npx nodemon server.js
```

Server จะรันที่ `http://localhost:3000`

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/auth/mock-login` | Mock login สำหรับ dev |
| POST | `/auth/admin-login` | Admin login ไม่ต้องผ่าน Steam |
| GET | `/auth/steam` | เริ่ม Steam OpenID Login |
| GET | `/auth/steam/return` | Callback → redirect `myapp://auth/callback` |
| GET | `/auth/verify` | ตรวจสอบ JWT token |
| GET | `/auth/user/:steamId` | ดูข้อมูล user |

### Items

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/items` | list items (query: search, category, page, limit) |
| GET | `/items/:id` | ดู item เดียว |
| GET | `/items/meta/categories` | ดึง categories ทั้งหมด |

### Inventory

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/inventory/:steamId` | ดึง CS2 inventory จาก Steam API |

### Market

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/market/listings` | ของที่วางขายทั้งหมด (filter ได้) |
| POST | `/market/list` | วางขาย item |
| DELETE | `/market/list/:listingId` | ถอนของออก |
| POST | `/market/buy/:listingId` | ซื้อ item |
| GET | `/market/my-listings` | ของที่ฉันวางขาย |
| GET | `/market/orders` | ประวัติซื้อขาย |
| GET | `/market/balance` | ดูยอดเงิน |
| POST | `/market/deposit` | เติมเงิน (mock) |

---

## 🗄️ MongoDB Schemas

### Database: `defuseth` | Cluster: `cluster0.v8etbls.mongodb.net`

<details>
<summary><strong>users</strong></summary>

```js
{
  steamId: String,        // unique
  displayName: String,
  avatar: String,
  balance: Number,        // default: 1000
  inventory: [{
    assetId: String,
    name: String,
    weapon: String,
    skin: String,
    rarity: String,
    rarityColor: String,
    wear: String,
    float: Number,
    image: String,
    category: String,
    stattrak: Boolean,
    souvenir: Boolean,
    tradeLock: Boolean,
    listed: Boolean,
    listingId: String,
    acquiredAt: Date
  }]
}
```
</details>

<details>
<summary><strong>listings</strong></summary>

```js
{
  listingId: String,      // unique
  sellerId: String,
  sellerName: String,
  item: {
    assetId, name, weapon, skin,
    rarity, rarityColor, wear, float,
    image, stattrak
  },
  price: Number,
  fee: Number,            // 5% ของราคา
  sellerReceive: Number,  // 95% ของราคา
  status: 'active' | 'sold' | 'removed',
  createdAt: Date,
  soldAt: Date
}
```
</details>

<details>
<summary><strong>orders</strong></summary>

```js
{
  orderId: String,        // unique
  listingId: String,
  buyerId: String,
  buyerName: String,
  sellerId: String,
  sellerName: String,
  item: { ... },
  price: Number,
  fee: Number,
  sellerReceive: Number,
  status: 'completed',
  createdAt: Date
}
```
</details>

---

## ✅ สิ่งที่ทำเสร็จแล้ว

- [x] Steam OpenID Login + Callback Deep Link
- [x] Admin Login / Mock Login สำหรับ dev
- [x] CS2 Items API (2092 items, search + filter + paginate)
- [x] Inventory API (ดึงจาก Steam API จริง)
- [x] MongoDB เก็บ Users, Listings, Orders
- [x] JWT Auth Middleware
- [x] Deploy บน Render

---

## ❌ สิ่งที่ยังไม่ได้ทำ (Roadmap)

### 🔴 TASK 1 — ระบบซื้อขาย (Priority สูงสุด)
- [ ] `POST /market/buy/:listingId` — โอน item จริงระหว่าง users
- [ ] อัปเดต `inventory[]` ผู้ซื้อและผู้ขายใน MongoDB
- [ ] อัปเดต `balance` ทั้งสองฝ่าย (หัก fee 5%)
- [ ] บันทึก Order และเปลี่ยน Listing status → `sold`

### 🟡 TASK 2 — Price History
- [ ] เพิ่ม `PriceHistory` collection
- [ ] บันทึกราคาทุกครั้งที่มีการซื้อขาย
- [ ] เพิ่ม endpoint `GET /market/price-history/:itemName`

### 🟢 TASK 3 — Order History แยก Buy / Sell
- [ ] `GET /market/orders?role=buyer` — ประวัติการซื้อ
- [ ] `GET /market/orders?role=seller` — ประวัติการขาย

---

## 🧪 ข้อมูลทดสอบ

| ชื่อ | ค่า |
|------|-----|
| Steam ID ทดสอบ | `76561198283624115` (HEALINGFACTOR) |
| Backend URL | `https://defuse-th-backend.onrender.com` |

---

## 📄 License

สำหรับการศึกษา — CPE451 Project, 2568
