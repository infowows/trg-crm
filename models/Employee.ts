import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string;
  fullName: string;
  position: string;
  phone?: string;
  email?: string;
  address?: string;
  department?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Account fields
  username?: string;
  password?: string;
  role?: string;
  gender?: string;
  dob?: Date;
  lastLogin?: Date;
  avatar?: string;
}

const EmployeeSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Account fields
    username: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined to not be unique
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    gender: String,
    dob: Date,
    lastLogin: Date,
    avatar: String,
  },
  {
    timestamps: true,
    collection: "Nhân viên",
  },
);

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
