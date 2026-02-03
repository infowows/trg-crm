import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerCare extends Document {
  careId: string;
  customerId?: string;
  employeeId?: string;
  opportunityRef?: mongoose.Types.ObjectId; // id cơ hội
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
  interestedServices?: string[]; // lấy từ demands trong opportunity
  careResult?: string; // kết quả chăm sóc
  careClassification?: string; // xếp loại chăm sóc
  discussionContent?: string;
  needsNote?: string;
  status: "Hoàn thành" | "Chờ báo cáo" | "Hủy"; // tự huỷ sau 30 ngày từ ngày tạo
  quotationLink?: string; // link báo giá
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
    customerId: {
      type: String,
      trim: true,
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
    timeFrom: {
      type: Date,
    },
    timeTo: {
      type: Date,
    },
    method: {
      type: String,
      enum: ["Online", "Trực tiếp"],
      default: "Online",
    },
    location: {
      type: String,
      trim: true,
    },
    carePerson: {
      type: String,
      required: true,
      trim: true,
    },
    actualCareDate: {
      type: Date,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    files: [
      {
        type: Schema.Types.Mixed, // Support both String and Object
      },
    ],
    interestedServices: [
      {
        type: String,
        trim: true,
      },
    ],
    careResult: {
      type: String,
      trim: true,
    },
    careClassification: {
      type: String,
      trim: true,
    },
    discussionContent: {
      type: String,
      trim: true,
    },
    needsNote: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Hoàn thành", "Chờ báo cáo", "Hủy"],
      default: "Chờ báo cáo",
    },
    quotationLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "Chăm sóc khách hàng",
  },
);

export default mongoose.models.CustomerCare ||
  mongoose.model<ICustomerCare>("CustomerCare", CustomerCareSchema);
