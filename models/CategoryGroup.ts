import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryGroup extends Document {
  name: string;
  code: string;
  note?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategoryGroupSchema: Schema = new Schema(
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
    note: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "Nhóm hạng mục",
  },
);

export default mongoose.models.CategoryGroup ||
  mongoose.model<ICategoryGroup>("CategoryGroup", CategoryGroupSchema);
