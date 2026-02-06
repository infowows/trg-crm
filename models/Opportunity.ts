import mongoose, { Schema, Document } from "mongoose";

export interface IOpportunity extends Document {
  opportunityNo: string; // ID cơ hội
  customerRef: mongoose.Types.ObjectId; // ID khách hàng
  demands: string[]; // Nhu cầu (danh sách các dịch vụ được chọn)
  unitPrice: number; // giá trị cơ hội dự kiến
  probability: number; // phần trăm chốt đơn
  opportunityValue: number; // doanh thu dự kiến = giá trị cơ hội dự kiến * phần trăm chốt đơn
  careHistory: mongoose.Types.ObjectId[]; // lịch sử chăm sóc (danh sách các lần chăm sóc)
  closingDate?: Date; // ngày chốt cơ hội
  actualRevenue?: number; // doanh thu thực tế
  status:
    | "Mới ghi nhận"
    | "Đang tư vấn"
    | "Đã gửi đề xuất"
    | "Chờ quyết định"
    | "Thành công"
    | "Không thành công";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema: Schema = new Schema(
  {
    opportunityNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    demands: [
      {
        type: String,
      },
    ],
    unitPrice: {
      type: Number,
      default: 0,
    },
    probability: {
      type: Number,
      default: 0, // 0-100
    },
    opportunityValue: {
      type: Number,
      default: 0,
    },
    careHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerCare",
      },
    ],
    closingDate: {
      type: Date,
    },
    actualRevenue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Mới ghi nhận",
        "Đang tư vấn",
        "Đã gửi đề xuất",
        "Chờ quyết định",
        "Thành công",
        "Không thành công",
      ],
      default: "Mới ghi nhận",
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Cơ hội",
  },
);

export default mongoose.models.Opportunity ||
  mongoose.model<IOpportunity>("Opportunity", OpportunitySchema);
