import { JWTPayload } from "./auth";
import mongoose from "mongoose";

/**
 * Tạo query điều kiện dựa trên phân quyền của user
 * @param auth Thông tin user từ token
 * @param field Tên trường dùng để lọc (ví dụ: 'assignedTo' cho Customer, 'customerRef' cho Opportunity)
 * @returns Object query cho Mongoose
 */
export function getPermissionQuery(
  auth: JWTPayload,
  field: string = "assignedTo",
) {
  // Nếu là admin (toàn quyền)
  if (auth.phan_quyen === "admin") {
    return {};
  }

  // Nếu là vị trí Lead hoặc Trưởng phòng (xem tất cả theo yêu cầu)
  const position = auth.chuc_vu?.toLowerCase() || "";
  if (
    position.includes("lead") ||
    position.includes("trưởng") ||
    position.includes("quản lý")
  ) {
    // Có thể thêm lọc theo phòng ban ở đây nếu cần: return { department: auth.phong_ban };
    return {};
  }

  // Nếu là Staff/Nhân viên, chỉ xem dữ liệu của bản thân
  // Lưu ý: auth.id thường là ObjectId string
  return { [field]: auth.id };
}

/**
 * Lấy danh sách ID khách hàng mà nhân viên được phép truy cập
 * Dùng cho các bảng không có trực tiếp assignedTo nhưng có customerRef
 */
export async function getAssignedCustomerIds(
  auth: JWTPayload,
  CustomerModel: any,
) {
  if (auth.phan_quyen === "admin") return null;

  const position = auth.chuc_vu?.toLowerCase() || "";
  if (
    position.includes("lead") ||
    position.includes("trưởng") ||
    position.includes("quản lý")
  ) {
    return null; // Trả về null nghĩa là xem tất cả
  }

  const customers = await CustomerModel.find({ assignedTo: auth.id }).select(
    "_id",
  );
  return customers.map((c: any) => c._id);
}
