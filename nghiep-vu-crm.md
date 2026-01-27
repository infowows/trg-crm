# 📋 TỔNG HỢP NGHIỆP VỤ TRG CRM

## 🎯 **GIỚI THIỆU DỰ ÁN**

**TRG CRM** là hệ thống Quản lý Quan hệ Khách hàng được xây dựng trên nền tảng Next.js + MongoDB Atlas, được thiết kế để quản lý toàn bộ quy trình kinh doanh từ tìm kiếm khách hàng đến chăm sóc sau bán hàng.

### **🏗️ Kiến trúc hệ thống**

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Mongoose
- **Database:** MongoDB Atlas (NoSQL)
- **Authentication:** JWT Token + Middleware bảo vệ

---

## 📊 **CÁC MODULE NGHIỆP VỤ CHÍNH**

### **1. 🏢 QUẢN LÝ NHÂN VIÊN (DSNV)**

**Mục đích:** Quản lý thông tin nhân viên trong công ty

**Chức năng:**

- Thêm/Sửa/Xóa thông tin nhân viên
- Quản lý chức vụ và phòng ban
- Theo dõi thông tin liên hệ (email, phone)
- Phân công nhân viên cho khách hàng

**Dữ liệu quản lý:**

- `employeeId`: Mã nhân viên duy nhất
- `fullName`: Họ và tên đầy đủ
- `position`: Chức vụ (Sales Manager, Designer, etc.)
- `phone`: Số điện thoại
- `email`: Email công việc
- `active`: Trạng thái làm việc

**API:** `/api/employees`

---

### **2. 👥 QUẢN LÝ KHÁCH HÀNG (DSKH)**

**Mục đích:** Quản lý toàn bộ thông tin khách hàng tiềm năng và hiện tại

**Chức năng:**

- Đăng ký thông tin khách hàng mới
- Phân loại khách hàng theo mức độ tiềm năng
- Ghi nhận nguồn khách hàng (Google Ads, Facebook, etc.)
- Phân công nhân viên chăm sóc

**Dữ liệu quản lý:**

- `customerId`: Mã khách hàng tự động
- `fullName`: Tên công ty/cá nhân
- `shortName`: Tên viết tắt
- `address`: Địa chỉ liên hệ
- `phone`: Số điện thoại
- `source`: Nguồn tiếp cận
- `marketingClassification`: Phân loại marketing
- `potentialLevel`: Mức độ tiềm năng
- `salesPerson`: Nhân viên phụ trách

**API:** `/api/customers`

---

### **3. 📈 PHÂN LOẠI KHÁCH HÀNG**

**Mục đích:** Phân loại khách hàng để chiến lược marketing và bán hàng hiệu quả

**Chức năng:**

- Phân loại theo marketing (Phù hợp/Rác)
- Phân loại theo chu kỳ bán hàng (Ngắn hạn/Trung hạn/Dài hạn)
- Định nghĩa mô tả cho từng loại

**Dữ liệu quản lý:**

- `id`: Mã phân loại
- `marketingClassification`: Phân loại marketing
- `salesClassification`: Phân loại bán hàng
- `description`: Mô tả chi tiết

**API:** `/api/customer-classifications`

---

### **4. 🎯 CHĂM SÓC KHÁCH HÀNG (CSKH)**

**Mục đích:** Theo dõi và quản lý các hoạt động chăm sóc khách hàng

**Chức năng:**

- Ghi nhận lịch sử chăm sóc
- Lên kế hoạch chăm sóc định kỳ
- Theo dõi hiệu quả chăm sóc
- Phân loại hình thức chăm sóc

**Dữ liệu quản lý:**

- `careId`: Mã hoạt động chăm sóc
- `customerId`: Mã khách hàng
- `careDate`: Ngày chăm sóc
- `careType`: Loại hình chăm sóc
- `content`: Nội dung chăm sóc
- `status`: Trạng thái
- `employeeId`: Nhân viên thực hiện

**API:** `/api/customer-care`

---

### **5. 💰 BÁO GIÁ DỊCH VỤ**

**Mục đích:** Tạo và quản lý báo giá cho khách hàng

**Chức năng:**

- Tạo báo giá mới cho khách hàng
- Quản lý các hạng mục trong báo giá
- Tính toán tổng tiền, thuế, thành tiền
- Theo dõi trạng thái báo giá

**Dữ liệu quản lý:**

