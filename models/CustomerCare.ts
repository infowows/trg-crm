import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface cho thông tin khách hàng nhúng (Extended Reference)
 * Giúp lấy nhanh các thông tin thường dùng mà không cần populate
 */
interface ICustomerShortInfo {
  _id: mongoose.Types.ObjectId;
  shortName: string;
}

export interface ICustomerCare extends Document {
  careId: string;
  customerId?: string; // Dạng string (nếu bạn vẫn muốn dùng song song)
  customerRef?: mongoose.Types.ObjectId; // Reference chuẩn để join nếu cần
  customerInfo?: ICustomerShortInfo; // Dữ liệu nhúng để truy vấn cực nhanh
  employeeId?: string;
  opportunityRef?: mongoose.Types.ObjectId;
  careType:
    | "Tư vấn – Khảo sát"
    | "Làm rõ báo giá / hợp đồng"
    | "Triển khai – Theo dõi"
    | "Xử lý công nợ"
    | "Hậu mãi – Chăm sóc định kỳ";
  timeFrom?: Date;
  timeTo?: Date;
  method: "Online" | "Trực tiếp";
  location?: string;
  carePerson: string;
  actualCareDate?: Date;
  images?: string[];
  files?: (string | { url: string; name: string; format?: string })[];
  interestedServices?: string[];
  careResult?: string;
  careClassification?: string;
  discussionContent?: string;
  needsNote?: string;
  status: "Hoàn thành" | "Chờ báo cáo" | "Hủy";
  quotationRef?: mongoose.Types.ObjectId;
  quotationNo?: string;
  surveyRef?: mongoose.Types.ObjectId;
  surveyNo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerCareSchema: Schema = new Schema(
  {
    careId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // ID khách hàng dạng string
    customerId: {
      type: String,
      trim: true,
    },
    // Reference chuẩn đến collection Customers
    customerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    // THÔNG TIN NHÚNG: Đây là mấu chốt để bạn lấy shortName nhanh
    customerInfo: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      shortName: { type: String, trim: true },
    },
    employeeId: {
      type: String,
      trim: true,
    },
    opportunityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
    },
    careType: {
      type: String,
      enum: [
        "Tư vấn – Khảo sát",
        "Làm rõ báo giá / hợp đồng",
        "Triển khai – Theo dõi",
        "Xử lý công nợ",
        "Hậu mãi – Chăm sóc định kỳ",
      ],
      default: "Tư vấn – Khảo sát",
    },
    timeFrom: { type: Date },
    timeTo: { type: Date },
    method: {
      type: String,
      enum: ["Online", "Trực tiếp"],
      default: "Online",
    },
    location: { type: String, trim: true },
    carePerson: {
      type: String,
      required: true,
      trim: true,
    },
    actualCareDate: { type: Date },
    images: [{ type: String, trim: true }],
    files: [{ type: Schema.Types.Mixed }],
    interestedServices: [{ type: String, trim: true }],
    careResult: { type: String, trim: true },
    careClassification: { type: String, trim: true },
    discussionContent: { type: String, trim: true },
    needsNote: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Hoàn thành", "Chờ báo cáo", "Hủy"],
      default: "Chờ báo cáo",
    },
    quotationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaoGia",
    },
    quotationNo: { type: String, trim: true },
    surveyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PROJECT_SURVEY",
    },
    surveyNo: { type: String, trim: true },
  },
  {
    timestamps: true,
    // Tên collection có dấu thường gây khó khăn ở một số môi trường quản lý database, 
    // nhưng tôi giữ nguyên theo ý bạn.
    collection: "Chăm sóc khách hàng",
  }
);

// Index để tìm kiếm theo tên khách hàng nhúng nhanh hơn
CustomerCareSchema.index({ "customerInfo.shortName": "text" });
CustomerCareSchema.index({ customerRef: 1 });

export default mongoose.models.CustomerCare ||
  mongoose.model<ICustomerCare>("CustomerCare", CustomerCareSchema);