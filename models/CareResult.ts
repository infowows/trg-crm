import mongoose, { Schema, Document } from "mongoose";

export interface ICareResult extends Document {
  careGroup: string; // Nhóm chăm sóc
  result: string; // Kết quả
  classification: string; // Xếp loại
  isActive: boolean;
}

const CareResultSchema: Schema = new Schema(
  {
    careGroup: {
      type: String,
      required: true,
      trim: true,
    },
    result: {
      type: String,
      required: true,
      trim: true,
    },
    classification: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "Kết quả chăm sóc",
  },
);

export default mongoose.models.CareResult ||
  mongoose.model<ICareResult>("CareResult", CareResultSchema);
