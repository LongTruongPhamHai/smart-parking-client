# 💻 Phân hệ Frontend (Smart Parking Client)

> **Dự án:** Hệ thống quản lý bãi đỗ xe thông minh (Đại học Thuỷ Lợi)  
> **Vai trò:** Giao diện tương tác người dùng (Web Client)

---

## 🛠 Công nghệ sử dụng

- **Core:** Next.js 16 (App Router), React 19
- **Styling:** TailwindCSS
- **Components & Icons:** Lucide-React, shadcn/ui components
- **Notifications:** React Hot Toast (toast notifications)
- **Animations:** Framer Motion (smooth transitions)

---

## 📂 Cấu trúc Pages (Routes)

### 🏠 Public Pages

- **`src/app/page.js`** - Trang chủ
  - Hiển thị trạng thái các slot đỗ xe (Available/Occupied)
  - Thống kê tổng số slot, available, occupied
  - Không cần đăng nhập

- **`src/app/signin/`** - Đăng nhập
  - Đăng nhập bằng số điện thoại + mật khẩu
  - Tự động redirect theo role (Admin → `/admin`, Customer → `/customer`)

- **`src/app/signup/`** - Đăng ký
  - Tạo tài khoản Customer mới

### 👤 Customer Dashboard (`src/app/customer/`)

- **Thông tin tài khoản:** Hiển thị tên, email, số dư
- **Chỉnh sửa profile:** Cập nhật tên, email
- **Đổi mật khẩu:** Thay đổi mật khẩu hiện tại
- **Nạp tiền (Top-up):** Nạp tiền vào số dư tài khoản
- **Lịch sử gửi xe (Invoices):**
  - Bảng invoice với thông tin check-in, check-out, duration, total price
  - **Sort:** Toggle giữa Newest First / Oldest First
  - **Phân trang:** 15 invoices mỗi trang
- **Xem trạng thái bãi đỗ:** Real-time slot status

### 🔐 Admin Dashboard (`src/app/admin/`)

Gồm 4 tabs chính:

**1. Overview Tab**

- Dashboard tổng quan: stats, parking slot status

**2. Invoices Tab**

- Xem toàn bộ hóa đơn của hệ thống
- Hiển thị user_name, check-in/out time, duration, price, status
- Sort mới → cũ (mặc định)
- Phân trang 15 items/page

**3. Activity Logs Tab**

- Xem các event gửi tới Admin:
  - Check-in/Check-out notifications
  - Fire alert (cảnh báo cháy)
  - Gas alert (cảnh báo khí gas)
- Hiển thị type badge với màu sắc khác nhau
- Phân trang 15 logs/page

**4. Users Management Tab**

- CRUD operations: Thêm, sửa, xóa user
- Phân quyền Admin/Customer
- Tìm kiếm user theo tên/email
- Phân trang 15 users/page

### 🎮 Simulator (`src/app/simulator/`)

- Mô phỏng IoT hardware (thay thế thiết bị phần cứng thật)
- **Check-in:** Chọn user + parking slot → gọi API check-in
- **Check-out:** Chọn invoice đang active → gọi API check-out
- Hiển thị kết quả (thành công/lỗi) qua toast notification

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

### Yêu cầu

- **Node.js** 18+ và npm
- Backend Server phải chạy trước (xem [smart-parking-server README](../smart-parking-server/README.md))

### Bước 1: Cài đặt Dependencies

```bash
npm install
```

### Bước 2: Cấu hình biến môi trường (Optional)

Nếu Backend Server không chạy tại `http://127.0.0.1:8000`, tạo file `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://<IP_của_server>:<PORT>
```

Ví dụ:

```env
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

### Bước 3: Khởi động Development Server

```bash
npm run dev
```

Truy cập: **http://localhost:3000**

### Build Production

```bash
npm run build
npm start
```

---

## 🎨 UI Components

Project sử dụng các component từ:

- **shadcn/ui:** Button, Card, Input, Modal
- **Lucide-React:** Icons (Car, Users, Activity, etc.)
- **React Hot Toast:** Toast notifications
- **Framer Motion:** Page transitions và animations

---

## 📱 Responsive Design

- Mobile-first approach với TailwindCSS
- Breakpoints: sm, md, lg, xl
- Các bảng có scroll ngang trên mobile

---

## 🔑 Tài khoản Test

**Admin:**

- Phone: `011`
- Password: `011`

**Customer:**

- Phone: `012`
- Password: `012`

---

## 📝 Lưu ý khi phát triển

- Next.js sử dụng **App Router** (không phải Pages Router)
- Client components cần directive `"use client"` ở đầu file
- API calls sử dụng native `fetch()` với async/await
- State management: React hooks (useState, useEffect, useCallback)
- Không sử dụng WebSocket - data refresh qua polling hoặc manual reload

---

## 🐛 Troubleshooting

**Lỗi "Failed to fetch":**

- Kiểm tra Backend Server có đang chạy không
- Kiểm tra BACKEND_URL trong `.env.local`
- Kiểm tra CORS settings ở Backend

**Build errors:**

- Xóa folder `.next` và node_modules, chạy lại `npm install`
- Kiểm tra phiên bản Node.js >= 18

**Styling không hiển thị:**

- Kiểm tra TailwindCSS config
- Clear browser cache
