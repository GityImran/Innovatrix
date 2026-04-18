<div align="center">

# 🎓 CampusMart

**The Smart Circular Economy Marketplace for College Students**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://mongoosejs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socketdotio)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-blue)](https://razorpay.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%201.5-orange?logo=google)](https://ai.google.dev/)

> CampusMart is a full-stack campus marketplace where students can **buy, sell, rent, and request** second-hand academic and hostel items — peer-to-peer, within their own college community. Built with a modern dark SaaS design, real-time messaging, AI-powered condition verification, and integrated payments.

</div>

---

PPT : https://canva.link/mdw0hcg524bfk44

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features & Workflows](#features--workflows)
   - [Authentication & College Isolation](#authentication--college-isolation)
   - [Product Listings (Buy & Sell)](#product-listings-buy--sell)
   - [Rental Marketplace](#rental-marketplace)
   - [Community Requests](#community-requests)
   - [Shopping Cart & Checkout](#shopping-cart--checkout)
   - [Real-Time Chat (Socket.IO)](#real-time-chat-socketio)
   - [Seller Dashboard](#seller-dashboard)
   - [Admin Panel](#admin-panel)
   - [AI Condition Verification](#ai-condition-verification)
   - [Fair Price Checker](#fair-price-checker)
   - [Razorpay Payments](#razorpay-payments)
   - [Sustainability Page](#sustainability-page)
5. [Data Models](#data-models)
6. [API Reference](#api-reference)
7. [Environment Variables](#environment-variables)
8. [Project Structure](#project-structure)
9. [Getting Started](#getting-started)
10. [Deployment Notes](#deployment-notes)
11. [Roadmap (Coming Soon)](#roadmap-coming-soon)

---

## Overview

CampusMart solves a real problem: students at the end of every semester are left with textbooks, lab equipment, hostel furniture, and electronics they no longer need — while the next batch desperately needs the same items. Instead of letting these go to waste, CampusMart enables a **closed-loop peer-to-peer economy** within a single campus.

**What makes it different:**
- 🔒 **College-scoped feeds** — you only see items sold by students at your own college
- 🤖 **AI verification** — Gemini 1.5 Flash automatically checks if a product's photo matches the seller's claimed condition
- 💬 **Real-time messaging** — Socket.IO-powered chat between buyer and seller, directly on the platform
- 💳 **Integrated payments** — Razorpay for QR/UPI-on-delivery flow
- 📦 **Rental support** — items can be listed for day/week/month rental, not just sale
- 📢 **Community Requests** — buyers post what they need, sellers respond with matching listings

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.4 (Turbopack) | Full-stack React framework — App Router, RSC, SSR/SSG |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type safety across the entire codebase |
| **Tailwind CSS** | v4 | Utility-first CSS (used selectively alongside CSS Modules) |
| **CSS Modules** | — | Scoped component-level styles |
| **Framer Motion** | ^12 | Page-level and component animations |
| **Recharts** | ^3 | Data visualization in the Seller Dashboard |
| **Lucide React** | ^1.8 | Icon library |
| **date-fns** | ^4 | Date formatting (relative timestamps, calendar display) |

### Backend & Database
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | — | Runtime (via custom `server.js`) |
| **MongoDB** | — | Primary database (cloud-hosted via MongoDB Atlas) |
| **Mongoose** | ^9 | ODM for schema validation and DB interaction |
| **Socket.IO** | ^4 | Real-time bidirectional messaging layer |

### Auth & Security
| Technology | Purpose |
|---|---|
| **NextAuth v5 (beta)** | JWT-based session management, credential authentication |
| **bcryptjs** | Server-side password hashing (never stored in plaintext) |

### Third-Party Services
| Service | Purpose |
|---|---|
| **Cloudinary** | Image upload, storage, and transformation (product photos, ID cards) |
| **Razorpay** | Payment Links, UPI QR code generation, webhook-based confirmation |
| **Google Gemini 1.5 Flash** | AI product condition detection from uploaded images |

---

## Architecture

```
CampusMart/
├── server.js                 ← Custom HTTP server wrapping Next.js + Socket.IO
├── app/                      ← Next.js App Router
│   ├── (auth)/               ← Auth pages group (login, register)
│   ├── api/                  ← REST API Route Handlers
│   ├── components/           ← Shared UI components
│   ├── dashboard/            ← Seller + Admin dashboards
│   ├── product/[id]/         ← Product detail page
│   ├── requests/             ← Community Requests module
│   ├── seller/               ← Seller onboarding & management
│   ├── cart/                 ← Shopping cart
│   ├── chat/                 ← Real-time messaging UI
│   └── page.tsx              ← Landing/home page
├── models/                   ← Mongoose schemas
├── lib/                      ← Auth config, DB connection utilities
├── types/                    ← TypeScript type extensions
└── utils/                    ← Shared helper functions
```

### Request Lifecycle

```
Browser  →  Next.js Middleware (auth check)  →  RSC / Client Component
                                                        ↓
                                              API Route Handler
                                                        ↓
                                              Mongoose → MongoDB Atlas
                                                        ↓
                              Cloudinary (images) / Gemini AI / Razorpay (payments)
```

### Real-Time Messaging

```
Client A  ──── Socket.IO emit("send_message") ──→  server.js
                                                        ↓
                                              Save to MongoDB
                                              Update unread counts
                                                        ↓
Client A & B  ←── io.to(room).emit("receive_message") ─┘
```

---

## Features & Workflows

### Authentication & College Isolation

CampusMart uses **NextAuth v5** with a custom Credentials provider:

1. **Registration** (`/register`):
   - User provides name, email, college (from a curated approved list), and password
   - Password is hashed with **bcryptjs** before being stored
   - Each email must be unique across the platform

2. **Login** (`/login`):
   - Edge-safe config in `lib/auth.config.ts` for middleware usage
   - Full DB + bcrypt validation in `lib/auth.ts` (Node.js only)
   - On success, a **JWT session** is issued (30-day expiry)
   - Session stores: `id`, `email`, `name`, `college`, `isVerified`

3. **College Isolation**:
   - When fetching products on the home page, the query filters by the logged-in user's `college` field
   - Additionally, the legacy `sellerDomain` (derived from email's domain, e.g., `iitb.ac.in`) is matched for backward compatibility
   - Logged-out users see an **all-campus browse mode**

4. **Route Protection** (via `middleware.ts`):
   - `/dashboard/*` requires a valid session, otherwise redirects to `/login`
   - Authenticated users trying to visit `/login` or `/register` are redirected to `/`

---

### Product Listings (Buy & Sell)

**Workflow:**
1. Seller completes KYC (Seller Verification — see Admin Panel section)
2. Seller navigates to `/seller/add-product`
3. Fills out: title, category, description, condition (*new / good / used*), expected price, original price (optional), urgency flag, bundle flag
4. Uploads a photo → stored on **Cloudinary**
5. Photo is sent to **Gemini AI** to verify the condition automatically (`/api/ai/condition`)
6. Listing appears on the home page, filtered to college peers

**Product Features:**
- `isUrgent` flag — surfaces listings higher in home feed sort
- `isBundle` — groups multiple items under a `bundleTitle`
- `aiCondition` — stores AI-detected condition, mismatch flag, and failure flag
- Compound MongoDB index on `sellerDomain + createdAt` for efficient college-scoped queries
- **Status lifecycle:** `active → draft → sold`

**Product Detail Page** (`/product/[id]`):
- Displays price with discount % badge if `originalPrice` is provided
- Shows AI condition verification badge (✅ Verified / ⚠️ Mismatch / ℹ️ Unverified)
- Includes the **Fair Price Checker** component
- Breadcrumb navigation
- Related products section (same category)
- Seller profile snippet (name, email, campus badge)
- Sold-out overlay for inactive listings
- Rental pricing breakdown (day/week/month) if product is a rent item

---

### Rental Marketplace

Items can be listed for **rent** separately from sale:

1. Seller goes to `/seller/rent` and fills a rental form
2. Fields: title, description, category, condition, pricing (per day, optional: per week/month), availability window (from → till), security deposit, negotiation flag
3. Photo uploaded to **Cloudinary**, AI condition check runs
4. Rental items share the same product detail page template — differentiated by `__type: 'rent'`

**Rental-specific model fields (RentItem):**
- `pricing.day` (required), `pricing.week`, `pricing.month` (optional)
- `availability.from` and `availability.till` date range
- `securityDeposit` (optional, shown on product page)
- `allowNegotiation` flag
- **Status lifecycle:** `active → rented → unavailable`

---

### Community Requests

The **Requests** module (`/requests`) allows any student to post what they're looking for, so sellers can respond proactively:

**Workflow:**
1. **Buyer posts a request** at `/requests/new`:
   - Fields: item title, category, budget, preferred condition (New/Good/Used), optional description
   - Request is saved with `status: "open"` and linked to the buyer's user ID

2. **Sellers browse requests** at `/requests`:
   - Grid of open requests with category badges, budget, condition, and poster name
   - "Fulfill" button opens a modal with the seller's active listings
   - Seller selects a listing → a `RequestResponse` is created linking the request to the product

3. **Buyer accepts an offer** at `/requests/[id]`:
   - Buyer sees all seller offers with product thumbnails and prices
   - Clicking "Accept Offer" marks the response as `accepted`, changes request status to `fulfilled`, and redirects to the product page

4. **Status flow:** `open → fulfilled` (or `closed` for manual cancellation)

---

### Shopping Cart & Checkout

1. From any product page, buyer clicks "Add to Cart" (via `ProductActions` client component)
2. Cart is stored in MongoDB per user (`Cart` model)
3. `/cart` page shows all cart items with images, titles, and prices
4. Checkout initiates order creation (`/api/cart/checkout`):
   - Creates an `Order` record per cart item
   - Clears the cart
   - Initial status: `pending`

---

### Real-Time Chat (Socket.IO)

CampusMart runs a **custom Node.js HTTP server** (`server.js`) that wraps Next.js and attaches a **Socket.IO** server to the same port:

**Conversation lifecycle:**
1. Buyer clicks "Message Seller" on a product page
2. A `Conversation` document is created or fetched (unique per buyer+seller+item triple)
3. Buyer is redirected to `/chat/[conversationId]`

**Real-time flow:**
- Client emits `join_conversation` → server joins the socket to the room, resets unread count
- Client emits `send_message` → server saves the `Message` to MongoDB, increments unread count for the other participant, and broadcasts `receive_message` to the room
- Unread badge in the header (`UnreadBadge` component) polls `/api/conversation/unread` for the total count

**Chat features:**
- Inline offer cards — sellers can send a formal price offer from within chat (`/api/chat/offer`)
- Persistent message history loaded on page mount
- Real-time delivery without polling after the initial load

---

### Seller Dashboard

Accessible at `/dashboard` (requires active session + approved seller status):

**Sections:**
| Section | Description |
|---|---|
| **Overview Cards** | Total active listings, total sales revenue, pending orders, chat unread count |
| **Market Analysis** | Recharts bar/line graphs showing listing price distribution, category breakdown, and "Other listings range" comparisons |
| **My Products** | Table of all active/draft listings with quick edit and delete actions |
| **My Rent Items** | Separate table for rental listings with availability and status management |
| **Orders** | `/seller/orders` — incoming orders with buyer info, payment method, and status controls |
| **Earnings** | `/seller/earnings` — revenue breakdown by product, order timeline |
| **Settings** | `/seller/settings` — personal info, payment details, notification preferences |

**Seller onboarding (`/seller/register`):**
- Multi-section form: personal details → college details (course, department, year, roll number) → payment details (bank account + UPI ID)
- Student ID card uploaded to Cloudinary
- Creates a `SellerRequest` with `status: "pending"` awaiting admin approval

---

### Admin Panel

Accessible at `/dashboard/admin` (restricted to admin accounts):

**Sub-pages:**
| Page | Route | Description |
|---|---|---|
| **Overview** | `/dashboard/admin` | Platform-wide statistics |
| **Analytics** | `/dashboard/admin/analytics` | Revenue charts, category breakdowns, active user counts |
| **Seller Verification** | `/dashboard/admin/seller-verification` | Review pending seller applications; view ID cards, bank details; Approve / Reject with a single click |
| **Active Sellers** | `/dashboard/admin/active-sellers` | List of all approved sellers with ability to disable accounts |
| **Settings** | `/dashboard/admin/settings` | Platform configuration flags |

**Admin API routes:**
- `GET /api/admin/stats` — aggregated platform stats
- `GET/POST /api/admin/verification` — list and review seller applications
- `PATCH /api/admin/verification/[id]` — approve or reject a seller
- `GET /api/admin/sellers` — all approved sellers
- `PATCH /api/admin/sellers/[id]` — disable a seller account

---

### AI Condition Verification

**How it works:**

1. When a seller uploads a product image, the frontend calls `POST /api/ai/condition` with the image URL and the seller's claimed condition
2. The API uses **@google/generative-ai** to call **Gemini 1.5 Flash** with the image
3. Gemini returns its assessment of the item's condition (e.g., "good", "used", "new-like")
4. The API compares the AI-detected condition with the seller's claimed condition
5. If there's a mismatch, `mismatch: true` is stored; if Gemini fails, `aiFailed: true` is stored
6. This is saved in the product's `aiCondition` subdocument

**Display on product pages:**
- ✅ `text-emerald-400` — "Condition verified by AI"
- ⚠️ `text-amber-400` — "Condition may differ from listing" + shows both conditions
- ℹ️ `text-slate-400` — "Condition not verified" (AI failed)

---

### Fair Price Checker

The `FairPriceChecker` component appears on both:
- **Product detail pages** (buyer mode) — tells buyers if the price is fair compared to similar listings
- **Seller add-product form** (seller mode) — advises sellers on competitive pricing

**How it works:**
1. Component calls `POST /api/products/similar` with: title, category, condition, price, excludeId
2. The API finds similar products (same category + fuzzy title match) from the DB
3. Returns stats: `avgPrice`, `minPrice`, `maxPrice`, `recommendedRange`, `priceDifferencePercent`, `recommendation`
4. Component color-codes the result:
   - 🟢 Green — price is below market average (good deal)
   - 🟡 Amber — within 10% of market (fair)
   - 🔴 Red — more than 10% above market (consider reducing)

---

### Razorpay Payments

CampusMart uses a **"COD → UPI on delivery"** hybrid flow:

1. Buyer places order with `paymentMethod: "cod"`
2. When the seller goes to deliver, they generate a **Razorpay Payment Link** via the orders dashboard
3. A QR code / link is generated for the buyer to pay via UPI on the spot
4. Razorpay sends a **webhook** to `/api/webhook` on successful payment
5. The webhook updates the order: `status: "paid"`, stores `razorpayPaymentId`

**Order Status Flow:**
```
pending → out_for_delivery → paid → completed
          └──────── cancelled (terminal) ──────┘
```

---

### Sustainability Page

`/sustainability` — An informational page highlighting:
- Environmental impact of the circular economy model
- Stats on waste reduction from peer-to-peer selling
- Tips for eco-friendly campus life

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | 2–100 chars |
| `email` | String | Unique, lowercase, college email |
| `college` | String | From approved list |
| `password` | String | bcrypt-hashed |
| `isVerified` | Boolean | Admin-verified seller flag |

### Product
| Field | Type | Notes |
|---|---|---|
| `sellerId` | ObjectId → User | |
| `sellerDomain` | String | Derived from email domain (legacy) |
| `college` | String | Explicit college name (new) |
| `category` | String | |
| `title` | String | |
| `description` | String | |
| `condition` | Enum | `new / good / used` |
| `originalPrice` | Number | Optional, for discount display |
| `expectedPrice` | Number | Selling price |
| `image` | `{url, public_id}` | Cloudinary hosted |
| `aiCondition` | `{detected, mismatch, aiFailed}` | Gemini AI result |
| `isUrgent` | Boolean | Bumped to top of feed |
| `isBundle` | Boolean | Multiple items |
| `bundleTitle` | String | Optional |
| `status` | Enum | `active / draft / sold` |

### RentItem
All fields from Product, plus:
| Field | Type | Notes |
|---|---|---|
| `pricing` | `{day, week?, month?}` | All in ₹ |
| `availability` | `{from, till}` | Date range |
| `securityDeposit` | Number | Optional |
| `allowNegotiation` | Boolean | |
| `status` | Enum | `active / rented / unavailable` |

### Order
| Field | Type | Notes |
|---|---|---|
| `buyerId` | ObjectId → User | |
| `sellerId` | ObjectId → User | |
| `itemId` | ObjectId | Polymorphic ref |
| `itemModel` | Enum | `Product / RentItem` |
| `orderType` | Enum | `purchase / rent` |
| `totalAmount` | Number | |
| `status` | Enum | `pending / out_for_delivery / paid / completed / cancelled` |
| `paymentMethod` | Enum | `cod / upi / online / cash` |
| `paymentLinkId` | String? | Razorpay Payment Link ID |
| `razorpayPaymentId` | String? | Set by webhook on success |

### Request (Community)
| Field | Type | Notes |
|---|---|---|
| `title` | String | What the buyer needs |
| `category` | String | |
| `budget` | Number | Max willing to pay |
| `condition` | Enum | `New / Good / Used` |
| `description` | String | Optional extra details |
| `userId` | ObjectId → User | The buyer |
| `status` | Enum | `open / fulfilled / closed` |

### RequestResponse
| Field | Type | Notes |
|---|---|---|
| `requestId` | ObjectId → Request | |
| `productId` | ObjectId → Product | Seller's matching listing |
| `sellerId` | ObjectId → User | |
| `offeredPrice` | Number | |
| `status` | Enum | `pending / accepted / rejected` |

### SellerRequest (Verification)
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Unique per user |
| `fullName, email, phoneNumber` | String | Contact info |
| `collegeName, course, department` | String | Academic details |
| `studentStatus` | Enum | `Current Student / Passout` |
| `yearBatch, rollNumber` | String | Optional |
| `idCardPhotoUrl` | String | Cloudinary URL |
| `accountHolderName, accountNumber, ifscCode, upiId` | String | Payment details |
| `status` | Enum | `pending / approved / rejected / disabled` |

### Conversation
| Field | Type | Notes |
|---|---|---|
| `itemId` | ObjectId → Product | |
| `buyerId` | ObjectId → User | |
| `sellerId` | ObjectId → User | |
| `unreadCounts` | Map<userId, number> | Per-user unread tracking |

### Message
| Field | Type | Notes |
|---|---|---|
| `conversationId` | ObjectId → Conversation | |
| `senderId` | ObjectId → User | |
| `message` | String | Plain text content |

### Cart
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | |
| `items` | Array of `{productId, quantity}` | |

---

## API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/register` | Create a new user account |
| POST | `/api/auth/[...nextauth]` | NextAuth session endpoints |

### Products
| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | List products (with college filter) |
| POST | `/api/products` | Create a new product listing |
| GET | `/api/products/[id]` | Get a single product |
| PUT | `/api/products/[id]` | Update a product |
| DELETE | `/api/products/[id]` | Delete a product |
| POST | `/api/products/similar` | Get similar items for Fair Price Checker |

### Rental Items
| Method | Route | Description |
|---|---|---|
| GET | `/api/rent-items` | List all rental listings |
| POST | `/api/rent-items` | Create a rental listing |
| GET | `/api/rent-items/[id]` | Get single rent item |
| PUT | `/api/rent-items/[id]` | Update rent item |
| DELETE | `/api/rent-items/[id]` | Delete rent item |

### Community Requests
| Method | Route | Description |
|---|---|---|
| GET | `/api/requests` | List open requests |
| POST | `/api/requests` | Post a new request |
| GET | `/api/requests/[id]` | Get request details |
| GET | `/api/requests/[id]/responses` | Get all seller responses for a request |
| POST | `/api/requests/respond` | Submit a seller offer for a request |
| POST | `/api/requests/respond/[responseId]/accept` | Accept a seller's offer |

### Cart & Orders
| Method | Route | Description |
|---|---|---|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart` | Add item to cart |
| DELETE | `/api/cart` | Remove item or clear cart |
| POST | `/api/cart/checkout` | Create orders from cart items |
| GET | `/api/orders` | List orders (buyer view) |
| GET | `/api/orders/[id]` | Get order details |

### Seller
| Method | Route | Description |
|---|---|---|
| POST | `/api/seller/register` | Submit seller verification request |
| GET | `/api/seller/products` | Get seller's own product listings |
| GET | `/api/seller/products/[id]` | Get a seller's specific product |
| PUT | `/api/seller/products/[id]` | Update seller product |
| DELETE | `/api/seller/products/[id]` | Delete seller product |
| GET | `/api/seller/rent-items` | Get seller's rental listings |
| GET | `/api/seller/orders` | Get orders received by seller |
| GET | `/api/seller/earnings` | Get seller's earnings breakdown |

### Messaging
| Method | Route | Description |
|---|---|---|
| GET | `/api/conversation` | Get all conversations for user |
| GET | `/api/conversation/unread` | Get total unread message count |
| GET | `/api/messages/[id]` | Get messages in a conversation |
| POST | `/api/chat/offer` | Send a formal price offer in chat |

### AI & Utilities
| Method | Route | Description |
|---|---|---|
| POST | `/api/ai/condition` | Run Gemini AI condition check on a product image |
| GET | `/api/search` | Full-text search across products and rent items |
| POST | `/api/upload` | Upload image to Cloudinary |
| POST | `/api/webhook` | Razorpay payment webhook handler |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform-wide statistics |
| GET | `/api/admin/verification` | List pending seller applications |
| PATCH | `/api/admin/verification/[id]` | Approve or reject a seller application |
| GET | `/api/admin/sellers` | List all approved sellers |
| PATCH | `/api/admin/sellers/[id]` | Disable/enable a seller account |
| POST | `/api/admin/backfill-domains` | Utility to backfill legacy sellerDomain data |

---

## Environment Variables

Create a `.env.local` file in the root:

```env
# ── Database ──────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# ── Auth ──────────────────────────────────────────────────
NEXTAUTH_SECRET=<a long random string, use: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# ── Cloudinary ────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# ── Google Gemini AI ──────────────────────────────────────
GEMINI_API_KEY=<your_gemini_api_key>

# ── Razorpay ──────────────────────────────────────────────
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>

# ── App ───────────────────────────────────────────────────
PORT=3000
NODE_ENV=development
```

---

## Project Structure

```
CampusMart/
│
├── server.js                         # Custom HTTP server: Next.js + Socket.IO
├── proxy.ts                          # Proxy configuration
│
├── app/
│   ├── layout.tsx                    # Root layout (fonts, global styles)
│   ├── page.tsx                      # Home page (college-filtered product feed)
│   ├── globals.css                   # CSS design tokens & global resets
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── api/                          # REST API Route Handlers
│   │   ├── ai/condition/route.ts     # Gemini AI condition check
│   │   ├── auth/[...nextauth]/       # NextAuth endpoints
│   │   ├── admin/                    # Admin-only endpoints
│   │   ├── cart/                     # Cart CRUD + checkout
│   │   ├── chat/offer/               # In-chat price offers
│   │   ├── conversation/             # Conversation management
│   │   ├── messages/[id]/            # Message history
│   │   ├── orders/                   # Order management
│   │   ├── products/                 # Product CRUD + similar items
│   │   ├── register/                 # User registration
│   │   ├── rent-items/               # Rental listing CRUD
│   │   ├── requests/                 # Community requests + responses
│   │   ├── search/                   # Full-text search
│   │   ├── seller/                   # Seller-scoped operations
│   │   ├── upload/                   # Cloudinary upload handler
│   │   └── webhook/                  # Razorpay webhook
│   │
│   ├── components/
│   │   ├── Header/                   # Top navigation bar + SuperCoins chip
│   │   ├── CategoriesNav/            # Action nav (Requests, Trading, Auction, Sustainability)
│   │   ├── Hero/                     # Landing page hero banner
│   │   ├── ProductCarousel/          # Horizontal scrollable product cards
│   │   ├── FairPriceChecker/         # AI-backed price comparison widget
│   │   ├── ProblemStatement/         # Marketing section on landing page
│   │   ├── Footer/                   # Site footer
│   │   └── ...
│   │
│   ├── cart/page.tsx                 # Shopping cart page
│   ├── chat/                         # Real-time chat UI
│   ├── dashboard/                    # Seller & admin dashboards
│   ├── product/[id]/                 # Product detail page (buy + rent)
│   ├── requests/                     # Community requests module
│   │   ├── page.tsx                  # Request listing
│   │   ├── RequestsList.tsx          # Client-side request cards grid
│   │   ├── [id]/page.tsx             # Request detail + seller offers
│   │   ├── [id]/RequestDetails.tsx   # Interactive detail client component
│   │   └── new/                      # Post a new request form
│   ├── search/page.tsx               # Search results page
│   ├── seller/                       # Seller management pages
│   └── sustainability/               # Sustainability information page
│
├── models/                           # Mongoose document schemas
│   ├── User.ts
│   ├── Product.ts
│   ├── RentItem.ts
│   ├── Order.ts
│   ├── Cart.ts
│   ├── Conversation.ts
│   ├── Message.ts
│   ├── Request.ts
│   ├── RequestResponse.ts
│   └── SellerRequest.ts
│
├── lib/
│   ├── auth.ts                       # Full NextAuth config (Node.js runtime)
│   ├── auth.config.ts                # Edge-safe shell auth config
│   └── mongodb.ts                    # Mongoose connection singleton
│
├── types/                            # TypeScript declaration augmentations
├── utils/                            # Shared helper functions
└── public/                           # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A MongoDB Atlas account (free tier works)
- A Cloudinary account (free tier works)
- A Google AI Studio account (Gemini API key)
- A Razorpay account (for payments)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/CampusMart.git
cd CampusMart

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables section)

# 4. Start the development server
npm run dev
```

> **Note:** `npm run dev` starts the **custom `server.js`** (not `next dev`) to enable Socket.IO support on the same port.

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `node server.js` | Development server with Socket.IO (hot reload) |
| `build` | `next build` | Production build (Turbopack) |
| `start` | `next start` | Start production Next.js server |
| `lint` | `eslint` | Run ESLint across the project |

### First-Time Setup
1. Register an account at `http://localhost:3000/register`
2. To create an admin account, manually set a user's `isVerified: true` in MongoDB and add an admin flag (or use the first registered account as admin in your dev environment)
3. Apply for seller access at `/seller/register`
4. Approve your own seller application via `/dashboard/admin/seller-verification`
5. Add your first product listing at `/seller/add-product`

---

## Deployment Notes

- The custom `server.js` is **required** for Socket.IO to work — standard Next.js serverless deployment (Vercel) will **not** support the WebSocket connection
- Deploy to a **VPS / container** (e.g., AWS EC2, Railway, Render, DigitalOcean Droplet) where a persistent Node.js process can run
- Set all environment variables in your hosting provider's dashboard
- MongoDB Atlas allows-listing: whitelist your server's IP (or use `0.0.0.0/0` for dev)
- Cloudinary free tier: 25GB storage, 25GB monthly bandwidth — sufficient for initial scale
- Razorpay webhooks: configure the webhook URL to `https://your-domain.com/api/webhook`

---

## Roadmap (Coming Soon)

| Feature | Status |
|---|---|
| **Trading** — peer-to-peer item swap/exchange system | 🚧 Coming Soon |
| **Auction** — timed competitive bidding on rare campus items | 🚧 Coming Soon |
| **SuperCoins** — campus loyalty reward points & redemption | 💡 Planned |
| Push notifications for chat messages | 💡 Planned |
| Mobile app (React Native) | 💡 Planned |
| Multi-image product listings | 💡 Planned |
| Bundle deal creation UI | 💡 Planned |

---

<div align="center">

**Built with ❤️ by the Deep-Fried Devs team**

*Making campus life a little smarter, one listing at a time.*

</div>
