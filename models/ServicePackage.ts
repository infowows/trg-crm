import mongoose, { Schema, Document } from "mongoose";

export interface IServicePackage extends Document {
    packageName: string; // Ví dụ: Gói Tiêu Chuẩn, Gói Cao Cấp
    code: string; // Ví dụ: STANDARD, PREMIUM
    description?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ServicePackageSchema: Schema = new Schema(
    {
        packageName: {
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
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "Gói dịch vụ",
    },
);

export default mongoose.models.ServicePackage ||
    mongoose.model<IServicePackage>("ServicePackage", ServicePackageSchema);
