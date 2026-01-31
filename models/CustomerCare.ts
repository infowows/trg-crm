import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerCare extends Document {
  careId: string;
  customerId?: string;
  employeeId?: string;
  careType:
    | "Khảo sát nhu cầu"
    | "Làm rõ báo giá/hợp đồng"
    | "Xử lý khiếu nại/bảo hành"
    | "Thu hồi công nợ";
  timeFrom?: Date;
  timeTo?: Date;
  method: "Online" | "Trực tiếp";
  location?: string;
  carePerson: string;
  actualCareDate?: Date;
  images?: string[];
  files?: (string | { url: string; name: string; format?: string })[];
  interestedServices?: string;
  discussionContent?: string;
  needsNote?: string;
  status: "Hoàn thành" | "Chờ báo cáo" | "Hủy";
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
    careType: {
      type: String,
      enum: [
        "Khảo sát nhu cầu",
        "Làm rõ báo giá/hợp đồng",
        "Xử lý khiếu nại/bảo hành",
        "Thu hồi công nợ",
      ],
      default: "Khảo sát nhu cầu",
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
    interestedServices: {
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
  },
  {
    timestamps: true,
    collection: "CSKH",
  },
);

export default mongoose.models.CustomerCare ||
  mongoose.model<ICustomerCare>("CustomerCare", CustomerCareSchema);
