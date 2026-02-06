import mongoose, { Schema, Document } from "mongoose";

export interface ICareResult extends Document {
  careGroupRef: mongoose.Types.ObjectId;
  careGroupName: string;
  resultName: string;
  resultCode: string;
  classification: string; // Cho phép nhập tùy chỉnh
  description?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CareResultSchema: Schema = new Schema(
  {
    careGroupRef: {
      type: Schema.Types.ObjectId,
      ref: "CareGroup",
      required: true,
    },
    careGroupName: {
      type: String,
      required: true,
      trim: true,
    },
    resultName: {
      type: String,
      required: true,
      trim: true,
    },
    resultCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    classification: {
      type: String,
      required: true,
      trim: true,
      // Không dùng enum để cho phép giá trị tùy chỉnh
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "Kết quả chăm sóc",
  },
);

// Index for faster queries
CareResultSchema.index({ careGroupRef: 1, active: 1 });
CareResultSchema.index({ careGroupName: 1 });

export default mongoose.models.CareResult ||
  mongoose.model<ICareResult>("CareResult", CareResultSchema);
