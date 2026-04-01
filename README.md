# InventoryHub - Smart Inventory & Order Management System

A full-stack web application for managing products, stock levels, customer orders, and fulfillment workflows with intelligent validation and conflict handling.


---

##  Project Overview

InventoryHub is a professional-grade inventory management system built with modern web technologies. It streamlines product management, order processing, and stock handling with real-time alerts and comprehensive audit trails.

### Live Deployment
- **Live Link:** https://inventory-hub-gold.vercel.app/
- **Backend API**: https://inventoryhub-ykmn.onrender.com/

---

### Core Features

#### 1. **Authentication** 
- [x] User Signup with email + password
- [x] User Login with JWT token generation
- [x] Redirect to Dashboard after login
- [x] Demo Login button with pre-filled credentials
- [x] Protected Routes (Middleware)
- [x] Role-based access control (USER, ADMIN, MANAGER)

#### 2. **Product & Category Setup** 

**Categories:**
- [x] Create product categories
- [x] Category Name input
- [x] Edit/Delete categories
- [x] View all categories with product counts

**Products:**
- [x] Add products manually
- [x] Product Name field
- [x] Category selection
- [x] Price input
- [x] Stock Quantity input
- [x] Minimum Stock Threshold input
- [x] Status display (Active/Out of Stock)
- [x] Edit/Delete products
- [x] Search & filter products

#### 3. **Order Management** 
- [x] Create new orders
- [x] Order with customer name
- [x] Add multiple products to single order
- [x] Auto-calculated total price
- [x] Update order status
- [x] Cancel orders
- [x] View orders (list & details)
- [x] Filter by date or status
- [x] Order Status workflow: Pending → Confirmed → Shipped → Delivered → Cancelled

#### 4. **Stock Handling Rules** 
- [x] Automatic stock deduction on order
- [x] Check stock availability before order confirmation
- [x] Show warning: "Only X items available in stock"
- [x] Prevent order if stock insufficient
- [x] Auto-mark product as "Out of Stock" when stock = 0
- [x] Real-time stock level updates
- [x] Stock transaction logging for audit trail

#### 5. **Restock Queue (Low Stock Management)** 
- [x] Auto-add products to queue when below threshold
- [x] Queue ordered by lowest stock first
- [x] Priority levels: HIGH / MEDIUM / LOW
- [x] Manual stock restock function
- [x] Remove item from queue after restocking
- [x] View restock queue
- [x] Restock statistics

#### 6. **Conflict Detection** 
- [x] Prevent duplicate product entries in same order
- [x] Prevent ordering inactive products
- [x] Show message: "This product is already added to the order."
- [x] Show message: "This product is currently unavailable."
- [x] Validate minimum stock thresholds
- [x] Prevent negative stock values

#### 7. **Dashboard** 
- [x] Total Orders Today metric
- [x] Pending vs Completed Orders metric
- [x] Low Stock Items Count metric
- [x] Revenue Today metric
- [x] Product Summary table:
  - Product name
  - Stock levels
  - Low stock indicator
  - Status display
- [x] Activities feed (latest 5-10 actions)
- [x] Responsive layout

#### 8. **Activity Log** 
- [x] Track recent system actions (latest 10)
- [x] Examples:
  - "10:15 AM — Order #1023 created by user"
  - "10:20 AM — Stock updated for iPhone 13"
  - "10:30 AM — Product Headphone added to Restock Queue"
  - "11:00 AM — Order #1023 marked as Shipped"
- [x] Timestamp tracking
- [x] User attribution
- [x] Action type display

### More Features 

- [x] **Search & Filter**: Products, orders, categories searchable
- [x] **Pagination**: Large datasets paginated for performance
- [x] **Analytics**: Revenue charts and order metrics
- [x] **Role-based Access**: Admin/Manager/User permissions
- [x] **Responsive Design**: Mobile, tablet, desktop optimized
- [x] **Light Theme**: Whitish/professional background (`hsl(210 20% 98%)`)
- [x] **Error Handling**: Toast notifications + user-friendly messages
- [x] **Loading States**: Skeleton loaders + spinners
- [x] **Real-time Updates**: Activity feed updates
- [x] **Dark Mode Ready**: CSS variables prepared for theme switching
- [x] **CSV/JSON Export**: Ready for implementation
- [x] **Advanced Filtering**: By status, date range, price range

---

## 🏗️ Tech Stack

### Backend
```
Express.js 4.19.2          - REST API Framework
TypeScript 5.5.0           - Type Safety
Prisma 5.15.0              - ORM & Database
PostgreSQL                 - Database
JWT (jsonwebtoken)         - Authentication
bcryptjs 2.4.3            - Password Hashing
CORS 2.8.5                - Cross-Origin Support
```

