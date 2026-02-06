import mongoose, { Schema, Document } from "mongoose";

export interface IRejectGroup extends Document {
  name: string;
  code: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const RejectGroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
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
    collection: "Nhóm lý do từ chối",
  },
);

export default mongoose.models.RejectGroup ||
  mongoose.model<IRejectGroup>("RejectGroup", RejectGroupSchema);
