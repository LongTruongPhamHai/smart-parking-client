# 💻 Phân hệ Frontend (Smart Parking Client)

> **Dự án:** Hệ thống quản lý bãi đỗ xe thông minh (Đại học Thuỷ Lợi)  
> **Vai trò:** Giao diện tương tác người dùng (Web Client).

---

## 🛠 Công nghệ sử dụng

- **Core:** Next.js (App Router), React 19.
- **Styling:** TailwindCSS.
- **Components & Icons:** Lucide-React, React Hot Toast (Thông báo nổi).
- **Animations:** Framer Motion (hiệu ứng di chuyển mượt mà tại trang chủ).

---

## 📂 Các trang tính năng chính (Pages)

1. `src/app/page.js`: **Trang chủ** - Hiển thị trạng thái các bãi đỗ xe theo thời gian thực (Trống/Đã có xe). Có điều hướng đến các trang chức năng.
2. `src/app/admin`: **Admin Dashboard** - Trang dành cho Quản trị viên quản lý danh sách Bãi đỗ xe, tạo mới và chỉnh sửa User, theo dõi bảng doanh thu (Invoices).
3. `src/app/customer`: **Customer Dashboard** - Trang dành cho Khách hàng xem thông tin cá nhân, chỉnh sửa mật khẩu, nạp tiền vào thẻ và xem lịch sử gửi xe.
4. `src/app/simulator`: **Simulator (Mô phỏng IoT)** - Giao diện để mô phỏng hành vi quẹt thẻ từ của xe vào (Check-in) và xe ra (Check-out) thay cho thiết bị phần cứng thật.

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

**Bước 1: Cài đặt Dependencies**  
Yêu cầu hệ thống đã cài đặt [Node.js](https://nodejs.org/). Mở terminal tại thư mục này và chạy:
```bash
npm install
```

**Bước 2: Cấu hình biến môi trường (Optional)**  
Nếu Backend Server của bạn không chạy tại `http://127.0.0.1:8000`, hãy tạo một file `.env.local` ở thư mục hiện tại và thêm dòng sau:
```env
NEXT_PUBLIC_BACKEND_URL=http://<IP_cua_ban>:<PORT>
```

**Bước 3: Khởi động Client**  
Chạy lệnh sau để khởi động môi trường dev:
```bash
npm run dev
```
Mở trình duyệt và truy cập: `http://localhost:3000` để sử dụng hệ thống!
