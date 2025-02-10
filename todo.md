Project Plan: Custom POS System with Warehouse Management

Roles and Permissions:
1. Admin:
   - View all warehouse products
   - Edit/delete products
   - Make purchases
   - Apply €2 coupons
   - Manage users
   - Close registers
   - View closed registers with:
     - Items sold count
     - Coupons used count
     - Treat items count

2. Staff:
   - Make purchases
   - Close registers
   - Apply €2 coupons
   - Mark products as treats

3. Secretary:
   - Manage football field appointments
   - Manage party bookings

Dashboard Features:
- Admin Dashboard:
  - Recent sales widget
  - Low stock products widget (items < 10)
  
- Staff Dashboard:
  - Recent sales widget with:
    - Product edit capability
    - Edited/deleted product indicators

Technical Requirements:
- Backend: Supabase
- Frontend: Next.js with TypeScript
- Shared Features:
  - Order taking (Admin & Staff)
  - €2 coupon application
  - Treat product marking