import mongoose, { Document, Schema } from "mongoose";
import Customer from "./Customer";

// Schema cho báo giá (chứa thông tin giá và tính toán)
const quotationPackageSchema = new mongoose.Schema({
  serviceGroup: { type: String, required: true }, // nhóm dịch vụ
  service: { type: String, required: true }, // tên dịch vụ
  volume: { type: Number, required: true }, // khối lượng (từ survey)
  packages: [
    {
      packageName: { type: String, required: true }, // tên gói dịch vụ
      servicePricing: { type: Number, required: true }, // đơn giá của gói
      totalPrice: { type: Number, required: true }, // thành tiền = volume * servicePricing
      isSelected: { type: Boolean, default: false }, // gói được chọn bởi khách hàng
    },
  ], // mảng các gói với cùng volume để khách hàng so sánh
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNo: { type: String, unique: true, required: true },
    date: { type: Date, required: true },
    customer: { type: String, required: true }, // customer name
    customerRef: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // reference to customer
    surveyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSurvey",
    }, // reference to survey
    packages: [quotationPackageSchema], // mảng các gói dịch vụ với giá
    totalAmount: { type: Number, default: 0 }, // tổng thành tiền
    grandTotal: { type: Number, default: 0 }, // tổng cộng
    status: {
      type: String,
      enum: ["draft", "sent", "approved", "rejected", "completed"],
      default: "draft",
    },
    notes: { type: String }, // ghi chú báo giá
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "BAOGIA_V2" }, // Đổi tên để force model mới
);

const Quotation =
  mongoose.models.BAOGIA_V2 || mongoose.model("BAOGIA_V2", quotationSchema);
export default Quotation;
