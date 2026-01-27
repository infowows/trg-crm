import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
    employeeId: string;
    fullName: string;
    position: string;
    phone?: string;
    email?: string;
    department?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
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
        department: {
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
        collection: "DSNV",
    },
);

export default mongoose.models.Employee ||
    mongoose.model<IEmployee>("Employee", EmployeeSchema);
