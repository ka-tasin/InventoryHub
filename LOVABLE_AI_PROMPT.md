# InventoryHub Frontend - Build Prompt for Lovable AI

## Project Overview
Build a professional, modern **Inventory Management System Frontend** that integrates with an existing production backend API deployed at **https://inventoryhub-ykmn.onrender.com/**.

The system manages product inventory, categories, orders, restocking, and user authentication with role-based access (USER, ADMIN, MANAGER).

---

## Core Features to Implement

### 1. **Authentication & Authorization**
- User registration and login pages
- JWT token-based authentication
- Persistent session management (localStorage)
- Role-based UI rendering (USER, ADMIN, MANAGER roles)
- Logout functionality
- Protected routes - redirect to login if not authenticated

### 2. **Dashboard**
- Overview cards showing:
  - Total Products
  - Total Orders
  - Low Stock Items Count
  - Recent Activity Feed
- Recent activity log with timestamps (last 10 activities)
- Dashboard statistics and quick metrics
- Welcome message with logged-in user info

### 3. **Products Management**
- **Product Listing Page**
  - Display all products in a table/grid view
  - Show: Product Name, Price, Current Stock, Category, Status (ACTIVE/OUT_OF_STOCK)
  - Real-time stock status indicators
  - Search/filter by product name or category
  - Sort by price, stock level, or date

- **Create Product**
  - Form to add new products
  - Fields: Name, Price, Stock, Minimum Threshold, Category (dropdown)
  - Success confirmation message

- **Edit Product**
  - Modal/form to update product details
  - Pre-populated current values
  - Update validation

- **Delete Product**
  - Confirm dialog before deletion

- **Low Stock Alert**
  - Special section/page showing products below minimum threshold
  - Visual indicators (badges/colors) for low stock items

### 4. **Categories Management**
- **Category List**
  - Display all categories in a table/card view
  - Show category name and product count
  - Search functionality

- **Create Category**
  - Simple form to add new category
  - Unique name validation

- **Edit & Delete Categories**
  - Update category names
  - Delete with confirmation

### 5. **Orders Management**
- **Orders List**
  - Display all orders in a timeline or table view
  - Show: Order #, Customer Name, Total Price, Status, Date
  - Filter by status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  - Sort by date or total price

- **Order Details**
  - View full order information
  - Display order items with quantities and prices
  - Show order status and timeline
  - Calculate and display order total

- **Create Order**
  - Form to create new order
  - Customer name field
  - Add multiple products with quantities
  - Real-time price calculation
  - Stock validation - prevent ordering more than available

- **Update Order Status**
  - Change order status (PENDING → CONFIRMED → SHIPPED → DELIVERED)
  - Visual status badges/timeline

- **Cancel Order**
  - Option to cancel orders (with confirmation)
  - Only if not already DELIVERED

- **Order Statistics**
  - Total orders, completed orders, pending orders
  - Revenue metrics

### 6. **Restock Management**
- **Restock Queue**
  - Display products pending restock
  - Show priority levels (HIGH, MEDIUM, LOW)
  - Visual priority indicators

- **Restock Product**
  - Form to add stock to a product
  - Quantity field
  - Notes/comments field
  - Log transaction with type (RESTOCK, DEDUCT, ADJUST)

- **Remove from Queue**
  - Option to remove product from restock queue

- **Restock Statistics**
  - Products restocked this month
  - Average restock time
  - Queue status

### 7. **Activity Logs**
- Show all system activities with timestamps
- Filter by action type (CREATE, UPDATE, DELETE, RESTOCK, etc.)
- Display user who performed action, affected product/order
- Activity details/notes
- Date range filter

---

## Complete API Endpoints Reference

### **Authentication (No Auth Required)**
```
POST   /api/auth/register
  Body: { email, password, name }
  Response: { user: { id, email, name, role }, token }

POST   /api/auth/login
  Body: { email, password }
  Response: { user: { id, email, name, role }, token }
```

### **Products (Auth Required)**
```
POST   /api/products
  Body: { name, price, stock, minThreshold, categoryId }
  Response: Product object

GET    /api/products
  Response: Array of all products with category info

GET    /api/products/:id
  Response: Single product with full details

GET    /api/products/low-stock
  Response: Array of products below minThreshold

GET    /api/products/stats
  Response: { totalProducts, totalValue, activeProducts, outOfStockCount }

PUT    /api/products/:id
  Body: { name, price, stock, minThreshold, categoryId, status }
  Response: Updated product

PATCH  /api/products/:id/stock
  Body: { quantity, type: "DEDUCT|RESTOCK|ADJUST", notes? }
  Response: Updated stock + transaction record

DELETE /api/products/:id
  Response: Success message
```

### **Categories (Auth Required)**
```
POST   /api/categories
  Body: { name }
  Response: Category object

GET    /api/categories
  Response: Array of all categories with product count

GET    /api/categories/:id
  Response: Single category with all its products

PUT    /api/categories/:id
  Body: { name }
  Response: Updated category

DELETE /api/categories/:id
  Response: Success message
```

### **Orders (Auth Required)**
```
POST   /api/orders
  Body: { customerName, items: [{ productId, quantity, unitPrice }] }
  Response: Order object with order number

GET    /api/orders
  Response: Array of all orders with items

GET    /api/orders/:id
  Response: Single order with all items and details

GET    /api/orders/dashboard/stats
  Response: { totalOrders, pendingOrders, completedOrders, totalRevenue }

GET    /api/orders/dashboard/activity
  Response: Recent activity logs (last 10 items)

PUT    /api/orders/:id
  Body: { customerName, status, items: [...] }
  Response: Updated order

PATCH  /api/orders/:id/cancel
  Response: Order marked as CANCELLED with timestamp

```

