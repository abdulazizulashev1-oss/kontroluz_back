# 🤖 Kontrol.uz — Telegram Bot & Client Integration API Qo'llanmasi

Ushbu hujjat **"Kontrol.uz"** Headless E-Commerce va Sanoat Avtomatikasi tizimining Telegram Bot hamda Tashqi Integratsiyalar uchun mo'ljallangan rasmiy API qo'llanmasidir.

---

## 📌 GENERAL INFORMATION

- **Production API Base URL:** `https://api.kontrol.uz/api`
- **Development API Base URL:** `http://localhost:1337/api`
- **Content-Type:** `application/json`
- **Autentifikatsiya:** Ochiq REST API (Jamoat va Telegram bot so'rovlari uchun qo'shimcha kalit talab etilmaydi).
- **Format:** Barcha rasmlar to'liq server havola shaklida (`https://api.kontrol.uz/uploads/...`) yoki nisbiy havolada qaytadi.

---

## 🔌 API ENDPOINTS RO'YXATI

| # | Maqsadi | Method | Endpoint |
| :-: | :--- | :-: | :--- |
| 1 | Bot Tugmalari uchun Kategoriyalar | `GET` | `/api/bot/categories` |
| 2 | Katalog mahsulotlari (Paginatsiya) | `GET` | `/api/bot/products` |
| 3 | Telegram Bot ichida Qidiruv | `GET` | `/api/bot/products/search` |
| 4 | Mahsulot Kartochkasi & Telegram Matni | `GET` | `/api/bot/products/:id` |
| 5 | Ariza / Smeta qoldirish (Lead) | `POST` | `/api/bot/leads` |
| 6 | Bot orqali Buyurtma Rasmiylashtirish | `POST` | `/api/bot/orders` |
| 7 | Buyurtma Holatini Tekshirish | `GET` | `/api/bot/orders/check` |
| 8 | Barcha tovarlar yengil kesh formati | `GET` | `/api/products/all` |

---

## 📖 ENDPOINTLAR BO'YICHA BATAFSIL TASHIX

### 1️⃣ Kategoriyalar va Subkategoriyalarni Olish

Telegram Bot inline keyboard yoki menyu tugmalarini yaratish uchun ishlatiladi.

- **URL:** `GET https://api.kontrol.uz/api/bot/categories`
- **Query Parametrlari:**
  - `locale` *(string, optional)*: `uz` | `ru` | `en` (standart: `uz`)
  - `parentSlug` *(string, optional)*: Agar subkategoriyalar so'ralsa (masalan: `parentSlug=videokuzatuv`). Bo'sh bo'lsa bosh kategoriyalar qaytadi.

#### Namuna So'rov (Request):
```http
GET https://api.kontrol.uz/api/bot/categories?locale=uz
```

#### Javob (Response 200 OK):
```json
{
  "data": [
    {
      "id": 18,
      "slug": "videokuzatuv",
      "name": "Videokuzatuv Tizimlari",
      "iconName": "Camera",
      "productCount": 42,
      "order": 1,
      "coverImageUrl": "https://api.kontrol.uz/uploads/videokuzatuv.webp",
      "hasSubcategories": true,
      "subcategories": [
        {
          "id": 21,
          "slug": "ip-kameralar",
          "name": "IP Kameralar",
          "iconName": "Camera",
          "productCount": 25
        },
        {
          "id": 22,
          "slug": "nvr-registratorlar",
          "name": "NVR Registratorlar",
          "iconName": "HardDrive",
          "productCount": 17
        }
      ]
    }
  ]
}
```

---

### 2️⃣ Kategoriya Bo'yicha Mahsulotlar Ro'yxati (Paginatsiya)

Botda foydalanuvchi biror kategoriyani tanlaganda mahsulotlarni sahifalab ko'rsatish uchun.

- **URL:** `GET https://api.kontrol.uz/api/bot/products`
- **Query Parametrlari:**
  - `categorySlug` *(string, optional)*: Kategoriya kodi (masalan: `ip-kameralar`)
  - `page` *(number, optional)*: Sahifa raqami (default: `1`)
  - `limit` *(number, optional)*: Sahifadagi tovarlar soni (default: `10`, max: `50`)
  - `locale` *(string, optional)*: `uz` | `ru` | `en`

#### Namuna So'rov (Request):
```http
GET https://api.kontrol.uz/api/bot/products?categorySlug=ip-kameralar&page=1&limit=10&locale=uz
```