### Frontend
```
React 18                   - UI Framework
TypeScript                 - Type Safety
Vite                       - Build Tool
TanStack Query 5.83.0      - Data Fetching & Caching
Axios 1.14.0              - HTTP Client
shadcn/ui                  - Component Library
Tailwind CSS 3             - Utility CSS
React Router               - Client-side Routing
React Hook Form            - Form Management
```

### Deployment
```
Render                     - Backend Hosting
Vercel                     - Frontend 
GitHub                     - Version Control
```

---

## 📁 Project Structure

```
inventory-hub/
├── backend/                        # Express.js API
│   ├── src/
│   │   ├── server.ts              # Express setup
│   │   ├── middleware/            # Auth middleware
│   │   └── modules/
│   │       ├── auth/              # Authentication
│   │       ├── products/          # Product CRUD
│   │       ├── categories/        # Category CRUD
│   │       ├── orders/            # Order management
│   │       ├── restock/           # Low stock queue
│   │       └── users/             # User profile
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── package.json
│
├── frontned/                       # React + Vite Frontend
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── RestockPage.tsx
│   │   │   ├── LowStockPage.tsx
│   │   │   └── ActivityPage.tsx
│   │   ├── components/            # Reusable components
│   │   ├── contexts/              # React Context
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # Utilities
│   │   └── main.tsx               # Entry point
│   └── package.json
│
├── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL database (or use Render)
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
# Edit .env with your database URL and JWT secret

# Setup database
npm run prisma:migrate

# Start development server
npm run dev
```

**Backend runs on**: http://localhost:3000

### Frontend Setup

```bash
cd frontned

# Install dependencies
npm install

# Setup environment variables
# VITE_API_URL=https://inventoryhub-ykmn.onrender.com/

# Start development server
npm run dev
```

**Frontend runs on**: http://localhost:5173

---

## 📚 API Documentation

### Base URL
```
https://inventoryhub-ykmn.onrender.com/
```

### Authentication Endpoints
```
POST   /api/auth/register     - Create new user
POST   /api/auth/login        - Login user
```

### Product Endpoints
```
GET    /api/products                 - List all products
POST   /api/products                 - Create product
GET    /api/products/low-stock       - Get low stock alerts
GET    /api/products/stats           - Get product stats
GET    /api/products/:id             - Get single product
PUT    /api/products/:id             - Update product
PATCH  /api/products/:id/stock       - Update stock
DELETE /api/products/:id             - Delete product
```

### Category Endpoints
```
GET    /api/categories      - List all categories
POST   /api/categories      - Create category
GET    /api/categories/:id  - Get category
PUT    /api/categories/:id  - Update category
DELETE /api/categories/:id  - Delete category
```

### Order Endpoints
```
GET    /api/orders                          - List all orders
POST   /api/orders                          - Create order
GET    /api/orders/dashboard/stats          - Order statistics
GET    /api/orders/dashboard/activity       - Activity feed
GET    /api/orders/:id                      - Get order details
PUT    /api/orders/:id                      - Update order
PATCH  /api/orders/:id/cancel               - Cancel order
```

### Restock Endpoints
```
GET    /api/restock/queue              - View restock queue
GET    /api/restock/stats              - Restock statistics
POST   /api/restock/:productId/restock - Add stock
DELETE /api/restock/:productId/queue   - Remove from queue
```

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

---

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for authentication:

1. Register user → Get JWT token
2. Login user → Get JWT token
3. Include token in headers: `Authorization: Bearer <TOKEN>`
4. Token auto-injected via Axios interceptors (Frontend)
5. Token verified via middleware (Backend)

```

---

## 📊 Database Schema

### Users Table
```
- id (Primary Key)
- email (Unique)
- password (Hashed)
- name
- role (USER, ADMIN, MANAGER)
- createdAt, updatedAt
```

### Categories Table
```
- id (Primary Key)
- name (Unique)
- createdAt, updatedAt
```

### Products Table
```
- id (Primary Key)
- name
- price
- stock
- minThreshold
- status (ACTIVE, OUT_OF_STOCK)
- categoryId (Foreign Key)
- createdAt, updatedAt
```

### Orders Table
```
- id (Primary Key)
- customerName
- totalPrice
- status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- items (OrderItems relation)
- createdAt, updatedAt
```

### RestockQueue Table
```
- id (Primary Key)
- productId (Foreign Key)
- priority (HIGH, MEDIUM, LOW)
- notes
- createdAt
```

### ActivityLog Table
```
- id (Primary Key)
- userId (Foreign Key)
- action (CREATE, UPDATE, DELETE, RESTOCK, etc.)
- details (JSON)
- timestamp
```

---
```

---

**Happy Coding! 🚀**
