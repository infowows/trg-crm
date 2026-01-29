import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
    name: string;
    code: string;
    serviceGroup: string;
    description?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ServiceSchema: Schema = new Schema(
    {
        serviceName: {
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
        serviceGroup: {
            type: String,
            required: true,
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
        collection: "Dịch vụ",
    },
);

export default mongoose.models.Service ||
    mongoose.model<IService>("Service", ServiceSchema);