#### Javob (Response 200 OK):
```json
{
  "data": [
    {
      "id": 4,
      "slug": "hikvision-ds-2cd2143g0-i-4mp-dome-ip-camera",
      "title": "Hikvision DS-2CD2143G0-I 4MP Vandal-Proof Dome IP Kamera",
      "sku": "HK-2CD2143G0",
      "price": 1250000,
      "oldPrice": 1450000,
      "currency": "UZS",
      "inStock": true,
      "stockCount": 45,
      "rating": 4.9,
      "shortDescription": "4 megapikselli yuqori aniqlikdagi IP kamera",
      "categorySlug": "ip-kameralar",
      "categoryName": "IP Kameralar",
      "coverImageUrl": "https://api.kontrol.uz/uploads/hikvision_front.webp"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3️⃣ Botda Matnli va Artikulli Qidiruv (Search)

Foydalanuvchi Telegram botga mahsulot nomini, kodi (`sku`) yoki kalit so'z yozganda bir zumda izlab beradi.

- **URL:** `GET https://api.kontrol.uz/api/bot/products/search`
- **Query Parametrlari:**
  - `q` *(string, required)*: Qidiruv matni (masalan: `q=hikvision` yoki `q=HK-2CD`)
  - `limit` *(number, optional)*: Qaytariladigan natijalar soni (default: `10`, max: `30`)
  - `locale` *(string, optional)*: `uz` | `ru` | `en`

#### Namuna So'rov (Request):
```http
GET https://api.kontrol.uz/api/bot/products/search?q=hikvision&locale=uz
```

#### Javob (Response 200 OK):
```json
{
  "data": [
    {
      "id": 4,
      "slug": "hikvision-ds-2cd2143g0-i-4mp-dome-ip-camera",
      "title": "Hikvision DS-2CD2143G0-I 4MP Vandal-Proof Dome IP Kamera",
      "sku": "HK-2CD2143G0",
      "price": 1250000,
      "oldPrice": 1450000,
      "currency": "UZS",
      "inStock": true,
      "shortDescription": "4 megapikselli yuqori aniqlikdagi IP kamera",
      "categoryName": "IP Kameralar",
      "coverImageUrl": "https://api.kontrol.uz/uploads/hikvision_front.webp"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

### 4️⃣ Bitta Mahsulot Kartochkasi va Telegram Matni

Mahsulot sahifasidagi barcha texnik xususiyatlar, galereya rasmlari hamda bot uchun **tayyor `telegramMessageText` matni** bilan qaytadi.

- **URL:** `GET https://api.kontrol.uz/api/bot/products/:id` (ID yoki Slug berish mumkin, masalan: `/api/bot/products/4`)
- **Query Parametrlari:** `locale=uz`

#### Namuna So'rov (Request):
```http
GET https://api.kontrol.uz/api/bot/products/4?locale=uz
```

#### Javob (Response 200 OK):
```json
{
  "data": {
    "id": 4,
    "slug": "hikvision-ds-2cd2143g0-i-4mp-dome-ip-camera",
    "title": "Hikvision DS-2CD2143G0-I 4MP Vandal-Proof Dome IP Kamera",
    "sku": "HK-2CD2143G0",
    "price": 1250000,
    "oldPrice": 1450000,
    "currency": "UZS",
    "inStock": true,
    "stockCount": 45,
    "rating": 4.9,
    "reviewCount": 28,
    "shortDescription": "4 megapikselli yuqori aniqlikdagi IP kamera",
    "fullDescription": "Hikvision DS-2CD2143G0-I sanoat va tijorat obyektlari uchun mo'ljallangan...",
    "specifications": {
      "Matritsa aniqligi": "4 MP",
      "IR Tungi masofa": "30m",
      "Himoya": "IP67 / IK10"
    },
    "categorySlug": "ip-kameralar",
    "categoryName": "IP Kameralar",
    "coverImageUrl": "https://api.kontrol.uz/uploads/hikvision_front.webp",
    "galleryImageUrls": [
      "https://api.kontrol.uz/uploads/side1.webp",
      "https://api.kontrol.uz/uploads/side2.webp"
    ],
    "telegramMessageText": "📦 *Hikvision DS-2CD2143G0-I 4MP Vandal-Proof Dome IP Kamera*\n🔢 *Artikul:* `HK-2CD2143G0`\n📁 *Kategoriya:* IP Kameralar\n💰 *Narxi:* *1 250 000 UZS* ~1 450 000 UZS~\n📦 *Holati:* 🟢 Omborda mavjud\n\n📝 *Qisqa ma'lumot:*\n4 megapikselli yuqori aniqlikdagi IP kamera\n\n⚙️ *Texnik xarakteristikasi:*\n• *Matritsa aniqligi:* 4 MP\n• *IR Tungi masofa:* 30m\n• *Himoya:* IP67 / IK10"
  }
}
```

---

### 5️⃣ Telegram Bot orqali B2B Ariza / Smeta Yuborish (Lead)

Foydalanuvchi botda konsultatsiya yoki smeta so'rab ariza qoldirganda Strapi bazasiga saqlanadi.

- **URL:** `POST https://api.kontrol.uz/api/bot/leads`
- **Request Body (JSON):**
```json
{
  "clientName": "Jamshidbek",
  "phone": "+998901234567",
  "telegramUsername": "jamshid_user",
  "telegramChatId": "123456789",
  "company": "Orient Group",
  "category": "videokuzatuv",
  "message": "3000 kv.m ombor uchun smeta tuzib berishingizni so'rayman",
  "objectType": "warehouse",
  "areaSqM": 450
}
```