- `quotationNo`: Số báo giá duy nhất
- `customerId`: Mã khách hàng
- `date`: Ngày tạo báo giá
- `validTo`: Ngày hết hạn
- `items`: Danh sách hạng mục
- `totalAmount`: Tổng tiền
- `taxAmount`: Tiền thuế
- `grandTotal`: Thành tiền
- `status`: Trạng thái (draft, approved, rejected)

**API:** `/api/quotations`

---

### **6. 🏗️ QUẢN LÝ DỊCH VỤ**

**Mục đích:** Quản lý danh mục các dịch vụ công ty cung cấp

**Chức năng:**

- Đăng ký các loại dịch vụ
- Phân loại dịch vụ theo nhóm
- Thiết lập giá dịch vụ
- Quản lý gói dịch vụ

**Dữ liệu quản lý:**

- `serviceId`: Mã dịch vụ
- `serviceName`: Tên dịch vụ
- `serviceGroup`: Nhóm dịch vụ
- `description`: Mô tả chi tiết
- `basePrice`: Giá cơ bản
- `active`: Trạng thái

**API:** `/api/services`

---

### **7. 📦 GÓI DỊCH VỤ**

**Mục đích:** Tạo các gói dịch vụ kết hợp nhiều dịch vụ

**Chức năng:**

- Tạo gói dịch vụ với nhiều hạng mục
- Thiết lập giá cho gói
- Quản lý các dịch vụ con trong gói

**Dữ liệu quản lý:**

- `packageId`: Mã gói dịch vụ
- `packageName`: Tên gói
- `description`: Mô tả
- `items`: Danh sách dịch vụ con
- `totalPrice`: Tổng giá gói
- `active`: Trạng thái

**API:** `/api/service-packages`

---

### **8. 💲 CÀI ĐẶT GIÁ DỊCH VỤ**

**Mục đích:** Quản lý bảng giá chi tiết cho từng dịch vụ

**Chức năng:**

- Thiết lập giá theo từng dịch vụ cụ thể
- Phân loại theo gói (cơ bản, tiêu chuẩn, cao cấp)
- Quản lý đơn giá cho từng hạng mục

**Dữ liệu quản lý:**

- `serviceGroup`: Nhóm dịch vụ
- `serviceDetail`: Chi tiết dịch vụ
- `package1`: Gói cơ bản
- `package2`: Gói tiêu chuẩn
- `package3`: Gói cao cấp
- `unitPrice`: Đơn giá

**API:** `/api/service-pricing`

---

### **9. 🏭 NHÓM VẬT TƯ**

**Mục đích:** Quản lý các nhóm vật tư, nguyên vật liệu

**Chức năng:**

- Phân loại vật tư theo nhóm
- Mô tả chi tiết từng nhóm
- Quản lý danh mục vật tư

**Dữ liệu quản lý:**

- `groupId`: Mã nhóm vật tư
- `groupName`: Tên nhóm
- `description`: Mô tả chi tiết
- `active`: Trạng thái

**API:** `/api/material-groups`

---

### **10. 📋 HẠNG MỤC DỊCH VỤ**

**Mục đích:** Quản lý chi tiết các hạng mục trong từng dịch vụ

**Chức năng:**

- Đăng ký các hạng mục chi tiết
- Phân loại theo nhóm dịch vụ
- Thiết lập đơn giá cho từng hạng mục

**Dữ liệu quản lý:**

- `itemId`: Mã hạng mục
- `itemName`: Tên hạng mục
- `group`: Nhóm thuộc
- `unit`: Đơn vị tính
- `unitPrice`: Đơn giá
- `active`: Trạng thái

**API:** `/api/category-items`

---

### **11. 🎯 LOẠI CHĂM SÓC**

**Mục đích:** Định nghĩa các loại hình chăm sóc khách hàng

**Chức năng:**

- Đăng ký các loại hình chăm sóc
- Mô tả chi tiết từng loại
- Thiết lập tần suất chăm sóc

**Dữ liệu quản lý:**

- `careTypeId`: Mã loại chăm sóc
- `careTypeName`: Tên loại
- `description`: Mô tả
- `frequency`: Tần suất
- `active`: Trạng thái

**API:** `/api/care-types`

---

### **12. 📍 QUẢN LÝ CHỨC VỤ**

**Mục đích:** Quản lý hệ thống chức vụ trong công ty

**Chức năng:**

- Đăng ký các chức vụ
- Phân cấp quản lý
- Mô tả trách nhiệm từng chức vụ

**Dữ liệu quản lý:**

- `positionId`: Mã chức vụ
- `positionName`: Tên chức vụ
- `department`: Phòng ban
- `description`: Mô tả công việc
- `isActive`: Trạng thái

