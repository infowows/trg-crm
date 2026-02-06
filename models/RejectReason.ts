import mongoose, { Schema, Document } from "mongoose";

export interface IRejectReason extends Document {
  rejectGroupRef: mongoose.Types.ObjectId;
  rejectGroupName: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const RejectReasonSchema: Schema = new Schema(
  {
    rejectGroupRef: {
      type: Schema.Types.ObjectId,
      ref: "RejectGroup",
      required: true,
    },
    rejectGroupName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
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
    collection: "Lý do từ chối",
  },
);

// Index for faster queries
RejectReasonSchema.index({ rejectGroupRef: 1, active: 1 });
RejectReasonSchema.index({ rejectGroupName: 1 });

export default mongoose.models.RejectReason ||
  mongoose.model<IRejectReason>("RejectReason", RejectReasonSchema);
