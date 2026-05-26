<div align="center">

# 🎓 CampusMart

**The Smart Circular Economy Marketplace for College Students**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://mongoosejs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socketdotio)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-blue)](https://razorpay.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5-orange?logo=google)](https://ai.google.dev/)

> CampusMart is a full-stack campus marketplace where students can **buy, sell, trade, rent, and request** second-hand academic and hostel items — peer-to-peer, within their own college community. Built with a premium dark SaaS design, real-time messaging, AI-powered condition verification, live auctions, mutual trade agreements, integrated payments, and a sustainability impact tracker.

</div>

---

🎨 **Design System:** Premium dark-mode glassmorphic UI with animated sidebar navigation, smooth-scroll category browsing, ambient glow effects, and micro-animations throughout.

📊 **Presentation:** https://canva.link/mdw0hcg524bfk44

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features & Workflows](#features--workflows)
   - [Authentication & College Isolation](#authentication--college-isolation)
   - [Product Listings (Buy & Sell)](#product-listings-buy--sell)
   - [Rental Marketplace](#rental-marketplace)
   - [Community Requests](#community-requests)
   - [Campus Trading Hub](#campus-trading-hub)
   - [Live Auction System](#live-auction-system)
   - [Shopping Cart & Checkout](#shopping-cart--checkout)
   - [Real-Time Chat (Socket.IO)](#real-time-chat-socketio)
   - [Seller Dashboard](#seller-dashboard)
   - [Admin Panel](#admin-panel)
   - [AI Condition Verification](#ai-condition-verification)
   - [Fair Price Checker](#fair-price-checker)
   - [Razorpay Payments](#razorpay-payments)
   - [Sustainability Dashboard](#sustainability-dashboard)
   - [SuperCoins Loyalty System](#supercoins-loyalty-system)
5. [Data Models](#data-models)
6. [API Reference](#api-reference)
7. [Environment Variables](#environment-variables)
8. [Project Structure](#project-structure)
9. [Getting Started](#getting-started)
10. [Deployment Notes](#deployment-notes)

---

## Overview

CampusMart solves a real problem: students at the end of every semester are left with textbooks, lab equipment, hostel furniture, and electronics they no longer need — while the next batch desperately needs the same items. Instead of letting these go to waste, CampusMart enables a **closed-loop peer-to-peer economy** within a single campus.

**What makes it different:**
- 🔒 **College-scoped feeds** — you only see items from students at your own college
- 🔁 **Mutual Trade System** — negotiate item-for-item swaps with a two-sided meeting confirmation flow
- ⚖️ **Live Auctions** — timed competitive bidding with real-time bid tracking and auto-end logic
- 🤖 **AI verification** — Gemini 2.5 Flash checks if a product photo matches the seller's claimed condition
- 💬 **Real-time messaging** — Socket.IO chat between buyer and seller with inline price offers
- 💳 **Integrated payments** — Razorpay for QR/UPI-on-delivery flow
- 📦 **Rental support** — items can be listed for daily/weekly/monthly rental, not just sale
- 📢 **Community Requests** — buyers post what they need, sellers respond proactively
- 🌱 **Sustainability tracker** — real-time CO₂ savings and waste reduction impact metrics
- 🪙 **SuperCoins** — campus loyalty reward points visible in the header

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.4 (Turbopack) | Full-stack React framework — App Router, RSC, SSR/SSG |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Strict type safety across the entire codebase |
| **Tailwind CSS** | v4 | Utility-first CSS (used selectively alongside CSS Modules) |
| **CSS Modules** | — | Scoped component-level styling |
| **Framer Motion** | ^12 | Page-level and component animations (Sustainability page) |
| **Recharts** | ^3 | Data visualization — Seller Dashboard market analysis + Sustainability charts |
| **Lucide React** | ^1.8 | Icon library |
| **date-fns** | ^4 | Date formatting (relative timestamps, calendar display) |
| **cobe** | ^2 | 3D globe render on the Sustainability page |

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
| **Google Gemini 2.5 Flash** | AI product condition detection from uploaded images |

---

## Architecture

```
CampusMart/
├── server.js                 ← Custom HTTP server wrapping Next.js + Socket.IO
├── proxy.ts                  ← Middleware proxy configuration
├── app/                      ← Next.js App Router
│   ├── (auth)/               ← Auth pages group (login, register)
│   ├── api/                  ← REST API Route Handlers
│   ├── components/           ← Shared UI components (Header, Sidebar, Hero, etc.)
│   ├── dashboard/            ← Seller + Admin dashboards
│   ├── product/[id]/         ← Product detail page
│   ├── requests/             ← Community Requests module
│   ├── trade/                ← Campus Trading Hub (mutual swap system)
│   ├── auctions/             ← Live Auction listing page
│   ├── auction/[id]/         ← Individual auction detail with live bidding
│   ├── seller/               ← Seller onboarding & management
│   ├── cart/                 ← Shopping cart
│   ├── chat/                 ← Real-time messaging UI
│   ├── sustainability/       ← Eco-impact dashboard
│   └── page.tsx              ← Landing/home page with category feed
├── models/                   ← Mongoose schemas (14 models)
├── lib/                      ← Auth config, DB connection, AI, scroll utilities
├── types/                    ← TypeScript type extensions (NextAuth session)
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

### Real-Time Messaging (Socket.IO)

```
Client A  ──── emit("send_message") ──→  server.js (Socket.IO attached)
                                                  ↓
                                        Save Message to MongoDB
                                        Increment unread count for recipient
                                                  ↓
Client A & B  ←── io.to(room).emit("receive_message") ─┘
```

### Landing Page Architecture

The home page (`/`) uses a premium dark-mode glassmorphic layout:
- **Fixed Glassmorphic Sidebar** — collapses to 68px (icon-only) and expands to 260px on hover; links to Requests, Trading, Auction, Sustainability
- **Categories Nav Bar** — smooth-scroll anchor links to category carousels (Lab Equipment, Electronics, Hostel Supplies, Furniture, Books, Others) using a custom 1.5s quintic-easing animation
- **College-scoped Product Carousels** — dynamic sections per product category, filtered to the user's college
- **Ambient Glow Orbs** — two fixed radial-gradient overlays (amber + blue) that deliver atmospheric depth

---

## Features & Workflows

### Authentication & College Isolation

CampusMart uses **NextAuth v5** with a custom Credentials provider:

1. **Registration** (`/register`):
   - User provides name, college email, college (from curated list), and password
   - Password is hashed with **bcryptjs** before being stored
   - Each email must be unique across the platform

2. **Login** (`/login`):
   - Edge-safe config in `lib/auth.config.ts` for middleware usage
   - Full DB + bcrypt validation in `lib/auth.ts` (Node.js only)
   - On success, a **JWT session** is issued (30-day expiry)
   - Session stores: `id`, `email`, `name`, `college`, `isVerified`

3. **College Isolation**:
   - Home page queries filter by the logged-in user's `college` field
   - Legacy `sellerDomain` (email domain e.g. `iitb.ac.in`) matched for backward compatibility
   - Logged-out users see an all-campus browse mode

4. **Route Protection** (via `middleware.ts`):
   - `/dashboard/*` requires a valid session, redirects to `/login`
   - Authenticated users visiting `/login` or `/register` are redirected to `/`

---

### Product Listings (Buy & Sell)

**Workflow:**
1. Seller completes KYC (Seller Verification — see Admin Panel)
2. Seller navigates to `/seller/add-product`
3. Fills out: title, category, description, condition (*new / good / used*), expected price, original price (optional), urgency flag, bundle flag, trade-enabled flag, trade preferences
4. Uploads a photo → stored on **Cloudinary**
5. AI condition check runs automatically (`POST /api/ai/condition`)
6. Listing appears on the home page under the correct category carousel, filtered to college peers

**Product Features:**
- `isUrgent` — surfaces listings higher in home feed sort
- `isBundle` — groups multiple items under a `bundleTitle`
- `isTradeEnabled` — marks item as available for peer-to-peer trade offers
- `tradePreferences` — seller specifies what they'd accept in a swap
- `aiCondition` — stores AI-detected condition, mismatch flag, and failure flag
- **Status lifecycle:** `active → draft → sold`

**Product Detail Page** (`/product/[id]`):
- Price with discount % badge if `originalPrice` is provided
- AI condition verification badge (✅ Verified / ⚠️ Mismatch / ℹ️ Unverified)
- **Fair Price Checker** component
- Breadcrumb navigation
- Related products section (same category)
- Seller profile snippet (name, email, campus badge)
- Sold-out overlay for inactive listings
- Rental pricing breakdown if it's a rental listing

---

### Rental Marketplace

Items can be listed for **rent** separately from sale:

1. Seller goes to `/seller/rent` and fills a rental form
2. Fields: title, description, category, condition, pricing (per day; optional: per week/month), availability window (from → till), security deposit, negotiation flag
3. Photo uploaded to **Cloudinary**, AI condition check runs
4. Rental items share the product detail page (`/product/[id]`) — differentiated by `__type: 'rent'`

**RentItem-specific model fields:**
- `pricing.day` (required), `pricing.week`, `pricing.month` (optional)
- `availability.from` and `availability.till` date range
- `securityDeposit` (optional, shown on product page)
- `allowNegotiation` flag
- **Status lifecycle:** `active → rented → unavailable`

---

### Community Requests

The **Requests** module (`/requests`) lets any student post what they're looking for:

**Workflow:**
1. **Buyer posts a request** at `/requests/new`:
   - Fields: item title, category, budget, preferred condition (New/Good/Used), optional description
   - Request saved with `status: "open"` linked to the buyer's user ID

2. **Sellers browse requests** at `/requests`:
   - Grid of open requests with category badges, budget, condition, and poster name
   - Separated into "My Requests" (own posts) and "Requests from Other Students"
   - "Fulfill" button opens a modal with the seller's active listings

3. **Buyer accepts an offer** at `/requests/[id]`:
   - Buyer sees all seller offers with product thumbnails and prices
   - Clicking "Accept Offer" marks the response as `accepted`, changes request status to `fulfilled`, and redirects to the product page

4. **Notification system:** Buyers receive a bell notification if there are unread offer responses for their requests

**Status flow:** `open → fulfilled` (or `closed` for manual cancellation)

---

### Campus Trading Hub

`/trade` — A fully operational mutual item-swap system where students negotiate directly.

**Workflow:**
1. Seller enables `isTradeEnabled` on their listing and optionally specifies `tradePreferences`
2. Interested student browses the **Browse Items** tab and clicks "Propose Trade"
3. Student selects one or more of their own products to offer, plus optional cash top-up (₹)
4. A `Trade` document is created: `status: "pending"`
5. Product owner sees the offer in the **Received** tab and can **Accept** or **Reject**
6. On acceptance, both parties can **Propose a Meeting** (place + time) — a two-sided negotiation flow:
   - Proposer sets place + time → `meetingDetails.status: "pending"`
   - Other party can **Accept**, **Reject**, or **Counter Propose** with different details
   - Only when both users have accepted does the meeting become confirmed
   - Trade status advances to `"scheduled"` once meeting is confirmed
7. After the physical exchange, either party can **Mark Complete** → `status: "completed"`

**Trade Model:**
- `requesterId` / `ownerId` — the two parties
- `requestedProductId` — the product being requested
- `offeredProductIds[]` — products offered in exchange
- `cashOffered` — optional cash top-up
- `meetingDetails` — `{ proposedBy, place, time, status, acceptedBy[] }`
- Compound index to prevent duplicate pending trades for the same product pair

**API Routes:**
- `GET /api/trade` — list user's trades
- `POST /api/trade/create` — propose a trade
- `POST /api/trade/respond` — accept or reject a trade
- `POST /api/trade/propose-meeting` — propose a meeting time
- `POST /api/trade/accept-meeting` — accept the current proposal
- `POST /api/trade/reject-meeting` — reject and reset for counter-proposal
- `POST /api/trade/complete` — mark trade as completed
- `GET /api/trade/my-products` — fetch your tradeable listings

---

### Live Auction System

`/auctions` and `/auction/[id]` — Timed competitive bidding on campus items.

**Workflow:**
1. Sellers create auctions at `/seller/auctions/create`:
   - Fields: product title, description, category, condition, multi-image upload (Cloudinary), starting price, minimum bid increment, optional reserve price, end time
2. Live listings appear on the `/auctions` page sorted by soonest to end
3. Buyers place bids on `/auction/[id]`:
   - Each bid must exceed `currentBid + minIncrement`
   - `currentBid` and `highestBidderId` update on every valid bid
4. When `endTime` is reached, a background check (`updateMany`) auto-marks auctions as `"ended"`
5. Highest bidder gets a **Won Auctions** section on the auctions page

**Auction Model:**
- `productTitle`, `description`, `category`, `condition`
- `images[]` — multiple Cloudinary URLs
- `startingPrice`, `currentBid`, `highestBidderId`
- `minIncrement`, `reservePrice` (optional)
- `endTime`, `status` — `active → ended → sold`

**Bid Model:**
- `auctionId`, `bidderId`, `amount`, `timestamp`

**API Routes:**
- `GET /api/auctions` — list auctions (auto-ends expired ones)
- `POST /api/auctions/create` — create a new auction
- `GET /api/auctions/[id]` — get auction details with bids
- `POST /api/auctions/bid` — place a bid
- `POST /api/auctions/[id]/end` — manually end an auction
- `POST /api/auctions/[id]/purchase` — purchase flow for won auction

---

### Shopping Cart & Checkout

1. From any product page, buyer clicks "Add to Cart" (via `AddToCartButton` component)
2. Cart stored in MongoDB per user (`Cart` model)
3. `/cart` page shows all cart items with images, titles, and prices
4. Checkout initiates order creation (`POST /api/cart/checkout`):
   - Creates an `Order` record per cart item
   - Clears the cart
   - Initial status: `pending`

---

### Real-Time Chat (Socket.IO)

CampusMart runs a **custom Node.js HTTP server** (`server.js`) that wraps Next.js and attaches a **Socket.IO** server:

**Conversation lifecycle:**
1. Buyer clicks "Message Seller" on a product page
2. A `Conversation` document is created or fetched (unique per buyer+seller+item triple)
3. Buyer redirected to `/chat/[conversationId]`

**Real-time flow:**
- Client emits `join_conversation` → server joins socket to room, resets unread count
- Client emits `send_message` → server saves `Message` to MongoDB, increments unread count for the other participant, broadcasts `receive_message` to the room
- Unread badge in the header (`UnreadBadge` component) polls `/api/conversation/unread` for the total count

**Chat features:**
- Inline offer cards — sellers can send formal price offers from chat (`/api/chat/offer`)
- Persistent message history loaded on page mount
- Real-time delivery without polling after the initial load

---

### Seller Dashboard

Accessible at `/dashboard` (requires active session + approved seller status):

**Sections:**
| Section | Description |
|---|---|
| **Overview Cards** | Total active listings, total sales revenue, pending orders, chat unread count |
| **Market Analysis** | Recharts bar/line graphs — listing price distribution, category breakdown, "Other listings range" comparisons |
| **My Products** | Table of active/draft listings with quick edit and delete |
| **My Rent Items** | Separate table for rental listings with availability and status management |
| **My Auctions** | `/seller/auctions` — mange created auctions; create new with multi-image upload |
| **Orders** | `/seller/orders` — incoming orders with buyer info, payment method, status controls |
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
| **Seller Verification** | `/dashboard/admin/seller-verification` | Review pending seller applications; view ID cards, bank details; Approve / Reject |
| **Active Sellers** | `/dashboard/admin/active-sellers` | All approved sellers with ability to disable accounts |
| **Settings** | `/dashboard/admin/settings` | Platform configuration flags |

**Admin API routes:**
- `GET /api/admin/stats` — aggregated platform stats
- `GET/POST /api/admin/verification` — list and review seller applications
- `PATCH /api/admin/verification/[id]` — approve or reject a seller
- `GET /api/admin/sellers` — all approved sellers
- `PATCH /api/admin/sellers/[id]` — disable a seller account
- `POST /api/admin/backfill-domains` — utility to backfill legacy sellerDomain data

---

### AI Condition Verification

**How it works:**
1. Seller uploads a product image → frontend calls `POST /api/ai/condition` with the image URL and claimed condition
2. API uses **@google/generative-ai** (Gemini 2.5 Flash) to analyze the image
3. Gemini returns its assessment (e.g., "good", "used", "new-like")
4. API compares AI-detected condition with seller's claimed condition
5. If mismatch: `mismatch: true` stored; if Gemini fails: `aiFailed: true` stored
6. A real-time alert appears **below the Photos section** in the add-product form if a mismatch is detected
7. Saved in the product's `aiCondition` subdocument

**Display on product pages:**
- ✅ Emerald — "Condition verified by AI"
- ⚠️ Amber — "Condition may differ from listing" + shows both conditions
- ℹ️ Slate — "Condition not verified" (AI failed or not run)

---

### Fair Price Checker

Appears on both product detail pages (buyer mode) and the add-product form (seller mode):

**How it works:**
1. Calls `POST /api/products/similar` with title, category, condition, price, excludeId
2. API finds similar products (same category + fuzzy title match) from DB
3. Returns: `avgPrice`, `minPrice`, `maxPrice`, `recommendedRange`, `priceDifferencePercent`, `recommendation`
4. Color-coded result:
   - 🟢 Green — below market average (good deal for buyers)
   - 🟡 Amber — within 10% of market (fair)
   - 🔴 Red — more than 10% above market (consider reducing)

---

### Razorpay Payments

CampusMart uses a **"COD → UPI on delivery"** hybrid flow:

1. Buyer places order with `paymentMethod: "cod"`
2. When seller prepares to deliver, they generate a **Razorpay Payment Link** from the orders dashboard
3. A QR code / link is generated for the buyer to pay via UPI on the spot
4. Razorpay sends a **webhook** to `/api/webhook/razorpay` on successful payment
5. The webhook updates the order: `status: "paid"`, stores `razorpayPaymentId`

**Order Status Flow:**
```
pending → out_for_delivery → paid → completed
          └──────── cancelled (terminal) ──────┘
```

---

### Sustainability Dashboard

`/sustainability` — A rich, animated dashboard powered by Framer Motion, Recharts, and the `cobe` 3D globe that showcases the environmental impact of peer-to-peer resale:

**Features:**
- **Live Stats**: Total items listed, estimated CO₂ saved (kg), waste diverted (kg), money saved (₹) — calculated from real product data via `lib/sustainability.ts`
- **Category-wise Impact Charts**: Bar chart showing CO₂ savings broken down by product category
- **Cumulative Impact Line Chart**: Month-over-month growth in CO₂ savings
- **Sustainability Score**: Animated progress metric for the campus community
- **Eco Suggestions**: Contextual tips based on current platform data
- **3D Globe** (`cobe`): Renders an interactive Earth to visualize the global context of local sustainability actions
- **Recyclability Pie Chart**: Visual breakdown of item types by recyclability

**Data Source:** `lib/productStore.ts` and `lib/sustainability.ts` compute stats from real listings, not mock data.

---

### SuperCoins Loyalty System

CampusMart implements a **campus loyalty program**:
- Every user has a `superCoins` balance tracked in the `User` model
- The **CampusCoins chip** (🪙 icon + balance) is displayed in the top navigation header for all logged-in users
- Balance is fetched server-side in the `Header` component on every page load
- Infrastructure is in place for coins to be awarded on purchases and redeemed for discounts

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
| `superCoins` | Number | Campus loyalty points (default: 0) |

### Product
| Field | Type | Notes |
|---|---|---|
| `sellerId` | ObjectId → User | |
| `sellerDomain` | String | Derived from email domain (legacy) |
| `college` | String | Explicit college name (new) |
| `category` | String | Lab Equipment, Electronics, etc. |
| `title` | String | |
| `description` | String | |
| `condition` | Enum | `new / good / used` |
| `originalPrice` | Number | Optional, for discount display |
| `expectedPrice` | Number | Selling price |
| `image` | `{url, public_id}` | Cloudinary hosted |
| `aiCondition` | `{detected, mismatch, aiFailed}` | Gemini AI result |
| `isUrgent` | Boolean | Bumped to top of feed |
| `isBundle` | Boolean | Multiple items grouped |
| `bundleTitle` | String | Optional |
| `isTradeEnabled` | Boolean | Available for peer trade offers |
| `tradePreferences` | String[] | What the seller wants in exchange |
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

### Trade
| Field | Type | Notes |
|---|---|---|
| `requesterId` | ObjectId → User | The party proposing the swap |
| `ownerId` | ObjectId → User | The party receiving the proposal |
| `requestedProductId` | ObjectId → Product | Product being requested |
| `offeredProductIds` | ObjectId[] → Product | Products offered in return |
| `cashOffered` | Number | Optional cash top-up (₹) |
| `status` | Enum | `pending / accepted / rejected / scheduled / completed` |
| `meetingDetails` | `{proposedBy, place, time, status, acceptedBy[]}` | Two-sided meeting negotiation |

### Auction
| Field | Type | Notes |
|---|---|---|
| `productTitle` | String | |
| `description` | String | |
| `category` | String | |
| `condition` | Enum | `New / Good / Used` |
| `images` | String[] | Multiple Cloudinary URLs |
| `sellerId` | ObjectId → User | |
| `startingPrice` | Number | |
| `currentBid` | Number | Updates on every valid bid |
| `highestBidderId` | ObjectId → User | Optional |
| `minIncrement` | Number | Minimum raise per bid |
| `reservePrice` | Number | Optional minimum to sell |
| `endTime` | Date | Auction deadline |
| `status` | Enum | `active / ended / sold` |

### Bid
| Field | Type | Notes |
|---|---|---|
| `auctionId` | ObjectId → Auction | |
| `bidderId` | ObjectId → User | |
| `amount` | Number | |

### Order
| Field | Type | Notes |
|---|---|---|
| `buyerId` | ObjectId → User | |
| `sellerId` | ObjectId → User | |
| `itemId` | ObjectId | Polymorphic ref |
| `itemModel` | Enum | `Product / RentItem / Auction` |
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
| `type` | Enum | `text / offer` |

### Cart
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | |
| `items` | Array of `{productId, quantity, itemModel}` | |

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
| POST | `/api/requests/respond/[responseId]/reject` | Reject a seller's offer |

### Trading
| Method | Route | Description |
|---|---|---|
| GET | `/api/trade` | List user's trades (sent + received) |
| POST | `/api/trade/create` | Propose a new trade |
| POST | `/api/trade/respond` | Accept or reject a trade |
| POST | `/api/trade/propose-meeting` | Propose a meeting (place + time) |
| POST | `/api/trade/accept-meeting` | Accept the current meeting proposal |
| POST | `/api/trade/reject-meeting` | Reject proposal (allows counter-proposal) |
| POST | `/api/trade/complete` | Mark trade as completed |
| GET | `/api/trade/my-products` | Fetch caller's tradeable listings |
| POST | `/api/trade/schedule` | Legacy schedule endpoint (mapped to new flow) |

### Auctions
| Method | Route | Description |
|---|---|---|
| GET | `/api/auctions` | List auctions (auto-ends expired) |
| POST | `/api/auctions/create` | Create a new auction |
| GET | `/api/auctions/[id]` | Get auction + bid history |
| POST | `/api/auctions/bid` | Place a bid |
| POST | `/api/auctions/[id]/end` | Manually end an auction |
| POST | `/api/auctions/[id]/purchase` | Purchase flow for won auction |

### Cart & Orders
| Method | Route | Description |
|---|---|---|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart` | Add item to cart |
| DELETE | `/api/cart` | Remove item or clear cart |
| POST | `/api/cart/checkout` | Create orders from cart items |
| GET | `/api/orders` | List orders (buyer view) |
| GET | `/api/orders/[id]` | Get order details |
| POST | `/api/orders/[id]/confirm` | Confirm order receipt |
| POST | `/api/orders/[id]/complete` | Mark order complete |
| POST | `/api/orders/[id]/start-delivery` | Mark order out for delivery |
| POST | `/api/orders/[id]/generate-payment-link` | Generate Razorpay Payment Link |
| GET | `/api/order-status/[id]` | Public order status lookup |

### Seller
| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/seller/register` | Submit / check seller verification request |
| GET | `/api/seller/products` | Get seller's product listings |
| GET | `/api/seller/products/[id]` | Get a seller's specific product |
| PUT | `/api/seller/products/[id]` | Update seller product |
| DELETE | `/api/seller/products/[id]` | Delete seller product |
| GET | `/api/seller/rent-items` | Get seller's rental listings |
| GET/PUT/DELETE | `/api/seller/rent-items/[id]` | Manage a specific rental listing |
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
| POST | `/api/webhook/razorpay` | Razorpay payment webhook handler |

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

Create a `.env.local` file in the project root:

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
├── server.js                         # Custom HTTP server: Next.js + Socket.IO on the same port
├── proxy.ts                          # Middleware proxy configuration
│
├── app/
│   ├── layout.tsx                    # Root layout (fonts, global styles)
│   ├── page.tsx                      # Home page (college-filtered product carousels + sidebar)
│   ├── globals.css                   # CSS design tokens, global resets, smooth-scroll
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── api/                          # REST API Route Handlers
│   │   ├── ai/condition/route.ts     # Gemini AI condition check
│   │   ├── auth/[...nextauth]/       # NextAuth endpoints
│   │   ├── admin/                    # Admin-only endpoints (stats, verification, sellers)
│   │   ├── auctions/                 # Auction CRUD, bidding, end, purchase
│   │   ├── cart/                     # Cart CRUD + checkout
│   │   ├── chat/offer/               # In-chat price offers
│   │   ├── conversation/             # Conversation management + unread counts
│   │   ├── messages/[id]/            # Message history per conversation
│   │   ├── order-status/[id]/        # Public order status lookup
│   │   ├── orders/                   # Order management (confirm, complete, delivery, payment link)
│   │   ├── products/                 # Product CRUD + similar items
│   │   ├── register/                 # User registration
│   │   ├── rent-items/               # Rental listing CRUD
│   │   ├── requests/                 # Community requests + responses (accept/reject)
│   │   ├── search/                   # Full-text search
│   │   ├── seller/                   # Seller-scoped operations (products, rent, orders, earnings)
│   │   ├── trade/                    # Trade lifecycle (create, respond, meeting, complete)
│   │   ├── upload/                   # Cloudinary upload handler
│   │   └── webhook/razorpay/         # Razorpay payment webhook
│   │
│   ├── components/
│   │   ├── Header/                   # Top navigation bar + SuperCoins chip + cart count
│   │   ├── Sidebar/                  # Collapsible glassmorphic sidebar (landing only)
│   │   ├── CategoriesNav/            # Category scroll-nav (Lab Equipment, Books, etc.)
│   │   ├── Hero/                     # Landing page hero banner with animated CTA
│   │   ├── ProductCarousel/          # Horizontal scrollable product cards
│   │   ├── Auction/                  # AuctionCard component (bidding UI)
│   │   ├── FairPriceChecker/         # Market price comparison widget
│   │   ├── NegotiationModal/         # Price negotiation modal in chat
│   │   ├── AddToCartButton/          # Client-side add-to-cart button
│   │   ├── ProblemStatement/         # Marketing section on landing page
│   │   ├── EcoLayout/                # Layout wrapper for sustainability page
│   │   ├── CallToAction/             # Reusable CTA component
│   │   ├── Footer/                   # Site footer
│   │   ├── AdminTopbar.tsx           # Admin dashboard top bar
│   │   └── Table.tsx                 # Reusable data table component
│   │
│   ├── about/                        # About page
│   ├── auction/[id]/                 # Individual auction detail + live bidding
│   ├── auctions/                     # Auction listings page
│   ├── cart/page.tsx                 # Shopping cart page
│   ├── chat/                         # Real-time chat UI (list + conversation)
│   ├── contact/                      # Contact page
│   ├── dashboard/                    # Seller & admin dashboards
│   ├── orders/                       # Buyer orders page
│   ├── privacy/                      # Privacy policy page
│   ├── product/[id]/                 # Product detail page (buy + rent)
│   ├── requests/                     # Community requests module
│   │   ├── page.tsx                  # Request listing (My Requests + Others)
│   │   ├── RequestsClient.tsx        # Interactive request list + notifications
│   │   ├── RequestsList.tsx          # Request card grid component
│   │   ├── [id]/page.tsx             # Request detail + seller offers
│   │   ├── [id]/RequestDetails.tsx   # Interactive detail client component
│   │   └── new/page.tsx              # Post a new request form
│   ├── search/page.tsx               # Search results page
│   ├── seller/                       # Seller management pages
│   │   ├── page.tsx                  # Seller overview dashboard
│   │   ├── add-product/              # Add product form (with AI condition check)
│   │   ├── auctions/                 # Seller auction management
│   │   ├── auctions/create/          # Create new auction form
│   │   ├── earnings/                 # Earnings breakdown
│   │   ├── orders/                   # Seller's received orders
│   │   ├── products/                 # Seller product list
│   │   ├── register/                 # KYC / seller onboarding form
│   │   ├── rent/                     # Add rental listing
│   │   └── settings/                 # Seller settings
│   ├── sustainability/               # Eco-impact dashboard with Framer Motion + Recharts + cobe globe
│   └── trade/                        # Campus Trading Hub (mutual swap system)
│       ├── page.tsx                  # Server wrapper
│       └── TradeClient.tsx           # Full trade UI (browse + sent + received + completed)
│
├── models/                           # Mongoose document schemas (14 total)
│   ├── User.ts                       # + superCoins field
│   ├── Product.ts                    # + isTradeEnabled, tradePreferences
│   ├── RentItem.ts
│   ├── Order.ts
│   ├── Cart.ts
│   ├── Conversation.ts
│   ├── Message.ts
│   ├── Request.ts
│   ├── RequestResponse.ts
│   ├── SellerRequest.ts
│   ├── Trade.ts                      # Two-sided swap with meetingDetails negotiation
│   ├── Auction.ts                    # Timed bidding with multi-image support
│   ├── Bid.ts                        # Individual auction bids
│   └── Notification.ts               # Platform notification system
│
├── lib/
│   ├── auth.ts                       # Full NextAuth config (Node.js runtime)
│   ├── auth.config.ts                # Edge-safe shell auth config
│   ├── mongodb.ts                    # Mongoose connection singleton
│   ├── aiCondition.ts                # Gemini API helper
│   ├── gemini.ts                     # Gemini client initialization
│   ├── cloudinary.ts                 # Cloudinary client
│   ├── razorpay.ts                   # Razorpay client
│   ├── sustainability.ts             # CO₂/waste stats calculation logic
│   ├── productStore.ts               # Product data access helper for sustainability
│   ├── scroll.ts                     # Custom slow-scroll utility (1.5s quintic easing)
│   ├── mockProducts.ts               # Fallback mock data for empty catalog
│   └── socket.ts                     # Socket.IO client singleton
│
├── types/                            # TypeScript declaration augmentations (NextAuth session)
├── utils/                            # Shared helper functions
└── public/                           # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A MongoDB Atlas account (free tier works)
- A Cloudinary account (free tier: 25GB storage)
- A Google AI Studio account (Gemini API key)
- A Razorpay account (for payment links)

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

> **Note:** `npm run dev` starts the **custom `server.js`** (not `next dev`) to enable Socket.IO support on the same port. The server runs Next.js + Socket.IO together.

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `node server.js` | Development server with Socket.IO + hot reload |
| `build` | `next build` | Production build (Turbopack) |
| `start` | `next start` | Start production Next.js server |
| `lint` | `eslint` | Run ESLint across the project |

### First-Time Setup
1. Register an account at `http://localhost:3000/register`
2. To create an admin account, manually set a user's `isVerified: true` in MongoDB and add an admin flag in your dev environment
3. Apply for seller access at `/seller/register`
4. Approve your own seller application via `/dashboard/admin/seller-verification`
5. Add your first product listing at `/seller/add-product`
6. Enable trade on a listing to start receiving swap offers at `/trade`

---

## Deployment Notes

- The custom `server.js` is **required** for Socket.IO — standard Next.js serverless deployment (Vercel) will **not** support WebSocket connections
- Deploy to a **VPS / container** (e.g., AWS EC2, Railway, Render, DigitalOcean Droplet) where a persistent Node.js process can run
- Set all environment variables in your hosting provider's dashboard
- MongoDB Atlas: whitelist your server IP (or `0.0.0.0/0` for dev)
- Cloudinary free tier: 25GB storage, 25GB monthly bandwidth
- Razorpay webhooks: configure to `https://your-domain.com/api/webhook/razorpay`
- For production, run `npm run build` then `node server.js` (server.js handles both production Next.js + Socket.IO)

---

<div align="center">

**Built with ❤️ by the Deep-Fried Devs team**

*Making campus life a little smarter, one listing at a time.*

</div>