**API:** `/api/positions`

---

### **13. 🔗 NGUỒN KHÁCH HÀNG**

**Mục đích:** Quản lý các kênh tiếp cận khách hàng

**Chức năng:**

- Đăng ký các kênh marketing
- Theo dõi hiệu quả từng kênh
- Phân bổ nguồn khách hàng

**Dữ liệu quản lý:**

- `code`: Mã nguồn
- `name`: Tên kênh
- `active`: Trạng thái hoạt động

**API:** `/api/source-settings`

---

## 🔐 **QUẢN LÝ NGƯỜI DÙNG VÀ PHÂN QUYỀN**

### **Authentication System**

- **Login API:** `/api/auth/login`
- **User Profile:** `/api/auth/me`
- **JWT Token:** Bảo vệ các route
- **Middleware:** Tự động redirect chưa đăng nhập

### **Phân quyền người dùng**

- **Admin:** Toàn quyền truy cập
- **Manager:** Quản lý nhân viên và báo cáo
- **Sales:** Quản lý khách hàng và báo giá
- **Employee:** Truy cập theo phân công

---

## 📈 **QUY TRÌNH NGHIỆP VỤ TÍCH HỢP**

### **1. Quy trình tiếp cận khách hàng:**

```
Nguồn khách hàng → Đăng ký KHS → Phân loại → Phân nhân viên → CSKH
```

### **2. Quy trình bán hàng:**

```
Tư vấn → Tạo báo giá → Duyệt báo giá → Thực hiện dịch vụ → Chăm sóc sau bán
```

### **3. Quy trình chăm sóc:**

```
Lên kế hoạch → Thực hiện CSKH → Ghi nhận → Đánh giá → Lên kế hoạch tiếp theo
```

---

## 📊 **BÁO CÁO VÀ PHÂN TÍCH**

### **Các loại báo cáo:**

- **Báo cáo doanh thu:** Theo tháng/quý/năm
- **Báo cáo khách hàng:** Số lượng mới, tỷ lệ chuyển đổi
- **Báo cáo nhân viên:** Hiệu suất sales, hiệu quả CSKH
- **Báo cáo dịch vụ:** Doanh thu theo dịch vụ, gói dịch vụ

### **Dashboard:**

- Tổng quan doanh thu
- Số lượng khách hàng mới
- Tỷ lệ chuyển đổi
- Hiệu suất nhân viên

---

## 🔧 **CẤU HÌNH HỆ THỐNG**

### **Environment Variables:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wows-crm
JWT_SECRET=your-secret-key-here
```

### **Seed Data:**

- **API:** `/api/seed`
- **Dữ liệu mẫu:** 15 sheets từ file Excel
- **Tự động tạo:** Admin user, dữ liệu demo

---

## 🚀 **HƯỚNG DẪN TRIỂN KHAI**

### **Development:**

```bash
npm install
npm run dev
```

### **Production:**

```bash
npm run build
npm start
```

### **Seed Data:**

```bash
POST /api/seed
POST /api/create-admin
```

---

## 📝 **GHI CHÚ QUAN TRỌNG**

### **MongoDB Design Principles:**

- **Denormalization:** Tránh sử dụng refs, lưu snapshot data
- **Document Structure:** Thiết kế schema phù hợp với nghiệp vụ
- **Indexing:** Tối ưu query performance
- **Connection Pooling:** Sử dụng connection caching

### **Security:**

- **JWT Authentication:** Bảo vệ API routes
- **Input Validation:** Validate tất cả input data
- **Error Handling:** Consistent error responses
- **Rate Limiting:** Prevent abuse

### **Performance:**

- **Pagination:** Tất cả list API có pagination
- **Caching:** Cache frequently accessed data
- **Lazy Loading:** Load data khi cần thiết
- **Optimized Queries:** Sử dụng indexes và projections

---

## 🎯 **KẾ HOẠCH PHÁT TRIỂN**

### **Phase 1 (Current):**

- ✅ Core CRM functionality
- ✅ User authentication
- ✅ Basic reporting

### **Phase 2 (Future):**

- 📧 Email integration
- 📱 Mobile app
- 🤖 AI-powered insights
- 📊 Advanced analytics

### **Phase 3 (Future):**

- 🔄 Workflow automation
- 🌐 Multi-tenant support
- 📈 Advanced reporting
- 🔗 Third-party integrations

---

**📞 LIÊN HỆ:**

- **Project:** TRG CRM System
- **Technology:** Next.js + MongoDB Atlas
- **Version:** v1.0
- **Last Updated:** January 2026