#### Javob (Response 200 OK):
```json
{
  "success": true,
  "data": {
    "id": 15,
    "clientName": "Jamshidbek",
    "phone": "+998901234567",
    "status": "NEW",
    "message": "Lead submitted successfully from Telegram Bot"
  }
}
```

---

### 6️⃣ Telegram Bot orqali Savat Buyurtmasini Yaratish (Order & Chek)

Foydalanuvchi Telegram bot orqali savatdagi tovarlarga buyurtma beradi. API avtomatik unikal `ORD-YYYYMMDD-XXXX` nomer, QQS (12%) hisoblab beradi hamda botga yuboriladigan **tayyor `receiptText` chek matnini** qaytaradi.

- **URL:** `POST https://api.kontrol.uz/api/bot/orders`
- **Request Body (JSON):**
```json
{
  "customerName": "Alisher Navoiy",
  "customerPhone": "+998901234567",
  "telegramUsername": "alisher_dev",
  "telegramChatId": "987654321",
  "shippingAddress": "Toshkent sh, Yunusobod tumani, 4-mavze",
  "paymentMethod": "click",
  "notes": "Eshik oldiga yetkazilganda qo'ng'iroq qiling",
  "items": [
    {
      "productId": 4,
      "slug": "hikvision-ds-2cd2143g0-i-4mp-dome-ip-camera",
      "title": "Hikvision DS-2CD2143G0-I 4MP IP Kamera",
      "price": 1250000,
      "quantity": 2
    }
  ]
}
```

#### Javob (Response 200 OK):
```json
{
  "success": true,
  "data": {
    "id": 9,
    "orderNumber": "ORD-20260902-8412",
    "totalAmount": 2800000,
    "status": "NEW",
    "receiptText": "🎉 *BUYURTMA QABUL QILINDI!*\n🔢 *Buyurtma Nomeri:* `ORD-20260902-8412`\n👤 *Xaridor:* Alisher Navoiy\n📞 *Tel:* +998901234567\n📍 *Manzil:* Toshkent sh, Yunusobod tumani, 4-mavze\n💳 *To'lov Turi:* CLICK\n\n🛍 *Buyurtma tarkibi:*\n1. *Hikvision DS-2CD2143G0-I 4MP IP Kamera* — 2 dona x 1 250 000 UZS\n\n💵 *Jami Summa:* *2 800 000 UZS* (QQS 12% kiritilgan)\n⌛ *Holati:* 🟢 Qabul qilindi (Tez orada operator bog'lanadi)"
  }
}
```

---

### 7️⃣ Buyurtma Holatini Tekshirish (Check Status)

Xaridor botda buyurtma nomeri yoki telefon raqamini kiritib, uning holatini (`NEW`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`) bilishi mumkin.

- **URL:** `GET https://api.kontrol.uz/api/bot/orders/check`
- **Query Parametrlari:** `orderNumber=ORD-20260902-8412` yoki `phone=+998901234567`

#### Namuna So'rov (Request):
```http
GET https://api.kontrol.uz/api/bot/orders/check?orderNumber=ORD-20260902-8412
```

#### Javob (Response 200 OK):
```json
{
  "data": [
    {
      "id": 9,
      "orderNumber": "ORD-20260902-8412",
      "customerName": "Alisher Navoiy",
      "totalAmount": 2800000,
      "status": "NEW",
      "createdAt": "2026-09-02T08:15:22.100Z",
      "updatedAt": "2026-09-02T08:15:22.100Z"
    }
  ]
}
```

---

### 8️⃣ Barcha Uskunalar va Mahsulotlarning Yengil Massivi (Cache Endpoint)

Sayt va Bot uchun 10,000 ta tovarli bazada soniyaning ulushida (<50ms) va ultra-yengil hajmgacha (<400KB) keshlangan barcha tovarlar ro'yxati.

- **URL:** `GET https://api.kontrol.uz/api/products/all`
- **Query Parametri:** `locale=uz|ru|en|all`

---

## ⚙️ TELEGRAM BOT DASTURCHISI UCHUN TAVSIYALAR (BEST PRACTICES)

1. **Matnlarni Inline Mode va Bot Xabarida Ishlatish:**
   - `/api/bot/products/:id` javobidagi `telegramMessageText` matni tayyor Telegram Markdown v2 formatida formatlangan. Botingizda `parse_mode='Markdown'` (yoki `HTML`) parametri bilan yuborsangiz yetarli.
2. **Media Rasm Yuborish:**
   - `coverImageUrl` rasm havolasini Telegram `sendPhoto` metodida `photo` parametri sifatida yuboring.
   - `galleryImageUrls` massividagi rasmlarni Telegram `sendMediaGroup` (albom) metodi orqali yuborishingiz mumkin.
3. **Kesh va Tezlik:**
   - Serverimiz in-memory RAM cache bilan ta'minlangan. So'rovlar bir necha millisoniyalarda javob beradi.
