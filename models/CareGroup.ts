import mongoose, { Schema, Document } from "mongoose";

export interface ICareGroup extends Document {
  name: string;
  code: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CareGroupSchema: Schema = new Schema(
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
    collection: "Nhóm chăm sóc",
  },
);

export default mongoose.models.CareGroup ||
  mongoose.model<ICareGroup>("CareGroup", CareGroupSchema);
