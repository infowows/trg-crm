import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerId: string;
  registrationDate?: Date;
  fullName: string;
  shortName?: string;
  address?: string;
  phone?: string;
  image?: string;
  source?: string;
  referrer?: string;
  referrerPhone?: string;
  opportunityHistory: mongoose.Types.ObjectId[];
  appraisalDate?: Date; // Ngày thẩm định
  appraisalStatus?: string; // Xếp loại (Phù hợp/Không phù hợp...)
  appraisalNote?: string; // Ghi chú thẩm định chi tiết
  potentialLevel?: string; // 1 - 5 stars
  salesPerson?: string;
  assignedTo?: mongoose.Types.ObjectId;
  needsNote?: string;
  trueCustomerDate?: Date; // khi có hợp đồng đầu tiên thành công
  firstContractValue?: number; // giá trị hợp đồng đầu tiên thành công
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  isDel: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    registrationDate: {
      type: Date,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    referrer: {
      type: String,
      trim: true,
    },
    referrerPhone: {
      type: String,
      trim: true,
    },
    opportunityHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Opportunity",
      },
    ],
    appraisalDate: {
      type: Date,
    },
    appraisalStatus: {
      type: String,
      trim: true,
    },
    appraisalNote: {
      type: String,
      trim: true,
    },
    potentialLevel: {
      type: String,
      trim: true,
    },
    salesPerson: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    needsNote: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    trueCustomerDate: {
      type: Date,
    },
    firstContractValue: {
      type: Number,
      default: 0,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "Khách hàng",
  },
);

const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
export default Customer;