### **Restock (Auth Required)**
```
GET    /api/restock/queue
  Response: Array of products in restock queue with priority

GET    /api/restock/stats
  Response: { totalInQueue, highPriority, mediumPriority, lowPriority }

POST   /api/restock/:productId/restock
  Body: { quantity, notes? }
  Response: Success + updated stock + transaction record

DELETE /api/restock/:productId/queue
  Response: Product removed from restock queue
```

---

## Design Requirements

### **Overall Style**
- **Main Background Color**: Whitish/Light (#f8f9fa, #fafbfc, or #ffffff)
- **Accent Color**: Professional blue or teal (suggest: #0066cc or #1abc9c)
- **Professional appearance** suitable for business use
- Clean, minimal, modern UI
- Dark text on light backgrounds for readability

### **Layout Structure**
- **Top Navigation Bar**: Logo, user info dropdown, logout
- **Left Sidebar**: Main navigation menu (Dashboard, Products, Categories, Orders, Restock, Activity Logs)
- **Main Content Area**: Full-width responsive layout
- **Mobile Responsive**: Works on all screen sizes

### **UI Components**
- **Cards**: For metrics and summaries with light shadows
- **Tables**: For listing data with sorting/pagination
- **Forms**: Clean, well-organized with clear labels and validation
- **Buttons**: Clear CTAs (Create, Edit, Delete, Submit, Cancel)
- **Status Badges**: Color-coded (Green=Active/Success, Red=Low/Cancelled, Yellow=Pending, etc.)
- **Modals**: For dialogs (create, edit, confirm delete)
- **Toast Notifications**: For success/error messages
- **Loading States**: Skeleton loaders or spinners for data fetching
- **Empty States**: User-friendly messages when no data available

### **Color Scheme**
- Background: #f8f9fa or #fafbfc (whitish)
- Card/Surfaces: White (#ffffff)
- Text: Dark gray (#333, #444, #555)
- Primary Actions: #0066cc or #1abc9c
- Success: #28a745 (green)
- Error: #dc3545 (red)
- Warning: #ffc107 (yellow/orange)
- Info: #17a2b8 (light blue)

---

## Technical Implementation Details

### **Technology Stack**
- **Frontend Framework**: React or Next.js (from Lovable AI default)
- **State Management**: React Context API or Zustand
- **HTTP Client**: axios or fetch API
- **Authentication**: JWT stored in localStorage with Authorization header
- **Styling**: Tailwind CSS (for professional whitish design)
- **UI Components**: shadcn/ui or Headless UI recommended
- **Routing**: React Router v6+
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: React Query (TanStack Query) for caching and sync
- **Date/Time**: date-fns or dayjs

### **API Base URL**
```
https://inventoryhub-ykmn.onrender.com/
```

### **Authentication Pattern**
1. User registers/logs in
2. Backend returns JWT token
3. Store token in localStorage as `authToken`
4. Attach `Authorization: Bearer <token>` header to all authenticated requests
5. On 401 response, clear token and redirect to login
6. Implement token refresh if needed

### **Error Handling**
- Display user-friendly error messages from API responses
- Show validation errors on forms
- Handle network errors gracefully
- Log errors for debugging

### **Responsive Design**
- Mobile: 320px and up
- Tablet: 768px breakpoint
- Desktop: 1024px and up
- Sidebar collapses to hamburger menu on mobile
- Tables convert to cards on mobile

---

## Pages Layout

1. **Login Page** - Simple, clean form with email/password
2. **Register Page** - Form with email, password, name fields
3. **Dashboard** - Overview with stats, recent activity, welcome message
4. **Products Page** - List, search, create, edit, delete products
5. **Low Stock Page** - Dedicated alert page for low stock items
6. **Categories Page** - Manage categories
7. **Orders Page** - List all orders with filters and status management
8. **Order Details Page** - View single order in detail
9. **Create/Edit Order Page** - Form to create/modify orders
10. **Restock Queue Page** - Manage restock priority queue
11. **Activity Logs Page** - Full activity history with filters
12. **Settings/Profile Page** - User profile and preferences

---

## Additional Requirements

- **No Backend Auth Middleware in Frontend**: The backend already handles JWT verification, so frontend should just pass the token
- **Automatic Token Injection**: All requests after login should include the bearer token
- **Loading States**: Show loading indicators during API calls
- **Optimistic Updates**: For better UX, update UI before API confirmation (with rollback on error)
- **Pagination**: For large lists (products, orders, activity logs)
- **Export Data**: Option to export orders or activity logs to CSV (optional but nice to have)
- **Real-time Updates**: Consider polling or websockets for live data updates (optional)
- **Demo Mode**: Support for demo user (isDemo: true from backend)

---

## Success Criteria

✅ Professional, whitish design theme implemented
✅ All CRUD operations working for Products, Categories, Orders, Restock
✅ Authentication working with JWT tokens
✅ Dashboard with meaningful metrics and activity
✅ Low stock alerts and restock management functional
✅ Responsive across all devices
✅ Clean error handling and user feedback
✅ All API endpoints properly integrated
✅ Role-based features visible (if implementing)
✅ Clean, maintainable, production-ready code

---

## Final Notes

- The backend is fully deployed and ready for integration
- All database migrations are complete
- The frontend should focus on being a professional, user-friendly interface
- Prioritize data visualization and clear status indicators
- Ensure all forms have proper validation
- Make the whitish/light theme the primary design aesthetic
