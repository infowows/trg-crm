import mongoose, { Schema, Document } from "mongoose";

export interface IServiceGroup extends Document {
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ServiceGroupSchema: Schema = new Schema(
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
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "Nhóm dịch vụ",
    },
);

export default mongoose.models.ServiceGroup ||
    mongoose.model<IServiceGroup>("ServiceGroup", ServiceGroupSchema);
